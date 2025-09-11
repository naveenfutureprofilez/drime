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

class UploadConfirmation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public GuestUpload $guestUpload,
        public ShareableLink $shareableLink,
        public string $linkUrl
    ) {
    }

    public function envelope(): Envelope
    {
        $itemsCount = $this->guestUpload->files()->count();
        
        if ($itemsCount > 1) {
            $subject = "Your files have been uploaded successfully";
        } else {
            $subject = "Your file has been uploaded successfully";
        }
        
        return new Envelope(
            from: config('mail.from.address', 'hello@example.com'),
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
            view: 'emails.upload-confirmation',
            with: [
                'itemsCount' => $itemsCount,
                'totalSizeFormatted' => $totalSizeFormatted,
                'expiresAtFormatted' => $expiresAtFormatted,
                'filesList' => $filesList,
                'linkUrl' => $this->linkUrl,
                'appName' => 'DRIME',
            ]
        );
    }
}
