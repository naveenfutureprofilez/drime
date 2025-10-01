<?php

namespace App\Mail;

use App\Models\GuestUpload;
use App\Models\ShareableLink;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
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
        // Set the queue using the method instead of property to avoid conflicts
        $this->onQueue('high');
    }

    public function envelope(): Envelope
    {
        // Use the title if provided, otherwise fall back to default subject
        if ($this->guestUpload->title) {
            $subject = $this->guestUpload->title;
        } else {
            $fileName = $this->shareableLink->entry->name ?? $this->guestUpload->original_filename;
            
            // Handle multi-file transfers
            $fileCount = $this->guestUpload->files()->count();
            if ($fileCount > 1) {
                $subject = "Files shared: {$fileCount} files";
            } elseif ($fileName) {
                $subject = "File shared: {$fileName}";
            } else {
                $subject = "File shared";
            }
        }
        
        $fromAddress = config('mail.from.address', 'hello@example.com');
        $fromName = config('mail.from.name', config('app.name', 'App'));

        return new Envelope(
            from: new Address($fromAddress, $fromName),
            replyTo: $this->guestUpload->sender_email
                ? [new Address($this->guestUpload->sender_email, $this->senderName)]
                : [],
            subject: $subject,
        );
    }

    public function content(): Content
    {
        // Build files list and totals (supports multi-file uploads)
        $files = $this->guestUpload->files;
        if ($files->isEmpty() && $this->shareableLink->entry) {
            // Legacy single file
            $files = collect([$this->shareableLink->entry]);
        }

        $itemsCount = $files->count();
        $totalBytes = $files->sum('file_size');
        if ($totalBytes === 0 && $this->guestUpload->total_size) {
            $totalBytes = (int) $this->guestUpload->total_size;
        }

        $filesList = $files->map(function ($file) {
            return [
                'name' => $file->name,
                'size' => (int) $file->file_size,
            ];
        })->values()->all();

        $formatBytes = function (int $bytes): string {
            if ($bytes <= 0) return '0 B';
            $units = ['B','KB','MB','GB','TB'];
            $i = (int) floor(log($bytes, 1024));
            return round($bytes / pow(1024, $i), 2).' '.$units[$i];
        };

        $totalSizeFormatted = $formatBytes($totalBytes);
        $expiresAtFormatted = $this->shareableLink->expires_at ? $this->shareableLink->expires_at->format('F j, Y') : null;

        return new Content(
            view: 'emails.guest-upload-sent',
            with: [
                'senderName' => $this->senderName,
                'itemsCount' => $itemsCount,
                'totalSizeFormatted' => $totalSizeFormatted,
                'expiresAtFormatted' => $expiresAtFormatted,
                'filesList' => $filesList,
                'linkUrl' => $this->linkUrl,
                'customMessage' => $this->customMessage,
                'appName' => config('app.name', 'Drime'),
            ]
        );
    }
}
