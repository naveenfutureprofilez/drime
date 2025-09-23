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
            $table->integer('expected_files')->nullable()->after('total_size');
            $table->index('expected_files');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guest_uploads', function (Blueprint $table) {
            $table->dropIndex(['expected_files']);
            $table->dropColumn('expected_files');
        });
    }
};
