<?php

require_once 'vendor/autoload.php';

use Aws\S3\S3Client;
use Aws\Exception\AwsException;

echo "🔑 Testing Cloudflare R2 Authentication...\n\n";

// Your current credentials
$credentials = [
    'key' => '3d4dd0136ee0028d68e584fb250db27f',
    'secret' => '4d92958083d40e24f0842a1e303df55bd92d9443838be4a231f337a7f49a01e6',
    'endpoint' => 'https://18b804eaa6bc9759e2278f8d5367f42f.r2.cloudflarestorage.com',
    'bucket' => 'drime_transfer',
    'region' => 'auto'
];

echo "📋 Testing with these credentials:\n";
echo "   Key: " . substr($credentials['key'], 0, 8) . "...\n";
echo "   Secret: " . substr($credentials['secret'], 0, 8) . "...\n";
echo "   Endpoint: " . $credentials['endpoint'] . "\n";
echo "   Bucket: " . $credentials['bucket'] . "\n\n";

try {
    // Create S3 client
    $s3Client = new S3Client([
        'version' => 'latest',
        'region' => $credentials['region'],
        'endpoint' => $credentials['endpoint'],
        'use_path_style_endpoint' => false,
        'credentials' => [
            'key' => $credentials['key'],
            'secret' => $credentials['secret'],
        ]
    ]);

    echo "✅ S3 Client created successfully\n";

    // Test 1: Check if bucket exists
    echo "🪣 Testing bucket access...\n";
    try {
        $result = $s3Client->headBucket(['Bucket' => $credentials['bucket']]);
        echo "✅ Bucket exists and is accessible\n";
    } catch (AwsException $e) {
        echo "❌ Bucket access failed: " . $e->getMessage() . "\n";
        if ($e->getAwsErrorCode() === 'NoSuchBucket') {
            echo "   → The bucket '{$credentials['bucket']}' doesn't exist\n";
        } elseif ($e->getAwsErrorCode() === 'AccessDenied') {
            echo "   → Access denied - check your API token permissions\n";
        }
    }

    // Test 2: Try to list objects (read permission)
    echo "📖 Testing read permissions...\n";
    try {
        $result = $s3Client->listObjects(['Bucket' => $credentials['bucket'], 'MaxKeys' => 1]);
        echo "✅ Read permission works\n";
        echo "   Found " . count($result['Contents'] ?? []) . " objects\n";
    } catch (AwsException $e) {
        echo "❌ Read permission failed: " . $e->getAwsErrorMessage() . "\n";
        echo "   Error code: " . $e->getAwsErrorCode() . "\n";
    }

    // Test 3: Try to upload a small test file (write permission)
    echo "✍️ Testing write permissions...\n";
    try {
        $testKey = 'test-auth-' . time() . '.txt';
        $result = $s3Client->putObject([
            'Bucket' => $credentials['bucket'],
            'Key' => $testKey,
            'Body' => 'Test file for authentication check',
            'ContentType' => 'text/plain'
        ]);
        echo "✅ Write permission works\n";
        
        // Clean up test file
        $s3Client->deleteObject(['Bucket' => $credentials['bucket'], 'Key' => $testKey]);
        echo "🧹 Test file cleaned up\n";
        
    } catch (AwsException $e) {
        echo "❌ Write permission failed: " . $e->getAwsErrorMessage() . "\n";
        echo "   Error code: " . $e->getAwsErrorCode() . "\n";
        
        if ($e->getAwsErrorCode() === 'AccessDenied') {
            echo "\n💡 Your API token needs these permissions:\n";
            echo "   - Account: Cloudflare R2:Edit (or R2:Read + R2:Write)\n";
            echo "   - Bucket: All buckets or specific bucket permissions\n";
        }
    }

} catch (Exception $e) {
    echo "❌ Failed to create S3 client: " . $e->getMessage() . "\n";
}

echo "\n🔗 Next Steps:\n";
echo "1. If bucket doesn't exist: Create bucket 'drime_transfer' in Cloudflare R2\n";
echo "2. If access denied: Update API token permissions in Cloudflare Dashboard\n";
echo "3. Required permissions: Account → Cloudflare R2:Edit\n";
echo "4. Account Resources: Include → Your Account\n";
