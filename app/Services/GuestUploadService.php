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
        // Ensure guest uploads work independently of billing system
        $this->validateGuestUploadAccess();
        
        $files = $request->file('files');
        $uploadedFiles = [];
        
        $expiresAt = $this->calculateExpiryTime($request->integer('expires_in_hours', 72)); // Default 3 days
        $password = $request->string('password')->toString();
        $maxDownloads = $request->integer('max_downloads');

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

            // Create GuestUpload record
            $guestUpload = GuestUpload::create([
                'file_entry_id' => $fileEntry->id,
                'original_filename' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'password' => $password ?: null,
                'expires_at' => $expiresAt,
                'max_downloads' => $maxDownloads,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metadata' => [
                    'original_extension' => $file->getClientOriginalExtension(),
                    'upload_method' => 'direct', // Will be 'tus' for resumable uploads
                ],
                'recipient_emails' => [],
            ]);

            $uploadedFiles[] = [
                'hash' => $guestUpload->hash,
                'filename' => $guestUpload->original_filename,
                'size' => $guestUpload->file_size,
                'mime_type' => $guestUpload->mime_type,
                'expires_at' => $guestUpload->expires_at->toISOString(),
                'download_url' => url("/download/{$guestUpload->hash}"),
                'share_url' => url("/share/{$guestUpload->hash}"),
            ];
        }

        return [
            'uploads' => $uploadedFiles,
            'total_files' => count($uploadedFiles),
            'expires_at' => $expiresAt->toISOString(),
        ];
    }

    /**
     * Handle TUS upload completion
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

        $expiresAt = $this->calculateExpiryTime(
            $request->integer('expires_in_hours', 72)
        );

        // Create GuestUpload record
        $guestUpload = GuestUpload::create([
            'file_entry_id' => $fileEntry->id,
            'original_filename' => base64_decode($fileName),
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'password' => $request->string('password')->toString() ?: null,
            'expires_at' => $expiresAt,
            'max_downloads' => $request->integer('max_downloads'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'upload_method' => 'tus',
                'tus_key' => $uploadKey,
            ],
            'recipient_emails' => [],
        ]);

        return [
            'hash' => $guestUpload->hash,
            'filename' => $guestUpload->original_filename,
            'size' => $guestUpload->file_size,
            'mime_type' => $guestUpload->mime_type,
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
            ->with(['fileEntry', 'shareableLink'])
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
                
                // Delete physical file from storage
                if ($upload->fileEntry) {
                    $disk = Storage::disk($upload->fileEntry->disk_prefix ?: config('common.site.uploads_disk'));
                    $filePath = $upload->fileEntry->path ? 
                        $upload->fileEntry->path . '/' . $upload->fileEntry->file_name : 
                        $upload->fileEntry->file_name;
                    
                    if ($disk->exists($filePath)) {
                        $disk->delete($filePath);
                        $counters['physical_files']++;
                    }
                    
                    // Delete FileEntry
                    $upload->fileEntry->delete();
                    $counters['file_entries']++;
                }
                
                // Delete GuestUpload record
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
