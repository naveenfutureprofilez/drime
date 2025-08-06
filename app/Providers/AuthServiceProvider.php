<?php

namespace App\Providers;

use App\Models\File;
use App\Models\Folder;
use App\Models\ShareableLink;
use App\Policies\DriveFileEntryPolicy;
use App\Policies\ShareableLinkPolicy;
use Common\Files\FileEntry;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        File::class => DriveFileEntryPolicy::class,
        Folder::class => DriveFileEntryPolicy::class,
        FileEntry::class => DriveFileEntryPolicy::class,
        ShareableLink::class => ShareableLinkPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        // Define guest uploads enabled gate
        Gate::define('guest_uploads_enabled', function ($user = null) {
            return config('app.guest_uploads_enabled', true);
        });
    }
}
