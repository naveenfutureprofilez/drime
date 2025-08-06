# Guest Uploads Database Schema Changes

## Overview
This document summarizes the database schema extensions implemented for guest uploads and configuration functionality.

## Changes Made

### 1. Shareable Links Table Extensions
**Migration**: `2025_01_15_120000_add_guest_columns_to_shareable_links.php`

Added the following columns to the `shareable_links` table:
- `is_guest` (boolean, default: false) - Indicates if this link allows guest uploads
- `guest_deleted_at` (timestamp, nullable) - Soft delete timestamp for guest functionality

### 2. Guest Uploads Table Extensions
**Migration**: `2025_01_15_120001_update_guest_uploads_table_corrected.php`

Extended the existing `guest_uploads` table with:
- `link_id` (varchar(30), nullable, indexed) - References shareable_links.hash
- `total_size` (bigint, default: 0) - Total size of uploaded files
- `sender_email` (varchar(255), nullable) - Email of the person uploading
- `recipient_emails` (JSON, nullable) - Array of recipient email addresses
- `last_downloaded_at` (timestamp, nullable) - When files were last downloaded

**Note**: The table already contained these columns from the original migration:
- `id` (primary key)
- `hash` (unique string identifier)
- `file_entry_id` (references file_entries table)
- `original_filename`
- `file_size`
- `mime_type`
- `password` (nullable)
- `expires_at` (nullable, indexed)
- `download_count` (default: 0)
- `max_downloads` (nullable)
- `ip_address` (nullable)
- `user_agent` (nullable)
- `metadata` (JSON, nullable)
- `created_at` and `updated_at` timestamps

### 3. Default Settings Configuration
**Migration**: `2025_01_15_120002_seed_guest_upload_settings.php`

Added the following default settings to the `settings` table:
- `guest_uploads.enabled` = `true` - Enable/disable guest upload functionality
- `guest_uploads.max_size_mb` = `100` - Maximum file size in MB for guest uploads
- `guest_uploads.retention_days` = `30` - How long to retain guest uploads before cleanup

**Config File Update**: Also updated `/config/common/default-settings.php` to include these settings for new installations.

## Database Relationships

### Guest Uploads to Shareable Links
The `guest_uploads.link_id` field references `shareable_links.hash` to establish the relationship between guest uploads and the shareable link that allowed them.

### Guest Uploads to File Entries
The existing `guest_uploads.file_entry_id` references `file_entries.id` for the actual uploaded files.

## Schema Summary

### Updated shareable_links table structure:
```sql
CREATE TABLE shareable_links (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hash VARCHAR(30) UNIQUE,
    user_id INT UNSIGNED,
    entry_id INT UNSIGNED,
    allow_edit BOOLEAN DEFAULT 0,
    allow_download BOOLEAN DEFAULT 1,
    password VARCHAR(255) NULL,
    expires_at TIMESTAMP NULL,
    is_guest BOOLEAN DEFAULT FALSE,
    guest_deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Updated guest_uploads table structure:
```sql
CREATE TABLE guest_uploads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hash VARCHAR(32) UNIQUE,
    file_entry_id INT UNSIGNED NULL,
    original_filename VARCHAR(255),
    file_size BIGINT UNSIGNED,
    mime_type VARCHAR(255) NULL,
    password VARCHAR(255) NULL,
    expires_at TIMESTAMP NULL,
    download_count INT DEFAULT 0,
    max_downloads INT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    metadata JSON NULL,
    link_id VARCHAR(30) NULL,
    total_size BIGINT DEFAULT 0,
    sender_email VARCHAR(255) NULL,
    recipient_emails JSON NULL,
    last_downloaded_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (file_entry_id) REFERENCES file_entries(id) ON DELETE CASCADE,
    INDEX (link_id),
    INDEX (expires_at),
    INDEX (expires_at, created_at)
);
```

## Usage Notes

1. **Guest Link Creation**: When creating a shareable link for guest uploads, set `is_guest = true`
2. **File Association**: Guest uploaded files are linked via `link_id` to the shareable link's `hash`
3. **Email Tracking**: The system can track both sender and recipient emails for audit purposes
4. **Size Limits**: The `guest_uploads.max_size_mb` setting controls upload limits
5. **Retention**: Use `guest_uploads.retention_days` setting for cleanup jobs

## Migration Status
All migrations have been successfully applied and are ready for use:
- ✅ `2025_01_15_120000_add_guest_columns_to_shareable_links`
- ✅ `2025_01_15_120001_update_guest_uploads_table_corrected`  
- ✅ `2025_01_15_120002_seed_guest_upload_settings`
