<?php

namespace App\Http\Controllers;

use App\Models\GuestUpload;
use App\Models\FileEntry;
use App\Services\GuestUploadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Events\GuestUploadDownloaded;
use Common\Core\BaseController;

class GuestUploadController extends BaseController
{
    public function __construct(private GuestUploadService $guestUploadService)
    {
    }

    /**
     * Create a new guest upload record
     */
    public function store(Request $request): JsonResponse
    {
        logger('GuestUploadController::store called', ['request' => $request->all()]);
        
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|min:1',
            'files.*' => 'required|file|max:' . config('app.max_file_size', 3145728), // 3GB default
            'password' => 'nullable|string|min:4|max:255',
            'expires_in_hours' => 'nullable|integer|min:1|max:168', // Max 7 days
            'max_downloads' => 'nullable|integer|min:1|max:1000',
        ]);

        if ($validator->fails()) {
            logger('Validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        logger('Validation passed');
        logger('Files received', ['file_count' => count($request->file('files'))]);
        logger('File details', ['files' => array_map(function($file) {
            return [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ];
        }, $request->file('files'))]);

        try {
            logger('About to call handleUpload service');
            $result = $this->guestUploadService->handleUpload($request);
            logger('Service returned result', ['result' => $result]);
            
            return response()->json([
                'message' => 'Files uploaded successfully',
                'data' => $result
            ], 201);
            
        } catch (\Exception $e) {
            logger('Exception in upload', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'message' => 'Upload failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get guest upload by hash
     */
    public function show(string $hash): JsonResponse
    {
        $guestUpload = GuestUpload::with('fileEntry')
            ->where('hash', $hash)
            ->first();

        if (!$guestUpload) {
            return response()->json([
                'message' => 'Upload not found'
            ], 404);
        }

        if (!$guestUpload->canDownload()) {
            return response()->json([
                'message' => 'This upload has expired or reached download limit'
            ], 410);
        }

        return response()->json([
            'data' => [
                'hash' => $guestUpload->hash,
                'original_filename' => $guestUpload->original_filename,
                'file_size' => $guestUpload->file_size,
                'mime_type' => $guestUpload->mime_type,
                'download_count' => $guestUpload->download_count,
                'max_downloads' => $guestUpload->max_downloads,
                'expires_at' => $guestUpload->expires_at,
                'has_password' => !is_null($guestUpload->password),
                'created_at' => $guestUpload->created_at,
            ]
        ]);
    }

    /**
     * Download file
     */
    public function download(string $hash, Request $request): mixed
    {
        $guestUpload = GuestUpload::with('fileEntry')
            ->where('hash', $hash)
            ->first();

        if (!$guestUpload) {
            return response()->json(['message' => 'Upload not found'], 404);
        }

        if (!$guestUpload->canDownload()) {
            return response()->json([
                'message' => 'This upload has expired or reached download limit'
            ], 410);
        }

        // Check password if required
        if ($guestUpload->password) {
            $request->validate([
                'password' => 'required|string'
            ]);

            if (!password_verify($request->password, $guestUpload->password)) {
                return response()->json(['message' => 'Invalid password'], 401);
            }
        }

        try {
            $fileEntry = $guestUpload->fileEntry;
            if (!$fileEntry) {
                return response()->json(['message' => 'File not found'], 404);
            }

            // Get file from storage (Cloudflare R2)
            $disk = Storage::disk(config('common.site.uploads_disk'));
            
            // Build the file path - files are stored in guest-uploads folder
            $filePath = $fileEntry->path ? 
                $fileEntry->path . '/' . $fileEntry->file_name : 
                $fileEntry->file_name;
            
            if (!$disk->exists($filePath)) {
                return response()->json(['message' => 'File not found in storage'], 404);
            }

            // Fire event for download tracking and notifications
            // The event listener will handle incrementing download count and sending notifications
            $shareableLink = $guestUpload->shareableLink;
            if ($shareableLink) {
                GuestUploadDownloaded::dispatch($guestUpload, $shareableLink);
            }

            return $disk->download(
                $filePath,
                $guestUpload->original_filename
            );
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Download failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify password for protected upload
     */
    public function verifyPassword(string $hash, Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string'
        ]);

        $guestUpload = GuestUpload::where('hash', $hash)->first();

        if (!$guestUpload) {
            return response()->json(['message' => 'Upload not found'], 404);
        }

        if (!$guestUpload->canDownload()) {
            return response()->json([
                'message' => 'This upload has expired or reached download limit'
            ], 410);
        }

        if (!$guestUpload->password) {
            return response()->json(['message' => 'This upload is not password protected'], 400);
        }

        $isValid = password_verify($request->password, $guestUpload->password);

        return response()->json([
            'valid' => $isValid,
            'message' => $isValid ? 'Password correct' : 'Invalid password'
        ], $isValid ? 200 : 401);
    }

    /**
     * Get preview for supported file types (images)
     */
    public function preview(string $hash): mixed
    {
        $guestUpload = GuestUpload::with('fileEntry')
            ->where('hash', $hash)
            ->first();

        if (!$guestUpload) {
            return response()->json(['message' => 'Upload not found'], 404);
        }

        if (!$guestUpload->canDownload()) {
            return response()->json([
                'message' => 'This upload has expired or reached download limit'
            ], 410);
        }

        // Only allow previews for images
        if (!str_starts_with($guestUpload->mime_type, 'image/')) {
            return response()->json(['message' => 'Preview not available for this file type'], 400);
        }

        $fileEntry = $guestUpload->fileEntry;
        if (!$fileEntry) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $disk = Storage::disk(config('common.site.uploads_disk'));
        
        if (!$disk->exists($fileEntry->file_name)) {
            return response()->json(['message' => 'File not found in storage'], 404);
        }

        return response($disk->get($fileEntry->file_name))
            ->header('Content-Type', $guestUpload->mime_type)
            ->header('Cache-Control', 'public, max-age=3600');
    }
}
