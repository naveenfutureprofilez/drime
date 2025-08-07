<?php

namespace Tests\Feature;

use App\Models\GuestUpload;
use App\Models\GuestUploadFile;
use App\Models\FileEntry;
use App\Models\ShareableLink;
use App\Services\GuestUploadService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Carbon\Carbon;
use ZipArchive;

class MultiFileGuestUploadsTest extends TestCase
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
    public function it_uploads_three_files_and_creates_single_guest_upload_with_three_pivot_rows()
    {
        // Create three test files
        $files = [
            UploadedFile::fake()->image('test1.jpg', 100, 100)->size(1024),
            UploadedFile::fake()->create('test2.pdf', 2048), // 2MB
            UploadedFile::fake()->create('test3.txt', 512)   // 512KB
        ];

        // Upload multiple files via the guest upload API
        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => $files,
            'expires_in_hours' => 48,
            'max_downloads' => 5
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'hash',
                         'expires_at',
                         'files',
                         'download_all_url'
                     ]
                 ]);

        // Assert single GuestUpload row was created
        $this->assertCount(1, GuestUpload::all());
        $guestUpload = GuestUpload::first();
        
        $this->assertNotNull($guestUpload->hash);
        $this->assertEquals(5, $guestUpload->max_downloads);
        $this->assertNotNull($guestUpload->expires_at);

        // Assert 3 FileEntry rows were created
        $this->assertCount(3, FileEntry::all());
        
        // Assert 3 pivot rows in guest_upload_files table
        $this->assertCount(3, GuestUploadFile::all());
        $this->assertCount(3, $guestUpload->files);
        
        // Verify each file is properly linked
        $uploadedFilenames = $guestUpload->files->pluck('name')->toArray();
        $this->assertContains('test1.jpg', $uploadedFilenames);
        $this->assertContains('test2.pdf', $uploadedFilenames);
        $this->assertContains('test3.txt', $uploadedFilenames);
        
        // Verify total size is calculated correctly
        $expectedTotalSize = 1024 + 2048 + 512; // Convert to KB
        $this->assertEquals($expectedTotalSize, $guestUpload->total_size / 1024);
    }

    /** @test */
    public function show_endpoint_returns_three_files_information()
    {
        // Create a guest upload with 3 files
        $guestUpload = $this->createGuestUploadWithThreeFiles();

        // Call the show endpoint
        $response = $this->getJson("/api/v1/guest/upload/{$guestUpload->hash}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'hash',
                     'expires_at',
                     'max_downloads',
                     'download_count',
                     'has_password',
                     'files' => [
                         '*' => [
                             'id',
                             'filename',
                             'size',
                             'mime_type'
                         ]
                     ]
                 ]);

        $responseData = $response->json();
        
        // Assert 3 files are returned
        $this->assertCount(3, $responseData['files']);
        
        // Verify file details
        $filenames = collect($responseData['files'])->pluck('filename')->toArray();
        $this->assertContains('file1.txt', $filenames);
        $this->assertContains('file2.pdf', $filenames);
        $this->assertContains('file3.jpg', $filenames);
    }

    /** @test */
    public function single_file_download_works_and_respects_password()
    {
        // Create a password-protected guest upload with 3 files
        $password = 'test123';
        $guestUpload = $this->createGuestUploadWithThreeFiles($password);
        $fileEntry = $guestUpload->files->first();

        // Try to download without password - should fail
        $response = $this->getJson("/api/v1/download/{$guestUpload->hash}/{$fileEntry->id}");
        $response->assertStatus(401)
                 ->assertJson(['message' => 'Invalid password']);

        // Try to download with wrong password - should fail
        $response = $this->getJson("/api/v1/download/{$guestUpload->hash}/{$fileEntry->id}?password=wrong");
        $response->assertStatus(401)
                 ->assertJson(['message' => 'Invalid password']);

        // Mock the file in storage for download
        Storage::disk('uploads')->put(
            "guest-uploads/{$fileEntry->file_name}",
            'Test file content'
        );

        // Download with correct password - should succeed
        $response = $this->getJson("/api/v1/download/{$guestUpload->hash}/{$fileEntry->id}?password={$password}");
        $response->assertStatus(200);

        // Verify download count was incremented
        $guestUpload->refresh();
        $this->assertEquals(1, $guestUpload->download_count);
    }

    /** @test */
    public function download_all_returns_zip_with_three_entries()
    {
        // Create a guest upload with 3 files
        $guestUpload = $this->createGuestUploadWithThreeFiles();
        
        // Mock files in storage
        foreach ($guestUpload->files as $file) {
            Storage::disk('uploads')->put(
                "guest-uploads/{$file->file_name}",
                "Content for {$file->name}"
            );
        }

        // Download all files as ZIP
        $response = $this->get("/api/v1/download/{$guestUpload->hash}");
        $response->assertStatus(200);
        
        // Verify it's a ZIP response
        $this->assertStringContainsString('application/octet-stream', $response->headers->get('Content-Type') ?? '');
        
        // Verify download count was incremented once for the entire ZIP
        $guestUpload->refresh();
        $this->assertEquals(1, $guestUpload->download_count);
    }

    /** @test */
    public function download_limit_applies_across_multiple_files()
    {
        // Create a guest upload with max 2 downloads
        $guestUpload = $this->createGuestUploadWithThreeFiles(null, 2);
        
        // Mock files in storage
        foreach ($guestUpload->files as $file) {
            Storage::disk('uploads')->put(
                "guest-uploads/{$file->file_name}",
                "Content for {$file->name}"
            );
        }

        $firstFile = $guestUpload->files->first();
        $secondFile = $guestUpload->files->skip(1)->first();
        $thirdFile = $guestUpload->files->last();

        // First download should succeed
        $response = $this->get("/api/v1/download/{$guestUpload->hash}/{$firstFile->id}");
        $response->assertStatus(200);
        
        // Second download should succeed
        $response = $this->get("/api/v1/download/{$guestUpload->hash}/{$secondFile->id}");
        $response->assertStatus(200);
        
        // Third download should fail due to limit
        $response = $this->get("/api/v1/download/{$guestUpload->hash}/{$thirdFile->id}");
        $response->assertStatus(410)
                 ->assertJson(['message' => 'This upload has expired or reached download limit']);
        
        // Verify download count reached the limit
        $guestUpload->refresh();
        $this->assertEquals(2, $guestUpload->download_count);
        $this->assertTrue($guestUpload->hasReachedDownloadLimit());
    }

    /** @test */
    public function purge_job_cleans_everything_for_expired_uploads()
    {
        // Create an expired guest upload with 3 files
        $guestUpload = $this->createGuestUploadWithThreeFiles();
        
        // Make it expired
        $guestUpload->update(['expires_at' => Carbon::now()->subDays(31)]);
        
        // Create files in storage
        $storedFiles = [];
        foreach ($guestUpload->files as $file) {
            $filePath = "guest-uploads/{$file->file_name}";
            Storage::disk('uploads')->put($filePath, 'Test content');
            $storedFiles[] = $filePath;
        }
        
        // Verify files exist in storage before purge
        foreach ($storedFiles as $filePath) {
            $this->assertTrue(Storage::disk('uploads')->exists($filePath));
        }

        // Run the purge command
        $this->artisan('guest-uploads:purge')
             ->assertExitCode(0);

        // Assert everything was cleaned up
        $this->assertCount(0, GuestUpload::withoutGlobalScopes()->get());
        $this->assertCount(0, GuestUploadFile::all());
        $this->assertCount(0, FileEntry::all());
        
        // Verify files were deleted from storage
        foreach ($storedFiles as $filePath) {
            $this->assertFalse(Storage::disk('uploads')->exists($filePath));
        }
    }

    /** @test */
    public function download_limit_applies_to_zip_downloads_as_well()
    {
        // Create a guest upload with max 1 download
        $guestUpload = $this->createGuestUploadWithThreeFiles(null, 1);
        
        // Mock files in storage
        foreach ($guestUpload->files as $file) {
            Storage::disk('uploads')->put(
                "guest-uploads/{$file->file_name}",
                "Content for {$file->name}"
            );
        }

        // Download all as ZIP - should succeed
        $response = $this->get("/api/v1/download/{$guestUpload->hash}");
        $response->assertStatus(200);
        
        // Try to download individual file - should fail due to limit
        $firstFile = $guestUpload->files->first();
        $response = $this->get("/api/v1/download/{$guestUpload->hash}/{$firstFile->id}");
        $response->assertStatus(410)
                 ->assertJson(['message' => 'This upload has expired or reached download limit']);
        
        // Verify download count
        $guestUpload->refresh();
        $this->assertEquals(1, $guestUpload->download_count);
    }

    /** @test */
    public function expired_uploads_cannot_be_downloaded()
    {
        // Create a guest upload that's expired
        $guestUpload = $this->createGuestUploadWithThreeFiles();
        $guestUpload->update(['expires_at' => Carbon::now()->subHour()]);
        
        $firstFile = $guestUpload->files->first();

        // Try to download - should fail
        $response = $this->get("/api/v1/download/{$guestUpload->hash}/{$firstFile->id}");
        $response->assertStatus(410)
                 ->assertJson(['message' => 'This upload has expired or reached download limit']);
        
        // Try to download all - should fail  
        $response = $this->get("/api/v1/download/{$guestUpload->hash}");
        $response->assertStatus(410)
                 ->assertJson(['message' => 'This upload has expired or reached download limit']);
    }

    /** @test */
    public function single_file_upload_still_works_with_new_system()
    {
        // Test backward compatibility with single file uploads
        $file = UploadedFile::fake()->create('single.txt', 1024);

        $response = $this->postJson('/api/v1/guest/upload', [
            'files' => [$file],
            'expires_in_hours' => 24
        ]);

        $response->assertStatus(201);

        // Assert single GuestUpload row
        $this->assertCount(1, GuestUpload::all());
        
        // Assert single FileEntry row
        $this->assertCount(1, FileEntry::all());
        
        // Assert single pivot row
        $this->assertCount(1, GuestUploadFile::all());
        
        $guestUpload = GuestUpload::first();
        $this->assertCount(1, $guestUpload->files);
        $this->assertEquals('single.txt', $guestUpload->files->first()->name);
    }

    /** @test */
    public function password_verification_endpoint_works_correctly()
    {
        $password = 'secure123';
        $guestUpload = $this->createGuestUploadWithThreeFiles($password);

        // Test correct password
        $response = $this->postJson("/api/v1/guest/upload/{$guestUpload->hash}/verify-password", [
            'password' => $password
        ]);
        
        $response->assertStatus(200)
                 ->assertJson([
                     'valid' => true,
                     'message' => 'Password correct'
                 ]);

        // Test incorrect password
        $response = $this->postJson("/api/v1/guest/upload/{$guestUpload->hash}/verify-password", [
            'password' => 'wrong'
        ]);
        
        $response->assertStatus(401)
                 ->assertJson([
                     'valid' => false,
                     'message' => 'Invalid password'
                 ]);
    }

    /**
     * Helper method to create a guest upload with 3 test files
     */
    private function createGuestUploadWithThreeFiles(?string $password = null, ?int $maxDownloads = null): GuestUpload
    {
        // Create the main GuestUpload record
        $guestUpload = GuestUpload::create([
            'hash' => 'test-hash-' . uniqid(),
            'password' => $password,
            'expires_at' => Carbon::now()->addDays(1),
            'max_downloads' => $maxDownloads,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test Agent',
            'metadata' => ['upload_method' => 'test'],
            'recipient_emails' => [],
            'total_size' => 0,
        ]);

        // Create 3 FileEntry records
        $files = [
            FileEntry::create([
                'name' => 'file1.txt',
                'file_name' => 'stored-file1-' . uniqid(),
                'mime' => 'text/plain',
                'file_size' => 1024,
                'extension' => 'txt',
                'user_id' => null,
                'parent_id' => null,
                'path' => 'guest-uploads',
                'type' => 'file',
            ]),
            FileEntry::create([
                'name' => 'file2.pdf',
                'file_name' => 'stored-file2-' . uniqid(),
                'mime' => 'application/pdf',
                'file_size' => 2048,
                'extension' => 'pdf',
                'user_id' => null,
                'parent_id' => null,
                'path' => 'guest-uploads',
                'type' => 'file',
            ]),
            FileEntry::create([
                'name' => 'file3.jpg',
                'file_name' => 'stored-file3-' . uniqid(),
                'mime' => 'image/jpeg',
                'file_size' => 3072,
                'extension' => 'jpg',
                'user_id' => null,
                'parent_id' => null,
                'path' => 'guest-uploads',
                'type' => 'file',
            ]),
        ];

        // Attach files to the guest upload via pivot table
        foreach ($files as $file) {
            $guestUpload->files()->attach($file->id);
        }

        // Update total size
        $totalSize = collect($files)->sum('file_size');
        $guestUpload->update(['total_size' => $totalSize]);

        return $guestUpload->fresh(['files']);
    }
}
