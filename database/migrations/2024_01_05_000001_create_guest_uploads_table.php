<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guest_uploads', function (Blueprint $table) {
            $table->id();
            $table->string('hash', 32)->unique()->index();
            $table->unsignedInteger('file_entry_id')->nullable();
            $table->string('original_filename');
            $table->bigInteger('file_size')->unsigned();
            $table->string('mime_type')->nullable();
            $table->string('password')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->integer('download_count')->default(0);
            $table->integer('max_downloads')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('file_entry_id')->references('id')->on('file_entries')->onDelete('cascade');
            $table->index(['expires_at', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guest_uploads');
    }
};
