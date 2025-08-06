<?php

namespace App\Console\Commands;

use App\Services\GuestUploadService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class CleanupExpiredGuestUploads extends Command
{
    protected $signature = 'guest-uploads:purge';
    protected $description = 'Purge expired guest uploads, associated files, and shareable links';

    public function __construct(private GuestUploadService $guestUploadService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Starting purge of expired guest uploads...');

        try {
            $startTime = Carbon::now();
            $result = $this->guestUploadService->purgeExpiredUploads();
            
            // Cache the last run time for admin statistics
            Cache::put('guest_uploads.last_purge_run', $startTime->toISOString(), now()->addDays(30));
            
            // Clear admin stats cache so it will be refreshed
            Cache::forget('admin.guest_uploads.stats');
            
            $this->info("Successfully purged {$result['guest_uploads']} expired guest uploads.");
            $this->info("Deleted {$result['shareable_links']} associated shareable links.");
            $this->info("Removed {$result['file_entries']} file entries.");
            $this->info("Cleaned up {$result['physical_files']} physical files.");
            
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error('Failed to purge expired uploads: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
