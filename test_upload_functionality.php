<?php

require_once 'vendor/autoload.php';

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Storage;
use Common\Files\Actions\StoreFile;
use Common\Files\FileEntryPayload;

echo "🧪 Testing File Upload Functionality with Current Configuration...\n\n";

try {
    // Test what disk the uploads are using
    $uploadsConfig = config('common.site.uploads_disk_driver');
    echo "📋 Current uploads disk driver: " . ($uploadsConfig ?: 'default') . "\n\n";
    
    // Test the dynamic uploads disk
    $uploadsDisk = Storage::disk('uploads');
    echo "✅ Uploads disk loaded: " . get_class($uploadsDisk) . "\n";
    
    // Create a test file payload similar to how the application would handle it
    $testContent = "Test file content for upload functionality verification - " . date('Y-m-d H:i:s');
    $testFileName = 'test-upload-' . time() . '.txt';
    
    $payload = new FileEntryPayload([
        'filename' => $testFileName,
        'clientMime' => 'text/plain',
        'public' => false,
        'visibility' => 'private',
        'diskPrefix' => 'test-uploads'
    ]);
    
    echo "📝 Testing file storage with StoreFile action...\n";
    
    $storeFile = new StoreFile();
    $result = $storeFile->execute($payload, [
        'contents' => $testContent
    ]);
    
    if ($result) {
        echo "✅ File stored successfully at: {$result}\n";
        
        // Verify the file exists
        if ($uploadsDisk->exists($result)) {
            echo "✅ File exists in storage\n";
            
            // Verify content
            $retrievedContent = $uploadsDisk->get($result);
            if ($retrievedContent === $testContent) {
                echo "✅ File content matches original\n";
            } else {
                echo "❌ File content mismatch\n";
            }
            
            // Clean up
            $uploadsDisk->delete($result);
            echo "🧹 Test file cleaned up\n";
        } else {
            echo "❌ File was not found in storage\n";
        }
    } else {
        echo "❌ Failed to store file\n";
    }
    
    // Also test public disk if configured
    $publicConfig = config('common.site.public_disk_driver');
    echo "\n📋 Current public disk driver: " . ($publicConfig ?: 'default') . "\n";
    
    $publicDisk = Storage::disk('public');
    echo "✅ Public disk loaded: " . get_class($publicDisk) . "\n";
    
    echo "\n🎉 Upload functionality test completed!\n";
    
} catch (Exception $e) {
    echo "❌ Test failed: " . $e->getMessage() . "\n";
    echo "🔧 Check your configuration and try again.\n";
    exit(1);
}
