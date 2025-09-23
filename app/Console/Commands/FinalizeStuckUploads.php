<?php

namespace App\Console\Commands;

use App\Models\GuestUpload;
use App\Jobs\ProcessGuestUploadJob;
use App\Services\GuestUploadService;
use Illuminate\Console\Command;
use Carbon\Carbon;

class FinalizeStuckUploads extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'guest:finalize-stuck-uploads {--minutes=10 : Minutes to wait before considering uploads stuck}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Finalize stuck guest uploads that should send confirmation emails';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $minutesOld = $this->option('minutes');
        $cutoffTime = Carbon::now()->subMinutes($minutesOld);
        
        $this->info("Looking for stuck uploads older than {$minutesOld} minutes...");
        
        // Find potentially stuck uploads
        $stuckUploads = GuestUpload::withoutGlobalScopes()
            ->where('status', 'completed')
            ->where('email_sent', false)
            ->whereNotNull('recipient_emails')
            ->where('updated_at', '<', $cutoffTime)
            ->get();
        
        if ($stuckUploads->isEmpty()) {
            $this->info('No stuck uploads found.');
            return 0;
        }
        
        $this->info("Found {$stuckUploads->count()} potentially stuck uploads.");
        
        $processedCount = 0;
        $guestUploadService = app(GuestUploadService::class);
        
        foreach ($stuckUploads as $upload) {
            // Use the same shouldDispatchEmail logic
            if ($this->shouldDispatchEmailForStuckUpload($upload)) {
                // Dispatch the email job
                ProcessGuestUploadJob::dispatch(
                    $upload->hash,
                    $upload->files()->first()?->id ?? 0,
                    $upload->recipient_emails
                )->delay(now()->addSeconds(5));
                
                $this->line("Dispatched email for upload {$upload->hash}");
                $processedCount++;
                
                // Log the action
                \Log::info('Stuck upload email dispatched by scheduler', [
                    'guest_upload_hash' => $upload->hash,
                    'recipient_email' => $upload->recipient_emails,
                    'current_files' => $upload->files()->count(),
                    'expected_files' => $upload->expected_files,
                    'stuck_minutes' => Carbon::now()->diffInMinutes($upload->updated_at)
                ]);
            }
        }
        
        $this->info("Processed {$processedCount} stuck uploads.");
        return 0;
    }
    
    /**
     * Check if email should be dispatched for a stuck upload
     * (duplicates logic from GuestUploadService for consistency)
     */
    private function shouldDispatchEmailForStuckUpload(GuestUpload $guestUpload): bool
    {
        // Check if recipient email exists
        if (empty($guestUpload->recipient_emails)) {
            return false;
        }
        
        // Check if email was already sent
        if ($guestUpload->email_sent) {
            return false;
        }
        
        // If expected_files is null, send immediately (legacy behavior)
        if ($guestUpload->expected_files === null) {
            return true;
        }
        
        // If expected_files is set, only send when we have all files
        $currentFileCount = $guestUpload->files()->count();
        return $currentFileCount >= $guestUpload->expected_files;
    }
}
