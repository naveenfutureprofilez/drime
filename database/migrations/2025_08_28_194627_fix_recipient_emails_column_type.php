<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('guest_uploads', function (Blueprint $table) {
            // Change recipient_emails from JSON to string
            $table->string('recipient_emails')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guest_uploads', function (Blueprint $table) {
            // Revert back to JSON
            $table->json('recipient_emails')->nullable()->change();
        });
    }
};
