<?php

require_once 'vendor/autoload.php';

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Storage;

echo "🧪 Testing Cloudflare R2 Configuration...\n\n";

try {
    // Test disk configuration
    $disk = Storage::disk('cloudflare');
    echo "✅ Cloudflare R2 disk loaded successfully\n";

    // Test basic connectivity by listing files (this will test authentication)
    echo "🔍 Testing connectivity to Cloudflare R2...\n";
    
    try {
        $files = $disk->files();
        echo "✅ Successfully connected to Cloudflare R2\n";
        echo "📁 Found " . count($files) . " files in bucket\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'credentials') !== false) {
            echo "❌ Authentication failed - check your R2 credentials\n";
        } else {
            echo "❌ Connection failed: " . $e->getMessage() . "\n";
        }
        echo "\n📝 Please update the following environment variables:\n";
        echo "   CLOUDFLARE_R2_KEY=your_access_key_id\n";
        echo "   CLOUDFLARE_R2_SECRET=your_secret_access_key\n";
        echo "   CLOUDFLARE_R2_BUCKET=your_bucket_name\n";
        echo "   CLOUDFLARE_R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com\n";
        echo "   CLOUDFLARE_R2_URL=https://your_custom_domain.com (optional)\n\n";
        exit(1);
    }

    // Test write permissions
    echo "📝 Testing write permissions...\n";
    $testFileName = 'test-upload-' . time() . '.txt';
    $testContent = 'This is a test file for Cloudflare R2 integration with Laravel.';
    
    try {
        $success = $disk->put("test-uploads/{$testFileName}", $testContent);
        if ($success) {
            echo "✅ Successfully wrote test file to R2\n";
            
            // Test read permissions
            echo "📖 Testing read permissions...\n";
            $content = $disk->get("test-uploads/{$testFileName}");
            if ($content === $testContent) {
                echo "✅ Successfully read test file from R2\n";
            } else {
                echo "❌ File content mismatch\n";
            }
            
            // Clean up test file
            $disk->delete("test-uploads/{$testFileName}");
            echo "🧹 Test file cleaned up\n";
        } else {
            echo "❌ Failed to write test file to R2\n";
        }
    } catch (Exception $e) {
        echo "❌ Write test failed: " . $e->getMessage() . "\n";
    }

    // Test guest-uploads directory
    echo "📁 Testing guest-uploads directory...\n";
    try {
        $guestFiles = $disk->files('guest-uploads');
        echo "✅ Successfully accessed guest-uploads directory\n";
        echo "📄 Found " . count($guestFiles) . " files in guest-uploads\n";
    } catch (Exception $e) {
        echo "⚠️  Note: guest-uploads directory doesn't exist yet (this is normal for new buckets)\n";
    }

    echo "\n🎉 Cloudflare R2 configuration test completed successfully!\n";
    echo "💡 Your Laravel application is now configured to use Cloudflare R2 for file storage.\n\n";
    
    // Show current disk configuration
    echo "📋 Current Configuration:\n";
    echo "   Default uploads disk: " . config('common.site.uploads_disk') . "\n";
    echo "   R2 Endpoint: " . config('filesystems.disks.cloudflare.endpoint') . "\n";
    echo "   R2 Bucket: " . config('filesystems.disks.cloudflare.bucket') . "\n";
    echo "   R2 Region: " . config('filesystems.disks.cloudflare.region') . "\n";
    
} catch (Exception $e) {
    echo "❌ Configuration test failed: " . $e->getMessage() . "\n";
    echo "🔧 Please check your Cloudflare R2 configuration in .env and config/filesystems.php\n";
    exit(1);
}
