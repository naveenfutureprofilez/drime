<?php

namespace App\Jobs;

use App\Models\GuestUpload;
use App\Services\GuestUploadService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessGuestUploadJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $guestUploadHash;
    protected string $fileEntryId;
    protected ?string $recipientEmail;

    /**
     * Create a new job instance.
     */
    public function __construct(
        string $guestUploadHash,
        string $fileEntryId,
        ?string $recipientEmail = null
    ) {
        $this->guestUploadHash = $guestUploadHash;
        $this->fileEntryId = $fileEntryId;
        $this->recipientEmail = $recipientEmail;

        // Set job to high priority for user experience
        $this->onQueue('high');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Starting guest upload processing job', [
                'guest_upload_hash' => $this->guestUploadHash,
                'file_entry_id' => $this->fileEntryId,
                'recipient_email' => $this->recipientEmail
            ]);

            $guestUpload = GuestUpload::where('hash', $this->guestUploadHash)->first();
            if (!$guestUpload) {
                Log::error('Guest upload not found for processing job', [
                    'hash' => $this->guestUploadHash
                ]);
                return;
            }

            // Send confirmation email if recipient email is provided
            if ($this->recipientEmail && !$guestUpload->email_sent) {
                app(GuestUploadService::class)->sendConfirmationEmailAsync($guestUpload, $this->recipientEmail);
                
                // Mark email as sent to prevent duplicate sends
                $guestUpload->update([
                    'email_sent' => true,
                    'email_sent_at' => now()
                ]);
            }

            // Update processing status
            $guestUpload->update([
                'processing_completed_at' => now(),
                'status' => 'completed'
            ]);

            Log::info('Guest upload processing job completed successfully', [
                'guest_upload_hash' => $this->guestUploadHash,
                'file_entry_id' => $this->fileEntryId
            ]);

        } catch (\Exception $e) {
            Log::error('Guest upload processing job failed', [
                'guest_upload_hash' => $this->guestUploadHash,
                'file_entry_id' => $this->fileEntryId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Update status to indicate processing failed
            if (isset($guestUpload)) {
                $guestUpload->update([
                    'status' => 'processing_failed',
                    'error_message' => $e->getMessage()
                ]);
            }

            // Re-throw so the job can be retried
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Guest upload processing job permanently failed', [
            'guest_upload_hash' => $this->guestUploadHash,
            'file_entry_id' => $this->fileEntryId,
            'error' => $exception->getMessage()
        ]);

        // Mark as failed in database
        $guestUpload = GuestUpload::where('hash', $this->guestUploadHash)->first();
        if ($guestUpload) {
            $guestUpload->update([
                'status' => 'processing_failed',
                'error_message' => $exception->getMessage()
            ]);
        }
    }
}
