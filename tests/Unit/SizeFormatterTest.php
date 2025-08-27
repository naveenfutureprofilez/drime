<?php

namespace Tests\Unit;

use App\Helpers\SizeFormatter;
use Tests\TestCase;

class SizeFormatterTest extends TestCase
{
    /**
     * Test bytes to ini format conversion
     */
    public function test_bytes_to_ini_conversion()
    {
        // Test zero
        $this->assertEquals('0', SizeFormatter::bytesToIni(0));
        
        // Test bytes
        $this->assertEquals('100', SizeFormatter::bytesToIni(100));
        
        // Test KB
        $this->assertEquals('1K', SizeFormatter::bytesToIni(1024));
        $this->assertEquals('5K', SizeFormatter::bytesToIni(5 * 1024));
        
        // Test MB
        $this->assertEquals('1M', SizeFormatter::bytesToIni(1024 * 1024));
        $this->assertEquals('100M', SizeFormatter::bytesToIni(100 * 1024 * 1024));
        
        // Test GB
        $this->assertEquals('1G', SizeFormatter::bytesToIni(1024 * 1024 * 1024));
        $this->assertEquals('3G', SizeFormatter::bytesToIni(3 * 1024 * 1024 * 1024));
        
        // Test non-exact values (should round to best unit)
        $this->assertEquals('2G', SizeFormatter::bytesToIni(2147483648)); // 2GB exactly
        $this->assertEquals('3G', SizeFormatter::bytesToIni(3221225472)); // 3GB exactly
    }

    /**
     * Test ini format to bytes conversion
     */
    public function test_ini_to_bytes_conversion()
    {
        // Test zero and empty
        $this->assertEquals(0, SizeFormatter::iniToBytes('0'));
        $this->assertEquals(0, SizeFormatter::iniToBytes(''));
        
        // Test bytes
        $this->assertEquals(100, SizeFormatter::iniToBytes('100'));
        
        // Test KB
        $this->assertEquals(1024, SizeFormatter::iniToBytes('1K'));
        $this->assertEquals(5 * 1024, SizeFormatter::iniToBytes('5K'));
        
        // Test MB
        $this->assertEquals(1024 * 1024, SizeFormatter::iniToBytes('1M'));
        $this->assertEquals(100 * 1024 * 1024, SizeFormatter::iniToBytes('100M'));
        
        // Test GB
        $this->assertEquals(1024 * 1024 * 1024, SizeFormatter::iniToBytes('1G'));
        $this->assertEquals(3 * 1024 * 1024 * 1024, SizeFormatter::iniToBytes('3G'));
        
        // Test case insensitive
        $this->assertEquals(1024, SizeFormatter::iniToBytes('1k'));
        $this->assertEquals(1024 * 1024, SizeFormatter::iniToBytes('1m'));
        $this->assertEquals(1024 * 1024 * 1024, SizeFormatter::iniToBytes('1g'));
    }

    /**
     * Test round-trip conversion consistency
     */
    public function test_round_trip_conversion()
    {
        $testValues = [
            1024,           // 1KB
            1048576,        // 1MB
            1073741824,     // 1GB
            3221225472,     // 3GB
        ];
        
        foreach ($testValues as $bytes) {
            $ini = SizeFormatter::bytesToIni($bytes);
            $convertedBack = SizeFormatter::iniToBytes($ini);
            
            $this->assertEquals($bytes, $convertedBack, 
                "Round-trip conversion failed for {$bytes} bytes (ini: {$ini})"
            );
        }
    }

    /**
     * Test human-readable formatting
     */
    public function test_format_bytes()
    {
        $this->assertEquals('0 B', SizeFormatter::formatBytes(0));
        $this->assertEquals('100 B', SizeFormatter::formatBytes(100));
        $this->assertEquals('1 KB', SizeFormatter::formatBytes(1024));
        $this->assertEquals('1 MB', SizeFormatter::formatBytes(1024 * 1024));
        $this->assertEquals('1 GB', SizeFormatter::formatBytes(1024 * 1024 * 1024));
        $this->assertEquals('3 GB', SizeFormatter::formatBytes(3 * 1024 * 1024 * 1024));
        
        // Test precision
        $this->assertEquals('1.5 MB', SizeFormatter::formatBytes(1572864, 1));
        $this->assertEquals('1.50 MB', SizeFormatter::formatBytes(1572864, 2));
    }

    /**
     * Test memory limit calculation
     */
    public function test_get_recommended_memory_limit()
    {
        $baseMemory = 512 * 1024 * 1024; // 512MB
        
        // Small upload should use base memory
        $smallUpload = 10 * 1024 * 1024; // 10MB
        $recommendedMemory = SizeFormatter::getRecommendedMemoryLimit($smallUpload);
        $this->assertEquals($baseMemory, $recommendedMemory);
        
        // Large upload should use 50% of upload size if larger than base
        $largeUpload = 2 * 1024 * 1024 * 1024; // 2GB
        $recommendedMemory = SizeFormatter::getRecommendedMemoryLimit($largeUpload);
        $expectedMemory = intval($largeUpload * 0.5);
        $this->assertEquals($expectedMemory, $recommendedMemory);
    }

    /**
     * Test post max size calculation
     */
    public function test_get_recommended_post_max_size()
    {
        $uploadSize = 100 * 1024 * 1024; // 100MB
        $postMaxSize = SizeFormatter::getRecommendedPostMaxSize($uploadSize);
        
        // Should be at least 10% larger than upload size
        $minExpected = $uploadSize + ($uploadSize * 0.1);
        $this->assertGreaterThanOrEqual($minExpected, $postMaxSize);
        
        // Should include at least 1MB overhead
        $this->assertGreaterThanOrEqual($uploadSize + (1024 * 1024), $postMaxSize);
    }

    /**
     * Test edge cases and invalid input
     */
    public function test_edge_cases()
    {
        // Very large values
        $largeValue = 1024 * 1024 * 1024 * 1024; // 1TB
        $ini = SizeFormatter::bytesToIni($largeValue);
        $this->assertIsString($ini);
        
        // Invalid ini format should return the numeric part
        $this->assertEquals(100, SizeFormatter::iniToBytes('100X'));
        $this->assertEquals(100, SizeFormatter::iniToBytes('100invalid'));
    }
}
