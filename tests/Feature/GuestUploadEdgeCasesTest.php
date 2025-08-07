<?php

namespace Tests\Feature;

use App\Models\GuestUpload;
use App\Models\GuestUploadFile;
use App\Models\FileEntry;
use App\Services\GuestUploadService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Carbon\Carbon;

class GuestUploadEdgeCasesTest extends TestCase
{
    use RefreshDatabase;

    private GuestUploadService $guestUploadService;

    public function setUp(): void
    {
        parent::setUp();
        Storage::fake('uploads');
        $this->guestUploadService = app(GuestUploadService::class);
    }

    /** @test */
    public function it_handles_maximum_file_size_validation()
    {
        // Create a file that exceeds the maximum size limit
        $largeFile = UploadedFile::fake()->create('large.txt', 5000000); // 5GB (exceeds 3GB default limit)

        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => [$largeFile],
            'expires_in_hours' => 24
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['files.0']);
    }

    /** @test */
    public function it_validates_maximum_expiry_hours()
    {
        $file = UploadedFile::fake()->create('test.txt', 1024);

        // Try to set expiry beyond maximum (168 hours)
        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => [$file],
            'expires_in_hours' => 200 // Exceeds 7 days limit
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['expires_in_hours']);
    }

    /** @test */
    public function it_validates_minimum_password_length()
    {
        $file = UploadedFile::fake()->create('test.txt', 1024);

        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => [$file],
            'password' => '123', // Too short
            'expires_in_hours' => 24
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);
    }

    /** @test */
    public function it_validates_maximum_downloads_limit()
    {
        $file = UploadedFile::fake()->create('test.txt', 1024);

        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => [$file],
            'max_downloads' => 2000, // Exceeds 1000 limit
            'expires_in_hours' => 24
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['max_downloads']);
    }

    /** @test */
    public function it_handles_empty_files_array()
    {
        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => [], // Empty array
            'expires_in_hours' => 24
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['files']);
    }

    /** @test */
    public function it_enforces_global_scope_for_expired_uploads()
    {
        // Create an expired upload
        $expiredUpload = $this->createExpiredGuestUpload();
        
        // Should not appear in normal queries
        $this->assertCount(0, GuestUpload::all());
        
        // Should appear when global scopes are disabled
        $this->assertCount(1, GuestUpload::withoutGlobalScopes()->get());
        
        // Trying to access it via API should fail
        $response = $this->getJson("/api/v1/guest/upload/{$expiredUpload->hash}");
        $response->assertStatus(404);
    }

    /** @test */
    public function it_handles_file_storage_failures_gracefully()
    {
        // Create a mock that simulates storage failure
        Storage::fake('uploads');
        Storage::shouldReceive('disk->putFileAs')
               ->andReturn(false); // Simulate storage failure

        $file = UploadedFile::fake()->create('test.txt', 1024);

        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => [$file],
            'expires_in_hours' => 24
        ]);

        $response->assertStatus(500)
                 ->assertJson(['message' => 'Upload failed']);
    }

    /** @test */
    public function it_calculates_total_size_correctly_for_mixed_file_sizes()
    {
        $files = [
            UploadedFile::fake()->create('small.txt', 100),  // 100KB
            UploadedFile::fake()->create('medium.pdf', 500), // 500KB
            UploadedFile::fake()->create('large.jpg', 2000)  // 2MB
        ];

        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => $files,
            'expires_in_hours' => 24
        ]);

        $response->assertStatus(201);

        $guestUpload = GuestUpload::first();
        
        // Total should be 100KB + 500KB + 2000KB = 2600KB
        $expectedTotal = (100 + 500 + 2000) * 1024; // Convert to bytes
        $this->assertEquals($expectedTotal, $guestUpload->total_size);
    }

    /** @test */
    public function it_handles_duplicate_filenames_gracefully()
    {
        // Create files with identical names but different content
        $files = [
            UploadedFile::fake()->createWithContent('duplicate.txt', 'Content 1'),
            UploadedFile::fake()->createWithContent('duplicate.txt', 'Content 2'),
            UploadedFile::fake()->createWithContent('duplicate.txt', 'Content 3')
        ];

        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => $files,
            'expires_in_hours' => 24
        ]);

        $response->assertStatus(201);

        $guestUpload = GuestUpload::first();
        
        // All 3 files should be uploaded despite having same names
        $this->assertCount(3, $guestUpload->files);
        
        // All should have the same original name
        $filenames = $guestUpload->files->pluck('name')->toArray();
        $this->assertEquals(['duplicate.txt', 'duplicate.txt', 'duplicate.txt'], $filenames);
        
        // But different stored file names
        $storedNames = $guestUpload->files->pluck('file_name')->toArray();
        $this->assertCount(3, array_unique($storedNames)); // All unique
    }

    /** @test */
    public function it_handles_special_characters_in_filenames()
    {
        $files = [
            UploadedFile::fake()->create('file with spaces.txt', 100),
            UploadedFile::fake()->create('file-with-dashes.pdf', 200),
            UploadedFile::fake()->create('file_with_underscores.jpg', 300),
            UploadedFile::fake()->create('file(with)parentheses.doc', 400),
            UploadedFile::fake()->create('file[with]brackets.xlsx', 500)
        ];

        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => $files,
            'expires_in_hours' => 24
        ]);

        $response->assertStatus(201);

        $guestUpload = GuestUpload::first();
        $this->assertCount(5, $guestUpload->files);
        
        // Verify original filenames are preserved
        $originalNames = $guestUpload->files->pluck('name')->toArray();
        $this->assertContains('file with spaces.txt', $originalNames);
        $this->assertContains('file-with-dashes.pdf', $originalNames);
        $this->assertContains('file_with_underscores.jpg', $originalNames);
        $this->assertContains('file(with)parentheses.doc', $originalNames);
        $this->assertContains('file[with]brackets.xlsx', $originalNames);
    }

    /** @test */
    public function download_count_is_shared_across_all_files_in_upload()
    {
        // Create upload with 2 files and max 3 downloads
        $guestUpload = $this->createGuestUploadWithFiles(2, 3);
        
        // Mock files in storage
        foreach ($guestUpload->files as $file) {
            Storage::disk('uploads')->put(
                "guest-uploads/{$file->file_name}",
                "Content for {$file->name}"
            );
        }

        $file1 = $guestUpload->files->first();
        $file2 = $guestUpload->files->last();

        // Download file 1 twice
        $this->get("/api/v1/download/{$guestUpload->hash}/{$file1->id}")
             ->assertStatus(200);
        $this->get("/api/v1/download/{$guestUpload->hash}/{$file1->id}")
             ->assertStatus(200);
        
        // Download file 2 once  
        $this->get("/api/v1/download/{$guestUpload->hash}/{$file2->id}")
             ->assertStatus(200);
        
        // Total count should be 3 (shared across all files)
        $guestUpload->refresh();
        $this->assertEquals(3, $guestUpload->download_count);
        
        // Fourth download of any file should fail
        $this->get("/api/v1/download/{$guestUpload->hash}/{$file1->id}")
             ->assertStatus(410);
    }

    /** @test */
    public function it_prevents_accessing_non_existent_files_in_upload()
    {
        $guestUpload = $this->createGuestUploadWithFiles(2);
        
        // Try to download a file ID that doesn't belong to this upload
        $otherFileEntry = FileEntry::create([
            'name' => 'other.txt',
            'file_name' => 'other-stored.txt',
            'mime' => 'text/plain',
            'file_size' => 1024,
            'extension' => 'txt',
            'user_id' => null,
            'type' => 'file',
        ]);
        
        $response = $this->get("/api/v1/download/{$guestUpload->hash}/{$otherFileEntry->id}");
        $response->assertStatus(404)
                 ->assertJson(['message' => 'File not found']);
    }

    /** @test */
    public function it_handles_missing_files_in_storage_during_zip_download()
    {
        $guestUpload = $this->createGuestUploadWithFiles(3);
        
        // Only create 2 of 3 files in storage (simulate missing files)
        $files = $guestUpload->files;
        Storage::disk('uploads')->put(
            "guest-uploads/{$files[0]->file_name}",
            "Content for file 1"
        );
        Storage::disk('uploads')->put(
            "guest-uploads/{$files[1]->file_name}",
            "Content for file 2"
        );
        // Don't create the third file
        
        // ZIP download should still work and include available files
        $response = $this->get("/api/v1/download/{$guestUpload->hash}");
        $response->assertStatus(200);
        
        // Download count should still increment
        $guestUpload->refresh();
        $this->assertEquals(1, $guestUpload->download_count);
    }

    /** @test */
    public function purge_command_handles_missing_storage_files_gracefully()
    {
        // Create expired upload
        $guestUpload = $this->createGuestUploadWithFiles(2);
        $guestUpload->update(['expires_at' => Carbon::now()->subDays(31)]);
        
        // Create only one file in storage, leave the other missing
        $files = $guestUpload->files;
        Storage::disk('uploads')->put(
            "guest-uploads/{$files[0]->file_name}",
            "Content"
        );
        
        // Purge should complete successfully even with missing files
        $this->artisan('guest-uploads:purge')
             ->assertExitCode(0);
        
        // Records should be cleaned up
        $this->assertCount(0, GuestUpload::withoutGlobalScopes()->get());
        $this->assertCount(0, GuestUploadFile::all());
    }

    /**
     * Helper method to create expired guest upload
     */
    private function createExpiredGuestUpload(): GuestUpload
    {
        return GuestUpload::withoutGlobalScopes()->create([
            'hash' => 'expired-hash-' . uniqid(),
            'expires_at' => Carbon::now()->subHour(),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test Agent',
            'metadata' => ['upload_method' => 'test'],
            'recipient_emails' => [],
            'total_size' => 0,
        ]);
    }

    /**
     * Helper method to create guest upload with specified number of files
     */
    private function createGuestUploadWithFiles(int $fileCount, ?int $maxDownloads = null): GuestUpload
    {
        $guestUpload = GuestUpload::create([
            'hash' => 'test-hash-' . uniqid(),
            'expires_at' => Carbon::now()->addDays(1),
            'max_downloads' => $maxDownloads,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test Agent',
            'metadata' => ['upload_method' => 'test'],
            'recipient_emails' => [],
            'total_size' => 0,
        ]);

        $totalSize = 0;
        
        for ($i = 1; $i <= $fileCount; $i++) {
            $fileEntry = FileEntry::create([
                'name' => "file{$i}.txt",
                'file_name' => 'stored-file' . $i . '-' . uniqid(),
                'mime' => 'text/plain',
                'file_size' => 1024 * $i, // Different sizes for each file
                'extension' => 'txt',
                'user_id' => null,
                'parent_id' => null,
                'path' => 'guest-uploads',
                'type' => 'file',
            ]);
            
            $guestUpload->files()->attach($fileEntry->id);
            $totalSize += $fileEntry->file_size;
        }
        
        $guestUpload->update(['total_size' => $totalSize]);
        
        return $guestUpload->fresh(['files']);
    }
}
