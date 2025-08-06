<?php

namespace App\Events;

use App\Models\GuestUpload;
use App\Models\ShareableLink;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GuestUploadDownloaded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public GuestUpload $guestUpload,
        public ShareableLink $shareableLink
    ) {
    }
}
