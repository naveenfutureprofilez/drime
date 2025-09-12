<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Exception;

/**
 * Service to handle file download errors with proper logging and user-friendly messages
 */
class FileDownloadErrorHandler
{
    /**
     * Handle file not found errors with detailed logging and user feedback
     */
    public static function handleFileNotFound($fileName, $originalName = null, $context = []): JsonResponse
    {
        $errorId = uniqid('download_err_');
        
        Log::warning('File download failed - file not found in storage', array_merge([
            'error_id' => $errorId,
            'stored_filename' => $fileName,
            'original_filename' => $originalName,
            'storage_disk' => config('common.site.uploads_disk_driver'),
        ], $context));
        
        return response()->json([
            'message' => 'The requested file is temporarily unavailable',
            'error_code' => 'FILE_NOT_FOUND',
            'error_id' => $errorId,
            'retry_after' => 30, // Suggest retry after 30 seconds
            'details' => [
                'suggestion' => 'Please try again in a few moments. If the problem persists, contact support.',
                'support_info' => 'Reference ID: ' . $errorId
            ]
        ], 404);
    }
    
    /**
     * Handle storage connection/timeout errors with retry logic
     */
    public static function handleStorageError(Exception $e, $context = []): JsonResponse
    {
        $errorId = uniqid('storage_err_');
        
        // Determine if this is a timeout or connection issue
        $isTimeout = str_contains($e->getMessage(), 'timeout') || 
                    str_contains($e->getMessage(), 'timed out') ||
                    str_contains($e->getMessage(), 'Connection refused');
        
        $isPermissionError = str_contains($e->getMessage(), '403') ||
                           str_contains($e->getMessage(), 'Access Denied') ||
                           str_contains($e->getMessage(), 'Forbidden');
        
        Log::error('File download failed - storage error', array_merge([
            'error_id' => $errorId,
            'error_type' => $isTimeout ? 'timeout' : ($isPermissionError ? 'permission' : 'unknown'),
            'error_message' => $e->getMessage(),
            'storage_disk' => config('common.site.uploads_disk_driver'),
        ], $context));
        
        if ($isTimeout) {
            return response()->json([
                'message' => 'Download is taking longer than expected',
                'error_code' => 'STORAGE_TIMEOUT',
                'error_id' => $errorId,
                'retry_after' => 60,
                'details' => [
                    'suggestion' => 'Large files may take a moment to prepare. Please try again.',
                    'support_info' => 'Reference ID: ' . $errorId
                ]
            ], 408); // Request Timeout
        }
        
        if ($isPermissionError) {
            return response()->json([
                'message' => 'Access to this file is restricted',
                'error_code' => 'ACCESS_DENIED',
                'error_id' => $errorId,
                'details' => [
                    'suggestion' => 'This file may have been moved or access permissions changed.',
                    'support_info' => 'Reference ID: ' . $errorId
                ]
            ], 403);
        }
        
        // Generic storage error
        return response()->json([
            'message' => 'Unable to access file storage',
            'error_code' => 'STORAGE_ERROR',
            'error_id' => $errorId,
            'retry_after' => 120,
            'details' => [
                'suggestion' => 'This is a temporary issue. Please try again later.',
                'support_info' => 'Reference ID: ' . $errorId
            ]
        ], 503); // Service Unavailable
    }
    
    /**
     * Handle file corruption or integrity issues
     */
    public static function handleCorruptedFile($fileName, $context = []): JsonResponse
    {
        $errorId = uniqid('corrupt_err_');
        
        Log::error('File download failed - file corruption detected', array_merge([
            'error_id' => $errorId,
            'filename' => $fileName,
        ], $context));
        
        return response()->json([
            'message' => 'The requested file appears to be corrupted',
            'error_code' => 'FILE_CORRUPTED',
            'error_id' => $errorId,
            'details' => [
                'suggestion' => 'This file may need to be re-uploaded. Please contact support.',
                'support_info' => 'Reference ID: ' . $errorId
            ]
        ], 422);
    }
    
    /**
     * Handle ZIP generation errors with specific messages
     */
    public static function handleZipError(Exception $e, $fileCount, $context = []): JsonResponse
    {
        $errorId = uniqid('zip_err_');
        
        Log::error('ZIP download failed', array_merge([
            'error_id' => $errorId,
            'file_count' => $fileCount,
            'error_message' => $e->getMessage(),
        ], $context));
        
        return response()->json([
            'message' => 'Failed to create download archive',
            'error_code' => 'ZIP_CREATION_FAILED',
            'error_id' => $errorId,
            'retry_after' => 60,
            'details' => [
                'suggestion' => 'Try downloading individual files or contact support.',
                'file_count' => $fileCount,
                'support_info' => 'Reference ID: ' . $errorId
            ]
        ], 500);
    }
    
    /**
     * Handle expired or limit reached uploads with clear guidance
     */
    public static function handleExpiredUpload($upload): JsonResponse
    {
        if ($upload->hasReachedDownloadLimit()) {
            return response()->json([
                'message' => 'Download limit reached',
                'error_code' => 'DOWNLOAD_LIMIT_EXCEEDED',
                'details' => [
                    'max_downloads' => $upload->max_downloads,
                    'current_downloads' => $upload->download_count,
                    'suggestion' => 'This file has reached its maximum download limit.'
                ]
            ], 403);
        }
        
        return response()->json([
            'message' => 'This download link has expired',
            'error_code' => 'LINK_EXPIRED',
            'details' => [
                'expired_at' => $upload->expires_at,
                'suggestion' => 'Please request a new download link.'
            ]
        ], 410);
    }
    
    /**
     * Handle invalid password attempts with rate limiting suggestions
     */
    public static function handleInvalidPassword($attempts = 1): JsonResponse
    {
        $maxAttempts = 5;
        $remainingAttempts = max(0, $maxAttempts - $attempts);
        
        if ($remainingAttempts === 0) {
            return response()->json([
                'message' => 'Too many incorrect password attempts',
                'error_code' => 'PASSWORD_ATTEMPTS_EXCEEDED',
                'retry_after' => 300, // 5 minutes
                'details' => [
                    'suggestion' => 'Please wait 5 minutes before trying again.'
                ]
            ], 429);
        }
        
        return response()->json([
            'message' => 'Incorrect password',
            'error_code' => 'INVALID_PASSWORD',
            'details' => [
                'remaining_attempts' => $remainingAttempts,
                'suggestion' => 'Please check your password and try again.'
            ]
        ], 401);
    }
    
    /**
     * Attempt to retry a failed operation with exponential backoff
     */
    public static function retryOperation(callable $operation, int $maxRetries = 3, int $baseDelay = 1): mixed
    {
        $lastException = null;
        
        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                return $operation();
            } catch (Exception $e) {
                $lastException = $e;
                
                // Don't retry on certain permanent errors
                if (str_contains($e->getMessage(), '404') || 
                    str_contains($e->getMessage(), 'Not Found') ||
                    str_contains($e->getMessage(), '403') ||
                    str_contains($e->getMessage(), 'Access Denied')) {
                    break;
                }
                
                if ($attempt < $maxRetries) {
                    $delay = $baseDelay * pow(2, $attempt - 1); // Exponential backoff
                    sleep($delay);
                    
                    Log::info("Retrying operation (attempt {$attempt}/{$maxRetries}) after {$delay}s delay", [
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }
        
        throw $lastException;
    }
}
