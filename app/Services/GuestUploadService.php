<?php

namespace App\Services;

use App\Models\GuestUpload;
use App\Models\FileEntry;
use App\Models\ShareableLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;
use App\Mail\UploadConfirmation;
use App\Helpers\EmailUrlHelper;

class GuestUploadService
{
    /**
     * Handle guest file upload
     */
    public function handleUpload(Request $request): array
    {
        // a. Validate guest access as today
        $this->validateGuestUploadAccess();
        
        $files = $request->file('files');
        
        logger('GuestUploadService::handleUpload - Files received', [
            'file_count' => $files ? count($files) : 0,
            'file_names' => $files ? array_map(fn($f) => $f->getClientOriginalName(), $files) : []
        ]);
        
        // b. Create the GuestUpload *before* iterating files. Populate all non-file fields once.
        $expiresAt = $this->calculateExpiryTime($request->integer('expires_in_hours', 72)); // Default 3 days
        $password = $request->string('password')->toString();
        $maxDownloads = $request->integer('max_downloads');
        
        // Process form data - map frontend fields correctly
        $recipientEmail = $request->string('sender_email')->toString(); // Frontend sends as 'sender_email' but it's actually recipient
        $title = $request->string('sender_name')->toString(); // Frontend sends as 'sender_name' but it's actually title
        $message = $request->string('message')->toString();
        
        logger('Form data processed', [
            'recipient_email' => $recipientEmail,
            'title' => $title,
            'message' => $message
        ]);
        
        $guestUpload = GuestUpload::create([
            'password' => $password ?: null,
            'expires_at' => $expiresAt,
            'max_downloads' => $maxDownloads,
            'sender_email' => null, // This is for the actual sender, not the form email
            'title' => $title ?: null, // Store the title from form in dedicated title column
            'message' => $message ?: null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'upload_method' => 'direct', // Will be 'tus' for resumable uploads
            ],
            'recipient_emails' => $recipientEmail ?: null, // Store the email from form as string
            'total_size' => 0, // Will be updated after processing all files
        ]);
        
        $totalSize = 0;
        $uploadedFiles = [];

        // c. Inside the loop keep previous logic for FileEntry creation but do not create GuestUpload rows
        foreach ($files as $file) {
            // Store file using configured uploads disk (can be Cloudflare R2)
            $disk = Storage::disk('uploads'); // This uses the dynamic-uploads driver
            $fileName = $this->generateUniqueFileName($file);
            $path = $disk->putFileAs('guest-uploads', $file, $fileName);
            
            if (!$path) {
                throw new \Exception('Failed to store file: ' . $file->getClientOriginalName());
            }

            // Create FileEntry (for compatibility with existing system)
            $fileEntry = FileEntry::create([
                'name' => $file->getClientOriginalName(),
                'file_name' => $fileName,
                'mime' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'extension' => $file->getClientOriginalExtension(),
                'user_id' => null, // Guest upload
                'parent_id' => null,
                'path' => 'guest-uploads',
                'disk_prefix' => 'uploads', // Uses dynamic-uploads driver
                'type' => 'file',
            ]);

            // After each FileEntry is stored: attach to GuestUpload and track total size
            $guestUpload->files()->attach($fileEntry->id);
            $totalSize += $file->getSize();
            
            // Build file info for response
            $uploadedFiles[] = [
                'id' => $fileEntry->id,
                'filename' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'download_url' => EmailUrlHelper::emailUrl("/download/{$guestUpload->hash}/{$fileEntry->id}"),
                'share_url' => EmailUrlHelper::emailUrl("/share/{$guestUpload->hash}"),
            ];
        }

        // d. After loop finishes, update total_size and mark as completed immediately
        $guestUpload->update([
            'total_size' => $totalSize,
            'status' => 'completed' // Mark as completed immediately
        ]);

        // e. OPTIMIZED: Send confirmation email asynchronously (completely optional)
        $emailSent = false;
        if ($recipientEmail) {
            // Dispatch background job for email sending with delay
            \App\Jobs\ProcessGuestUploadJob::dispatch(
                $guestUpload->hash,
                $guestUpload->files->first()?->id ?? 0,
                $recipientEmail
            )->delay(now()->addSeconds(10)); // Longer delay since it's not critical
            $emailSent = true; // Set to true since job is dispatched
        }

