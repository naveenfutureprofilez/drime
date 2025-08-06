# Guest Uploads Feature

This document provides an overview of the guest uploads feature, including its configuration and usage.

## Feature Overview

The guest uploads feature allows unauthenticated users to upload files with configurable expiration and download limits. This provides a flexible way to handle temporary file sharing without requiring user registration.

## Configuration

The following environment variables are available to configure the guest uploads feature. These can be set in your `.env` file.

- `GUEST_UPLOADS_ENABLED`: Enable or disable the guest uploads feature globally.
  - **Default**: `true`
  - **Example**: `GUEST_UPLOADS_ENABLED=true`

- `GUEST_UPLOAD_DEFAULT_EXPIRY_HOURS`: The default expiration time in hours for guest uploads.
  - **Default**: `72` (3 days)
  - **Example**: `GUEST_UPLOAD_DEFAULT_EXPIRY_HOURS=24`

- `GUEST_UPLOAD_MAX_EXPIRY_HOURS`: The maximum expiration time in hours that can be set for a guest upload.
  - **Default**: `168` (7 days)
  - **Example**: `GUEST_UPLOAD_MAX_EXPIRY_HOURS=336`

- `GUEST_UPLOAD_MAX_FILE_SIZE`: The maximum file size in kilobytes (KB) for guest uploads.
  - **Default**: `2048000` (2GB)
  - **Example**: `GUEST_UPLOAD_MAX_FILE_SIZE=5120000` (5GB)

## Automatic Cleanup

Expired guest uploads are automatically purged from the system to free up storage space. This is handled by a scheduled artisan command.

- **Command**: `guest-uploads:purge`
- **Schedule**: Runs daily at midnight.
- **Retention Policy**: The cleanup respects the `guest_uploads.retention_days` setting (default: 30 days).

## How to Use

1.  **Enable the Feature**: Ensure `GUEST_UPLOADS_ENABLED` is set to `true` in your `.env` file.
2.  **Protect Routes**: Use the `guest.uploads.enabled` middleware to protect routes that require guest uploads to be enabled.
3.  **Manage Guest Links**: Use the helper methods on the `ShareableLink` model to manage guest links (`isGuest()`, `isExpired()`, `softDeleteGuest()`).

