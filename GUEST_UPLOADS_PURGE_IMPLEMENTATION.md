# Guest Uploads Automatic Cleanup Implementation

## Overview
This implementation provides automatic cleanup of expired guest uploads, respecting the application settings and handling all related data comprehensively.

## Components Implemented

### 1. Artisan Command: `guest-uploads:purge`
- **File**: `app/Console/Commands/CleanupExpiredGuestUploads.php`
- **Signature**: `guest-uploads:purge`
- **Description**: Purge expired guest uploads, associated files, and shareable links
- **Functionality**: 
  - Deletes expired `GuestUpload` records
  - Removes associated `FileEntry` records
  - Deletes related `ShareableLink` records
  - Cleans up physical files from storage
  - Respects `settings('guest_uploads.retention_days')` configuration

### 2. Enhanced GuestUploadService
- **File**: `app/Services/GuestUploadService.php`
- **New Method**: `purgeExpiredUploads()`
- **Features**:
  - Uses global scope bypass to access expired records
  - Handles retention policy based on settings
  - Comprehensive cleanup of all related entities
  - Error handling and logging
  - Returns detailed statistics of cleanup operations

### 3. Scheduled Task
- **File**: `app/Console/Kernel.php`
- **Schedule**: Daily at midnight (0 0 * * *)
- **Integration**: Automatically registered and scheduled

## Key Features

### Retention Policy
- Respects `guest_uploads.retention_days` setting (default: 30 days)
- Cleans up uploads that are either:
  - Expired based on `expires_at` timestamp
  - Older than the retention period based on `created_at`

### Comprehensive Cleanup
The purge operation handles:
1. **GuestUpload records**: Primary upload records
2. **FileEntry records**: Associated file metadata
3. **ShareableLink records**: Related sharing links
4. **Physical files**: Actual files from storage disks
5. **Orphaned links**: Guest shareable links without associated files

### Error Handling
- Continues processing even if individual items fail
- Logs errors for debugging
- Returns detailed statistics for monitoring

### Database Relations
- Properly handles relationships between models
- Uses `withoutGlobalScopes()` to access expired records
- Maintains data integrity during cleanup

## Configuration

### Settings
The cleanup respects the following setting:
- `guest_uploads.retention_days` (default: 30 days)

### Storage
- Works with any configured storage disk
- Handles both local and cloud storage (e.g., Cloudflare R2)
- Supports different paths and naming conventions

## Usage

### Manual Execution
```bash
php artisan guest-uploads:purge
```

### Scheduled Execution
The command runs automatically daily at midnight via Laravel's task scheduler.

### Verify Schedule
```bash
php artisan schedule:list
```

## Output Example
```
Starting purge of expired guest uploads...
Successfully purged 15 expired guest uploads.
Deleted 12 associated shareable links.
Removed 15 file entries.
Cleaned up 15 physical files.
```

## Technical Details

### Database Queries
- Uses efficient querying with eager loading
- Bypasses global scopes to handle expired records
- Includes orphaned link cleanup

### File Handling
- Supports multiple storage disks
- Handles different path structures
- Graceful handling of missing files

### Logging
- Logs errors for failed individual operations
- Includes context information for debugging
- Continues processing after errors

## Integration Points

### Models
- `App\Models\GuestUpload`
- `App\Models\FileEntry` 
- `App\Models\ShareableLink`

### Services
- `App\Services\GuestUploadService`

### Configuration
- `config/common/default-settings.php`
- Laravel task scheduler

## Testing
The implementation has been tested to ensure:
- Command registration and execution
- Settings integration
- Model relationships
- Service method availability
- Scheduler integration
