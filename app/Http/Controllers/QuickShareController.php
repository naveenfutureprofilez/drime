<?php

namespace App\Http\Controllers;

use App\Models\FileEntry;
use App\Models\ShareableLink;
use App\Models\GuestUpload;
use Common\Files\Actions\CreateFileEntry;
use Common\Files\Actions\StoreFile;
use Common\Files\Actions\ValidateFileUpload;
use Common\Files\FileEntryPayload;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Mail\GuestUploadSent;
use App\Events\GuestUploadDownloaded;
use Illuminate\Support\Facades\Storage;
use Common\Core\BaseController;
use App\Helpers\EmailUrlHelper;
use App\Helpers\FilePathResolver;

class QuickShareController extends BaseController
{
    /**
     * Initiate/complete guest uploads
     * Reuses FileEntriesController::store logic but skips auth
     */
    public function store(Request $request): JsonResponse
    {
        $parentId = (int) $request->input('parentId') ?: null;
        $request->merge(['parentId' => $parentId]);

        $file = $request->file('file');
        $payload = new FileEntryPayload($request->all());

        // Validate file upload without auth
        $validator = Validator::make($request->all(), [
            'file' => [
                'required',
                'file',
                function ($attribute, $value, $fail) use ($payload) {
                    $errors = app(ValidateFileUpload::class)->execute([
                        'extension' => $payload->clientExtension,
                        'size' => $payload->size,
                    ]);
                    if ($errors) {
                        $fail($errors->first());
                    }
                },
            ],
            'parentId' => 'nullable|exists:file_entries,id',
            'relativePath' => 'nullable|string',
            'retention_hours' => 'nullable|integer|min:1|max:8760', // Max 1 year
            'sender_email' => 'nullable|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Store file using the same logic as FileEntriesController
            app(StoreFile::class)->execute($payload, ['file' => $file]);

            // Create FileEntry with user_id = null (guest upload)
            $payload->ownerId = null; // Flag as guest
            $fileEntry = app(CreateFileEntry::class)->execute($payload);

            // Calculate expiration time
            $retentionHours = $request->input('retention_hours', config('app.guest_upload_default_expiry_hours', 72));
            $maxHours = config('app.guest_upload_max_expiry_hours', 8760);
            $expiresAt = Carbon::now()->addHours(min($retentionHours, $maxHours));

            // Immediately create ShareableLink
            $shareableLink = ShareableLink::create([
                'entry_id' => $fileEntry->id,
                'hash' => Str::random(30),
                'is_guest' => true,
                'expires_at' => $expiresAt,
                'allow_download' => true,
                'allow_edit' => false,
            ]);

            // Persist guest_uploads meta row
            $guestUpload = GuestUpload::create([
                'hash' => Str::random(32),
                'file_entry_id' => $fileEntry->id,
                'original_filename' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'expires_at' => $expiresAt,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'link_id' => $shareableLink->hash,
                'sender_email' => $request->input('sender_email'),
                'total_size' => $file->getSize(),
                'metadata' => [
                    'upload_method' => 'quick-share',
                    'original_extension' => $file->getClientOriginalExtension(),
                ],
                'recipient_emails' => [],
            ]);

            // Return link URL in JSON
            $linkUrl = EmailUrlHelper::emailUrl("/quick-share/link/{$shareableLink->hash}");

            return response()->json([
                'message' => 'File uploaded successfully',
                'data' => [
                    'file_entry' => $fileEntry->load('users'),
                    'shareable_link' => [
                        'hash' => $shareableLink->hash,
                        'url' => $linkUrl,
                        'expires_at' => $shareableLink->expires_at,
                    ],
                    'guest_upload' => [
                        'hash' => $guestUpload->hash,
                        'filename' => $guestUpload->original_filename,
                        'size' => $guestUpload->file_size,
                        'mime_type' => $guestUpload->mime_type,
                    ],
                    'link_url' => $linkUrl,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send link emails
     */
    public function emailShare(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'link_hash' => 'required|string|exists:shareable_links,hash',
            'sender_email' => 'required|email',
            'recipient_emails' => 'required|array|min:1|max:10',
            'recipient_emails.*' => 'required|email',
            'message' => 'nullable|string|max:500',
            'sender_name' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $shareableLink = ShareableLink::where('hash', $request->input('link_hash'))
                ->where('is_guest', true)
                ->with('entry')
                ->first();

            if (!$shareableLink) {
                return response()->json([
                    'message' => 'Shareable link not found or invalid'
                ], 404);
            }

            if ($shareableLink->isExpired()) {
                return response()->json([
                    'message' => 'Shareable link has expired'
                ], 410);
            }

            $senderEmail = $request->input('sender_email');
            $recipientEmails = $request->input('recipient_emails');
            $message = $request->input('message');
            $senderName = $request->input('sender_name', $senderEmail);

            // Update guest upload record with email information
            $guestUpload = GuestUpload::where('link_id', $shareableLink->hash)->first();
            if ($guestUpload) {
                $guestUpload->update([
                    'sender_email' => $senderEmail,
                    'recipient_emails' => $recipientEmails,
                ]);
            }

            $linkUrl = EmailUrlHelper::emailUrl("/quick-share/link/{$shareableLink->hash}");
            $fileEntry = $shareableLink->entry;

            // Send emails to recipients using proper Mailable
            foreach ($recipientEmails as $recipientEmail) {
                Mail::to($recipientEmail)->queue(
                    new GuestUploadSent($shareableLink, $guestUpload, $senderName, $linkUrl, $message)
                );
            }

            return response()->json([
                'message' => 'Email(s) sent successfully',
                'data' => [
                    'sender_email' => $senderEmail,
                    'recipient_count' => count($recipientEmails),
                    'link_url' => $linkUrl,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send emails',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch lightweight payload for guest share page (supports multi-file)
     */
    public function showLink(string $hash): JsonResponse
    {
        $shareableLink = ShareableLink::where('hash', $hash)
            ->where('is_guest', true)
            ->with(['entry'])
            ->first();

        if (!$shareableLink) {
            return response()->json([
                'message' => 'Shareable link not found'
            ], 404);
        }

        if ($shareableLink->isExpired()) {
            return response()->json([
                'message' => 'This link has expired'
            ], 410);
        }

        if ($shareableLink->isGuestDeleted()) {
            return response()->json([
                'message' => 'This link is no longer available'
            ], 410);
        }

        $guestUpload = GuestUpload::with(['files', 'fileEntry'])
            ->where('link_id', $shareableLink->hash)
            ->first();

        if (!$guestUpload) {
            return response()->json([
                'message' => 'Upload data not found'
            ], 404);
        }

        // Get files from the new many-to-many relationship or fall back to old single file
        $files = $guestUpload->files;
        if ($files->isEmpty() && $guestUpload->fileEntry) {
            $files = collect([$guestUpload->fileEntry]);
        }

        // Lightweight payload for guest share page
        $data = [
            'link' => [
                'hash' => $shareableLink->hash,
                'expires_at' => $shareableLink->expires_at,
                'allow_download' => $shareableLink->allow_download,
                'allow_edit' => $shareableLink->allow_edit,
                'has_password' => !is_null($shareableLink->password),
            ],
            'files' => $files->map(function ($file) {
                return [
                    'id' => $file->id,
                    'name' => $file->name,
                    'size' => $file->file_size,
                    'mime_type' => $file->mime,
                    'extension' => $file->extension,
                    'type' => $file->type,
                    'created_at' => $file->created_at,
                ];
            }),
            'guest_upload' => [
                'hash' => $guestUpload->hash,
                'download_count' => $guestUpload->download_count,
                'max_downloads' => $guestUpload->max_downloads,
                'sender_email' => $guestUpload->sender_email,
                'last_downloaded_at' => $guestUpload->last_downloaded_at,
                'total_size' => $guestUpload->total_size,
                'file_count' => $files->count(),
            ],
        ];

        // Legacy support: add single 'file' field if only one file exists
        if ($files->count() === 1) {
            $file = $files->first();
            $data['file'] = [
                'id' => $file->id,
                'name' => $file->name,
                'size' => $file->file_size,
                'mime_type' => $file->mime,
                'extension' => $file->extension,
                'type' => $file->type,
                'created_at' => $file->created_at,
            ];
        }

        return response()->json([
            'data' => $data
        ]);
    }

    /**
     * Download file through quick-share link (legacy single file support)
     */
    public function download(string $hash, Request $request): mixed
    {
        $shareableLink = ShareableLink::where('hash', $hash)
            ->where('is_guest', true)
            ->with('entry')
            ->first();

        if (!$shareableLink) {
            return response()->json(['message' => 'Shareable link not found'], 404);
        }

        if ($shareableLink->isExpired()) {
            return response()->json([
                'message' => 'This link has expired'
            ], 410);
        }

        if ($shareableLink->isGuestDeleted()) {
            return response()->json([
                'message' => 'This link is no longer available'
            ], 410);
        }

        $guestUpload = GuestUpload::with(['files', 'fileEntry'])
            ->where('link_id', $shareableLink->hash)
            ->first();
            
        if (!$guestUpload || !$guestUpload->canDownload()) {
            return response()->json([
                'message' => 'This upload has expired or reached download limit'
            ], 410);
        }

        // Check password using consistent method
        $password = $request->input('password');
        if (!$guestUpload->verifyPassword($password)) {
            return response()->json(['message' => 'Invalid password'], 401);
        }

        // Get files from the new many-to-many relationship or fall back to old single file
        $files = $guestUpload->files;
        if ($files->isEmpty() && $guestUpload->fileEntry) {
            $files = collect([$guestUpload->fileEntry]);
        }
        
        if ($files->isEmpty()) {
            return response()->json(['message' => 'No files found'], 404);
        }

        // If multiple files, return as ZIP
        if ($files->count() > 1) {
            return $this->downloadAllFilesAsZip($guestUpload, $files);
        }

        // Single file download
        $fileEntry = $files->first();
        
        try {
            // Use FilePathResolver to find the actual file location
            $fileResult = FilePathResolver::resolve($fileEntry->file_name);
            
            if (!$fileResult) {
                return response()->json([
                    'message' => 'File not found in storage',
                    'debug' => [
                        'stored_name' => $fileEntry->file_name,
                        'original_name' => $fileEntry->name
                    ]
                ], 404);
            }
            
            $filePath = $fileResult['path'];
            $useDisk = $fileResult['disk'];

            // Increment download count ONCE before initiating download
            $guestUpload->incrementDownloadCount();

            // Fire event for download tracking and notifications (does not increment count)
            GuestUploadDownloaded::dispatch($guestUpload, $shareableLink);

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
            return response()->json([
                'message' => 'Download failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download a specific file by ID through quick-share link
     */
    public function downloadFile(string $hash, string $fileId, Request $request): mixed
    {
        $shareableLink = ShareableLink::where('hash', $hash)
            ->where('is_guest', true)
            ->first();

        if (!$shareableLink) {
            return response()->json(['message' => 'Shareable link not found'], 404);
        }

        if ($shareableLink->isExpired()) {
            return response()->json([
                'message' => 'This link has expired'
            ], 410);
        }

        if ($shareableLink->isGuestDeleted()) {
            return response()->json([
                'message' => 'This link is no longer available'
            ], 410);
        }

        $guestUpload = GuestUpload::with('files')
            ->where('link_id', $shareableLink->hash)
            ->first();
            
        if (!$guestUpload || !$guestUpload->canDownload()) {
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
            // Use FilePathResolver to find the actual file location
            $fileResult = FilePathResolver::resolve($fileEntry->file_name);
            
            if (!$fileResult) {
                return response()->json([
                    'message' => 'File not found in storage',
                    'debug' => [
                        'stored_name' => $fileEntry->file_name,
                        'original_name' => $fileEntry->name
                    ]
                ], 404);
            }
            
            $filePath = $fileResult['path'];
            $useDisk = $fileResult['disk'];

            // Increment download count for successful download
            $guestUpload->incrementDownloadCount();

            // Fire event for download tracking and notifications
            GuestUploadDownloaded::dispatch($guestUpload, $shareableLink);

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
            return response()->json([
                'message' => 'Download failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download all files as ZIP through quick-share link
     */
    public function downloadAll(string $hash, Request $request): mixed
    {
        $shareableLink = ShareableLink::where('hash', $hash)
            ->where('is_guest', true)
            ->first();

        if (!$shareableLink) {
            return response()->json(['message' => 'Shareable link not found'], 404);
        }

        if ($shareableLink->isExpired()) {
            return response()->json([
                'message' => 'This link has expired'
            ], 410);
        }

        if ($shareableLink->isGuestDeleted()) {
            return response()->json([
                'message' => 'This link is no longer available'
            ], 410);
        }

        $guestUpload = GuestUpload::with(['files', 'fileEntry'])
            ->where('link_id', $shareableLink->hash)
            ->first();
            
        if (!$guestUpload || !$guestUpload->canDownload()) {
            return response()->json([
                'message' => 'This upload has expired or reached download limit'
            ], 410);
        }

        // Check password using consistent method
        $password = $request->input('password') ?? $request->query('password');
        if (!$guestUpload->verifyPassword($password)) {
            return response()->json(['message' => 'Invalid password'], 401);
        }

        // Get files from the new many-to-many relationship or fall back to old single file
        $files = $guestUpload->files;
        if ($files->isEmpty() && $guestUpload->fileEntry) {
            $files = collect([$guestUpload->fileEntry]);
        }
        
        if ($files->isEmpty()) {
            return response()->json(['message' => 'No files found'], 404);
        }

        return $this->downloadAllFilesAsZip($guestUpload, $files, $shareableLink);
    }

    /**
     * Helper method to download multiple files as ZIP
     */
    private function downloadAllFilesAsZip($guestUpload, $files, $shareableLink = null)
    {
        return response()->stream(
            function () use ($guestUpload, $files, $shareableLink) {
                $timestamp = Carbon::now()->getTimestamp();
                
                // Use proper streaming ZIP library instead of creating temp files
                $zip = new ZipStream\ZipStream(
                    defaultEnableZeroHeader: true,
                    contentType: 'application/zip',
                    sendHttpHeaders: true,
                    outputName: "quickshare-{$guestUpload->hash}-$timestamp.zip",
                );
                
                $filesInZip = []; // Track duplicate file names
                $addedFiles = 0;
                
                foreach ($files as $fileEntry) {
                    try {
                        // Use FilePathResolver to find the actual file location
                        $fileResult = FilePathResolver::resolve($fileEntry->file_name);
                        
                        if (!$fileResult) {
                            logger('File not found in QuickShare ZIP generation', [
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
                            $fileName = $pathInfo['filename'] . '(' . $filesInZip[$fileName] . ').' . ($pathInfo['extension'] ?? '');
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
                            $addedFiles++;
                        }
                    } catch (\Exception $e) {
                        // Log error but continue with other files
                        logger('Error adding file to QuickShare ZIP', [
                            'file_id' => $fileEntry->id,
                            'error' => $e->getMessage()
                        ]);
                        continue;
                    }
                }

                $zip->finish();

                // Increment download count after successful ZIP creation
                if ($addedFiles > 0) {
                    $guestUpload->incrementDownloadCount();

                    // Fire event for download tracking and notifications
                    if ($shareableLink) {
                        GuestUploadDownloaded::dispatch($guestUpload, $shareableLink);
                    }
                }
            },
            200,
            [
                'X-Accel-Buffering' => 'no',
                'Pragma' => 'public',
                'Cache-Control' => 'no-cache',
                'Content-Transfer-Encoding' => 'binary',
            ]
        );
    }

}
