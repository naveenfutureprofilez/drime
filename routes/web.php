<?php

use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\ShareableLinksController;
use App\Http\Controllers\GuestUploadController;
use App\Http\Controllers\GuestTusController;
use App\Http\Controllers\QuickShareController;
use Common\Core\Controllers\HomeController;
use Common\Pages\CustomPageController;
use Illuminate\Support\Facades\Route;
use App\Helpers\SizeFormatter;

//FRONT-END ROUTES THAT NEED TO BE PRE-RENDERED
Route::get('/', LandingPageController::class);
Route::get('drive/s/{hash}', [ShareableLinksController::class, 'show']);

// GUEST UPLOAD ROUTES
Route::get('share/{hash}', [HomeController::class, 'render']); // Share page
Route::get('download/{hash}', [GuestUploadController::class, 'downloadAll']); // Direct download (download all files)
Route::get('download/{hash}/{fileId}', [GuestUploadController::class, 'downloadFile']); // Direct download single file

// GUEST UPLOAD API ROUTES (NO AUTH NEEDED - BYPASS SANCTUM MIDDLEWARE)
Route::prefix('api/v1')->group(function() {
    // GUEST UPLOADS
    Route::post('guest/upload', [GuestUploadController::class, 'store'])->middleware(['throttle:1000,1']);
    Route::post('guest/tus/entries', [GuestTusController::class, 'createEntry'])->middleware(['throttle:1000,1']);
    
    // Guest upload read operations (no throttling for reading)
    Route::get('guest/upload/{hash}', [GuestUploadController::class, 'show']);
    Route::get('guest/upload/{hash}/download', [GuestUploadController::class, 'download']);
    Route::post('guest/upload/{hash}/verify-password', [GuestUploadController::class, 'verifyPassword']);
    Route::get('guest/upload/{hash}/preview', [GuestUploadController::class, 'preview']);
    
    // New download endpoints per file and "download all"
    Route::get('download/{hash}/{fileId}', [GuestUploadController::class, 'downloadFile']);
    Route::get('download/{hash}', [GuestUploadController::class, 'downloadAll']);
    
    // QUICK SHARE API ENDPOINTS (NO AUTH NEEDED)
    Route::post('quick-share/uploads', [QuickShareController::class, 'store'])->middleware(['throttle:1000,1']);
    Route::post('quick-share/email-share', [QuickShareController::class, 'emailShare'])->middleware(['throttle:1000,1']);
    Route::get('quick-share/link/{hash}', [QuickShareController::class, 'showLink']);
    Route::get('quick-share/link/{hash}/download', [QuickShareController::class, 'download']);
    Route::get('quick-share/link/{hash}/download/{fileId}', [QuickShareController::class, 'downloadFile']);
    Route::get('quick-share/link/{hash}/download-all', [QuickShareController::class, 'downloadAll']);
});

Route::get('contact', [HomeController::class, 'render']);
Route::get('pages/{slugOrId}', [CustomPageController::class, 'show']);
Route::get('login', [HomeController::class, 'render'])->name('login');
Route::get('register', [HomeController::class, 'render'])->name('register');
Route::get('forgot-password', [HomeController::class, 'render']);
Route::get('pricing', '\Common\Billing\PricingPageController');

// DEMO ROUTES FOR UPLOAD PROGRESS INTERFACE
Route::get('demo', function () {
    return view('demo-index');
})->name('demo.index');

Route::get('demo/upload-progress', function () {
    return view('upload-demo');
})->name('demo.upload-progress');

Route::get('demo/upload-progress-basic', function () {
    return view('upload-progress');
})->name('demo.upload-progress-basic');

Route::get('demo/upload-progress-blade', function () {
    return view('demo.upload-blade');
})->name('demo.upload-progress-blade');

Route::get('demo/upload-progress-improved', function () {
    return view('demo.upload-improved');
})->name('demo.upload-progress-improved');

// TEST ROUTE FOR UPLOAD LIMITS
Route::get('test-upload-limits', function () {
    $data = [
        'environment' => [
            'GUEST_UPLOAD_MAX_FILE_SIZE' => env('GUEST_UPLOAD_MAX_FILE_SIZE'),
        ],
        'php_ini' => [
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size' => ini_get('post_max_size'),
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
            'max_input_time' => ini_get('max_input_time'),
            'max_file_uploads' => ini_get('max_file_uploads'),
        ],
        'converted_bytes' => [
            'upload_max_filesize' => SizeFormatter::iniToBytes(ini_get('upload_max_filesize')),
            'post_max_size' => SizeFormatter::iniToBytes(ini_get('post_max_size')),
            'memory_limit' => SizeFormatter::iniToBytes(ini_get('memory_limit')),
        ],
        'config' => [
            'uploads.guest_max_size' => config('uploads.guest_max_size'),
            'app.max_file_size' => config('app.max_file_size'),
        ],
    ];
    
    return response()->json($data, 200, [], JSON_PRETTY_PRINT);
});

//CATCH ALL ROUTES AND REDIRECT TO HOME
Route::fallback([HomeController::class, 'render']);
