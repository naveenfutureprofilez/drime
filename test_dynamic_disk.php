<?php

require_once 'vendor/autoload.php';

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Storage;

echo "🧪 Testing Dynamic Uploads Disk (used by your application)...\n\n";

try {
    // Test the dynamic uploads disk that your app actually uses
    $disk = Storage::disk('uploads');
    echo "✅ Dynamic uploads disk loaded successfully\n";
    
    // Check what disk it resolved to
    echo "📋 Resolved disk configuration:\n";
    echo "   Driver: " . config('common.site.uploads_disk_driver') . "\n";
    
    // Test basic connectivity
    echo "🔍 Testing connectivity...\n";
    
    try {
        $files = $disk->files();
        echo "✅ Successfully connected to storage\n";
        echo "📁 Found " . count($files) . " files\n";
    } catch (Exception $e) {
        echo "❌ Connection failed: " . $e->getMessage() . "\n";
        
        if (strpos($e->getMessage(), '403') !== false || strpos($e->getMessage(), 'AccessDenied') !== false) {
            echo "\n🔑 This is an authentication issue. Please update your R2 credentials:\n";
            echo "   1. Go to Cloudflare Dashboard → R2 Object Storage\n";
            echo "   2. Create or check your API token permissions\n";
            echo "   3. Update your .env file with correct credentials\n";
        }
        
        exit(1);
    }

    // Test write permissions
    echo "📝 Testing write permissions...\n";
    $testFileName = 'test-upload-' . time() . '.txt';
    $testContent = 'This is a test file for the dynamic uploads disk.';
    
    try {
        $success = $disk->put("test-uploads/{$testFileName}", $testContent);
        if ($success) {
            echo "✅ Successfully wrote test file\n";
            
            // Test read permissions
            echo "📖 Testing read permissions...\n";
            $content = $disk->get("test-uploads/{$testFileName}");
            if ($content === $testContent) {
                echo "✅ Successfully read test file\n";
            } else {
                echo "❌ File content mismatch\n";
            }
            
            // Clean up test file
            $disk->delete("test-uploads/{$testFileName}");
            echo "🧹 Test file cleaned up\n";
        } else {
            echo "❌ Failed to write test file\n";
        }
    } catch (Exception $e) {
        echo "❌ Write test failed: " . $e->getMessage() . "\n";
    }

    echo "\n🎉 Dynamic uploads disk test completed!\n";
    
} catch (Exception $e) {
    echo "❌ Test failed: " . $e->getMessage() . "\n";
    exit(1);
}
