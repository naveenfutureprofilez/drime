<?php

use App\Http\Controllers\DriveEntriesController;
use App\Http\Controllers\DuplicateEntriesController;
use App\Http\Controllers\EntrySyncInfoController;
use App\Http\Controllers\FcmTokenController;
use App\Http\Controllers\FolderPathController;
use App\Http\Controllers\FoldersController;
use App\Http\Controllers\MoveFileEntriesController;
use App\Http\Controllers\ShareableLinkPasswordController;
use App\Http\Controllers\ShareableLinksController;
use App\Http\Controllers\SharesController;
use App\Http\Controllers\SpaceUsageController;
use App\Http\Controllers\StarredEntriesController;
use App\Http\Controllers\UserFoldersController;
use App\Http\Controllers\GuestUploadController;
use App\Http\Controllers\GuestTusController;
use App\Http\Controllers\QuickShareController;
use App\Http\Controllers\Admin\GuestUploadStatsController;
use Illuminate\Support\Facades\Route;

// prettier-ignore
Route::group(['prefix' => 'v1'], function() {
  Route::group(['middleware' => ['optionalAuth:sanctum', 'verified', 'verifyApiAccess']], function () {
    // SHARING
    Route::post('file-entries/{fileEntry}/share', [
      SharesController::class,
      'addUsers',
    ]);
    Route::post('file-entries/{id}/unshare', [
      SharesController::class,
      'removeUser',
    ]);
    Route::put('file-entries/{fileEntry}/change-permissions', [
      SharesController::class,
      'changePermissions',
    ]);

    // SHAREABLE LINK
    Route::get('file-entries/{id}/shareable-link', [
      ShareableLinksController::class,
      'show',
    ]);
    Route::post('file-entries/{id}/shareable-link', [
      ShareableLinksController::class,
      'store',
    ]);
    Route::put('file-entries/{id}/shareable-link', [
      ShareableLinksController::class,
      'update',
    ]);
    Route::delete('file-entries/{id}/shareable-link', [
      ShareableLinksController::class,
      'destroy',
    ]);
    Route::post('shareable-links/{linkId}/import', [
      SharesController::class,
      'addCurrentUser',
    ]);

    // ENTRIES
    Route::get('drive/file-entries/{fileEntry}/model', [
      DriveEntriesController::class,
      'showModel',
    ]);
    Route::get('drive/file-entries', [
      DriveEntriesController::class,
      'index',
    ]);
    Route::post('file-entries/sync-info', [
      EntrySyncInfoController::class,
      'index',
    ]);
    Route::post('file-entries/move', [
      MoveFileEntriesController::class,
      'move',
    ]);
    Route::post('file-entries/duplicate', [
      DuplicateEntriesController::class,
      'duplicate',
    ]);

    // FOLDERS
    Route::post('folders', [FoldersController::class, 'store']);
    Route::get('users/{userId}/folders', [
      UserFoldersController::class,
      'index',
    ]);
    Route::get('folders/{hash}/path', [
      FolderPathController::class,
      'show',
    ]);

    // Labels
    Route::post('file-entries/star', [
      StarredEntriesController::class,
      'add',
    ]);
    Route::post('file-entries/unstar', [
      StarredEntriesController::class,
      'remove',
    ]);

    //SPACE USAGE
    Route::get('user/space-usage', [SpaceUsageController::class, 'index']);

    // FCM TOKENS
    Route::post('fcm-token', [FcmTokenController::class, 'store']);
    
    // ADMIN GUEST UPLOADS MANAGEMENT
    Route::get('admin/guest-uploads/stats', [GuestUploadStatsController::class, 'stats']);
    Route::post('admin/guest-uploads/cleanup', [GuestUploadStatsController::class, 'cleanup']);
  });

  //SHAREABLE LINKS PREVIEW (NO AUTH NEEDED)
  Route::get('shareable-links/{hash}', [
    ShareableLinksController::class,
    'show',
  ]);
  Route::post('shareable-links/{linkHash}/check-password', [
    ShareableLinkPasswordController::class,
    'check',
  ]);

  // GUEST UPLOADS (NO AUTH NEEDED) - Rate limiting temporarily disabled
  Route::post('guest/upload', [GuestUploadController::class, 'store']);
  Route::post('guest/tus/entries', [GuestTusController::class, 'createEntry']);
  
  // Guest upload read operations (no throttling)
  Route::get('guest/upload/{hash}', [GuestUploadController::class, 'show']);
  Route::get('guest/upload/{hash}/download', [GuestUploadController::class, 'download']);
  Route::post('guest/upload/{hash}/verify-password', [GuestUploadController::class, 'verifyPassword']);
  Route::get('guest/upload/{hash}/preview', [GuestUploadController::class, 'preview']);
  
  // QUICK SHARE API ENDPOINTS (NO AUTH NEEDED)
  Route::post('quick-share/uploads', [QuickShareController::class, 'store']);
  Route::post('quick-share/email-share', [QuickShareController::class, 'emailShare']);
  Route::get('quick-share/link/{hash}', [QuickShareController::class, 'showLink']);
  Route::get('quick-share/link/{hash}/download', [QuickShareController::class, 'download']);
});
