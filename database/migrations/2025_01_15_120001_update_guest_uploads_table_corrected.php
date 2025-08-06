<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guest_uploads', function (Blueprint $table) {
            // Add link_id as string to reference shareable_links hash
            if (!Schema::hasColumn('guest_uploads', 'link_id')) {
                $table->string('link_id', 30)->nullable();
                $table->index('link_id');
            }
            
            // Add total_size column
            if (!Schema::hasColumn('guest_uploads', 'total_size')) {
                $table->bigInteger('total_size')->default(0);
            }
            
            // Add sender_email column
            if (!Schema::hasColumn('guest_uploads', 'sender_email')) {
                $table->string('sender_email')->nullable();
            }
            
            // Add recipient_emails as JSON
            if (!Schema::hasColumn('guest_uploads', 'recipient_emails')) {
                $table->json('recipient_emails')->nullable();
            }
            
            // Add last_downloaded_at timestamp
            if (!Schema::hasColumn('guest_uploads', 'last_downloaded_at')) {
                $table->timestamp('last_downloaded_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('guest_uploads', function (Blueprint $table) {
            $table->dropColumn(['link_id', 'total_size', 'sender_email', 'recipient_emails', 'last_downloaded_at']);
        });
    }
};
