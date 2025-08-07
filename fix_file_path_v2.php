<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Get the file entry
$fileEntry = \Illuminate\Support\Facades\DB::table('file_entries')->where('id', 21)->first();

echo "Current file entry:\n";
echo "- Path: " . $fileEntry->path . "\n";
echo "- File Name: " . $fileEntry->file_name . "\n";

// The path field should be just "guest-uploads" (the directory)
// The file_name should be the full filename on disk
$actualFilename = '34ba846ee8291456b35fb66972893daaa7b6e9c51a68959933e377eee92e3e7b.pdf';
$correctPath = 'guest-uploads';

// Update the file entry
$updated = \Illuminate\Support\Facades\DB::table('file_entries')
    ->where('id', 21)
    ->update([
        'path' => $correctPath,
        'file_name' => $actualFilename
    ]);

if ($updated) {
    echo "\n✅ Updated file entry 21:\n";
    echo "- Path: " . $correctPath . "\n";
    echo "- File Name: " . $actualFilename . "\n";
    
    // Verify the file path logic
    $fullPath = storage_path('app/' . $correctPath . '/' . $actualFilename);
    echo "- Full path: " . $fullPath . "\n";
    echo "- File exists: " . (file_exists($fullPath) ? 'YES' : 'NO') . "\n";
} else {
    echo "\n❌ Failed to update file entry\n";
}
