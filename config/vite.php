<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Vite Build Directory
    |--------------------------------------------------------------------------
    |
    | The directory relative to the "public" directory where Vite will place
    | the built assets when running the "vite build" command. This should
    | match the "build.outDir" configuration option in your Vite config.
    |
    */
    'build_directory' => 'build',

    /*
    |--------------------------------------------------------------------------
    | Vite Hot File Path
    |--------------------------------------------------------------------------
    |
    | The path relative to the "public" directory where the Vite "hot" file
    | will be written when the Vite development server is running. This
    | should generally not need to be changed.
    |
    */
    'hot_file' => 'hot',

    /*
    |--------------------------------------------------------------------------
    | Development Server URL
    |--------------------------------------------------------------------------
    |
    | The URL where the Vite development server is running. This is used
    | to load assets during development.
    |
    */
    'dev_server_url' => env('VITE_DEV_SERVER_URL', 'http://localhost:5173'),

    /*
    |--------------------------------------------------------------------------
    | Development Server Key
    |--------------------------------------------------------------------------
    |
    | The key to use when connecting to the development server over HTTPS.
    |
    */
    'dev_server_key' => env('VITE_DEV_SERVER_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Development Server Certificate
    |--------------------------------------------------------------------------
    |
    | The certificate to use when connecting to the development server over HTTPS.
    |
    */
    'dev_server_cert' => env('VITE_DEV_SERVER_CERT'),
];
