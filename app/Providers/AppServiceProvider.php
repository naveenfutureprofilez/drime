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
        
        // Set dynamic PHP ini limits for file uploads
        $this->configureDynamicUploadLimits($guestUploadMaxSize);

        Model::preventLazyLoading(!app()->isProduction());

        Relation::enforceMorphMap([
            FileEntry::MODEL_TYPE => FileEntry::class,
            User::MODEL_TYPE => User::class,
        ]);
    }
    
    /**
     * Configure dynamic upload limits based on environment variables
     */
    private function configureDynamicUploadLimits(int $maxSizeBytes): void
    {
        // Calculate recommended values
        $uploadMaxFilesize = SizeFormatter::bytesToIni($maxSizeBytes);
        $postMaxSize = SizeFormatter::bytesToIni(SizeFormatter::getRecommendedPostMaxSize($maxSizeBytes));
        $memoryLimit = SizeFormatter::bytesToIni(SizeFormatter::getRecommendedMemoryLimit($maxSizeBytes));
        
        // Set PHP ini settings
        ini_set('upload_max_filesize', $uploadMaxFilesize);
        ini_set('post_max_size', $postMaxSize);
        ini_set('memory_limit', $memoryLimit);
        ini_set('max_execution_time', '0'); // No time limit for uploads
        ini_set('max_input_time', '0'); // No time limit for input processing
        ini_set('max_file_uploads', '20');
        
        // Log settings when debug is enabled
        if (config('app.debug')) {
            logger()->info('[DynamicUploadLimits] Applied settings', [
                'upload_max_filesize' => $uploadMaxFilesize,
                'post_max_size' => $postMaxSize,
                'memory_limit' => $memoryLimit,
                'max_execution_time' => '0 (unlimited)',
                'max_input_time' => '0 (unlimited)',
                'based_on_bytes' => number_format($maxSizeBytes)
            ]);
        }
    }

}