        // f. Build response payload
        return [
            'hash' => $guestUpload->hash,
            'expires_at' => $guestUpload->expires_at->toISOString(),
            'files' => $uploadedFiles,
            'download_all_url' => EmailUrlHelper::emailUrl("/download/{$guestUpload->hash}"),
            'email_sent' => $emailSent,
            'recipient_email' => $recipientEmail,
        ];
    }

    /**
     * Handle TUS upload completion with multi-file support (Optimized)
     * 
     * This method supports grouping multiple TUS uploads into a single GuestUpload:
     * 1. If upload_group_hash is provided, attach the file to existing GuestUpload
     * 2. If upload_group_hash is not provided, create a new GuestUpload
     * 3. The response always echoes the shared hash for the client to use in subsequent uploads
     * 4. Heavy processing (cloud transfer, email) is moved to background job
     * 
     * @param string $uploadKey The TUS upload key for this specific file
     * @param Request $request Request containing upload_group_hash and other parameters
     * @return array Response containing the shared hash and file information
     */
    public function handleTusUpload(string $uploadKey, Request $request): array
    {
        $startTime = microtime(true);
        logger('GuestUploadService::handleTusUpload - Started', [
            'upload_key' => $uploadKey,
            'start_time' => $startTime
        ]);
        
        // This will be called when TUS upload is completed
        // The file is already stored by TUS protocol
        
        $tusData = app(\Common\Files\Tus\TusCache::class)->get($uploadKey);
        if (!$tusData) {
            throw new \Exception('TUS upload data not found');
        }
        
        logger('GuestUploadService::handleTusUpload - TUS data retrieved', [
            'upload_key' => $uploadKey,
            'elapsed_ms' => (microtime(true) - $startTime) * 1000
        ]);

        // Extract file information from TUS metadata
        $metadata = $tusData['metadata'] ?? [];
        $fileName = $metadata['name'] ?? $metadata['clientName'] ?? 'unknown';
        $fileSize = $tusData['size'] ?? 0;
        $mimeType = $metadata['clientMime'] ?? $metadata['mime'] ?? 'application/octet-stream';
        
        // Debug the TUS data structure
        logger('TUS data structure debug', [
            'tusData_keys' => array_keys($tusData),
            'metadata' => $metadata,
            'fileName' => $fileName,
            'fileSize' => $fileSize,
            'mimeType' => $mimeType
        ]);
        
        // Get or create GuestUpload based on upload_group_hash
        $uploadGroupHash = $request->string('upload_group_hash')->toString();
        $recipientEmail = $request->string('sender_email')->toString();
        $senderName = $request->string('sender_name')->toString();
        $message = $request->string('message')->toString();
        $isNewUploadGroup = !$uploadGroupHash;
        
        logger('GuestUploadService::handleTusUpload - Form data extracted', [
            'recipient_email' => $recipientEmail,
            'sender_name' => $senderName,
            'message' => $message,
            'upload_group_hash' => $uploadGroupHash
        ]);
        
        if ($uploadGroupHash) {
            // Find existing GuestUpload by upload_group_hash
            $guestUpload = GuestUpload::where('hash', $uploadGroupHash)->first();
            
            if (!$guestUpload) {
                throw new \Exception('Upload group not found');
            }
        } else {
            // Create new GuestUpload if no upload_group_hash supplied
            $expiresAt = $this->calculateExpiryTime(
                $request->integer('expires_in_hours', 72)
            );
            
            // Process form data for TUS uploads too
            $title = $senderName ?: null; // Use extracted sender_name as title
            
            $guestUpload = GuestUpload::create([
                'password' => $request->string('password')->toString() ?: null,
                'expires_at' => $expiresAt,
                'max_downloads' => $request->integer('max_downloads'),
                'sender_email' => null,
                'title' => $title,
                'message' => $message ?: null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metadata' => [
                    'upload_method' => 'tus',
                ],
                'recipient_emails' => $recipientEmail ?: null, // Store as string
                'total_size' => 0, // Will be updated after attaching files
            ]);
        }
        
        // Create FileEntry for TUS uploaded file
        // TUS server already decoded the metadata, so use filename directly
        $decodedName = $fileName;
        
        // Only attempt base64 decode if fileName looks like encoded data
        if ($fileName !== 'unknown' && base64_encode(base64_decode($fileName, true)) === $fileName) {
            try {
                $decoded = base64_decode($fileName);
                if (mb_check_encoding($decoded, 'UTF-8')) {
                    $decodedName = $decoded;
                }
            } catch (\Exception $e) {
                // Keep original if decoding fails
                $decodedName = $fileName;
            }
        }
        
        // Prepare for cloud storage transfer (will be done asynchronously)
        $finalDisk = Storage::disk('uploads'); // Dynamic uploads disk
        $localTusPath = storage_path("tus/{$uploadKey}");
        
        $finalFileName = $this->generateUniqueFileName($decodedName);
        $cloudPath = "guest-uploads/{$finalFileName}";
        
        // Check if we should move to cloud storage
        $shouldMoveToCloud = config('common.site.uploads_disk_driver') !== 'local';
        
        if ($shouldMoveToCloud && file_exists($localTusPath)) {
            // OPTIMIZED: Don't move to cloud storage synchronously - do it in background job
            // For now, create FileEntry pointing to local TUS storage
            // The background job will handle the cloud transfer and update the FileEntry
            
            logger()->info('Scheduling TUS file for cloud storage transfer', [
                'upload_key' => $uploadKey,
                'file_size' => $fileSize,
                'source' => $localTusPath,
                'destination' => $cloudPath,
                'will_transfer_async' => true
            ]);
            
            // Temporarily keep file in local storage, will be moved by background job
            $diskPrefix = 'local';
            $finalPath = 'tus';
            $finalFileName = $uploadKey;
            
            // Store metadata for background job to process later
            $guestUpload->update([
                'metadata' => array_merge($guestUpload->metadata ?? [], [
                    'pending_cloud_transfer' => [
                        'upload_key' => $uploadKey,
                        'local_path' => $localTusPath,
                        'cloud_path' => $cloudPath,
                        'final_filename' => $this->generateUniqueFileName($decodedName)
                    ]
                ])
            ]);
        } else {
            // Keep file in local TUS storage
            $finalFileName = $uploadKey;
            $diskPrefix = 'local';
            $finalPath = 'tus';
        }
        
        $fileEntry = FileEntry::create([
            'name' => $decodedName,
            'file_name' => $finalFileName,
            'mime' => $mimeType,
            'file_size' => $fileSize,
            'extension' => pathinfo($decodedName, PATHINFO_EXTENSION),
            'user_id' => null,
            'parent_id' => null,
            'path' => $finalPath,
            'disk_prefix' => $diskPrefix,
            'type' => 'file',
        ]);

        // OPTIMIZED: Use a single database transaction for better performance
        \DB::transaction(function () use ($guestUpload, $fileEntry, $fileSize) {
            // Attach the file to the GuestUpload
            $guestUpload->files()->attach($fileEntry->id);
            
            // Update total size efficiently - just add the current file size instead of recalculating
            $currentTotalSize = $guestUpload->total_size + $fileSize;
            $guestUpload->update([
                'total_size' => $currentTotalSize,
                'status' => 'completed' // Mark as completed immediately - background jobs handle the rest
            ]);
        });
        
        logger()->info('File entry created successfully', [
            'upload_key' => $uploadKey,
            'file_entry_id' => $fileEntry->id,
            'file_name' => $decodedName,
            'file_size' => $fileSize,
            'guest_upload_hash' => $guestUpload->hash,
            'total_files' => $guestUpload->files()->count(),
            'total_size' => $guestUpload->fresh()->total_size
        ]);

        // OPTIMIZED: Dispatch background jobs for heavy operations (non-blocking)
        
        // Only dispatch jobs for heavy operations that don't affect upload completion
        if ($shouldMoveToCloud && isset($guestUpload->metadata['pending_cloud_transfer'])) {
            \App\Jobs\TransferFileToCloudJob::dispatch(
                $fileEntry->id,
                $guestUpload->metadata['pending_cloud_transfer']
            )->delay(now()->addSeconds(5)); // Longer delay since it's not user-facing
        }
        
        // Email sending is completely optional - dispatch with delay
        $emailWillBeSent = false;
        if ($isNewUploadGroup && $recipientEmail) {
            \App\Jobs\ProcessGuestUploadJob::dispatch(
                $guestUpload->hash,
                $fileEntry->id,
                $recipientEmail
            )->delay(now()->addSeconds(10)); // Much longer delay since it's not critical
            
            $emailWillBeSent = true;
            logger('Email job dispatched for guest upload', [
                'guest_upload_hash' => $guestUpload->hash,
                'recipient_email' => $recipientEmail
            ]);
        }

        logger('GuestUploadService::handleTusUpload - Completed', [
            'upload_key' => $uploadKey,
            'total_elapsed_ms' => (microtime(true) - $startTime) * 1000,
            'file_entry_id' => $fileEntry->id,
            'guest_upload_hash' => $guestUpload->hash,
            'email_will_be_sent' => $emailWillBeSent
        ]);
        
        return [
            'hash' => $guestUpload->hash, // Return shared hash for group
            'fileEntry' => [ // Maintain compatibility with existing TUS frontend
                'id' => $fileEntry->id,
                'name' => $fileEntry->name,
                'file_name' => $fileEntry->file_name,
                'mime' => $fileEntry->mime,
                'file_size' => $fileEntry->file_size,
                'extension' => $fileEntry->extension,
            ],
            'upload_group_hash' => $guestUpload->hash,
            'total_files' => $guestUpload->files()->count(),
            'total_size' => $guestUpload->fresh()->total_size,
            'expires_at' => $guestUpload->expires_at->toISOString(),
            'download_url' => EmailUrlHelper::emailUrl("/download/{$guestUpload->hash}"),
            'share_url' => EmailUrlHelper::emailUrl("/share/{$guestUpload->hash}"),
            'email_sent' => $emailWillBeSent, // Only true if email job was actually dispatched
        ];
    }

    /**
     * Purge expired uploads based on retention policy
     */
    public function purgeExpiredUploads(): array
    {
        $retentionDays = settings('guest_uploads.retention_days', 30);
        $cutoffTime = Carbon::now()->subDays($retentionDays);
        
        $counters = [
            'guest_uploads' => 0,
            'file_entries' => 0,
            'shareable_links' => 0,
            'physical_files' => 0,
        ];

        // Get expired uploads (either by expires_at or retention policy)
        $expiredUploads = GuestUpload::withoutGlobalScopes()
            ->with(['files', 'shareableLink'])
            ->where(function ($query) use ($cutoffTime) {
                $query->where('expires_at', '<', Carbon::now())
                      ->orWhere('created_at', '<', $cutoffTime);
            })
            ->get();

        foreach ($expiredUploads as $upload) {
            try {
                // Delete associated ShareableLink if exists
                if ($upload->shareableLink) {
                    ShareableLink::withoutGlobalScopes()
                        ->where('id', $upload->shareableLink->id)
                        ->delete();
                    $counters['shareable_links']++;
                }
                
                // Loop through all associated files to delete physical files and FileEntry rows
                foreach ($upload->files as $fileEntry) {
                    // Delete physical file from storage
                    $disk = Storage::disk($fileEntry->disk_prefix ?: config('common.site.uploads_disk', 'uploads'));
                    $filePath = $fileEntry->path ? 
                        $fileEntry->path . '/' . $fileEntry->file_name : 
                        $fileEntry->file_name;
                    
                    if ($disk->exists($filePath)) {
                        $disk->delete($filePath);
                        $counters['physical_files']++;
                    }
                    
                    // Delete FileEntry record
                    $fileEntry->delete();
                    $counters['file_entries']++;
                }
                
                // Delete GuestUpload record (pivot rows will be cascade deleted)
                $upload->delete();
                $counters['guest_uploads']++;
                
            } catch (\Exception $e) {
                // Log error but continue cleanup
                logger()->error('Failed to purge expired upload: ' . $e->getMessage(), [
                    'upload_id' => $upload->id,
                    'hash' => $upload->hash,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Also clean up orphaned guest ShareableLinks that are expired
        $expiredLinks = ShareableLink::withoutGlobalScopes()
            ->where('is_guest', true)
            ->where(function ($query) use ($cutoffTime) {
                $query->where('expires_at', '<', Carbon::now())
                      ->orWhere('created_at', '<', $cutoffTime)
                      ->orWhereNotNull('guest_deleted_at');
            })
            ->whereDoesntHave('entry') // Orphaned links
            ->get();
            
        foreach ($expiredLinks as $link) {
            try {
                $link->delete();
                $counters['shareable_links']++;
            } catch (\Exception $e) {
                logger()->error('Failed to delete orphaned shareable link: ' . $e->getMessage(), [
                    'link_id' => $link->id,
                ]);
            }
        }

        // Clean up stale rows from guest_upload_files pivot table with orphaned foreign keys
        $this->cleanupOrphanedPivotRows($counters);

        return $counters;
    }

    /**
     * Clean up expired uploads (legacy method)
     */
    public function cleanupExpiredUploads(): int
    {
        $result = $this->purgeExpiredUploads();
        return $result['guest_uploads'];
    }

    /**
     * Generate unique filename for storage
     */
    private function generateUniqueFileName($file): string
    {
        if (is_string($file)) {
            // For TUS uploads, $file is the filename string
            $extension = pathinfo($file, PATHINFO_EXTENSION);
            $hash = hash('sha256', $file . time() . rand());
            return $hash . ($extension ? '.' . $extension : '');
        } else {
            // For regular uploads, $file is UploadedFile object
            $extension = $file->getClientOriginalExtension();
            $hash = hash('sha256', $file->getClientOriginalName() . time() . rand());
            return $hash . ($extension ? '.' . $extension : '');
        }
    }

    /**
     * Calculate expiry time based on hours
     */
    private function calculateExpiryTime(?int $hours): Carbon
    {
        $hours = $hours ?: config('app.guest_upload_default_expiry_hours', 72);
        $maxHours = config('app.guest_upload_max_expiry_hours', 8760); // 1 year max (365 * 24)
        
        return Carbon::now()->addHours(min($hours, $maxHours));
    }

    /**
     * Clean up orphaned pivot table rows where foreign keys no longer exist
     */
    private function cleanupOrphanedPivotRows(array &$counters): void
    {
        try {
            // Clean up pivot rows where guest_upload_id doesn't exist
            $orphanedByGuestUpload = \Illuminate\Support\Facades\DB::table('guest_upload_files as guf')
                ->leftJoin('guest_uploads as gu', 'guf.guest_upload_id', '=', 'gu.id')
                ->whereNull('gu.id')
                ->count();

            if ($orphanedByGuestUpload > 0) {
                \Illuminate\Support\Facades\DB::table('guest_upload_files as guf')
                    ->leftJoin('guest_uploads as gu', 'guf.guest_upload_id', '=', 'gu.id')
                    ->whereNull('gu.id')
                    ->delete();
                
                logger()->info('Cleaned up orphaned guest_upload_files rows (missing guest_upload)', [
                    'count' => $orphanedByGuestUpload
                ]);
            }

            // Clean up pivot rows where file_entry_id doesn't exist
            $orphanedByFileEntry = \Illuminate\Support\Facades\DB::table('guest_upload_files as guf')
                ->leftJoin('file_entries as fe', 'guf.file_entry_id', '=', 'fe.id')
                ->whereNull('fe.id')
                ->count();

            if ($orphanedByFileEntry > 0) {
                \Illuminate\Support\Facades\DB::table('guest_upload_files as guf')
                    ->leftJoin('file_entries as fe', 'guf.file_entry_id', '=', 'fe.id')
                    ->whereNull('fe.id')
                    ->delete();
                
                logger()->info('Cleaned up orphaned guest_upload_files rows (missing file_entry)', [
                    'count' => $orphanedByFileEntry
                ]);
            }
            
        } catch (\Exception $e) {
            logger()->error('Failed to cleanup orphaned pivot rows: ' . $e->getMessage());
        }
    }

    /**
     * Validate guest upload access - ensures feature works independently of billing system
     * 
     * @throws ValidationException
     */
    private function validateGuestUploadAccess(): void
    {
        // Check if guest uploads are enabled
        if (!settings('guest_uploads.enabled', true)) {
            throw ValidationException::withMessages([
                'guest_uploads' => ['Guest uploads are currently disabled.']
            ]);
        }

        // Ensure feature works when BILLING_ENABLED is false
        // No subscription checks for guest uploads - they should always work
        // if the feature is enabled, regardless of billing configuration
        
        // Note: Guest uploads are a standalone feature that should not be 
        // dependent on user subscriptions or billing status. This ensures
        // the feature works even when BILLING_ENABLED=false.
        
        logger('Guest upload access validated', [
            'guest_uploads_enabled' => settings('guest_uploads.enabled', true),
            'billing_enabled' => env('BILLING_ENABLED', false),
            'max_size_mb' => settings('guest_uploads.max_size_mb', 100)
        ]);
    }

    /**
     * Send upload confirmation email to the uploader
     */
    private function sendUploadConfirmation(GuestUpload $guestUpload, string $email): void
    {
        try {
            logger('Starting email sending process', [
                'email' => $email,
                'upload_hash' => $guestUpload->hash
            ]);
            
            // Create or get shareable link for the upload
            $shareableLink = $guestUpload->shareableLink;
            if (!$shareableLink) {
                logger('Creating new shareable link');
                // Create a shareable link if it doesn't exist
                $shareableLink = ShareableLink::create([
                    'entry_id' => $guestUpload->files->first()->id ?? null,
                    'hash' => \Illuminate\Support\Str::random(30),
                    'is_guest' => true,
                    'expires_at' => $guestUpload->expires_at,
                    'allow_download' => true,
                    'allow_edit' => false,
                ]);
                
                // Update guest upload with the new link
                $guestUpload->update(['link_id' => $shareableLink->hash]);
                logger('Shareable link created', ['link_hash' => $shareableLink->hash]);
            } else {
                logger('Using existing shareable link', ['link_hash' => $shareableLink->hash]);
            }

            $linkUrl = EmailUrlHelper::emailUrl("/share/{$guestUpload->hash}");
            
            logger('About to create UploadConfirmation mailable', [
                'linkUrl' => $linkUrl,
                'files_count' => $guestUpload->files()->count(),
                'total_size' => $guestUpload->total_size
            ]);

            // Send confirmation email immediately (synchronous)
            try {
                $mailable = new UploadConfirmation($guestUpload, $shareableLink, $linkUrl);
                logger('Mailable created successfully, sending email');
                
                // Test mailable content generation
                $envelope = $mailable->envelope();
                logger('Envelope created successfully', [
                    'subject' => $envelope->subject,
                    'from' => $envelope->from ? (is_array($envelope->from) ? $envelope->from[0]->address : $envelope->from->address) : 'none'
                ]);
                
                $content = $mailable->content();
                logger('Content created successfully', [
                    'view' => $content->view,
                    'data_keys' => array_keys($content->with ?? [])
                ]);
                
                Mail::to($email)->send($mailable);
                
                logger('Mail::send completed successfully');
            } catch (\Exception $mailableException) {
                logger('Exception during mailable creation or sending', [
                    'error' => $mailableException->getMessage(),
                    'trace' => $mailableException->getTraceAsString(),
                    'file' => $mailableException->getFile(),
                    'line' => $mailableException->getLine()
                ]);
                throw $mailableException;
            }

            logger('Upload confirmation email sent', [
                'email' => $email,
                'upload_hash' => $guestUpload->hash,
                'link_url' => $linkUrl
            ]);

        } catch (\Exception $e) {
            logger('Failed to send upload confirmation email', [
                'email' => $email,
                'upload_hash' => $guestUpload->hash ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            // Re-throw the exception so it's visible in the response
            throw $e;
        }
    }

    /**
     * Send upload confirmation email asynchronously (for background jobs)
     */
    public function sendConfirmationEmailAsync(GuestUpload $guestUpload, string $email): void
    {
        \Illuminate\Support\Facades\Log::info('GuestUploadService::sendConfirmationEmailAsync called', [
            'guest_upload_id' => $guestUpload->id,
            'guest_upload_hash' => $guestUpload->hash,
            'email' => $email,
            'current_email_sent_status' => $guestUpload->email_sent
        ]);
        
        try {
            \Illuminate\Support\Facades\Log::info('Calling private sendUploadConfirmation method');
            $this->sendUploadConfirmation($guestUpload, $email);
            \Illuminate\Support\Facades\Log::info('sendUploadConfirmation completed successfully');
        } catch (\Exception $e) {
            // Log error but don't throw - email failure shouldn't break the upload
            \Illuminate\Support\Facades\Log::error('Async email sending failed in GuestUploadService', [
                'guest_upload_hash' => $guestUpload->hash,
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
        }
    }
}
