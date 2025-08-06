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

class GuestUploadSent extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public ShareableLink $shareableLink,
        public GuestUpload $guestUpload,
        public string $senderName,
        public string $linkUrl,
        public ?string $customMessage = null
    ) {
    }

    public function envelope(): Envelope
    {
        $fileName = $this->shareableLink->entry->name ?? $this->guestUpload->original_filename;
        
        return new Envelope(
            from: $this->guestUpload->sender_email,
            replyTo: $this->guestUpload->sender_email,
            subject: "File shared: {$fileName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.guest-upload-sent',
            with: [
                'senderName' => $this->senderName,
                'fileName' => $this->shareableLink->entry->name ?? $this->guestUpload->original_filename,
                'fileSize' => $this->guestUpload->file_size,
                'linkUrl' => $this->linkUrl,
                'customMessage' => $this->customMessage,
                'expiresAt' => $this->shareableLink->expires_at,
                'appName' => config('app.name', 'File Sharing Service'),
            ]
        );
    }
}
