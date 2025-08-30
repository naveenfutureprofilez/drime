<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\FileUpload;
use Illuminate\Support\Str;

class FileUploadsSeeder extends Seeder
{
    public function run()
    {
        $testFiles = [
            [
                'original_filename' => 'document.pdf',
                'file_path' => 'uploads/test/document.pdf',
                'file_size' => 2048576, // 2MB
                'mime_type' => 'application/pdf',
                'shareable_link' => Str::random(32),
                'expires_at' => now()->addDays(7),
                'max_downloads' => 10,
                'download_count' => 3,
                'created_at' => now()->subDays(2),
            ],
            [
                'original_filename' => 'image.jpg',
                'file_path' => 'uploads/test/image.jpg',
                'file_size' => 1536000, // 1.5MB
                'mime_type' => 'image/jpeg',
                'shareable_link' => Str::random(32),
                'expires_at' => now()->addDays(3),
                'max_downloads' => 5,
                'download_count' => 5, // Reached limit
                'created_at' => now()->subDays(1),
            ],
            [
                'original_filename' => 'video.mp4',
                'file_path' => 'uploads/test/video.mp4',
                'file_size' => 15728640, // 15MB
                'mime_type' => 'video/mp4',
                'shareable_link' => Str::random(32),
                'expires_at' => now()->subDays(1), // Expired
                'max_downloads' => null,
                'download_count' => 2,
                'created_at' => now()->subDays(3),
            ],
            [
                'original_filename' => 'presentation.pptx',
                'file_path' => 'uploads/test/presentation.pptx',
                'file_size' => 5242880, // 5MB
                'mime_type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'shareable_link' => Str::random(32),
                'expires_at' => null, // Never expires
                'max_downloads' => null,
                'download_count' => 12,
                'created_at' => now()->subDays(5),
            ],
            [
                'original_filename' => 'archive.zip',
                'file_path' => 'uploads/test/archive.zip',
                'file_size' => 8388608, // 8MB
                'mime_type' => 'application/zip',
                'shareable_link' => Str::random(32),
                'expires_at' => now()->addDays(14),
                'max_downloads' => 50,
                'download_count' => 1,
                'created_at' => now(),
            ],
        ];

        foreach ($testFiles as $fileData) {
            FileUpload::create($fileData);
        }

        $this->command->info('Created ' . count($testFiles) . ' test file uploads');
    }
}
