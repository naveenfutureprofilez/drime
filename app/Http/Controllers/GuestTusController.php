<?php

namespace App\Http\Controllers;

use App\Services\GuestUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Common\Core\BaseController;
use Illuminate\Validation\ValidationException;
use Common\Files\Tus\TusCache;

class GuestTusController extends BaseController
{
    public function __construct(private GuestUploadService $guestUploadService)
    {
    }

    /**
     * Handle TUS upload completion and create GuestUpload record
     * 
     * Client Usage Pattern:
     * 1. First file: POST without upload_group_hash → receives upload_group_hash in response
     * 2. Subsequent files: POST with upload_group_hash → files are added to same GuestUpload group
     * 3. Response always echoes the shared hash so client can continue uploading more parts
     * 
     * This enables multiple TUS uploads to be grouped into a single downloadable package.
     */
    public function createEntry(Request $request): JsonResponse
    {
        $request->validate([
            'uploadKey' => 'required|string',
            'upload_group_hash' => 'nullable|string|size:32', // Optional group hash for multi-file uploads
            'password' => 'nullable|string|min:4|max:255',
            'expires_in_hours' => 'nullable|integer|min:1|max:8760', // Max 1 year
            'max_downloads' => 'nullable|integer|min:1|max:1000',
        ]);

        $uploadKey = $request->string('uploadKey')->toString();

        // Get TUS cache to validate file details before creating entry
        $tusCache = app(TusCache::class);
        $tusData = $tusCache->get($uploadKey);

        if (!$tusData) {
            return response()->json(['message' => 'Upload data not found'], 404);
        }

        // Get guest upload settings
        $maxSizeMb = settings('guest_uploads.max_size_mb', 100);
        $maxSizeBytes = $maxSizeMb * 1024 * 1024;
        $blockedExtensions = settings('uploads.blocked_extensions', []);

        // Validate file size
        if (isset($tusData['size']) && $tusData['size'] > $maxSizeBytes) {
            return response()->json([
                'message' => 'File size limit exceeded',
                'error' => 'File size exceeds the maximum allowed size of ' . $maxSizeMb . ' MB.',
            ], 413);
        }

        // Extract filename from TUS metadata structure
        $metadata = $tusData['metadata'] ?? [];
        $fileName = $metadata['name'] ?? $metadata['clientName'] ?? 'unknown';
        
        // Since TUS server already base64_decodes metadata values, we don't need to decode again
        if ($fileName === 'unknown' && isset($tusData['name'])) {
            // Fallback to direct access if metadata structure is different
            try {
                $fileName = base64_decode($tusData['name']);
                if (!mb_check_encoding($fileName, 'UTF-8')) {
                    $fileName = mb_convert_encoding(base64_decode($tusData['name']), 'UTF-8', 'auto');
                }
            } catch (\Exception $e) {
                $fileName = 'unknown';
            }
        }
        
        $extension = pathinfo($fileName, PATHINFO_EXTENSION);
        $mimeType = $metadata['clientMime'] ?? $metadata['mime'] ?? $tusData['mime'] ?? '';

        if (in_array(strtolower($extension), $blockedExtensions) || in_array($mimeType, $blockedExtensions)) {
            return response()->json([
                'message' => 'File type not allowed',
                'error' => 'This file type or extension is blocked from being uploaded.',
            ], 422);
        }

        try {
            $result = $this->guestUploadService->handleTusUpload($uploadKey, $request);

            return response()->json([
                'message' => 'File uploaded successfully',
                'fileEntry' => $result, // Maintain compatibility with existing TUS frontend
                'upload_group_hash' => $result['upload_group_hash'], // Echo shared hash for client to use in subsequent uploads
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'error' => $e->getMessage()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
