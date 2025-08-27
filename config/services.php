<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Stripe, Mailgun, SparkPost and others. This file provides a sane
    | default location for this type of information, allowing packages
    | to have a conventional place to find your various credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT'),
    ],

    'ses' => [
        'key' => env('SES_KEY'),
        'secret' => env('SES_SECRET'),
        'region' => 'us-east-1',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'cloudflare' => [
        'key' => env('CLOUDFLARE_R2_KEY'),
        'secret' => env('CLOUDFLARE_R2_SECRET'),
        'endpoint' => env('CLOUDFLARE_R2_ENDPOINT'),
        'region' => env('CLOUDFLARE_R2_REGION', 'auto'),
        'bucket' => env('CLOUDFLARE_R2_BUCKET'),
        'url' => env('CLOUDFLARE_R2_URL'),
        'visibility' => 'private',
        'throw' => true,
        'use_path_style_endpoint' => false,
    ],
];
