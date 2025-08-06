<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Guest Upload Security Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains security and limit configurations for guest uploads.
    | These settings are managed through the admin settings panel but are
    | documented here for reference.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Size Limits
    |--------------------------------------------------------------------------
    |
    | Maximum aggregate size for guest uploads in megabytes.
    | This is enforced per upload request (not per file).
    |
    */
    'max_size_mb' => env('GUEST_UPLOADS_MAX_SIZE_MB', 3072), // 3GB in MB

    /*
    |--------------------------------------------------------------------------
    | Content Type Restrictions
    |--------------------------------------------------------------------------
    |
    | Guest uploads reuse the existing blocked extensions configuration
    | from the main uploads system. This ensures consistency across
    | the platform for security purposes.
    |
    */
    'reuse_blocked_extensions' => true,

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Rate limits for guest uploads and downloads per IP address.
    | These are configured in RouteServiceProvider.
    |
    */
    'rate_limits' => [
        'uploads' => [
            'per_hour' => 10,
            'burst_per_10_minutes' => 3,
        ],
        'downloads' => [
            'per_hour' => 100,
            'burst_per_10_minutes' => 30,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Billing Independence
    |--------------------------------------------------------------------------
    |
    | Guest uploads work independently of the billing system.
    | When BILLING_ENABLED is false, guest uploads will still function
    | as long as the feature is enabled in settings.
    |
    */
    'billing_independent' => true,

    /*
    |--------------------------------------------------------------------------
    | Feature Toggle
    |--------------------------------------------------------------------------
    |
    | Whether guest uploads are enabled. This is managed through
    | the settings system and can be controlled via admin panel.
    |
    */
    'enabled' => env('GUEST_UPLOADS_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Retention Policy
    |--------------------------------------------------------------------------
    |
    | How long guest uploads are retained before cleanup.
    | This is in addition to expiry dates set per upload.
    |
    */
    'retention_days' => env('GUEST_UPLOADS_RETENTION_DAYS', 30),
];
