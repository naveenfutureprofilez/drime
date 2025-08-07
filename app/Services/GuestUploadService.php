<?php

namespace App\Services;

use App\Models\GuestUpload;
use App\Models\FileEntry;
use App\Models\ShareableLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

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
        
        // b. Create the GuestUpload *before* iterating files. Populate all non-file fields once.
        $expiresAt = $this->calculateExpiryTime($request->integer('expires_in_hours', 72)); // Default 3 days
        $password = $request->string('password')->toString();
        $maxDownloads = $request->integer('max_downloads');
        
        $guestUpload = GuestUpload::create([
            'password' => $password ?: null,
            'expires_at' => $expiresAt,
            'max_downloads' => $maxDownloads,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'upload_method' => 'direct', // Will be 'tus' for resumable uploads
            ],
            'recipient_emails' => [],
            'total_size' => 0, // Will be updated after processing all files
        ]);
        
        $totalSize = 0;
        $uploadedFiles = [];

        // c. Inside the loop keep previous logic for FileEntry creation but do not create GuestUpload rows
        foreach ($files as $file) {
            // Store file using configured disk (Cloudflare R2)
            $disk = Storage::disk(config('common.site.uploads_disk'));
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
                'disk_prefix' => config('common.site.uploads_disk'),
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
                'download_url' => url("/download/{$guestUpload->hash}?file={$fileEntry->id}"),
                'share_url' => url("/share/{$guestUpload->hash}"),
            ];
        }

        // d. After loop finishes, update total_size and save
        $guestUpload->total_size = $totalSize;
        $guestUpload->save();

        // e. Build response payload
        return [
            'hash' => $guestUpload->hash,
            'expires_at' => $guestUpload->expires_at->toISOString(),
            'files' => $uploadedFiles,
            'download_all_url' => url("/download/{$guestUpload->hash}"),
        ];
    }

    /**
     * Handle TUS upload completion with multi-file support
     * 
     * This method supports grouping multiple TUS uploads into a single GuestUpload:
     * 1. If upload_group_hash is provided, attach the file to existing GuestUpload
     * 2. If upload_group_hash is not provided, create a new GuestUpload
     * 3. The response always echoes the shared hash for the client to use in subsequent uploads
     * 
     * @param string $uploadKey The TUS upload key for this specific file
     * @param Request $request Request containing upload_group_hash and other parameters
     * @return array Response containing the shared hash and file information
     */
    public function handleTusUpload(string $uploadKey, Request $request): array
    {
        // This will be called when TUS upload is completed
        // The file is already stored by TUS protocol
        
        $tusData = app(\Common\Files\Tus\TusCache::class)->get($uploadKey);
        if (!$tusData) {
            throw new \Exception('TUS upload data not found');
        }

        $fileName = $tusData['name'] ?? 'unknown';
        $fileSize = $tusData['size'] ?? 0;
        $mimeType = $tusData['mime'] ?? 'application/octet-stream';
        
        // Get or create GuestUpload based on upload_group_hash
        $uploadGroupHash = $request->string('upload_group_hash')->toString();
        
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
            
            $guestUpload = GuestUpload::create([
                'password' => $request->string('password')->toString() ?: null,
                'expires_at' => $expiresAt,
                'max_downloads' => $request->integer('max_downloads'),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metadata' => [
                    'upload_method' => 'tus',
                ],
                'recipient_emails' => [],
                'total_size' => 0, // Will be updated after attaching files
            ]);
        }
        
        // Create FileEntry for TUS uploaded file
        $fileEntry = FileEntry::create([
            'name' => base64_decode($fileName),
            'file_name' => $uploadKey,
            'mime' => $mimeType,
            'file_size' => $fileSize,
            'extension' => pathinfo(base64_decode($fileName), PATHINFO_EXTENSION),
            'user_id' => null,
            'parent_id' => null,
            'path' => 'tus',
            'disk_prefix' => 'local', // TUS files are stored locally first
            'type' => 'file',
        ]);

        // Attach the file to the GuestUpload
        $guestUpload->files()->attach($fileEntry->id);
        
        // Update total size by summing all attached files
        $totalSize = $guestUpload->files()->sum('file_entries.file_size');
        $guestUpload->update(['total_size' => $totalSize]);

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
            'total_size' => $totalSize,
            'expires_at' => $guestUpload->expires_at->toISOString(),
            'download_url' => url("/download/{$guestUpload->hash}"),
            'share_url' => url("/share/{$guestUpload->hash}"),
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
                    $disk = Storage::disk($fileEntry->disk_prefix ?: config('common.site.uploads_disk'));
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
        $extension = $file->getClientOriginalExtension();
        $hash = hash('sha256', $file->getClientOriginalName() . time() . rand());
        return $hash . ($extension ? '.' . $extension : '');
    }

    /**
     * Calculate expiry time based on hours
     */
    private function calculateExpiryTime(?int $hours): Carbon
    {
        $hours = $hours ?: config('app.guest_upload_default_expiry_hours', 72);
        $maxHours = config('app.guest_upload_max_expiry_hours', 168); // 7 days max
        
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
}
