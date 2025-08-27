<?php

namespace App\Helpers;

class SizeFormatter
{
    /**
     * Convert bytes to PHP ini format (e.g., 3145728000 → "3G")
     *
     * @param int $bytes
     * @return string
     */
    public static function bytesToIni(int $bytes): string
    {
        if ($bytes === 0) {
            return '0';
        }

        $units = ['', 'K', 'M', 'G'];
        $factor = 0;
        $value = $bytes;

        // Find the largest unit that results in a whole number
        while ($value >= 1024 && $factor < count($units) - 1) {
            if ($value % 1024 !== 0) {
                break;
            }
            $value /= 1024;
            $factor++;
        }

        // If we can't get a clean conversion, try to find the best fit
        if ($value >= 1024 && $factor < count($units) - 1) {
            $value = $bytes;
            $factor = 0;
            
            while ($value >= 1024 && $factor < count($units) - 1) {
                $value /= 1024;
                $factor++;
            }
            
            // Round to nearest integer for cleaner ini values
            $value = round($value);
        }

        return $value . $units[$factor];
    }

    /**
     * Convert PHP ini format to bytes (e.g., "3G" → 3145728000)
     *
     * @param string $size
     * @return int
     */
    public static function iniToBytes(string $size): int
    {
        $size = trim($size);
        
        if (empty($size) || $size === '0') {
            return 0;
        }

        $value = (int) $size;
        $unit = strtoupper(substr($size, -1));

        switch ($unit) {
            case 'G':
                $value *= 1024;
                // fall through
            case 'M':
                $value *= 1024;
                // fall through
            case 'K':
                $value *= 1024;
                break;
        }

        return $value;
    }

    /**
     * Format bytes for human-readable display
     *
     * @param int $bytes
     * @param int $precision
     * @return string
     */
    public static function formatBytes(int $bytes, int $precision = 2): string
    {
        if ($bytes === 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $factor = floor(log($bytes, 1024));
        
        return round($bytes / (1024 ** $factor), $precision) . ' ' . $units[$factor];
    }

    /**
     * Get recommended memory limit based on upload size
     * 
     * @param int $uploadSizeBytes
     * @return int Memory limit in bytes
     */
    public static function getRecommendedMemoryLimit(int $uploadSizeBytes): int
    {
        // Base memory requirement
        $baseMemory = 512 * 1024 * 1024; // 512MB
        
        // Additional memory should be at least 50% of upload size for processing
        $additionalMemory = intval($uploadSizeBytes * 0.5);
        
        return max($baseMemory, $additionalMemory);
    }

    /**
     * Get recommended post_max_size based on upload size
     * Should be slightly larger than upload size to account for form data overhead
     * 
     * @param int $uploadSizeBytes
     * @return int Post max size in bytes
     */
    public static function getRecommendedPostMaxSize(int $uploadSizeBytes): int
    {
        // Add 10% overhead for form data, minimum 1MB overhead
        $overhead = max(1024 * 1024, intval($uploadSizeBytes * 0.1));
        
        return $uploadSizeBytes + $overhead;
    }
}
