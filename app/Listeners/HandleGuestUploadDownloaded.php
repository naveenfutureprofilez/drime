<?php

namespace App\Listeners;

use App\Events\GuestUploadDownloaded;
use App\Mail\GuestUploadDownloaded as GuestUploadDownloadedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class HandleGuestUploadDownloaded implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(GuestUploadDownloaded $event): void
    {
        $guestUpload = $event->guestUpload;
        $shareableLink = $event->shareableLink;

        // Update download count and last downloaded timestamp
        $guestUpload->increment('download_count');
        $guestUpload->update(['last_downloaded_at' => Carbon::now()]);

        // Send notification to sender if email is provided
        if ($guestUpload->sender_email) {
            Mail::to($guestUpload->sender_email)->queue(
                new GuestUploadDownloadedMail($guestUpload, $shareableLink)
            );
        }
    }
}
