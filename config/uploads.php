<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Guest Upload Configuration
    |--------------------------------------------------------------------------
    |
    | These settings control file upload limits for guest users.
    | The max file size is controlled by the GUEST_UPLOAD_MAX_FILE_SIZE
    | environment variable and is automatically applied to PHP ini settings.
    |
    */

    // Maximum file size for guest uploads in bytes
    'guest_max_size' => env('GUEST_UPLOAD_MAX_FILE_SIZE', 3145728000), // 3GB default

    // Maximum file size for regular user uploads in bytes  
    'max_size' => env('MAX_UPLOAD_FILE_SIZE', env('GUEST_UPLOAD_MAX_FILE_SIZE', 3145728000)),

    /*
    |--------------------------------------------------------------------------
    | Allowed File Types
    |--------------------------------------------------------------------------
    |
    | Configure which file types are allowed or blocked for uploads.
    |
    */

    'allowed_extensions' => [],
    
    'blocked_extensions' => [
        'exe', 'bat', 'cmd', 'com', 'scr', 'pif', 'vbs', 'js', 'jar',
        'application/x-msdownload', 'application/x-executable',
        'application/x-dosexec', 'application/x-winexe'
    ],

    /*
    |--------------------------------------------------------------------------
    | Upload Processing
    |--------------------------------------------------------------------------
    |
    | Configuration for file upload processing and storage.
    |
    */

    'chunk_size' => 15728640, // 15MB chunks for resumable uploads
    'max_files_per_request' => 20, // Maximum number of files per upload request
];
