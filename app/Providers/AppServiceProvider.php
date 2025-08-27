<?php

namespace App\Providers;

use App\Models\FileEntry;
use App\Models\User;
use App\Services\Admin\GetAnalyticsHeaderData;
use App\Services\AppBootstrapData;
use App\Services\Entries\SetPermissionsOnEntry;
use Common\Admin\Analytics\Actions\GetAnalyticsHeaderDataAction;
use Common\Core\Bootstrap\BootstrapData;
use Common\Files\FileEntry as CommonFileEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;
use App\Helpers\SizeFormatter;

const WORKSPACED_RESOURCES = [FileEntry::class];
const WORKSPACE_HOME_ROUTE = '/drive';

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->bind(
            GetAnalyticsHeaderDataAction::class,
            GetAnalyticsHeaderData::class,
        );

        $this->app->bind(BootstrapData::class, AppBootstrapData::class);

        $this->app->bind(CommonFileEntry::class, FileEntry::class);

        $this->app->singleton(
            SetPermissionsOnEntry::class,
            fn() => new SetPermissionsOnEntry(),
        );
    }

    public function boot()
    {
        // Set Laravel's max_file_size config based on the environment variable
        $guestUploadMaxSize = (int) env('GUEST_UPLOAD_MAX_FILE_SIZE', 3145728000); // bytes
        config(['app.max_file_size' => intval($guestUploadMaxSize / 1024)]); // Convert to KB for Laravel

        Model::preventLazyLoading(!app()->isProduction());

        Relation::enforceMorphMap([
            FileEntry::MODEL_TYPE => FileEntry::class,
            User::MODEL_TYPE => User::class,
        ]);
    }

}
