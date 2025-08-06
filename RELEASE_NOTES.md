# Release Notes - Hybrid Guest Upload Capabilities

## New Features

### 🚀 Hybrid Guest Upload System

We've introduced a comprehensive guest upload system that allows both authenticated and unauthenticated users to share files seamlessly.

#### Key Features:

- **Flexible Upload Options**: Support for both authenticated user uploads and anonymous guest uploads
- **Configurable Expiration**: Set default and maximum expiration times for guest uploads
- **Automatic Cleanup**: Built-in purge system that automatically removes expired uploads
- **Security Controls**: Feature flags and middleware to control access
- **File Size Limits**: Configurable maximum file size limits for guest uploads

#### Configuration Options:

- `GUEST_UPLOADS_ENABLED` - Global feature toggle (default: `true`)
- `GUEST_UPLOAD_DEFAULT_EXPIRY_HOURS` - Default expiration time (default: `72` hours)
- `GUEST_UPLOAD_MAX_EXPIRY_HOURS` - Maximum expiration time (default: `168` hours)
- `GUEST_UPLOAD_MAX_FILE_SIZE` - Maximum file size in KB (default: `2048000` KB / 2GB)

#### New Models & Features:

- **Enhanced ShareableLink Model**: New `is_guest` flag and `guest_deleted_at` soft deletion
- **GuestUpload Model**: Dedicated model for guest uploads with expiration and download tracking
- **Global Scopes**: Automatic filtering of expired entries
- **Helper Methods**: Easy-to-use methods for checking expiration, guest status, and download limits

#### Middleware & Security:

- **GuestUploadsEnabled Middleware**: Protect routes based on feature flag
- **Updated ShareableLinkPolicy**: Support for guest access without authentication
- **Gate Integration**: `guest_uploads_enabled` gate for programmatic access control

#### Automatic Maintenance:

- **Scheduled Cleanup**: Daily purge of expired uploads via `guest-uploads:purge` command
- **Comprehensive Cleanup**: Removes expired uploads, associated files, and shareable links
- **Configurable Retention**: Respects `guest_uploads.retention_days` setting (default: 30 days)

## Technical Improvements

### Database Enhancements
- Added `is_guest` and `guest_deleted_at` columns to `shareable_links` table
- Implemented global scopes for automatic filtering of expired content

### Service Layer Updates
- Enhanced `GuestUploadService` with purge capabilities
- Comprehensive error handling and logging for cleanup operations

### Testing & Reliability
- Full test coverage for new features
- Validated gate, middleware, and policy functionality
- Tested global scopes and helper methods

## Migration Notes

When upgrading to this version:

1. **Database Migration**: The system will automatically add required columns to the `shareable_links` table
2. **Environment Variables**: Review and set the new environment variables as needed
3. **Scheduled Tasks**: The cleanup task is automatically registered and will run daily
4. **Feature Flag**: The guest uploads feature is enabled by default but can be disabled via `GUEST_UPLOADS_ENABLED=false`

## Breaking Changes

None. This release is fully backward compatible with existing functionality.

## What's Next

Future enhancements may include:
- Email notifications for guest upload expiration
- Advanced download analytics
- Custom branding for guest upload pages
- Integration with third-party storage providers

---

For detailed implementation information, see the [GUEST_UPLOADS_FEATURE.md](GUEST_UPLOADS_FEATURE.md) and [GUEST_UPLOADS_PURGE_IMPLEMENTATION.md](GUEST_UPLOADS_PURGE_IMPLEMENTATION.md) documentation files.
