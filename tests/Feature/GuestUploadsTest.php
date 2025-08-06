<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\GuestUpload;
use App\Models\ShareableLink;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Testing\RefreshDatabase;

class GuestUploadsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_uploads_can_be_enabled_and_disabled()
    {
        // Test that the gate allows access when guest uploads are enabled
        config(['common.settings.guest_uploads.enabled' => true]);
        $this->assertTrue(Gate::allows('guest_uploads_enabled'));

        // Test that the middleware allows access when guest uploads are enabled
        $response = $this->get('/guest-upload');
        $response->assertStatus(200);

        // Test that the gate denies access when guest uploads are disabled
        config(['common.settings.guest_uploads.enabled' => false]);
        $this->assertFalse(Gate::allows('guest_uploads_enabled'));

        // Test that the middleware blocks access when guest uploads are disabled
        $response = $this->get('/guest-upload');
        $response->assertStatus(404);
    }

    public function test_expired_guest_uploads_are_hidden_from_queries()
    {
        // Create an expired guest upload
        GuestUpload::factory()->create(['expires_at' => now()->subDay()]);

        // Test that the expired upload is not returned by default
        $this->assertCount(0, GuestUpload::all());

        // Test that the expired upload can be accessed when global scopes are disabled
        $this->assertCount(1, GuestUpload::withoutGlobalScopes()->get());
    }

    public function test_guest_uploads_are_purged_automatically()
    {
        // Create an expired guest upload and a corresponding shareable link
        $upload = GuestUpload::factory()->create(['expires_at' => now()->subDays(31)]);
        ShareableLink::factory()->create(['file_entry_id' => $upload->file_entry_id]);

        // Run the purge command
        $this->artisan('guest-uploads:purge');

        // Test that the upload and link have been deleted
        $this->assertCount(0, GuestUpload::all());
        $this->assertCount(0, ShareableLink::all());
    }
}

