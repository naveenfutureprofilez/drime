<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Direct SQL Query ===\n";
$directSql = \Illuminate\Support\Facades\DB::table('file_entries')->where('id', 21)->first();
echo "Direct SQL - Path: '" . $directSql->path . "'\n";
echo "Direct SQL - File Name: '" . $directSql->file_name . "'\n";
echo "Direct SQL - Name: '" . $directSql->name . "'\n";

echo "\n=== FileEntry Model ===\n";
$fileEntry = \App\Models\FileEntry::find(21);
if ($fileEntry) {
    echo "FileEntry Model - Path: '" . $fileEntry->path . "'\n";
    echo "FileEntry Model - File Name: '" . $fileEntry->file_name . "'\n";  
    echo "FileEntry Model - Name: '" . $fileEntry->name . "'\n";
} else {
    echo "FileEntry not found\n";
}

echo "\n=== Via GuestUpload relationship ===\n";
$guestUpload = \App\Models\GuestUpload::with('files')->where('hash', 'Z6UMBbYt4PZfBcjrnfDfPtEOU2ahuynN')->first();
if ($guestUpload) {
    echo "GuestUpload found with " . $guestUpload->files->count() . " files\n";
    $file = $guestUpload->files()->where('file_entries.id', 21)->first();
    if ($file) {
        echo "File found via relationship - Path: '" . $file->path . "'\n";
        echo "File found via relationship - File Name: '" . $file->file_name . "'\n";
        echo "File found via relationship - Name: '" . $file->name . "'\n";
        
        // Raw attributes
        echo "\nRaw attributes:\n";
        print_r($file->getAttributes());
    } else {
        echo "File 21 not found in this guest upload\n";
    }
} else {
    echo "GuestUpload not found\n";
}
