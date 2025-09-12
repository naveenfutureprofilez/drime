<?php

namespace App\Http\Controllers;

use App\Models\GuestUpload;
use App\Models\FileEntry;
use App\Services\GuestUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Events\GuestUploadDownloaded;
use Common\Core\BaseController;
use ZipStream\ZipStream;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Helpers\FilePathResolver;
use App\Services\FileDownloadErrorHandler;

class GuestUploadController extends BaseController
{
    public function __construct(private GuestUploadService $guestUploadService)
    {
    }

    /**
     * Create a new guest upload record
     */
    public function store(Request $request): JsonResponse
    {
        // Set unlimited execution time for large file uploads
        ini_set('max_execution_time', '0');
        ini_set('max_input_time', '0');
        
        logger('GuestUploadController::store called', [
            'request_all' => $request->all(),
            'sender_email' => $request->get('sender_email'),
            'sender_name' => $request->get('sender_name'), 
            'message' => $request->get('message'),
            'form_data_keys' => array_keys($request->all())
        ]);
        
        // Get max file size in KB for Laravel validation (Laravel expects KB)
        $maxFileSizeKB = intval(config('uploads.guest_max_size', 3145728000) / 1024);
        
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|min:1',
            'files.*' => 'required|file|max:' . $maxFileSizeKB,
            'password' => 'nullable|string|min:4|max:255',
            'expires_in_hours' => 'nullable|integer|min:1|max:8760', // Max 1 year
            'max_downloads' => 'nullable|integer|min:1|max:1000',
        ]);

        if ($validator->fails()) {
            logger('Validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        logger('Validation passed');
        logger('Files received', ['file_count' => count($request->file('files'))]);
        logger('File details', ['files' => array_map(function($file) {
            return [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ];
        }, $request->file('files'))]);

        try {
            logger('About to call handleUpload service');
            $result = $this->guestUploadService->handleUpload($request);
            logger('Service returned result', ['result' => $result]);
            
            return response()->json([
                'message' => 'Files uploaded successfully',
                'data' => $result
            ], 201)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
            
        } catch (\Exception $e) {
            logger('Exception in upload', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Upload failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get guest upload by hash
     */
    public function show(string $hash): JsonResponse
    {
        $guestUpload = GuestUpload::with(['files', 'fileEntry']) // Keep both for backward compatibility
            ->where('hash', $hash)
            ->first();

        if (!$guestUpload) {
            return response()->json([
                'message' => 'Upload not found'
            ], 404);
        }

        if (!$guestUpload->canDownload()) {
            return response()->json([
                'message' => 'This upload has expired or reached download limit'
            ], 410);
        }

        // Get files from the new many-to-many relationship or fall back to old single file
        $files = $guestUpload->files;
        if ($files->isEmpty() && $guestUpload->fileEntry) {
            $files = collect([$guestUpload->fileEntry]);
        }

        return response()->json([
            'hash' => $guestUpload->hash,
            'expires_at' => $guestUpload->expires_at,
            'max_downloads' => $guestUpload->max_downloads,
            'download_count' => $guestUpload->download_count,
            'has_password' => !is_null($guestUpload->password),
            'files' => $files->map(function ($file) {
                return [
                    'id' => $file->id,
                    'filename' => $file->getNameWithExtension(),
                    'size' => $file->file_size,
                    'mime_type' => $file->mime,
                ];
            }),
        ]);
    }

    /**
     * Download file (legacy method - now redirects to downloadAll for compatibility)
     */
    public function download(string $hash, Request $request): mixed
    {
        // Redirect to the new downloadAll method which handles both single and multi-file downloads
        return $this->downloadAll($hash, $request);
    }

    /**
     * Verify password for protected upload
     */
    public function verifyPassword(string $hash, Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string'
        ]);

        $guestUpload = GuestUpload::where('hash', $hash)->first();

        if (!$guestUpload) {
            return response()->json(['message' => 'Upload not found'], 404);
        }

        if (!$guestUpload->canDownload()) {
            return response()->json([
                'message' => 'This upload has expired or reached download limit'
            ], 410);
        }

        if (!$guestUpload->password) {
            return response()->json(['message' => 'This upload is not password protected'], 400);
        }

        $isValid = password_verify($request->password, $guestUpload->password);

        return response()->json([
            'valid' => $isValid,
            'message' => $isValid ? 'Password correct' : 'Invalid password'
        ], $isValid ? 200 : 401);
    }

    /**
     * Get preview for supported file types (images)
     */
    public function preview(string $hash): mixed
    {
        $guestUpload = GuestUpload::with('fileEntry')
            ->where('hash', $hash)
            ->first();

        if (!$guestUpload) {
            return response()->json(['message' => 'Upload not found'], 404);
        }

        if (!$guestUpload->canDownload()) {
            return response()->json([
                'message' => 'This upload has expired or reached download limit'
            ], 410);
        }

        // Only allow previews for images
        if (!str_starts_with($guestUpload->mime_type, 'image/')) {
            return response()->json(['message' => 'Preview not available for this file type'], 400);
        }

        $fileEntry = $guestUpload->fileEntry;
        if (!$fileEntry) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $disk = Storage::disk(config('common.site.uploads_disk', 'uploads'));
        
        if (!$disk->exists($fileEntry->file_name)) {
            return response()->json(['message' => 'File not found in storage'], 404);
        }

        return response($disk->get($fileEntry->file_name))
            ->header('Content-Type', $guestUpload->mime_type)
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Download a single file by file ID
     */
    public function downloadFile(string $hash, string $fileId, Request $request): mixed
    {
        logger('downloadFile called', ['hash' => $hash, 'fileId' => $fileId]);
        
        // Load GuestUpload with files
        $guestUpload = GuestUpload::with('files')
            ->where('hash', $hash)
            ->first();
        
        logger('GuestUpload found', ['found' => !!$guestUpload]);

        if (!$guestUpload) {
            logger('Upload not found');
            return response()->json(['message' => 'Upload not found'], 404);
        }

        // Verify password/limits once (not per file)
        $canDownload = $guestUpload->canDownload();
        logger('Can download check', ['canDownload' => $canDownload]);
        
        if (!$canDownload) {
            logger('Cannot download - expired or limit reached');
            return FileDownloadErrorHandler::handleExpiredUpload($guestUpload);
        }

        // Check password using consistent method
        $password = $request->input('password');
        $passwordVerified = $guestUpload->verifyPassword($password);
        logger('Password verification', ['hasPassword' => !!$guestUpload->password, 'verified' => $passwordVerified]);
        
        if (!$passwordVerified) {
            logger('Invalid password');
            return response()->json(['message' => 'Invalid password'], 401);
        }

        // Find the specific file by ID
        $fileEntry = $guestUpload->files()->where('file_entries.id', $fileId)->first();
        logger('File entry found', ['found' => !!$fileEntry, 'fileId' => $fileId]);
        
        if (!$fileEntry) {
            logger('File not found in upload files');
            return response()->json(['message' => 'File not found'], 404);
        }

        try {
            logger('Starting download process for file: ' . $fileEntry->name);
            
            // Use the FilePathResolver to find the actual file
            $fileResult = FilePathResolver::resolve($fileEntry->file_name);
            
            if (!$fileResult) {
                return FileDownloadErrorHandler::handleFileNotFound(
                    $fileEntry->file_name,
                    $fileEntry->name,
                    ['upload_hash' => $hash, 'file_id' => $fileId]
                );
            }
            
            $filePath = $fileResult['path'];
            $useDisk = $fileResult['disk'];
            
            logger('File found successfully', [
                'path' => $filePath,
                'disk' => is_string($useDisk) ? $useDisk : get_class($useDisk)
            ]);

            logger('About to increment download count');
            // Increment download count for successful download
            $guestUpload->incrementDownloadCount();

            // Fire event for download tracking and notifications (handles last_downloaded_at)
            $shareableLink = $guestUpload->shareableLink;
            if ($shareableLink) {
                GuestUploadDownloaded::dispatch($guestUpload, $shareableLink);
            }

            logger('About to start download', ['fileName' => $fileEntry->getNameWithExtension()]);
            
            // Handle direct file access for TUS files
            if ($useDisk === 'direct') {
                return response()->download(
                    $filePath,
                    $fileEntry->getNameWithExtension(),
                    [
                        'Content-Type' => $fileEntry->mime ?? 'application/octet-stream',
                    ]
                );
            }
            
            return $useDisk->download(
                $filePath,
                $fileEntry->getNameWithExtension()
            );
            
        } catch (\Exception $e) {
            return FileDownloadErrorHandler::handleStorageError($e, [
                'upload_hash' => $hash,
                'file_id' => $fileId,
                'file_name' => $fileEntry->name ?? 'unknown'
            ]);
        }
    }

    /**
     * Download all files as a ZIP stream
     */
    public function downloadAll(string $hash, Request $request): mixed
    {
        // Load GuestUpload with files and backward compatibility with fileEntry
        $guestUpload = GuestUpload::with(['files', 'fileEntry'])
            ->where('hash', $hash)
            ->first();

        if (!$guestUpload) {
            return response()->json(['message' => 'Upload not found'], 404);
        }

        // Verify password/limits once (not per file)
        if (!$guestUpload->canDownload()) {
            return FileDownloadErrorHandler::handleExpiredUpload($guestUpload);
        }

        // Check password using consistent method
        $password = $request->input('password') ?? $request->query('password');
        if (!$guestUpload->verifyPassword($password)) {
            return response()->json(['message' => 'Invalid password'], 401);
        }

        $files = $guestUpload->files;
        
        // Backward compatibility: if no files in the new relationship, check the old single fileEntry
        if ($files->isEmpty() && $guestUpload->fileEntry) {
            $files = collect([$guestUpload->fileEntry]);
        }
        
        if ($files->isEmpty()) {
            return response()->json(['message' => 'No files found'], 404);
        }

        // If only one file, download it directly
        if ($files->count() === 1) {
            $fileEntry = $files->first();
            
            try {
                // Use the FilePathResolver to find the actual file
                $fileResult = FilePathResolver::resolve($fileEntry->file_name);
                
                if (!$fileResult) {
                    return FileDownloadErrorHandler::handleFileNotFound(
                        $fileEntry->file_name,
                        $fileEntry->name,
                        ['upload_hash' => $hash, 'download_type' => 'single_file_from_multi']
                    );
                }
                
                $filePath = $fileResult['path'];
                $useDisk = $fileResult['disk'];

                // Increment download count for successful download
                $guestUpload->incrementDownloadCount();

                // Fire event for download tracking and notifications (handles last_downloaded_at)
                $shareableLink = $guestUpload->shareableLink;
                if ($shareableLink) {
                    GuestUploadDownloaded::dispatch($guestUpload, $shareableLink);
                }

                // Handle direct file access for TUS files
                if ($useDisk === 'direct') {
                    return response()->download(
                        $filePath,
                        $fileEntry->getNameWithExtension(),
                        [
                            'Content-Type' => $fileEntry->mime ?? 'application/octet-stream',
                        ]
                    );
                }
                
                return $useDisk->download(
                    $filePath,
                    $fileEntry->getNameWithExtension()
                );
                
            } catch (\Exception $e) {
                return FileDownloadErrorHandler::handleStorageError($e, [
                    'upload_hash' => $hash,
                    'download_type' => 'single_file_from_multi',
                    'file_name' => $fileEntry->name ?? 'unknown'
                ]);
            }
        }

        // Multiple files - stream as ZIP with retry logic
        try {
            return FileDownloadErrorHandler::retryOperation(
                fn() => $this->streamFilesAsZip($guestUpload, $files),
                maxRetries: 2,
                baseDelay: 1
            );
        } catch (\Exception $e) {
            return FileDownloadErrorHandler::handleZipError($e, $files->count(), [
                'upload_hash' => $hash,
                'file_count' => $files->count()
            ]);
        }
    }

    /**
     * Stream multiple files as a ZIP using Laravel's ZipStream
     */
    private function streamFilesAsZip(GuestUpload $guestUpload, $files): StreamedResponse
    {
        return new StreamedResponse(
            function () use ($guestUpload, $files) {
                $timestamp = Carbon::now()->getTimestamp();
                $zip = new ZipStream(
                    defaultEnableZeroHeader: true,
                    contentType: 'application/octet-stream',
                    sendHttpHeaders: true,
                    outputName: "guest-upload-{$guestUpload->hash}-$timestamp.zip",
                );

                $disk = Storage::disk('uploads'); // Dynamic uploads disk (can be Cloudflare R2)
                $localDisk = Storage::disk('local'); // For TUS files
                $filesInZip = []; // Track duplicate file names
                
                foreach ($files as $fileEntry) {
                    try {
                        // Use FilePathResolver to find the actual file location
                        $fileResult = FilePathResolver::resolve($fileEntry->file_name);
                        
                        if (!$fileResult) {
                            logger('File not found in ZIP generation', [
                                'fileName' => $fileEntry->file_name,
                                'originalName' => $fileEntry->name
                            ]);
                            continue; // Skip missing files
                        }
                        
                        $filePath = $fileResult['path'];
                        $useDisk = $fileResult['disk'];

                        // Handle duplicate file names by adding numbers
                        $fileName = $fileEntry->getNameWithExtension();
                        if (isset($filesInZip[$fileName])) {
                            $filesInZip[$fileName]++;
                            $pathInfo = pathinfo($fileName);
                            $fileName = $pathInfo['filename'] . '(' . $filesInZip[$fileName] . ').' . $pathInfo['extension'];
                        } else {
                            $filesInZip[$fileName] = 0;
                        }

                        // Handle direct file access for TUS files
                        if ($useDisk === 'direct') {
                            $stream = fopen($filePath, 'r');
                        } else {
                            $stream = $useDisk->readStream($filePath);
                        }
                        
                        if ($stream) {
                            $zip->addFileFromStream($fileName, $stream);
                            fclose($stream);
                        }
                    } catch (\Exception $e) {
                        // Log error but continue with other files
                        logger('Error adding file to ZIP', [
                            'file_id' => $fileEntry->id,
                            'error' => $e->getMessage()
                        ]);
                        continue;
                    }
                }

                $zip->finish();

                // Increment download count after successful ZIP creation ONCE
                $guestUpload->incrementDownloadCount();

                // Fire event for download tracking and notifications (handles last_downloaded_at)
                $shareableLink = $guestUpload->shareableLink;
                if ($shareableLink) {
                    GuestUploadDownloaded::dispatch($guestUpload, $shareableLink);
                }
            },
            200,
            [
                'X-Accel-Buffering' => 'no',
                'Pragma' => 'public',
                'Cache-Control' => 'no-cache',
                'Content-Transfer-Encoding' => 'binary',
            ],
        );
    }
}
