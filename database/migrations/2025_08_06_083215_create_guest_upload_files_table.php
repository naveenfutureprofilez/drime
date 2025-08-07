<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guest_upload_files', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('guest_upload_id');
            $table->unsignedInteger('file_entry_id');
            $table->timestamps();
            
            $table->foreign('guest_upload_id')
                ->references('id')->on('guest_uploads')
                ->onDelete('cascade');
            $table->foreign('file_entry_id')
                ->references('id')->on('file_entries')
                ->onDelete('cascade');

            // Composite unique index to avoid duplicates
            $table->unique(['guest_upload_id', 'file_entry_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guest_upload_files');
    }
};
