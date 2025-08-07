<?php

use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\ShareableLinksController;
use App\Http\Controllers\GuestUploadController;
use App\Http\Controllers\GuestTusController;
use App\Http\Controllers\QuickShareController;
use Common\Core\Controllers\HomeController;
use Common\Pages\CustomPageController;
use Illuminate\Support\Facades\Route;

//FRONT-END ROUTES THAT NEED TO BE PRE-RENDERED
Route::get('/', LandingPageController::class);
Route::get('drive/s/{hash}', [ShareableLinksController::class, 'show']);

// GUEST UPLOAD ROUTES
Route::get('share/{hash}', [HomeController::class, 'render']); // Share page
Route::get('download/{hash}', [GuestUploadController::class, 'downloadAll']); // Direct download (download all files)

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

//CATCH ALL ROUTES AND REDIRECT TO HOME
Route::fallback([HomeController::class, 'render']);
