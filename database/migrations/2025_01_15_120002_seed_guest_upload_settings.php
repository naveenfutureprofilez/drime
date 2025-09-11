<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $settings = [
            [
                'name' => 'guest_uploads.enabled',
                'value' => json_encode(true),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'guest_uploads.max_size_mb',
                'value' => json_encode(3072), // 3GB = 3072 MB
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'guest_uploads.retention_days',
                'value' => json_encode(30),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['name' => $setting['name']],
                $setting
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('settings')->whereIn('name', [
            'guest_uploads.enabled',
            'guest_uploads.max_size_mb',
            'guest_uploads.retention_days',
        ])->delete();
    }
};
