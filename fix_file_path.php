<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Find the actual file in storage
$guestUploadsDir = storage_path('app/guest-uploads');
$files = scandir($guestUploadsDir);

echo "Files found in guest-uploads directory:\n";
foreach ($files as $file) {
    if ($file !== '.' && $file !== '..') {
        echo "- " . $file . "\n";
        
        // Check if this file matches the expected pattern for file entry 21
        $expectedPrefix = '34ba846ee8291456b35fb66972893daaa7b6e9c51a68959933';
        if (strpos($file, $expectedPrefix) === 0) {
            echo "  ^ This matches file entry 21!\n";
            
            // Update the file entry path
            $correctPath = 'guest-uploads/' . $file;
            
            $updated = \Illuminate\Support\Facades\DB::table('file_entries')
                ->where('id', 21)
                ->update(['path' => $correctPath]);
            
            if ($updated) {
                echo "  ✅ Updated file entry 21 path to: " . $correctPath . "\n";
            } else {
                echo "  ❌ Failed to update file entry 21\n";
            }
        }
    }
}

// Verify the update
$fileEntry = \Illuminate\Support\Facades\DB::table('file_entries')->where('id', 21)->first();
echo "\nUpdated file entry:\n";
echo "- ID: " . $fileEntry->id . "\n";
echo "- Name: " . $fileEntry->name . "\n";
echo "- Path: " . $fileEntry->path . "\n";

$fullPath = storage_path('app/' . $fileEntry->path);
echo "- Full path: " . $fullPath . "\n";
echo "- File exists: " . (file_exists($fullPath) ? 'YES' : 'NO') . "\n";
