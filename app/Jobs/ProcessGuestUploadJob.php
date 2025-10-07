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
    protected ?array $recipientEmails;

    /**
     * Create a new job instance.
     */
    public function __construct(
        string $guestUploadHash,
        string $fileEntryId,
        ?array $recipientEmails = null
    ) {
        $this->guestUploadHash = $guestUploadHash;
        $this->fileEntryId = $fileEntryId;
        $this->recipientEmails = $recipientEmails;

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
                'recipient_emails' => $this->recipientEmails
            ]);

            $guestUpload = GuestUpload::where('hash', $this->guestUploadHash)->first();
            if (!$guestUpload) {
                Log::error('Guest upload not found for processing job', [
                    'hash' => $this->guestUploadHash
                ]);
                return;
            }
            
            // Early return if email was already sent (defensive programming)
            // OR if manual email sending was attempted (takes precedence)
            if ($guestUpload->email_sent || ($guestUpload->metadata['manual_email_sent'] ?? false)) {
                Log::info('Email already sent or manual email attempted for guest upload, skipping job', [
                    'guest_upload_hash' => $this->guestUploadHash,
                    'email_sent_at' => $guestUpload->email_sent_at,
                    'manual_email_sent' => $guestUpload->metadata['manual_email_sent'] ?? false
                ]);
                return;
            }

            // Send confirmation emails if recipient emails are provided
            // BUT skip if manual email was already attempted
            if ($this->recipientEmails && !empty($this->recipientEmails) && !$guestUpload->email_sent && !($guestUpload->metadata['manual_email_sent'] ?? false)) {
                Log::info('About to send confirmation emails', [
                    'recipient_emails' => $this->recipientEmails,
                    'recipient_count' => count($this->recipientEmails),
                    'guest_upload_hash' => $this->guestUploadHash,
                    'current_email_sent_status' => $guestUpload->email_sent,
                    'guest_upload_id' => $guestUpload->id,
                    'files_count' => $guestUpload->files()->count()
                ]);
                
                $emailsSent = 0;
                $emailErrors = [];
                
                foreach ($this->recipientEmails as $recipientEmail) {
                    try {
                        Log::info('Sending email to recipient', [
                            'recipient_email' => $recipientEmail,
                            'service_class' => GuestUploadService::class,
                            'method' => 'sendConfirmationEmailAsync'
                        ]);
                        
                        app(GuestUploadService::class)->sendConfirmationEmailAsync($guestUpload, $recipientEmail);
                        $emailsSent++;
                        
                        Log::info('Email sent successfully to recipient', [
                            'recipient_email' => $recipientEmail
                        ]);
                        
                    } catch (\Exception $emailException) {
                        $emailErrors[] = [
                            'recipient_email' => $recipientEmail,
                            'error' => $emailException->getMessage()
                        ];
                        
                        Log::error('Email sending failed for recipient', [
                            'recipient_email' => $recipientEmail,
                            'error' => $emailException->getMessage(),
                            'trace' => $emailException->getTraceAsString(),
                            'file' => $emailException->getFile(),
                            'line' => $emailException->getLine(),
                            'guest_upload_hash' => $this->guestUploadHash
                        ]);
                    }
                }
                
                // Mark email as sent if at least one email was sent successfully
                if ($emailsSent > 0) {
                    $guestUpload->update([
                        'email_sent' => true,
                        'email_sent_at' => now()
                    ]);
                    
                    Log::info('Database updated with email_sent = true', [
                        'guest_upload_id' => $guestUpload->id,
                        'emails_sent' => $emailsSent,
                        'total_recipients' => count($this->recipientEmails),
                        'email_sent_at' => $guestUpload->fresh()->email_sent_at
                    ]);
                }
                
                if (!empty($emailErrors)) {
                    Log::warning('Some emails failed to send', [
                        'guest_upload_hash' => $this->guestUploadHash,
                        'errors' => $emailErrors,
                        'successful_sends' => $emailsSent
                    ]);
                }
                
            } else {
                Log::info('Skipping email send', [
                    'recipient_emails' => $this->recipientEmails,
                    'email_already_sent' => $guestUpload->email_sent,
                    'reason' => empty($this->recipientEmails) ? 'no_recipient_emails' : 'email_already_sent',
                    'guest_upload_hash' => $this->guestUploadHash
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
