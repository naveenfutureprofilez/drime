<?php

namespace App\Http\Controllers\Admin;

use App\Models\GuestUpload;
use App\Services\GuestUploadService;
use Common\Core\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GuestUploadStatsController extends BaseController
{
    public function __construct(
        protected GuestUploadService $guestUploadService
    ) {
    }

    /**
     * Get guest upload statistics for admin dashboard
     */
    public function stats(): JsonResponse
    {
        $this->authorize('index', \Common\Settings\Setting::class);

        // Cache stats for 5 minutes to avoid expensive queries
        $stats = Cache::remember('admin.guest_uploads.stats', 300, function () {
            return $this->calculateStats();
        });

        return $this->success($stats);
    }

    /**
     * Manually trigger cleanup of expired uploads
     */
    public function cleanup(): JsonResponse
    {
        $this->authorize('update', \Common\Settings\Setting::class);

        $result = $this->guestUploadService->purgeExpiredUploads();

        // Clear the stats cache since cleanup has run
        Cache::forget('admin.guest_uploads.stats');

        return $this->success([
            'message' => __('Cleanup completed successfully.'),
            'result' => $result,
            'summary' => __(
                'Cleaned up :uploads uploads, :files files, :links links, and :physical physical files.',
                [
                    'uploads' => $result['guest_uploads'],
                    'files' => $result['file_entries'],
                    'links' => $result['shareable_links'],
                    'physical' => $result['physical_files'],
                ]
            ),
        ]);
    }

    /**
     * Calculate comprehensive statistics for guest uploads
     */
    private function calculateStats(): array
    {
        // Basic counts and storage usage
        $totalUploads = GuestUpload::count();
        $totalStorageBytes = GuestUpload::join('file_entries', 'guest_uploads.file_entry_id', '=', 'file_entries.id')
            ->sum('file_entries.file_size');

        // Recent activity counts
        $uploadsLast24h = GuestUpload::where('created_at', '>=', Carbon::now()->subDay())->count();
        $uploadsLast7d = GuestUpload::where('created_at', '>=', Carbon::now()->subWeek())->count();

        // Last purge run (check Laravel logs or create a separate tracking table)
        $lastPurgeRun = $this->getLastPurgeRunTime();

        // Additional useful stats
        $expiredUploads = GuestUpload::where('expires_at', '<', Carbon::now())->count();
        $retentionDays = settings('guest_uploads.retention_days', 30);
        $retentionCutoff = Carbon::now()->subDays($retentionDays);
        $uploadsToBeDeleted = GuestUpload::where(function ($query) use ($retentionCutoff) {
            $query->where('expires_at', '<', Carbon::now())
                  ->orWhere('created_at', '<', $retentionCutoff);
        })->count();

        // Top file types
        $topFileTypes = GuestUpload::select('mime_type', DB::raw('COUNT(*) as count'))
            ->groupBy('mime_type')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->pluck('count', 'mime_type')
            ->toArray();

        // Average file size
        $avgFileSize = GuestUpload::join('file_entries', 'guest_uploads.file_entry_id', '=', 'file_entries.id')
            ->avg('file_entries.file_size') ?: 0;

        return [
            'total_uploads' => $totalUploads,
            'total_storage_bytes' => (int) $totalStorageBytes,
            'uploads_count_last_24h' => $uploadsLast24h,
            'uploads_count_last_7d' => $uploadsLast7d,
            'last_purge_run' => $lastPurgeRun,
            'expired_uploads' => $expiredUploads,
            'uploads_to_be_deleted' => $uploadsToBeDeleted,
            'top_file_types' => $topFileTypes,
            'average_file_size_bytes' => (int) $avgFileSize,
            'settings' => [
                'enabled' => settings('guest_uploads.enabled', true),
                'max_size_mb' => settings('guest_uploads.max_size_mb', 100),
                'retention_days' => $retentionDays,
            ]
        ];
    }

    /**
     * Get the last purge run time from logs or cache
     */
    private function getLastPurgeRunTime(): ?string
    {
        // Try to get from cache first (set by the cleanup command)
        $lastRun = Cache::get('guest_uploads.last_purge_run');
        
        if ($lastRun) {
            return $lastRun;
        }

        // Fallback: check Laravel logs for recent cleanup activity
        // This is a simplified approach - in production you might want to store this in the database
        try {
            $logFile = storage_path('logs/laravel.log');
            if (file_exists($logFile)) {
                $logs = file_get_contents($logFile);
                if (preg_match('/\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\].*guest.*upload.*cleanup/i', $logs, $matches)) {
                    return $matches[1];
                }
            }
        } catch (\Exception $e) {
            // Log error but don't fail the request
            logger()->warning('Could not determine last purge run time', ['error' => $e->getMessage()]);
        }

        return null;
    }
}
