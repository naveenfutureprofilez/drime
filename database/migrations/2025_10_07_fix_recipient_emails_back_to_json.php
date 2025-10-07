<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, convert existing string data to JSON format
        $uploads = DB::table('guest_uploads')
            ->whereNotNull('recipient_emails')
            ->where('recipient_emails', '!=', '')
            ->get();

        foreach ($uploads as $upload) {
            $emails = $upload->recipient_emails;
            
            // If it's already a JSON string, skip
            if (json_decode($emails) !== null) {
                continue;
            }
            
            // Convert single email string to JSON array
            if (filter_var($emails, FILTER_VALIDATE_EMAIL)) {
                $jsonEmails = json_encode([$emails]);
                DB::table('guest_uploads')
                    ->where('id', $upload->id)
                    ->update(['recipient_emails' => $jsonEmails]);
            }
        }

        // Now change the column type back to JSON
        Schema::table('guest_uploads', function (Blueprint $table) {
            $table->json('recipient_emails')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guest_uploads', function (Blueprint $table) {
            $table->string('recipient_emails')->nullable()->change();
        });
    }
};