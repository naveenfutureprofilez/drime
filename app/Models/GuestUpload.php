<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class GuestUpload extends Model
{
    protected $fillable = [
        'hash',
        'file_entry_id',
        'original_filename',
        'file_size',
        'mime_type',
        'password',
        'expires_at',
        'download_count',
        'max_downloads',
        'ip_address',
        'user_agent',
        'metadata',
        'link_id',
        'total_size',
        'sender_email',
        'recipient_emails',
        'last_downloaded_at'
    ];

    protected $casts = [
        'file_entry_id' => 'integer',
        'file_size' => 'integer',
        'total_size' => 'integer',
        'download_count' => 'integer',
        'max_downloads' => 'integer',
        'expires_at' => 'datetime',
        'last_downloaded_at' => 'datetime',
        'metadata' => 'array',
        'recipient_emails' => 'array',
    ];

    protected $attributes = [
        'recipient_emails' => '[]',
    ];

    protected $hidden = [
        'password'
    ];

    public function fileEntry(): BelongsTo
    {
        return $this->belongsTo(FileEntry::class);
    }

    public function shareableLink(): BelongsTo
    {
        return $this->belongsTo(ShareableLink::class, 'link_id', 'hash');
    }

    public function setPasswordAttribute(?string $value): void
    {
        $this->attributes['password'] = $value ? bcrypt($value) : null;
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->lt(Carbon::now());
    }

    public function hasReachedDownloadLimit(): bool
    {
        return $this->max_downloads && $this->download_count >= $this->max_downloads;
    }

    public function canDownload(): bool
    {
        return !$this->isExpired() && !$this->hasReachedDownloadLimit();
    }

    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }

    public function generateHash(): string
    {
        return $this->hash ?: str()->random(32);
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (!$model->hash) {
                $model->hash = str()->random(32);
            }
        });
    }

    protected static function booted()
    {
        // Add global scope to hide expired guest uploads automatically
        static::addGlobalScope('hideExpiredUploads', function (Builder $builder) {
            $builder->where(function (Builder $query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', Carbon::now());
            });
        });
    }
}
