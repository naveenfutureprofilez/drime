<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuestUploadFile extends Pivot
{
    protected $table = 'guest_upload_files';

    protected $fillable = [
        'guest_upload_id',
        'file_entry_id',
        // Add future metadata fields here as needed
    ];

    protected $casts = [
        'guest_upload_id' => 'integer',
        'file_entry_id' => 'integer',
    ];

    public function guestUpload(): BelongsTo
    {
        return $this->belongsTo(GuestUpload::class);
    }

    public function fileEntry(): BelongsTo
    {
        return $this->belongsTo(FileEntry::class);
    }
}
