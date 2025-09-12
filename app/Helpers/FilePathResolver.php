<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

/**
 * Helper class to resolve file paths in storage when there might be 
 * mismatches between database filename and actual storage filename
 */
class FilePathResolver
{
    /**
     * Cache duration for file path lookups in seconds (1 hour)
     */
    const CACHE_DURATION = 3600;

    /**
     * Attempts to find the actual storage path for a file
     * 
     * @param string $fileName The filename from database
     * @param string $directory The directory to look in (default: guest-uploads)
     * @param string $diskName The storage disk to use (default: uploads)
     * @return array|null ['path' => string, 'disk' => object] or null if not found
     */
    public static function resolve($fileName, $directory = 'guest-uploads', $diskName = 'uploads')
    {
        // Check cache first
        $cacheKey = "file_path:{$diskName}:{$directory}:{$fileName}";
        $cachedPath = Cache::get($cacheKey);
        
        if ($cachedPath && Storage::disk($diskName)->exists($cachedPath)) {
            return [
                'path' => $cachedPath,
                'disk' => Storage::disk($diskName)
            ];
        }
        
        $disk = Storage::disk($diskName);
        $localDisk = Storage::disk('local');
        
        // Try standard paths first for quick exact match
        $possiblePaths = [
            // Try standard locations with the given filename
            "{$directory}/{$fileName}",
            $fileName,
            // Try with path from file entry if it exists
            "{$directory}/{$fileName}.pdf",
            "{$directory}/{$fileName}.jpg",
            "{$directory}/{$fileName}.mp4",
            "{$directory}/{$fileName}.mov",
            "{$directory}/{$fileName}.MOV",
            "{$directory}/{$fileName}.zip",
            "{$directory}/{$fileName}.txt",
        ];
        
        // Try each path directly
        foreach ($possiblePaths as $path) {
            if ($disk->exists($path)) {
                // Cache the successful path
                Cache::put($cacheKey, $path, self::CACHE_DURATION);
                
                return [
                    'path' => $path,
                    'disk' => $disk
                ];
            }
        }

        // Check TUS directory for direct file access
        $tusDirectPath = storage_path('tus/' . $fileName);
        if (file_exists($tusDirectPath)) {
            return [
                'path' => $tusDirectPath,
                'disk' => 'direct'
            ];
        }
        
        // More expensive lookup: Look for files that start with our filename
        // This is helpful if the file was stored with additional extensions or transformations
        try {
            // Search entire directory for matching files
            $files = $disk->files($directory);
            
            // Look for files that have the same base filename (ignoring extra extensions)
            foreach ($files as $file) {
                $basename = basename($file);
                
                // Check if this file starts with our database filename
                if (strpos($basename, $fileName) === 0) {
                    // Cache the successful path
                    Cache::put($cacheKey, $file, self::CACHE_DURATION);
                    
                    return [
                        'path' => $file,
                        'disk' => $disk
                    ];
                }
            }
            
            // For SHA-256 filenames: Check if any extension-based files match the provided name
            if (strlen($fileName) < 64) {
                // Try to find files where the base name (without extension) matches our file hash
                foreach ($files as $file) {
                    $pathInfo = pathinfo($file);
                    $filenameWithoutExt = $pathInfo['filename'];
                    
                    // Check if our hash is part of this filename
                    if (strpos($filenameWithoutExt, $fileName) !== false) {
                        // Cache the successful path
                        Cache::put($cacheKey, $file, self::CACHE_DURATION);
                        
                        return [
                            'path' => $file,
                            'disk' => $disk
                        ];
                    }
                }
            }
            
            // Enhanced approach: Check if a SHA-256 hash of the original filename exists
            // Some systems might be storing files as SHA-256 hash of the content
            // This is a bit more expensive but can be worth checking
            foreach ($files as $file) {
                $basename = basename($file);
                
                // If it's a likely SHA256 hash (64 hex chars), and starts with same few chars
                if (strlen($basename) >= 64 && 
                    ctype_xdigit(substr($basename, 0, 64)) && 
                    substr($basename, 0, 3) === substr($fileName, 0, 3)) {
                    
                    // Cache the successful path
                    Cache::put($cacheKey, $file, self::CACHE_DURATION);
                    
                    return [
                        'path' => $file,
                        'disk' => $disk
                    ];
                }
            }
        } catch (\Exception $e) {
            // Log but continue
            logger('Error searching for file: ' . $e->getMessage());
        }
        
        // Not found after all attempts
        return null;
    }
}
