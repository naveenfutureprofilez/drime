<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\FileEntry;
use App\Models\ShareableLink;
use App\Models\GuestUpload;

class QuickShareApiTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        Storage::fake('uploads');
    }

    /** @test */
    public function it_can_upload_file_via_quick_share_api()
    {
        $file = UploadedFile::fake()->image('test-file.jpg', 100, 100)->size(1024); // 1MB

        $response = $this->postJson('/api/v1/quick-share/uploads', [
            'file' => $file,
            'retention_hours' => 48,
            'sender_email' => 'sender@example.com',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'file_entry',
                         'shareable_link' => [
                             'hash',
                             'url',
                             'expires_at',
                         ],
                         'guest_upload' => [
                             'hash',
                             'filename',
                             'size',
                             'mime_type',
                         ],
                         'link_url',
                     ]
                 ]);

        // Assert file entry created with null user_id (guest)  
        $this->assertDatabaseHas('file_entries', [
            'name' => $file->getClientOriginalName(),
            'owner_id' => null,
        ]);

        // Assert shareable link created
        $this->assertDatabaseHas('shareable_links', [
            'is_guest' => true,
        ]);

        // Assert guest upload record created
        $this->assertDatabaseHas('guest_uploads', [
            'original_filename' => $file->getClientOriginalName(),
            'sender_email' => 'sender@example.com',
        ]);
    }

    /** @test */
    public function it_can_send_share_emails()
    {
        // First create a guest upload
        $file = UploadedFile::fake()->image('test-file.jpg', 100, 100)->size(1024);
        
        $uploadResponse = $this->postJson('/api/v1/quick-share/uploads', [
            'file' => $file,
            'retention_hours' => 48,
        ]);

        $linkHash = $uploadResponse->json('data.shareable_link.hash');

        // Now send emails
        $response = $this->postJson('/api/v1/quick-share/email-share', [
            'link_hash' => $linkHash,
            'sender_email' => 'sender@example.com',
            'sender_name' => 'John Doe',
            'recipient_emails' => ['recipient1@example.com', 'recipient2@example.com'],
            'message' => 'Please find the attached file.',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'data' => [
                         'sender_email',
                         'recipient_count',
                         'link_url',
                     ]
                 ]);
    }

    /** @test */
    public function it_can_fetch_link_payload_for_guest_share_page()
    {
        // First create a guest upload
        $file = UploadedFile::fake()->image('test-file.jpg', 100, 100)->size(1024);
        
        $uploadResponse = $this->postJson('/api/v1/quick-share/uploads', [
            'file' => $file,
            'retention_hours' => 48,
        ]);

        $linkHash = $uploadResponse->json('data.shareable_link.hash');

        // Fetch link payload
        $response = $this->getJson("/api/v1/quick-share/link/{$linkHash}");

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
                         'file' => [
                             'id',
                             'name',
                             'size',
                             'mime_type',
                             'extension',
                             'type',
                             'created_at',
                         ],
                         'guest_upload' => [
                             'hash',
                             'original_filename',
                             'download_count',
                             'max_downloads',
                         ],
                     ]
                 ]);
    }

    /** @test */
    public function it_returns_404_for_non_existent_link()
    {
        $response = $this->getJson('/api/v1/quick-share/link/non-existent-hash');

        $response->assertStatus(404)
                 ->assertJson([
                     'message' => 'Shareable link not found'
                 ]);
    }

    /** @test */
    public function it_validates_file_upload_requirements()
    {
        $response = $this->postJson('/api/v1/quick-share/uploads', [
            // Missing file
            'retention_hours' => 48,
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['file']);
    }

    /** @test */
    public function it_validates_email_share_requirements()
    {
        $response = $this->postJson('/api/v1/quick-share/email-share', [
            // Missing required fields
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors([
                     'link_hash',
                     'sender_email', 
                     'recipient_emails'
                 ]);
    }
}
