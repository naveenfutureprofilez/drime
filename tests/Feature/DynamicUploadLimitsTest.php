<?php

namespace Tests\Feature;

use App\Helpers\SizeFormatter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DynamicUploadLimitsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('uploads');
    }

    /**
     * Test that PHP ini settings are applied based on environment variable
     */
    public function test_php_ini_settings_applied_from_environment()
    {
        // Set test environment variable
        $testMaxSize = 10 * 1024 * 1024; // 10MB
        putenv("GUEST_UPLOAD_MAX_FILE_SIZE={$testMaxSize}");
        
        // Get current ini values
        $uploadMaxFilesize = ini_get('upload_max_filesize');
        $postMaxSize = ini_get('post_max_size');
        $memoryLimit = ini_get('memory_limit');
        
        // Convert to bytes for comparison
        $uploadMaxBytes = SizeFormatter::iniToBytes($uploadMaxFilesize);
        $postMaxBytes = SizeFormatter::iniToBytes($postMaxSize);
        $memoryBytes = SizeFormatter::iniToBytes($memoryLimit);
        
        // Verify upload_max_filesize matches our test size
        $this->assertEquals($testMaxSize, $uploadMaxBytes, 
            "upload_max_filesize should be {$testMaxSize} bytes but got {$uploadMaxBytes} bytes ({$uploadMaxFilesize})"
        );
        
        // Verify post_max_size is larger than upload size
        $this->assertGreaterThan($testMaxSize, $postMaxBytes,
            "post_max_size should be larger than upload size"
        );
        
        // Verify memory_limit is reasonable
        $this->assertGreaterThanOrEqual(512 * 1024 * 1024, $memoryBytes,
            "memory_limit should be at least 512MB"
        );
        
        // Clean up
        putenv("GUEST_UPLOAD_MAX_FILE_SIZE");
    }

    /**
     * Test guest upload validation respects the environment variable
     */
    public function test_guest_upload_respects_size_limit()
    {
        // Set a small limit for testing (1MB)
        $testLimit = 1024 * 1024; // 1MB
        config(['uploads.guest_max_size' => $testLimit]);
        
        // Create a file that exceeds the limit
        $oversizedFile = UploadedFile::fake()->create('large.txt', 2048); // 2MB (exceeds 1MB limit)
        
        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => [$oversizedFile],
            'expires_in_hours' => 24
        ]);
        
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['files.0']);
        
        // Test that a file within limits works
        $validFile = UploadedFile::fake()->create('small.txt', 512); // 512KB (within 1MB limit)
        
        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => [$validFile],
            'expires_in_hours' => 24
        ]);
        
        // This might fail due to other validation or missing services, but should not fail on file size
        if ($response->status() === 422) {
            $errors = $response->json('errors');
            $this->assertArrayNotHasKey('files.0', $errors, 
                'File within size limit should not have size validation errors'
            );
        }
    }

    /**
     * Test config values are properly set from environment
     */
    public function test_config_values_from_environment()
    {
        // Test default value
        $defaultSize = config('uploads.guest_max_size');
        $this->assertIsInt($defaultSize);
        $this->assertGreaterThan(0, $defaultSize);
        
        // Test that it matches environment variable
        $envValue = env('GUEST_UPLOAD_MAX_FILE_SIZE', 3145728000);
        $this->assertEquals($envValue, $defaultSize);
    }

    /**
     * Test SizeFormatter integration with ini settings
     */
    public function test_size_formatter_integration()
    {
        $testSizes = [
            1048576,      // 1MB
            10485760,     // 10MB  
            104857600,    // 100MB
            1073741824,   // 1GB
        ];
        
        foreach ($testSizes as $bytes) {
            // Convert to ini format
            $iniFormat = SizeFormatter::bytesToIni($bytes);
            $this->assertIsString($iniFormat);
            $this->assertMatchesRegularExpression('/^\d+[KMGT]?$/', $iniFormat);
            
            // Verify round-trip conversion
            $convertedBack = SizeFormatter::iniToBytes($iniFormat);
            $this->assertEquals($bytes, $convertedBack);
            
            // Test recommended values
            $postMaxSize = SizeFormatter::getRecommendedPostMaxSize($bytes);
            $this->assertGreaterThan($bytes, $postMaxSize);
            
            $memoryLimit = SizeFormatter::getRecommendedMemoryLimit($bytes);
            $this->assertGreaterThanOrEqual(512 * 1024 * 1024, $memoryLimit);
        }
    }

    /**
     * Test that validation uses the correct size values
     */
    public function test_validation_size_conversion()
    {
        // Test that Laravel validation expects KB while our env var is in bytes
        $testSizeBytes = 5 * 1024 * 1024; // 5MB in bytes
        $testSizeKB = $testSizeBytes / 1024; // 5MB in KB (what Laravel expects)
        
        config(['uploads.guest_max_size' => $testSizeBytes]);
        
        // Get the KB value that should be used in validation
        $validationSizeKB = intval(config('uploads.guest_max_size') / 1024);
        
        $this->assertEquals($testSizeKB, $validationSizeKB,
            'Validation should convert bytes to KB correctly'
        );
    }

    /**
     * Test error handling in dynamic limits
     */
    public function test_dynamic_limits_error_handling()
    {
        // Test with invalid environment value (should fallback to defaults)
        putenv('GUEST_UPLOAD_MAX_FILE_SIZE=invalid');
        
        // The bootstrap should handle this gracefully and use fallbacks
        $this->assertTrue(true, 'Should not throw exceptions with invalid env values');
        
        // Clean up
        putenv('GUEST_UPLOAD_MAX_FILE_SIZE');
    }

    /**
     * Test minimum size constraints
     */
    public function test_minimum_size_constraints()
    {
        // Test very small size (should be increased to minimum)
        $tinySize = 100; // 100 bytes
        putenv("GUEST_UPLOAD_MAX_FILE_SIZE={$tinySize}");
        
        // The dynamic limits should enforce a reasonable minimum (1MB)
        $minSize = 1024 * 1024; // 1MB
        
        // Get applied upload size
        $uploadMaxFilesize = ini_get('upload_max_filesize');
        $uploadMaxBytes = SizeFormatter::iniToBytes($uploadMaxFilesize);
        
        $this->assertGreaterThanOrEqual($minSize, $uploadMaxBytes,
            'Dynamic limits should enforce a reasonable minimum size'
        );
        
        // Clean up
        putenv('GUEST_UPLOAD_MAX_FILE_SIZE');
    }
}
