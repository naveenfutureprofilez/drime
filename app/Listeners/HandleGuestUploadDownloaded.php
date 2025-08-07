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

        // Only update last downloaded timestamp - download count is handled by controller
        // to prevent double counting and ensure proper limit enforcement
        $guestUpload->update(['last_downloaded_at' => Carbon::now()]);

        // Send notification to sender if email is provided
        if ($guestUpload->sender_email) {
            Mail::to($guestUpload->sender_email)->queue(
                new GuestUploadDownloadedMail($guestUpload, $shareableLink)
            );
        }
    }
}
