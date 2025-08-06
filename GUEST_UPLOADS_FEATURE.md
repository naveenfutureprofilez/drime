# Guest Uploads Feature Flag & Policies Implementation

This document describes the implementation of the guest uploads feature flag and policies for Laravel.

## Features Implemented

### 1. GuestUploadsEnabled Gate & Middleware

**Gate**: `guest_uploads_enabled` - Quickly disable the guest uploads feature globally.

**Middleware**: `GuestUploadsEnabled` - Middleware to protect routes that require guest uploads to be enabled.

**Usage in routes:**
```php
// Protect individual routes
Route::get('/guest-upload', [GuestUploadController::class, 'create'])
    ->middleware('guest.uploads.enabled');

// Protect route groups
Route::middleware(['guest.uploads.enabled'])->group(function () {
    Route::post('/guest-upload', [GuestUploadController::class, 'store']);
    Route::get('/guest-tus', [GuestTusController::class, 'create']);
});
```

**Configuration:**
- Set `GUEST_UPLOADS_ENABLED=false` in `.env` file to disable
- Or modify `config/app.php`: `'guest_uploads_enabled' => false`

### 2. Updated ShareableLinkPolicy

The `ShareableLinkPolicy` now allows `show` access when `is_guest = true` even without an authenticated user.

**Policy Logic:**
```php
public function show(?User $user, ShareableLink $link)
{
    // Allow guest access for guest shareable links
    if ($link->is_guest) {
        return true;
    }

    // User must be authenticated for non-guest links
    if (!$user) {
        return false;
    }

    // ... existing logic
}
```

### 3. Global Scopes for Expired Entries

Both `ShareableLink` and `GuestUpload` models now automatically hide expired guest entries.

**ShareableLink scope:**
- Hides guest links that are expired (`expires_at < now()`)
- Hides guest links that are soft deleted (`guest_deleted_at IS NOT NULL`)

**GuestUpload scope:**
- Hides uploads that are expired (`expires_at < now()`)

### 4. New Model Methods

**ShareableLink Helper Methods:**
```php
$link->isGuest();           // Check if it's a guest link
$link->isExpired();         // Check if the link is expired
$link->isGuestDeleted();    // Check if soft deleted
$link->softDeleteGuest();   // Soft delete a guest link
```

**GuestUpload Helper Methods:**
```php
$upload->canDownload();            // Check if download is allowed
$upload->isExpired();              // Check if expired
$upload->hasReachedDownloadLimit(); // Check download limit
$upload->incrementDownloadCount();  // Increment download counter
```

## Database Schema

The following columns have been added to the `shareable_links` table:
- `is_guest` (boolean, default: false)
- `guest_deleted_at` (timestamp, nullable)

## Quick Feature Toggle

To quickly disable the guest uploads feature:

1. **Via Environment Variable:**
   ```bash
   GUEST_UPLOADS_ENABLED=false
   ```

2. **Via Configuration:**
   ```php
   // config/app.php
   'guest_uploads_enabled' => false,
   ```

3. **Via Gate Check in Code:**
   ```php
   if (Gate::allows('guest_uploads_enabled')) {
       // Guest uploads are enabled
   }
   ```

## Security Considerations

1. **Middleware Protection**: Apply `guest.uploads.enabled` middleware to all guest upload routes
2. **Policy Checks**: The policy automatically handles guest vs authenticated access
3. **Automatic Cleanup**: Expired entries are hidden via global scopes
4. **Soft Deletion**: Guest links can be soft deleted without affecting regular users

## Testing

The implementation has been tested and verified to work correctly with:
- ✅ Gate allows/denies based on configuration
- ✅ Middleware blocks access when feature is disabled
- ✅ Policy allows guest access for `is_guest = true` links
- ✅ Global scopes hide expired entries automatically
- ✅ Helper methods work as expected

## Example Implementation

```php
// Controller method protected by middleware
class GuestUploadController extends Controller
{
    public function create()
    {
        // This route would be protected by 'guest.uploads.enabled' middleware
        return view('guest.upload.create');
    }
    
    public function show(ShareableLink $link)
    {
        // Policy automatically allows access for guest links
        $this->authorize('show', $link);
        
        if ($link->isGuest() && !$link->isExpired()) {
            return view('guest.upload.show', compact('link'));
        }
        
        abort(404);
    }
}
```
