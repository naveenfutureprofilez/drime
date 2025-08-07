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
        logger('GuestUploadController::store called', ['request' => $request->all()]);
        
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|min:1',
            'files.*' => 'required|file|max:' . config('app.max_file_size', 3145728), // 3GB default
            'password' => 'nullable|string|min:4|max:255',
            'expires_in_hours' => 'nullable|integer|min:1|max:168', // Max 7 days
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
            ], 201);
            
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
     * Download file
     */
    public function download(string $hash, Request $request): mixed
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

        // Check password using consistent method
        $password = $request->input('password');
        if (!$guestUpload->verifyPassword($password)) {
            return response()->json(['message' => 'Invalid password'], 401);
        }

        try {
            $fileEntry = $guestUpload->fileEntry;
            if (!$fileEntry) {
                return response()->json(['message' => 'File not found'], 404);
            }

            // Get file from storage (Cloudflare R2)
            $disk = Storage::disk(config('common.site.uploads_disk'));
            
            // Build the file path - files are stored in guest-uploads folder
            $filePath = $fileEntry->path ? 
                $fileEntry->path . '/' . $fileEntry->file_name : 
                $fileEntry->file_name;
            
            if (!$disk->exists($filePath)) {
                return response()->json(['message' => 'File not found in storage'], 404);
            }

            // Increment download count ONCE before initiating download
            $guestUpload->incrementDownloadCount();

            // Fire event for download tracking and notifications (does not increment count)
            $shareableLink = $guestUpload->shareableLink;
            if ($shareableLink) {
                GuestUploadDownloaded::dispatch($guestUpload, $shareableLink);
            }

            return $disk->download(
                $filePath,
                $guestUpload->original_filename
            );
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Download failed',
                'error' => $e->getMessage()
            ], 500);
        }
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

        $disk = Storage::disk(config('common.site.uploads_disk'));
        
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
        // Load GuestUpload with files
        $guestUpload = GuestUpload::with('files')
            ->where('hash', $hash)
            ->first();

        if (!$guestUpload) {
            return response()->json(['message' => 'Upload not found'], 404);
        }

        // Verify password/limits once (not per file)
        if (!$guestUpload->canDownload()) {
            return response()->json([
                'message' => 'This upload has expired or reached download limit'
            ], 410);
        }

        // Check password using consistent method
        $password = $request->input('password');
        if (!$guestUpload->verifyPassword($password)) {
            return response()->json(['message' => 'Invalid password'], 401);
        }

        // Find the specific file by ID
        $fileEntry = $guestUpload->files()->where('file_entries.id', $fileId)->first();
        
        if (!$fileEntry) {
            return response()->json(['message' => 'File not found'], 404);
        }

        try {
            // Re-use existing disk logic but lookup FileEntry by id
            $disk = Storage::disk(config('common.site.uploads_disk'));
            
            // Build the file path
            $filePath = $fileEntry->path ? 
                $fileEntry->path . '/' . $fileEntry->file_name : 
                $fileEntry->file_name;
            
            if (!$disk->exists($filePath)) {
                return response()->json(['message' => 'File not found in storage'], 404);
            }

            // Increment download count for successful download
            $guestUpload->incrementDownloadCount();

            // Fire event for download tracking and notifications (handles last_downloaded_at)
            $shareableLink = $guestUpload->shareableLink;
            if ($shareableLink) {
                GuestUploadDownloaded::dispatch($guestUpload, $shareableLink);
            }

            return $disk->download(
                $filePath,
                $fileEntry->getNameWithExtension()
            );
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Download failed',
                'error' => $e->getMessage()
            ], 500);
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
            return response()->json([
                'message' => 'This upload has expired or reached download limit'
            ], 410);
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
                $disk = Storage::disk(config('common.site.uploads_disk'));
                
                $filePath = $fileEntry->path ? 
                    $fileEntry->path . '/' . $fileEntry->file_name : 
                    $fileEntry->file_name;
                
                if (!$disk->exists($filePath)) {
                    return response()->json(['message' => 'File not found in storage'], 404);
                }

                // Increment download count for successful download
                $guestUpload->incrementDownloadCount();

                // Fire event for download tracking and notifications (handles last_downloaded_at)
                $shareableLink = $guestUpload->shareableLink;
                if ($shareableLink) {
                    GuestUploadDownloaded::dispatch($guestUpload, $shareableLink);
                }

                return $disk->download(
                    $filePath,
                    $fileEntry->getNameWithExtension()
                );
                
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Download failed',
                    'error' => $e->getMessage()
                ], 500);
            }
        }

        // Multiple files - stream as ZIP
        return $this->streamFilesAsZip($guestUpload, $files);
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

                $disk = Storage::disk(config('common.site.uploads_disk'));
                $filesInZip = []; // Track duplicate file names
                
                foreach ($files as $fileEntry) {
                    try {
                        $filePath = $fileEntry->path ? 
                            $fileEntry->path . '/' . $fileEntry->file_name : 
                            $fileEntry->file_name;
                        
                        if (!$disk->exists($filePath)) {
                            continue; // Skip missing files
                        }

                        // Handle duplicate file names by adding numbers
                        $fileName = $fileEntry->getNameWithExtension();
                        if (isset($filesInZip[$fileName])) {
                            $filesInZip[$fileName]++;
                            $pathInfo = pathinfo($fileName);
                            $fileName = $pathInfo['filename'] . '(' . $filesInZip[$fileName] . ').' . $pathInfo['extension'];
                        } else {
                            $filesInZip[$fileName] = 0;
                        }

                        $stream = $disk->readStream($filePath);
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
