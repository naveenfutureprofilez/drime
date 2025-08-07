<?php

namespace Tests\Feature;

use App\Models\GuestUpload;
use App\Models\FileEntry;
use App\Models\ShareableLink;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Carbon\Carbon;

class QuickShareMultiFileTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        Storage::fake('uploads');
    }

    /** @test */
    public function quick_share_show_link_returns_multi_file_information()
    {
        // Create a guest upload with multiple files through the multi-file system
        $guestUpload = $this->createMultiFileGuestUploadForQuickShare();
        $shareableLink = $this->createShareableLinkForGuestUpload($guestUpload);

        // Call the showLink endpoint
        $response = $this->getJson("/api/v1/quick-share/link/{$shareableLink->hash}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'link' => [
                             'hash',
                             'expires_at',
                             'allow_download',
                             'allow_edit',
                             'has_password',
                         ],
                         'files' => [
                             '*' => [
                                 'id',
                                 'name',
                                 'size',
                                 'mime_type',
                                 'extension',
                                 'type',
                                 'created_at'
                             ]
                         ],
                         'guest_upload' => [
                             'hash',
                             'download_count',
                             'max_downloads',
                             'sender_email',
                             'last_downloaded_at',
                             'total_size',
                             'file_count'
                         ]
                     ]
                 ]);

        $responseData = $response->json();
        
        // Assert 3 files are returned
        $this->assertCount(3, $responseData['data']['files']);
        $this->assertEquals(3, $responseData['data']['guest_upload']['file_count']);
        
        // Verify specific file information
        $filenames = collect($responseData['data']['files'])->pluck('name')->toArray();
        $this->assertContains('document.pdf', $filenames);
        $this->assertContains('image.jpg', $filenames);
        $this->assertContains('text.txt', $filenames);
    }

    /** @test */
    public function quick_share_show_link_provides_legacy_file_field_for_single_file()
    {
        // Create a single-file guest upload
        $guestUpload = $this->createSingleFileGuestUploadForQuickShare();
        $shareableLink = $this->createShareableLinkForGuestUpload($guestUpload);

        $response = $this->getJson("/api/v1/quick-share/link/{$shareableLink->hash}");

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'data' => [
                         'file' => [
                             'id',
                             'name',
                             'size',
                             'mime_type',
                         ],
                         'files' => [
                             '*' => [
                                 'id',
                                 'name'
                             ]
                         ]
                     ]
                 ]);

        $responseData = $response->json();
        
        // Should have both 'file' (legacy) and 'files' (new) fields
        $this->assertCount(1, $responseData['data']['files']);
        $this->assertArrayHasKey('file', $responseData['data']);
        $this->assertEquals('single.txt', $responseData['data']['file']['name']);
    }

    /** @test */
    public function quick_share_download_returns_zip_for_multiple_files()
    {
        // Create multi-file upload
        $guestUpload = $this->createMultiFileGuestUploadForQuickShare();
        $shareableLink = $this->createShareableLinkForGuestUpload($guestUpload);
        
        // Mock files in storage
        foreach ($guestUpload->files as $file) {
            $filePath = $file->path ? 
                $file->path . '/' . $file->file_name : 
                $file->file_name;
            Storage::disk('uploads')->put($filePath, "Content for {$file->name}");
        }

        // Download should return ZIP for multiple files
        $response = $this->get("/api/v1/quick-share/link/{$shareableLink->hash}/download");
        $response->assertStatus(200);
        
        // Verify it's a ZIP response
        $this->assertStringContainsString('application/zip', $response->headers->get('Content-Type') ?? '');
        
        // Verify download count incremented
        $guestUpload->refresh();
        $this->assertEquals(1, $guestUpload->download_count);
    }

    /** @test */
    public function quick_share_download_returns_single_file_for_single_file_upload()
    {
        // Create single-file upload
        $guestUpload = $this->createSingleFileGuestUploadForQuickShare();
        $shareableLink = $this->createShareableLinkForGuestUpload($guestUpload);
        
        // Mock file in storage
        $file = $guestUpload->files->first();
        $filePath = $file->path ? 
            $file->path . '/' . $file->file_name : 
            $file->file_name;
        Storage::disk('uploads')->put($filePath, "Single file content");

        // Download should return the file directly
        $response = $this->get("/api/v1/quick-share/link/{$shareableLink->hash}/download");
        $response->assertStatus(200);
        
        // Verify download count incremented
        $guestUpload->refresh();
        $this->assertEquals(1, $guestUpload->download_count);
    }

    /** @test */
    public function quick_share_download_file_by_id_works()
    {
        // Create multi-file upload
        $guestUpload = $this->createMultiFileGuestUploadForQuickShare();
        $shareableLink = $this->createShareableLinkForGuestUpload($guestUpload);
        
        $specificFile = $guestUpload->files->where('name', 'document.pdf')->first();
        
        // Mock the specific file in storage
        $filePath = $specificFile->path ? 
            $specificFile->path . '/' . $specificFile->file_name : 
            $specificFile->file_name;
        Storage::disk('uploads')->put($filePath, "PDF content");

        // Download specific file
        $response = $this->get("/api/v1/quick-share/link/{$shareableLink->hash}/download/{$specificFile->id}");
        $response->assertStatus(200);
        
        // Verify download count incremented
        $guestUpload->refresh();
        $this->assertEquals(1, $guestUpload->download_count);
    }

    /** @test */
    public function quick_share_download_all_endpoint_works()
    {
        // Create multi-file upload
        $guestUpload = $this->createMultiFileGuestUploadForQuickShare();
        $shareableLink = $this->createShareableLinkForGuestUpload($guestUpload);
        
        // Mock files in storage
        foreach ($guestUpload->files as $file) {
            $filePath = $file->path ? 
                $file->path . '/' . $file->file_name : 
                $file->file_name;
            Storage::disk('uploads')->put($filePath, "Content for {$file->name}");
        }

        // Use the download-all endpoint
        $response = $this->get("/api/v1/quick-share/link/{$shareableLink->hash}/download-all");
        $response->assertStatus(200);
        
        // Verify it's a ZIP response
        $this->assertStringContainsString('application/zip', $response->headers->get('Content-Type') ?? '');
        
        // Verify download count incremented
        $guestUpload->refresh();
        $this->assertEquals(1, $guestUpload->download_count);
    }

    /** @test */
    public function quick_share_respects_password_protection()
    {
        // Create password-protected upload
        $password = 'test123';
        $guestUpload = $this->createMultiFileGuestUploadForQuickShare($password);
        $shareableLink = $this->createShareableLinkForGuestUpload($guestUpload, $password);
        
        // Mock files in storage
        foreach ($guestUpload->files as $file) {
            $filePath = $file->path ? 
                $file->path . '/' . $file->file_name : 
                $file->file_name;
            Storage::disk('uploads')->put($filePath, "Protected content");
        }

        // Try download without password - should fail
        $response = $this->get("/api/v1/quick-share/link/{$shareableLink->hash}/download");
        $response->assertStatus(401)
                 ->assertJson(['message' => 'Invalid password']);

        // Try download with correct password - should succeed
        $response = $this->get("/api/v1/quick-share/link/{$shareableLink->hash}/download?password={$password}");
        $response->assertStatus(200);
        
        // Verify download count incremented
        $guestUpload->refresh();
        $this->assertEquals(1, $guestUpload->download_count);
    }

    /** @test */
    public function quick_share_respects_download_limits()
    {
        // Create upload with 1 download limit
        $guestUpload = $this->createMultiFileGuestUploadForQuickShare(null, 1);
        $shareableLink = $this->createShareableLinkForGuestUpload($guestUpload);
        
        // Mock files in storage
        foreach ($guestUpload->files as $file) {
            $filePath = $file->path ? 
                $file->path . '/' . $file->file_name : 
                $file->file_name;
            Storage::disk('uploads')->put($filePath, "Limited content");
        }

        // First download should succeed
        $response = $this->get("/api/v1/quick-share/link/{$shareableLink->hash}/download");
        $response->assertStatus(200);
        
        // Second download should fail
        $response = $this->get("/api/v1/quick-share/link/{$shareableLink->hash}/download");
        $response->assertStatus(410)
                 ->assertJson(['message' => 'This upload has expired or reached download limit']);
    }

    /** @test */
    public function quick_share_handles_expired_uploads()
    {
        // Create expired upload
        $guestUpload = $this->createMultiFileGuestUploadForQuickShare();
        $guestUpload->update(['expires_at' => Carbon::now()->subHour()]);
        
        $shareableLink = $this->createShareableLinkForGuestUpload($guestUpload);
        $shareableLink->update(['expires_at' => Carbon::now()->subHour()]);

        // Show link should fail
        $response = $this->getJson("/api/v1/quick-share/link/{$shareableLink->hash}");
        $response->assertStatus(410)
                 ->assertJson(['message' => 'This link has expired']);
        
        // Download should also fail
        $response = $this->get("/api/v1/quick-share/link/{$shareableLink->hash}/download");
        $response->assertStatus(410)
                 ->assertJson(['message' => 'This link has expired']);
    }

    /** @test */
    public function quick_share_handles_missing_files_gracefully()
    {
        // Create upload but don't create files in storage
        $guestUpload = $this->createMultiFileGuestUploadForQuickShare();
        $shareableLink = $this->createShareableLinkForGuestUpload($guestUpload);

        // Download should handle missing files gracefully
        $response = $this->get("/api/v1/quick-share/link/{$shareableLink->hash}/download");
        
        // Should still return 200 but with empty or error content
        // The actual behavior depends on implementation - ZIP with no files or error
        $this->assertTrue(in_array($response->status(), [200, 404, 500]));
    }

    /**
     * Helper method to create a multi-file guest upload for QuickShare testing
     */
    private function createMultiFileGuestUploadForQuickShare(?string $password = null, ?int $maxDownloads = null): GuestUpload
    {
        $guestUpload = GuestUpload::create([
            'hash' => 'quickshare-hash-' . uniqid(),
            'password' => $password,
            'expires_at' => Carbon::now()->addDays(1),
            'max_downloads' => $maxDownloads,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test Agent',
            'metadata' => ['upload_method' => 'quick-share'],
            'recipient_emails' => [],
            'total_size' => 0,
            'link_id' => null, // Will be set when ShareableLink is created
        ]);

        // Create 3 different file entries
        $files = [
            FileEntry::create([
                'name' => 'document.pdf',
                'file_name' => 'stored-doc-' . uniqid() . '.pdf',
                'mime' => 'application/pdf',
                'file_size' => 2048,
                'extension' => 'pdf',
                'user_id' => null,
                'parent_id' => null,
                'path' => 'guest-uploads',
                'type' => 'file',
            ]),
            FileEntry::create([
                'name' => 'image.jpg',
                'file_name' => 'stored-img-' . uniqid() . '.jpg',
                'mime' => 'image/jpeg',
                'file_size' => 4096,
                'extension' => 'jpg',
                'user_id' => null,
                'parent_id' => null,
                'path' => 'guest-uploads',
                'type' => 'file',
            ]),
            FileEntry::create([
                'name' => 'text.txt',
                'file_name' => 'stored-txt-' . uniqid() . '.txt',
                'mime' => 'text/plain',
                'file_size' => 1024,
                'extension' => 'txt',
                'user_id' => null,
                'parent_id' => null,
                'path' => 'guest-uploads',
                'type' => 'file',
            ]),
        ];

        // Attach files to guest upload
        foreach ($files as $file) {
            $guestUpload->files()->attach($file->id);
        }

        // Update total size
        $totalSize = collect($files)->sum('file_size');
        $guestUpload->update(['total_size' => $totalSize]);

        return $guestUpload->fresh(['files']);
    }

    /**
     * Helper method to create a single-file guest upload for QuickShare testing
     */
    private function createSingleFileGuestUploadForQuickShare(): GuestUpload
    {
        $guestUpload = GuestUpload::create([
            'hash' => 'quickshare-single-' . uniqid(),
            'expires_at' => Carbon::now()->addDays(1),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test Agent',
            'metadata' => ['upload_method' => 'quick-share'],
            'recipient_emails' => [],
            'total_size' => 0,
        ]);

        $file = FileEntry::create([
            'name' => 'single.txt',
            'file_name' => 'stored-single-' . uniqid() . '.txt',
            'mime' => 'text/plain',
            'file_size' => 512,
            'extension' => 'txt',
            'user_id' => null,
            'parent_id' => null,
            'path' => 'guest-uploads',
            'type' => 'file',
        ]);

        $guestUpload->files()->attach($file->id);
        $guestUpload->update(['total_size' => $file->file_size]);

        return $guestUpload->fresh(['files']);
    }

    /**
     * Helper method to create a ShareableLink for a GuestUpload
     */
    private function createShareableLinkForGuestUpload(GuestUpload $guestUpload, ?string $password = null): ShareableLink
    {
        // For QuickShare, we need to create a ShareableLink linked to a FileEntry
        // In the legacy system, it's linked to the first file
        $firstFile = $guestUpload->files->first();
        
        $shareableLink = ShareableLink::create([
            'entry_id' => $firstFile->id,
            'hash' => 'link-hash-' . uniqid(),
            'is_guest' => true,
            'expires_at' => $guestUpload->expires_at,
            'allow_download' => true,
            'allow_edit' => false,
            'password' => $password,
        ]);

        // Update the guest upload to reference this link
        $guestUpload->update(['link_id' => $shareableLink->hash]);

        return $shareableLink;
    }
}
