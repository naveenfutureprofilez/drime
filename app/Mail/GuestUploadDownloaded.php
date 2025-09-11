<?php

namespace App\Mail;

use App\Models\GuestUpload;
use App\Models\ShareableLink;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Helpers\EmailUrlHelper;

class GuestUploadDownloaded extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public GuestUpload $guestUpload,
        public ShareableLink $shareableLink
    ) {
    }

    public function envelope(): Envelope
    {
        $fileName = $this->shareableLink->entry->name ?? $this->guestUpload->original_filename;
        
        return new Envelope(
            to: $this->guestUpload->sender_email,
            subject: "Your shared file was downloaded: {$fileName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.guest-upload-downloaded',
            with: [
                'fileName' => $this->shareableLink->entry->name ?? $this->guestUpload->original_filename,
                'fileSize' => $this->guestUpload->file_size,
                'downloadCount' => $this->guestUpload->download_count,
                'maxDownloads' => $this->guestUpload->max_downloads,
                'downloadedAt' => $this->guestUpload->last_downloaded_at,
                'expiresAt' => $this->shareableLink->expires_at,
                'linkUrl' => EmailUrlHelper::emailUrl("/quick-share/link/{$this->shareableLink->hash}"),
                'appName' => config('app.name', 'File Sharing Service'),
            ]
        );
    }
}
