<?php

namespace App\Console\Commands;

use App\Models\GuestUpload;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateGuestUploadToPivot extends Command
{
    protected $signature = 'guest-uploads:migrate-to-pivot 
                           {--dry-run : Show what would be migrated without making changes}
                           {--batch-size=100 : Number of records to process per batch}';
    
    protected $description = 'Migrate existing GuestUpload single-file records to pivot table (guest_upload_files)';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $batchSize = (int) $this->option('batch-size');
        
        $this->info('Starting migration of GuestUpload records to pivot table...');
        
        if ($dryRun) {
            $this->warn('DRY RUN MODE - No changes will be made');
        }

        try {
            // Get all GuestUpload records where file_entry_id is not null
            // Use withoutGlobalScopes to bypass any global scopes that might filter results
            $totalRecords = GuestUpload::withoutGlobalScopes()
                ->whereNotNull('file_entry_id')
                ->count();

            if ($totalRecords === 0) {
                $this->info('No GuestUpload records with file_entry_id found. Nothing to migrate.');
                return Command::SUCCESS;
            }

            $this->info("Found {$totalRecords} GuestUpload records to migrate.");

            $migratedCount = 0;
            $skippedCount = 0;
            
            // Process records in batches to avoid memory issues
            GuestUpload::withoutGlobalScopes()
                ->whereNotNull('file_entry_id')
                ->chunkById($batchSize, function ($guestUploads) use ($dryRun, &$migratedCount, &$skippedCount) {
                    foreach ($guestUploads as $guestUpload) {
                        $this->processGuestUpload($guestUpload, $dryRun, $migratedCount, $skippedCount);
                    }
                });

            $this->newLine();
            $this->info("Migration completed!");
            $this->info("Migrated: {$migratedCount} records");
            $this->info("Skipped: {$skippedCount} records");
            
            if ($dryRun) {
                $this->warn('This was a dry run. No actual changes were made.');
                $this->info('Run without --dry-run to perform the actual migration.');
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error('Migration failed: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return Command::FAILURE;
        }
    }

    private function processGuestUpload(GuestUpload $guestUpload, bool $dryRun, int &$migratedCount, int &$skippedCount): void
    {
        // Check if pivot record already exists (idempotent check)
        $pivotExists = DB::table('guest_upload_files')
            ->where('guest_upload_id', $guestUpload->id)
            ->where('file_entry_id', $guestUpload->file_entry_id)
            ->exists();

        if ($pivotExists) {
            $skippedCount++;
            $this->line("  Skipped GuestUpload ID {$guestUpload->id} (pivot record already exists)", 'comment');
            return;
        }

        // Verify that the file_entry still exists
        $fileEntryExists = DB::table('file_entries')
            ->where('id', $guestUpload->file_entry_id)
            ->exists();

        if (!$fileEntryExists) {
            $skippedCount++;
            $this->line("  Skipped GuestUpload ID {$guestUpload->id} (file_entry {$guestUpload->file_entry_id} no longer exists)", 'comment');
            return;
        }

        if (!$dryRun) {
            // Insert pivot record
            DB::table('guest_upload_files')->insert([
                'guest_upload_id' => $guestUpload->id,
                'file_entry_id' => $guestUpload->file_entry_id,
                'created_at' => $guestUpload->created_at,
                'updated_at' => $guestUpload->updated_at,
            ]);
        }

        $migratedCount++;
        $this->line("  Migrated GuestUpload ID {$guestUpload->id} -> file_entry_id {$guestUpload->file_entry_id}");
    }
}
