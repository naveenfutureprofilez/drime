<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Query the database for file entry ID 21
$fileEntry = \Illuminate\Support\Facades\DB::table('file_entries')->where('id', 21)->first();

if ($fileEntry) {
    echo "File Entry ID 21 found:\n";
    echo "- ID: " . $fileEntry->id . "\n";
    echo "- Name: " . $fileEntry->name . "\n";
    echo "- File Name: " . $fileEntry->file_name . "\n";
    echo "- Path: " . $fileEntry->path . "\n";
    echo "- Type: " . $fileEntry->type . "\n";
    echo "- Size: " . $fileEntry->file_size . "\n";
    echo "- Created: " . $fileEntry->created_at . "\n";
    
    // Check if file actually exists in storage
    $fullPath = storage_path('app/' . $fileEntry->path);
    echo "\nFull storage path: " . $fullPath . "\n";
    echo "File exists in storage: " . (file_exists($fullPath) ? 'YES' : 'NO') . "\n";
    
    if (!file_exists($fullPath)) {
        echo "Storage directory: " . dirname($fullPath) . "\n";
        echo "Storage directory exists: " . (is_dir(dirname($fullPath)) ? 'YES' : 'NO') . "\n";
        
        // List files in the storage directory if it exists
        if (is_dir(dirname($fullPath))) {
            echo "Files in directory:\n";
            $files = scandir(dirname($fullPath));
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..') {
                    echo "  - " . $file . "\n";
                }
            }
        }
    }
    
} else {
    echo "No file entry found with ID 21\n";
}

// Also check guest_upload_files pivot table
$guestUploadFile = \Illuminate\Support\Facades\DB::table('guest_upload_files')->where('file_entry_id', 21)->first();
if ($guestUploadFile) {
    echo "\nGuest Upload Files record found:\n";
    echo "- Guest Upload ID: " . $guestUploadFile->guest_upload_id . "\n";
    echo "- File Entry ID: " . $guestUploadFile->file_entry_id . "\n";
    
    // Check the guest_uploads table for this upload
    $guestUpload = \Illuminate\Support\Facades\DB::table('guest_uploads')->where('id', $guestUploadFile->guest_upload_id)->first();
    if ($guestUpload) {
        echo "\nGuest Upload record (ID: " . $guestUpload->id . "):\n";
        echo "- Hash: " . $guestUpload->hash . "\n";
        echo "- Created: " . $guestUpload->created_at . "\n";
        
        // Check if the file should be in guest-uploads/{hash}/ directory
        $expectedPath = "guest-uploads/" . $guestUpload->hash . "/" . $fileEntry->file_name;
        $expectedFullPath = storage_path('app/' . $expectedPath);
        echo "\nExpected path: " . $expectedPath . "\n";
        echo "Expected full path: " . $expectedFullPath . "\n";
        echo "Expected file exists: " . (file_exists($expectedFullPath) ? 'YES' : 'NO') . "\n";
        
        // List files in the guest upload directory
        $guestUploadDir = storage_path('app/guest-uploads/' . $guestUpload->hash);
        if (is_dir($guestUploadDir)) {
            echo "\nFiles in guest upload directory (" . $guestUploadDir . "):\n";
            $files = scandir($guestUploadDir);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..') {
                    echo "  - " . $file . "\n";
                }
            }
        } else {
            echo "\nGuest upload directory does not exist: " . $guestUploadDir . "\n";
        }
    }
} else {
    echo "\nNo guest_upload_files record found for file entry ID 21\n";
}
