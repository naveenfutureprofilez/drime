<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'title',
        'message',
        'last_downloaded_at',
        'email_sent',
        'email_sent_at'
    ];

    protected $casts = [
        'file_entry_id' => 'integer',
        'file_size' => 'integer',
        'total_size' => 'integer',
        'download_count' => 'integer',
        'max_downloads' => 'integer',
        'expires_at' => 'datetime',
        'last_downloaded_at' => 'datetime',
        'email_sent_at' => 'datetime',
        'email_sent' => 'boolean',
        'metadata' => 'array',
        // recipient_emails is now a string, not array
    ];

    protected $attributes = [
        'recipient_emails' => null,
    ];

    protected $hidden = [
        'password'
    ];

    /**
     * @deprecated Use files() relationship instead for many-to-many support
     */
    public function fileEntry(): BelongsTo
    {
        return $this->belongsTo(FileEntry::class);
    }

    public function files(): BelongsToMany
    {
        return $this->belongsToMany(
            FileEntry::class,
            'guest_upload_files'
        )->using(GuestUploadFile::class);
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
        // Check expiration first
        if ($this->isExpired()) {
            return false;
        }
        
        // Check download limit regardless of which file is being requested
        // This prevents bypassing limits by requesting different files
        if ($this->hasReachedDownloadLimit()) {
            return false;
        }
        
        return true;
    }

    /**
     * Verify password for protected uploads
     */
    public function verifyPassword(?string $password): bool
    {
        if (!$this->password) {
            return true; // No password protection
        }
        
        if (!$password) {
            return false; // Password required but not provided
        }
        
        return password_verify($password, $this->password);
    }

    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
    }

    public function generateHash(): string
    {
        return $this->hash ?: str()->random(32);
    }

    /**
     * Get the total size of all associated files
     */
    public function getTotalSizeAttribute(): int
    {
        return $this->files()->sum('file_entries.file_size') ?? 0;
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
