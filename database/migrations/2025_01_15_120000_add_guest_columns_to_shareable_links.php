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
        Schema::table('shareable_links', function (Blueprint $table) {
            $table->boolean('is_guest')->default(false)->after('expires_at');
            $table->timestamp('guest_deleted_at')->nullable()->after('is_guest');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shareable_links', function (Blueprint $table) {
            $table->dropColumn(['is_guest', 'guest_deleted_at']);
        });
    }
};
