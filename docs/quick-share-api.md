# Quick Share API Documentation

The Quick Share API provides guest upload functionality that allows users to upload files without authentication and share them via email or links. This API is designed for temporary file sharing with automatic expiration.

## Overview

The Quick Share API consists of three main endpoints:

1. **POST** `/api/v1/quick-share/uploads` - Upload files for guest sharing
2. **POST** `/api/v1/quick-share/email-share` - Send share links via email  
3. **GET** `/api/v1/quick-share/link/{hash}` - Fetch file information for share page

All endpoints are **unauthenticated** and operate under the `v1` API prefix but outside the authentication middleware.

## API Endpoints

### 1. Upload Files (POST /api/v1/quick-share/uploads)

Upload a file and create a shareable link for guest access.

**Request:**
```http
POST /api/v1/quick-share/uploads
Content-Type: multipart/form-data

{
  "file": [uploaded_file],
  "retention_hours": 72,      // Optional, default: 72, max: 168 (7 days)
  "sender_email": "sender@example.com"  // Optional
}
```

**Response (201 Created):**
```json
{
  "message": "File uploaded successfully",
  "data": {
    "file_entry": {
      "id": 123,
      "name": "document.pdf",
      "file_size": 1048576,
      "mime": "application/pdf",
      "type": "file",
      "created_at": "2025-01-16T10:00:00Z",
      "owner_id": null
    },
    "shareable_link": {
      "hash": "abc123def456ghi789",
      "url": "https://example.com/quick-share/link/abc123def456ghi789",
      "expires_at": "2025-01-19T10:00:00Z"
    },
    "guest_upload": {
      "hash": "xyz789uvw456rst123",
      "filename": "document.pdf",
      "size": 1048576,
      "mime_type": "application/pdf"
    },
    "link_url": "https://example.com/quick-share/link/abc123def456ghi789"
  }
}
```

**Key Features:**
- Creates `FileEntry` with `user_id = null` (flagged as guest)
- Immediately creates `ShareableLink` with `is_guest = true`
- Persists `guest_uploads` meta row with link relationship
- Returns shareable link URL in JSON response

### 2. Send Share Emails (POST /api/v1/quick-share/email-share)

Send the shareable link to recipients via email.

**Request:**
```http
POST /api/v1/quick-share/email-share
Content-Type: application/json

{
  "link_hash": "abc123def456ghi789",
  "sender_email": "sender@example.com",
  "sender_name": "John Doe",           // Optional, defaults to sender_email
  "recipient_emails": [
    "recipient1@example.com",
    "recipient2@example.com"
  ],
  "message": "Please find the attached file."  // Optional
}
```

**Response (200 OK):**
```json
{
  "message": "Email(s) sent successfully", 
  "data": {
    "sender_email": "sender@example.com",
    "recipient_count": 2,
    "link_url": "https://example.com/quick-share/link/abc123def456ghi789"
  }
}
```

**Validation Rules:**
- `link_hash`: Required, must exist in shareable_links table
- `sender_email`: Required, valid email format
- `recipient_emails`: Required array, min 1, max 10 valid emails
- `message`: Optional, max 500 characters
- `sender_name`: Optional, max 100 characters

### 3. Fetch Link Information (GET /api/v1/quick-share/link/{hash})

Retrieve lightweight payload for the guest share page.

**Request:**
```http
GET /api/v1/quick-share/link/abc123def456ghi789
```

**Response (200 OK):**
```json
{
  "data": {
    "link": {
      "hash": "abc123def456ghi789",
      "expires_at": "2025-01-19T10:00:00Z",
      "allow_download": true,
      "allow_edit": false,
      "has_password": false
    },
    "file": {
      "id": 123,
      "name": "document.pdf",
      "size": 1048576,
      "mime_type": "application/pdf",
      "extension": "pdf",
      "type": "file",
      "created_at": "2025-01-16T10:00:00Z"
    },
    "guest_upload": {
      "hash": "xyz789uvw456rst123",
      "original_filename": "document.pdf",
      "download_count": 2,
      "max_downloads": null,
      "sender_email": "sender@example.com",
      "last_downloaded_at": "2025-01-16T11:30:00Z"
    }
  }
}
```

## Error Responses

### 404 Not Found
```json
{
  "message": "Shareable link not found"
}
```

### 410 Gone (Expired)
```json
{
  "message": "This link has expired"
}
```

### 422 Validation Error
```json
{
  "message": "Validation failed",
  "errors": {
    "file": ["The file field is required."],
    "sender_email": ["The sender email field must be a valid email address."]
  }
}
```

### 500 Server Error
```json
{
  "message": "Upload failed",
  "error": "Storage disk not available"
}
```

## Database Schema

### FileEntry
- `owner_id`: Set to `null` for guest uploads
- Regular file entry fields populated from upload

### ShareableLink
- `is_guest`: Set to `true`
- `expires_at`: Set based on retention hours
- `allow_download`: Default `true`
- `allow_edit`: Default `false`

### GuestUpload
- `hash`: Unique identifier for the upload
- `file_entry_id`: Links to the FileEntry
- `link_id`: References ShareableLink hash
- `sender_email`: Optional sender identification
- `recipient_emails`: JSON array of email recipients
- `expires_at`: Same as ShareableLink expiration
- `total_size`: File size in bytes
- `metadata`: JSON with upload method and extension info

## Configuration

The API uses the following configuration values:

- `app.guest_upload_default_expiry_hours`: Default retention time (72 hours)
- `app.guest_upload_max_expiry_hours`: Maximum retention time (168 hours / 7 days)
- `common.site.uploads_disk`: Storage disk configuration
- `app.max_file_size`: Maximum upload file size (2GB default)

## Security Features

1. **Automatic Expiration**: All uploads have mandatory expiration times
2. **No Authentication**: Completely guest-accessible  
3. **Unique Hashes**: Links use cryptographically secure random hashes
4. **File Validation**: Standard file upload validation applies
5. **Rate Limiting**: Standard API rate limiting applies
6. **Size Limits**: Configurable maximum file sizes

## Usage Examples

### cURL Upload Example
```bash
curl -X POST https://example.com/api/v1/quick-share/uploads \
  -F "file=@document.pdf" \
  -F "retention_hours=48" \
  -F "sender_email=john@example.com"
```

### JavaScript Fetch Example
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('retention_hours', 72);
formData.append('sender_email', 'sender@example.com');

const response = await fetch('/api/v1/quick-share/uploads', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Share URL:', result.data.link_url);
```

## Integration Notes

- The API reuses existing `FileEntriesController::store` logic via dedicated wrapper
- Leverages existing file storage and validation infrastructure  
- Compatible with existing file management and cleanup systems
- Extends the current shareable links system with guest functionality
