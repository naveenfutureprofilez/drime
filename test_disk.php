<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Disk configuration test:\n";
echo "======================\n";

// Test the config value
$diskName = config('common.site.uploads_disk', 'uploads');
echo "Config 'common.site.uploads_disk': '" . ($diskName ?? 'NULL') . "'\n";
echo "Default fallback: 'uploads'\n";

// Test the actual disk
$disk = \Illuminate\Support\Facades\Storage::disk($diskName);
echo "Disk driver: " . get_class($disk) . "\n";

// Test file existence in the uploads disk
$testPath = 'guest-uploads/34ba846ee8291456b35fb66972893daaa7b6e9c51a68959933';
echo "\nTesting file existence:\n";
echo "Path: " . $testPath . "\n";
echo "Exists in '{$diskName}' disk: " . ($disk->exists($testPath) ? 'YES' : 'NO') . "\n";

// Test local disk directly
$localDisk = \Illuminate\Support\Facades\Storage::disk('local');
echo "Exists in 'local' disk: " . ($localDisk->exists($testPath) ? 'YES' : 'NO') . "\n";

// Check what's actually in the uploads disk root
echo "\nContents of uploads disk root:\n";
try {
    $contents = $disk->allFiles();
    if (empty($contents)) {
        echo "  (empty)\n";
    } else {
        foreach (array_slice($contents, 0, 10) as $file) {
            echo "  - " . $file . "\n";
        }
        if (count($contents) > 10) {
            echo "  ... and " . (count($contents) - 10) . " more files\n";
        }
    }
} catch (\Exception $e) {
    echo "  Error: " . $e->getMessage() . "\n";
}
