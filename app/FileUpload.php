<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class FileUpload extends Model
{
    use HasFactory;

    protected $table = 'file_uploads';

    protected $fillable = [
        'original_filename',
        'file_path',
        'file_size',
        'mime_type',
        'shareable_link',
        'password',
        'expires_at',
        'max_downloads',
        'download_count',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'download_count' => 'integer',
        'file_size' => 'integer',
        'max_downloads' => 'integer',
    ];

    protected $appends = ['status'];

    public function getStatusAttribute(): string
    {
        if ($this->expires_at && $this->expires_at < now()) {
            return 'expired';
        }

        if ($this->max_downloads && $this->download_count >= $this->max_downloads) {
            return 'download_limit_reached';
        }

        return 'active';
    }

    public function getShareUrlAttribute(): string
    {
        return url("/share/{$this->shareable_link}");
    }

    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>', now());
        })->where(function ($q) {
            $q->whereNull('max_downloads')
              ->orWhereRaw('download_count < max_downloads');
        });
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now());
    }
}
