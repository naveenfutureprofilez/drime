<?php

namespace App\Http\Controllers\Admin;

use App\Models\GuestUpload;
use App\Models\FileEntry;
use App\Services\GuestUploadService;
use Common\Core\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Mail\GuestUploadSent;
use App\Models\ShareableLink;
use Carbon\Carbon;
use App\Helpers\EmailUrlHelper;

class TransferFilesController extends BaseController
{
    public function __construct(
        protected GuestUploadService $guestUploadService
    ) {
    }

    /**
     * Get paginated list of all transfer files
     */
    public function index(Request $request): JsonResponse
    {
        // $this->authorize('index', \Common\Settings\Setting::class); // Temporarily disabled to debug table display

        $perPage = $request->get('per_page', 15);
        $query = GuestUpload::with(['files', 'shareableLink'])
            ->orderBy('created_at', 'desc');

        // Search functionality
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('original_filename', 'like', "%{$search}%")
                  ->orWhere('hash', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%")
                  ->orWhere('recipient_emails', 'like', "%{$search}%")
                  ->orWhereHas('files', function ($fileQuery) use ($search) {
                      $fileQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($status = $request->get('status')) {
            switch ($status) {
                case 'expired':
                    $query->where('expires_at', '<', Carbon::now());
                    break;
                case 'active':
                    $query->where('expires_at', '>', Carbon::now());
                    break;
            }
        }

        $files = $query->paginate($perPage);

        // Transform the data to include additional information
        $files->getCollection()->transform(function ($item) {
            // Calculate total file size and get first file info
            $totalSize = $item->files->sum('file_size');
            $firstFile = $item->files->first();
            $fileNames = $item->files->pluck('name')->filter()->join(', ');
            
            // Use the first file's name as original_filename if original_filename is empty
            $displayName = $item->original_filename ?: ($firstFile ? $firstFile->name : 'Untitled');
            
            return [
                'id' => $item->id,
                'hash' => $item->hash,
                'original_filename' => $displayName, // Frontend expects this for file name display
                'file_name' => $firstFile ? $firstFile->name : null,
                'file_names' => $fileNames,
                'files_count' => $item->files->count(),
                'file_size' => $totalSize,
                'mime_type' => $firstFile ? $firstFile->mime : null,
                'download_count' => $item->download_count,
                'max_downloads' => $item->max_downloads,
                'has_password' => !is_null($item->password),
                'sender_email' => $item->sender_email,
                'recipient_emails' => $item->recipient_emails,
                'title' => $item->title, // Add title field
                'message' => $item->message, // Add message field
                'expires_at' => $item->expires_at,
                'created_at' => $item->created_at,
                'is_expired' => $item->expires_at && Carbon::parse($item->expires_at)->isPast(),
                'share_url' => $this->generateShareUrl($item),
                'formatted_size' => $this->formatBytes($totalSize),
                'status' => $this->getFileStatus($item)
            ];
        });

        return $this->success([
            'pagination' => [
                'data' => $files->items(),
                'current_page' => $files->currentPage(),
                'last_page' => $files->lastPage(),
                'per_page' => $files->perPage(),
                'total' => $files->total(),
                'from' => $files->firstItem(),
                'to' => $files->lastItem(),
            ]
        ]);
    }

    /**
     * Delete a transfer file
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        // $this->authorize('update', \Common\Settings\Setting::class); // Temporarily disabled

        $guestUpload = GuestUpload::with('fileEntry')->findOrFail($id);

        try {
            // Delete the file from storage
            if ($guestUpload->fileEntry) {
                $disk = Storage::disk(config('common.site.uploads_disk'));
                $filePath = $guestUpload->fileEntry->path ? 
                    $guestUpload->fileEntry->path . '/' . $guestUpload->fileEntry->file_name : 
                    $guestUpload->fileEntry->file_name;
                
                if ($disk->exists($filePath)) {
                    $disk->delete($filePath);
                }

                // Delete the file entry record
                $guestUpload->fileEntry->delete();
            }

            // Delete the guest upload record
            $guestUpload->delete();

            return $this->success([
                'message' => 'Transfer file deleted successfully'
            ]);

        } catch (\Exception $e) {
            return $this->error('Failed to delete transfer file: ' . $e->getMessage());
        }
    }

    /**
     * Bulk delete transfer files
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        // $this->authorize('update', \Common\Settings\Setting::class); // Temporarily disabled

        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:guest_uploads,id'
        ]);

        $deletedCount = 0;
        $errors = [];

        foreach ($request->ids as $id) {
            try {
                $guestUpload = GuestUpload::with('fileEntry')->find($id);
                if ($guestUpload) {
                    // Delete the file from storage
                    if ($guestUpload->fileEntry) {
                        $disk = Storage::disk(config('common.site.uploads_disk'));
                        $filePath = $guestUpload->fileEntry->path ? 
                            $guestUpload->fileEntry->path . '/' . $guestUpload->fileEntry->file_name : 
                            $guestUpload->fileEntry->file_name;
                        
                        if ($disk->exists($filePath)) {
                            $disk->delete($filePath);
                        }

                        $guestUpload->fileEntry->delete();
                    }

                    $guestUpload->delete();
                    $deletedCount++;
                }
            } catch (\Exception $e) {
                $errors[] = "Failed to delete file ID {$id}: " . $e->getMessage();
            }
        }

        $message = "Successfully deleted {$deletedCount} files";
        if (!empty($errors)) {
            $message .= ". Errors: " . implode(', ', $errors);
        }

        return $this->success([
            'message' => $message,
            'deleted_count' => $deletedCount,
            'errors' => $errors
        ]);
    }

    /**
     * Get transfer statistics
     */
    public function stats(): JsonResponse
    {
        // $this->authorize('index', \Common\Settings\Setting::class); // Temporarily disabled

        $totalFiles = GuestUpload::count();
        $totalSize = GuestUpload::join('file_entries', 'guest_uploads.file_entry_id', '=', 'file_entries.id')
            ->sum('file_entries.file_size');
        $expiredFiles = GuestUpload::where('expires_at', '<', Carbon::now())->count();
        $activeFiles = $totalFiles - $expiredFiles;
        $todayUploads = GuestUpload::whereDate('created_at', Carbon::today())->count();
        $weekUploads = GuestUpload::where('created_at', '>=', Carbon::now()->subWeek())->count();

        return $this->success([
            'total_files' => $totalFiles,
            'active_files' => $activeFiles,
            'expired_files' => $expiredFiles,
            'total_size' => $totalSize,
            'formatted_total_size' => $this->formatBytes($totalSize),
            'today_uploads' => $todayUploads,
            'week_uploads' => $weekUploads
        ]);
    }

    /**
     * Clean up expired files
     */
    public function cleanup(): JsonResponse
    {
        // $this->authorize('update', \Common\Settings\Setting::class); // Temporarily disabled

        try {
            $result = $this->guestUploadService->purgeExpiredUploads();

            return $this->success([
                'message' => 'Cleanup completed successfully',
                'deleted_uploads' => $result['guest_uploads'] ?? 0,
                'deleted_files' => $result['file_entries'] ?? 0,
                'deleted_physical_files' => $result['physical_files'] ?? 0
            ]);

        } catch (\Exception $e) {
            return $this->error('Cleanup failed: ' . $e->getMessage());
        }
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes(?int $bytes): string
    {
        if ($bytes === null || $bytes === 0) return '0 B';

        $k = 1024;
        $sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = floor(log($bytes) / log($k));

        return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
    }

    /**
     * Get file status
     */
    private function getFileStatus($item): string
    {
        if ($item->expires_at && Carbon::parse($item->expires_at)->isPast()) {
            return 'expired';
        }
        
        if ($item->max_downloads && $item->download_count >= $item->max_downloads) {
            return 'download_limit_reached';
        }

        return 'active';
    }

    /**
     * Send email notification for a transfer file
     */
    public function sendEmail(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sender_email' => 'required|email',
            'recipient_emails' => 'required|array|min:1|max:10',
            'recipient_emails.*' => 'required|email',
            'message' => 'nullable|string|max:500',
            'sender_name' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $guestUpload = GuestUpload::with(['files', 'shareableLink'])->findOrFail($id);

            $senderEmail = $request->input('sender_email');
            $recipientEmails = $request->input('recipient_emails');
            $message = $request->input('message');
            $senderName = $request->input('sender_name', $senderEmail);

            // Update guest upload record with email information
            $guestUpload->update([
                'sender_email' => $senderEmail,
                'recipient_emails' => $recipientEmails,
            ]);

            // Create or get shareable link for the transfer
            $shareableLink = $guestUpload->shareableLink;
            if (!$shareableLink) {
                // If no shareable link exists, create one
                $shareableLink = ShareableLink::create([
                    'entry_id' => $guestUpload->files->first()->id ?? null,
                    'hash' => \Illuminate\Support\Str::random(30),
                    'is_guest' => true,
                    'expires_at' => $guestUpload->expires_at,
                    'allow_download' => true,
                    'allow_edit' => false,
                ]);
                
                // Update guest upload with the new link
                $guestUpload->update(['link_id' => $shareableLink->hash]);
            }

            $linkUrl = $this->generateShareUrl($guestUpload);

            // Send emails to recipients immediately using the existing Mailable
            foreach ($recipientEmails as $recipientEmail) {
                Mail::to($recipientEmail)->send(
                    new GuestUploadSent($shareableLink, $guestUpload, $senderName, $linkUrl, $message)
                );
            }

            return response()->json([
                'message' => 'Email(s) sent successfully',
                'data' => [
                    'sender_email' => $senderEmail,
                    'recipient_count' => count($recipientEmails),
                    'link_url' => $linkUrl,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send emails',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate the correct share URL based on upload type
     */
    private function generateShareUrl($item): string
    {
        // If the upload has a shareable link, use the shareable link format
        if ($item->shareableLink) {
            // Check if it's a quick-share link (has is_guest = true)
            if ($item->shareableLink->is_guest) {
                return EmailUrlHelper::emailUrl("/quick-share/link/{$item->shareableLink->hash}");
            } else {
                return EmailUrlHelper::emailUrl("/share/{$item->shareableLink->hash}");
            }
        }
        
        // Fallback to guest upload format
        return EmailUrlHelper::emailUrl("/share/{$item->hash}");
    }
}
