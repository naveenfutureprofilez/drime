<?php

namespace App\Jobs;

use App\Models\FileEntry;
use App\Models\GuestUpload;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class TransferFileToCloudJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $fileEntryId;
    protected array $transferMetadata;

    /**
     * Create a new job instance.
     */
    public function __construct(string $fileEntryId, array $transferMetadata)
    {
        $this->fileEntryId = $fileEntryId;
        $this->transferMetadata = $transferMetadata;

        // Set job to high priority for user experience
        $this->onQueue('high');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Starting cloud storage transfer job', [
                'file_entry_id' => $this->fileEntryId,
                'transfer_metadata' => $this->transferMetadata
            ]);

            $fileEntry = FileEntry::find($this->fileEntryId);
            if (!$fileEntry) {
                Log::error('FileEntry not found for cloud transfer', [
                    'file_entry_id' => $this->fileEntryId
                ]);
                return;
            }

            $uploadKey = $this->transferMetadata['upload_key'];
            $localTusPath = $this->transferMetadata['local_path'];
            $cloudPath = $this->transferMetadata['cloud_path'];
            $finalFileName = $this->transferMetadata['final_filename'];

            if (!file_exists($localTusPath)) {
                Log::error('Local TUS file not found for cloud transfer', [
                    'local_path' => $localTusPath,
                    'upload_key' => $uploadKey
                ]);
                return;
            }

            $finalDisk = Storage::disk('uploads'); // Dynamic uploads disk
            $fileSize = filesize($localTusPath);

            Log::info('Transferring file to cloud storage', [
                'upload_key' => $uploadKey,
                'file_size' => $fileSize,
                'source' => $localTusPath,
                'destination' => $cloudPath
            ]);

            // Use streaming for files larger than 50MB to avoid memory issues
            if ($fileSize > 50 * 1024 * 1024) {
                $stream = fopen($localTusPath, 'r');
                if ($stream === false) {
                    throw new \Exception('Unable to open TUS file for streaming: ' . $localTusPath);
                }

                try {
                    $finalDisk->writeStream($cloudPath, $stream);
                    Log::info('Large file streamed successfully to cloud storage', [
                        'upload_key' => $uploadKey,
                        'file_size' => $fileSize
                    ]);
                } finally {
                    fclose($stream);
                }
            } else {
                // Use regular method for smaller files
                $fileContent = file_get_contents($localTusPath);
                $finalDisk->put($cloudPath, $fileContent);
                Log::info('Small file transferred to cloud storage', [
                    'upload_key' => $uploadKey,
                    'file_size' => $fileSize
                ]);
            }

            // Update FileEntry to point to cloud storage
            $fileEntry->update([
                'file_name' => $finalFileName,
                'path' => 'guest-uploads',
                'disk_prefix' => 'uploads'
            ]);

            // Clean up local TUS file
            if (file_exists($localTusPath)) {
                unlink($localTusPath);
                Log::info('Local TUS file cleaned up after cloud transfer', [
                    'local_path' => $localTusPath
                ]);
            }

            Log::info('Cloud storage transfer completed successfully', [
                'file_entry_id' => $this->fileEntryId,
                'upload_key' => $uploadKey,
                'cloud_path' => $cloudPath
            ]);

        } catch (\Exception $e) {
            Log::error('Cloud storage transfer job failed', [
                'file_entry_id' => $this->fileEntryId,
                'upload_key' => $this->transferMetadata['upload_key'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw so the job can be retried
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Cloud storage transfer job permanently failed', [
            'file_entry_id' => $this->fileEntryId,
            'upload_key' => $this->transferMetadata['upload_key'] ?? 'unknown',
            'error' => $exception->getMessage()
        ]);

        // File will remain in local storage if cloud transfer fails
        // This ensures users can still download their files
    }
}
