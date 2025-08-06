<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class ShareableLink extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'user_id' => 'integer',
        'entry_id' => 'integer',
        'id' => 'integer',
        'allow_download' => 'boolean',
        'allow_edit' => 'boolean',
        'expires_at' => 'datetime',
        'is_guest' => 'boolean',
        'guest_deleted_at' => 'datetime',
    ];

    public function entry(): BelongsTo
    {
        return $this->belongsTo(FileEntry::class);
    }

    public function setPasswordAttribute(?string $value)
    {
        $this->attributes['password'] = $value ? bcrypt($value) : null;
    }

    /**
     * Check if this is a guest shareable link
     */
    public function isGuest(): bool
    {
        return $this->is_guest;
    }

    /**
     * Check if the guest link is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->lt(Carbon::now());
    }

    /**
     * Check if the guest link is soft deleted
     */
    public function isGuestDeleted(): bool
    {
        return $this->guest_deleted_at !== null;
    }

    /**
     * Soft delete a guest link
     */
    public function softDeleteGuest(): void
    {
        $this->update(['guest_deleted_at' => Carbon::now()]);
    }

    protected static function booted()
    {
        // Add global scope to hide expired guest entries automatically
        static::addGlobalScope('hideExpiredGuestEntries', function (Builder $builder) {
            $builder->where(function (Builder $query) {
                $query->where('is_guest', false)
                      ->orWhere(function (Builder $subQuery) {
                          $subQuery->where('is_guest', true)
                                   ->where(function (Builder $expiredQuery) {
                                       $expiredQuery->whereNull('expires_at')
                                                   ->orWhere('expires_at', '>', Carbon::now());
                                   })
                                   ->whereNull('guest_deleted_at');
                      });
            });
        });
    }
}
