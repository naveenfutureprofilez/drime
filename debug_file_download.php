<?php

require_once 'vendor/autoload.php';

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\GuestUpload;
use App\Models\FileEntry;
use Illuminate\Support\Facades\Storage;

$hash = 'oGEkVGHPL3I8pUCr1UYQ6IGTwpBWLiSX';
$fileId = 33;

echo "🔍 Debugging file download issue...\n";
echo "Hash: {$hash}\n";
echo "File ID: {$fileId}\n\n";

$guestUpload = GuestUpload::with(['files', 'fileEntry'])->where('hash', $hash)->first();

if ($guestUpload) {
    echo "✅ GuestUpload found: {$guestUpload->id}\n";
    echo "📁 Files count: " . $guestUpload->files->count() . "\n";
    
    $fileEntry = $guestUpload->files()->where('file_entries.id', $fileId)->first();
    if ($fileEntry) {
        echo "✅ FileEntry found: {$fileEntry->id}\n";
        echo "📄 File name: {$fileEntry->name}\n";
        echo "🏷️ File name (stored): {$fileEntry->file_name}\n";
        echo "📂 Path: " . ($fileEntry->path ?: 'null') . "\n";
        echo "💾 Disk prefix: " . ($fileEntry->disk_prefix ?: 'null') . "\n";
        echo "📁 Raw path: " . $fileEntry->getRawOriginal('path') . "\n";
        
        // Check what disk we're using
        echo "\n🔧 Current storage config:\n";
        echo "   uploads_disk_driver: " . config('common.site.uploads_disk_driver') . "\n";
        
        // Check if file exists in local storage
        $disk = Storage::disk('uploads');
        
        $possiblePaths = [
            $fileEntry->path ? $fileEntry->path . '/' . $fileEntry->file_name : null,
            $fileEntry->file_name,
            'guest-uploads/' . $fileEntry->file_name,
        ];
        
        echo "\n🔍 Checking file existence in local storage:\n";
        foreach (array_filter($possiblePaths) as $path) {
            $exists = $disk->exists($path);
            echo "   {$path}: " . ($exists ? '✅ EXISTS' : '❌ NOT FOUND') . "\n";
        }
        
        // List all files in guest-uploads to see what's there
        echo "\n📁 Files in guest-uploads directory:\n";
        try {
            $files = $disk->files('guest-uploads');
            if (empty($files)) {
                echo "   (empty - no files found)\n";
            } else {
                foreach ($files as $file) {
                    echo "   📄 {$file}\n";
                }
            }
        } catch (Exception $e) {
            echo "   ❌ Error accessing guest-uploads: " . $e->getMessage() . "\n";
        }
        
        // Check the full storage path
        echo "\n🗂️ Full storage path: " . storage_path('app/uploads') . "\n";
        
    } else {
        echo "❌ FileEntry not found with ID: {$fileId}\n";
        echo "Available files in this upload:\n";
        foreach ($guestUpload->files as $file) {
            echo "   - ID: {$file->id}, Name: {$file->name}\n";
        }
    }
} else {
    echo "❌ GuestUpload not found with hash: {$hash}\n";
}
