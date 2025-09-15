<?php

namespace App\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Common\Core\BaseController;
use Common\Database\Datasource\Datasource;
use App\Models\GuestUpload;
use Illuminate\Support\Facades\DB;
use App\Helpers\EmailUrlHelper;

class TransferFilesController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // TODO: Re-enable auth after testing: $this->authorize('admin.access');

        // Use GuestUpload model with files relationship for multi-file support
        $query = GuestUpload::with(['files', 'fileEntry'])
            ->withoutGlobalScopes(); // Remove expired filter for admin view
        
        $datasource = new Datasource($query, $request->all());
        
        $datasource->order = [
            'col' => 'created_at',
            'dir' => 'desc'
        ];

        $pagination = $datasource->paginate();
        
        // Transform data for admin display
        $pagination->transform(function ($upload) {
            // Get files from relationship (multi-file) or single file fallback
            $files = $upload->files;
            if ($files->isEmpty() && $upload->fileEntry) {
                $files = collect([$upload->fileEntry]);
            }
            
            // Use first file for main display or aggregate info
            $primaryFile = $files->first();
            
            return [
                'id' => $upload->id,
                'original_filename' => $upload->original_filename ?: ($primaryFile ? $primaryFile->name : 'Multiple Files'),
                'file_size' => $upload->total_size ?: $upload->file_size,
                'mime_type' => $upload->mime_type ?: ($primaryFile ? $primaryFile->mime : null),
                'status' => $this->getFileStatus($upload),
                'download_count' => $upload->download_count,
                'max_downloads' => $upload->max_downloads,
                'expires_at' => $upload->expires_at,
                'created_at' => $upload->created_at,
                'updated_at' => $upload->updated_at,
                'share_url' => $upload->link_id ? EmailUrlHelper::emailUrl("/quick-share/link/{$upload->link_id}") : EmailUrlHelper::emailUrl("/share/{$upload->hash}"),
                'file_count' => $files->count(),
                'files' => $files->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'name' => $file->name,
                        'size' => $file->file_size,
                        'mime' => $file->mime,
                    ];
                }),
            ];
        });

        return $this->success(['pagination' => $pagination]);
    }

    public function destroy(int $id): JsonResponse
    {
        // TODO: Re-enable auth: $this->authorize('admin.access');

        $upload = GuestUpload::withoutGlobalScopes()->with(['files', 'fileEntry'])->findOrFail($id);
        
        // Delete associated files from storage
        $files = $upload->files;
        if ($files->isEmpty() && $upload->fileEntry) {
            $files = collect([$upload->fileEntry]);
        }
        
        foreach ($files as $file) {
            $disk = \Storage::disk($file->disk_prefix ?: config('common.site.uploads_disk', 'uploads'));
            $filePath = $file->path ? $file->path . '/' . $file->file_name : $file->file_name;
            
            if ($disk->exists($filePath)) {
                $disk->delete($filePath);
            }
            
            $file->delete();
        }
        
        // Delete the guest upload record
        $upload->delete();

        return $this->success();
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        // TODO: Re-enable auth: $this->authorize('admin.access');

        $ids = $request->get('ids', []);
        $deleted = 0;

        foreach ($ids as $id) {
            $upload = GuestUpload::withoutGlobalScopes()->with(['files', 'fileEntry'])->find($id);
            if ($upload) {
                // Delete associated files from storage
                $files = $upload->files;
                if ($files->isEmpty() && $upload->fileEntry) {
                    $files = collect([$upload->fileEntry]);
                }
                
                foreach ($files as $file) {
                    $disk = \Storage::disk($file->disk_prefix ?: config('common.site.uploads_disk', 'uploads'));
                    $filePath = $file->path ? $file->path . '/' . $file->file_name : $file->file_name;
                    
                    if ($disk->exists($filePath)) {
                        $disk->delete($filePath);
                    }
                    
                    $file->delete();
                }
                
                $upload->delete();
                $deleted++;
            }
        }

        return $this->success(['deleted_count' => $deleted]);
    }

    public function cleanup(): JsonResponse
    {
        // TODO: Re-enable auth: $this->authorize('admin.access');

        $expiredUploads = GuestUpload::withoutGlobalScopes()
            ->with(['files', 'fileEntry'])
            ->where('expires_at', '<', now())
            ->get();
            
        $deletedCount = 0;

        foreach ($expiredUploads as $upload) {
            // Delete associated files from storage
            $files = $upload->files;
            if ($files->isEmpty() && $upload->fileEntry) {
                $files = collect([$upload->fileEntry]);
            }
            
            foreach ($files as $file) {
                $disk = \Storage::disk($file->disk_prefix ?: config('common.site.uploads_disk', 'uploads'));
                $filePath = $file->path ? $file->path . '/' . $file->file_name : $file->file_name;
                
                if ($disk->exists($filePath)) {
                    $disk->delete($filePath);
                }
                
                $file->delete();
            }
            
            $upload->delete();
            $deletedCount++;
        }

        return $this->success(['deleted_uploads' => $deletedCount]);
    }

    public function stats(): JsonResponse
    {
        // TODO: Re-enable auth: $this->authorize('admin.access');

        $totalFiles = GuestUpload::withoutGlobalScopes()->count();
        $todayUploads = GuestUpload::withoutGlobalScopes()->whereDate('created_at', today())->count();
        $totalSize = GuestUpload::withoutGlobalScopes()->sum('total_size') ?: 0;

        return $this->success([
            'total_files' => $totalFiles,
            'today_uploads' => $todayUploads,
            'total_size' => $totalSize,
            'formatted_total_size' => $this->formatBytes($totalSize),
        ]);
    }

    private function getFileStatus($file): string
    {
        if ($file->expires_at && $file->expires_at < now()) {
            return 'expired';
        }

        if ($file->max_downloads && $file->download_count >= $file->max_downloads) {
            return 'download_limit_reached';
        }

        return 'active';
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function show(Request $request, $id): JsonResponse
    {
        // TODO: Re-enable auth after testing: $this->authorize('admin.access');

        $upload = GuestUpload::with(['files', 'fileEntry'])
            ->withoutGlobalScopes()
            ->findOrFail($id);

        // Get files from relationship (multi-file) or single file fallback
        $files = $upload->files;
        if ($files->isEmpty() && $upload->fileEntry) {
            $files = collect([$upload->fileEntry]);
        }
        
        // Use first file for main display or aggregate info
        $primaryFile = $files->first();
        
        $data = [
            'id' => $upload->id,
            'original_filename' => $upload->original_filename ?: ($primaryFile ? $primaryFile->name : 'Multiple Files'),
            'file_size' => $upload->total_size ?: $upload->file_size,
            'formatted_size' => $this->formatBytes($upload->total_size ?: $upload->file_size ?: 0),
            'mime_type' => $upload->mime_type ?: ($primaryFile ? $primaryFile->mime : null),
            'status' => $this->getFileStatus($upload),
            'title' => $upload->title,
            'message' => $upload->message,
            'sender_email' => $upload->sender_email,
            'recipient_emails' => $upload->recipient_emails,
            'download_count' => $upload->download_count ?? 0,
            'max_downloads' => $upload->max_downloads,
            'has_password' => !empty($upload->password),
            'expires_at' => $upload->expires_at,
            'created_at' => $upload->created_at,
            'updated_at' => $upload->updated_at,
            'files_count' => $files->count(),
            'share_url' => $upload->share_url ? EmailUrlHelper::buildShareUrl($upload->share_url) : null,
        ];

        return response()->json($data);
    }
}
