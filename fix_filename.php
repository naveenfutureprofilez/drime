<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// The actual filename on disk
$actualFilename = '34ba846ee8291456b35fb66972893daaa7b6e9c51a68959933e377eee92e3e7b.pdf';

// Check current value first
$current = \Illuminate\Support\Facades\DB::table('file_entries')->where('id', 21)->first();
echo "Before update - File Name: '" . $current->file_name . "'\n";
echo "Target filename: '" . $actualFilename . "'\n";

// Update the file entry
$updated = \Illuminate\Support\Facades\DB::table('file_entries')
    ->where('id', 21)
    ->update([
        'file_name' => $actualFilename
    ]);

echo "Update query affected " . $updated . " rows\n";

if ($updated > 0) {
    echo "✅ Updated file entry 21 file_name to: " . $actualFilename . "\n";
    
    // Verify the update
    $fileEntry = \Illuminate\Support\Facades\DB::table('file_entries')->where('id', 21)->first();
    echo "Current values:\n";
    echo "- Path: " . $fileEntry->path . "\n";
    echo "- File Name: " . $fileEntry->file_name . "\n";
    
    // Test the full path
    $fullPath = storage_path('app/' . $fileEntry->path . '/' . $fileEntry->file_name);
    echo "- Full path: " . $fullPath . "\n";
    echo "- File exists: " . (file_exists($fullPath) ? 'YES' : 'NO') . "\n";
} else {
    echo "❌ Failed to update file entry\n";
}
