<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guest_uploads', function (Blueprint $table) {
            // Add processing status columns
            $table->string('status', 50)->default('completed')->after('metadata')->index();
            $table->boolean('email_sent')->default(false)->after('status');
            $table->timestamp('email_sent_at')->nullable()->after('email_sent');
            $table->timestamp('processing_completed_at')->nullable()->after('email_sent_at');
            $table->text('error_message')->nullable()->after('processing_completed_at');
        });
    }

    public function down(): void
    {
        Schema::table('guest_uploads', function (Blueprint $table) {
            $table->dropColumn([
                'status', 
                'email_sent', 
                'email_sent_at', 
                'processing_completed_at', 
                'error_message'
            ]);
        });
    }
};
