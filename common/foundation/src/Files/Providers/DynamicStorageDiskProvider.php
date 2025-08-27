<?php

namespace Common\Files\Providers;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Foundation\Application;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;

class DynamicStorageDiskProvider extends ServiceProvider
{
    public function boot()
    {
        Storage::extend('dynamic-uploads', function (
            Application $app,
            $initialConfig,
        ) {
            return $this->resolveDisk('uploads', $initialConfig);
        });

        Storage::extend('dynamic-public', function (
            Application $app,
            $initialConfig,
        ) {
            return $this->resolveDisk('public', $initialConfig);
        });
    }

    public function register()
    {
        //
    }

    private function resolveDisk(string $type, array $initialConfig): Filesystem
    {
        $driverName = config("common.site.{$type}_disk_driver") ?? 'local';
        $config = array_merge(
            $initialConfig,
            config("services.$driverName") ?? [],
        );
        
        // Map S3-compatible services to s3 driver
        $actualDriver = $this->mapToActualDriver($driverName);
        $config['driver'] = $actualDriver;

        // set root based on drive type and name
        $config['root'] =
            $driverName === 'local'
                ? $config['local_root']
                : $config['remote_root'];

        // unset "storage" url from remote drives as "$disk->url()" will generate "storage/file_entry.jpg" url
        if (
            $driverName !== 'local' &&
            Arr::get($config, 'url') === $config['remote_root']
        ) {
            unset($config['url']);
        }

        if (isset($config['port'])) {
            $config['port'] = (int) $config['port'];
        }

        $dynamicConfigKey = "{$type}_{$driverName}";
        Config::set("filesystems.disks.{$dynamicConfigKey}", $config);

        return Storage::disk($dynamicConfigKey);
    }

    /**
     * Map service names to actual Laravel filesystem drivers
     */
    private function mapToActualDriver(string $driverName): string
    {
        // Map S3-compatible services to s3 driver
        $s3CompatibleServices = [
            'cloudflare',
            'digitalocean',
            'wasabi',
            'backblaze',
            'minio',
        ];
        
        if (in_array($driverName, $s3CompatibleServices)) {
            return 's3';
        }
        
        return $driverName;
    }
}
