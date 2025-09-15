# Dynamic Upload Limits Configuration

This document explains how to configure and manage file upload limits in Drime using the new dynamic limits system.

## Overview

Drime now supports dynamic file upload limits controlled by the `GUEST_UPLOAD_MAX_FILE_SIZE` environment variable. This replaces the previous hard-coded 3GB limits with a flexible, environment-based configuration.

## Environment Variable

### `GUEST_UPLOAD_MAX_FILE_SIZE`

**Format**: Integer (bytes)  
**Default**: `3145728000` (3GB in bytes)  
**Purpose**: Controls the maximum file size for guest uploads and affects PHP memory/post limits

**Examples**:
```bash
# 10 MB limit
GUEST_UPLOAD_MAX_FILE_SIZE=10485760

# 100 MB limit  
GUEST_UPLOAD_MAX_FILE_SIZE=104857600

# 1 GB limit
GUEST_UPLOAD_MAX_FILE_SIZE=1073741824

# 5 GB limit
GUEST_UPLOAD_MAX_FILE_SIZE=5368709120
```

## How It Works

When Drime starts, the `AppServiceProvider` reads the `GUEST_UPLOAD_MAX_FILE_SIZE` environment variable and automatically:

1. **Sets PHP ini limits**:
   - `upload_max_filesize` = File size limit
   - `post_max_size` = File size + 10% overhead (min 1MB)
   - `memory_limit` = max(512MB, 50% of file size)

2. **Updates Laravel config**:
   - `uploads.guest_max_size` = Raw byte value for validation
   - `app.max_file_size` = Value in KB for Laravel's validation system

3. **Updates database settings** (via seeder):
   - `guest_uploads.max_size` = Value in KB for admin UI display

## Deployment Steps

### 1. Update Environment Variable

Add or modify the variable in your environment configuration:

```bash
# .env file
GUEST_UPLOAD_MAX_FILE_SIZE=1073741824
```

### 2. Clear Configuration Cache

After changing the environment variable:

```bash
php artisan config:clear
```

### 3. Restart Application

Restart your web server/PHP-FPM to apply the new limits:

```bash
# Example for systemd
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx

# Example for Docker
docker-compose restart app
```

## Web Server Configuration

### Nginx

Ensure your Nginx configuration allows the upload size:

```nginx
server {
    # Set this to match or exceed your GUEST_UPLOAD_MAX_FILE_SIZE
    client_max_body_size 1G;  # For 1GB uploads
    
    # Also important for large uploads
    client_body_timeout 300s;
    client_header_timeout 300s;
}
```

### Apache

For Apache with php-fpm:

```apache
# In your virtual host or .htaccess
LimitRequestBody 1073741824  # 1GB in bytes
```

### PHP-FPM

If using PHP-FPM, you may need to adjust pool settings:

```ini
; /etc/php/8.2/fpm/pool.d/www.conf
request_terminate_timeout = 600s
```

## Monitoring and Debugging

### Check Current Limits

Visit `/test-upload-limits` on your application to see current settings:

```bash
curl https://your-domain.com/test-upload-limits
```

This will show:
- Environment variable value
- Applied PHP ini settings
- Laravel configuration values
- Converted byte values

### Logs

When `APP_DEBUG=true`, the system logs applied settings:

```
[DynamicUploadLimits] Applied settings: upload_max_filesize=1G, post_max_size=1G, memory_limit=512M (based on GUEST_UPLOAD_MAX_FILE_SIZE=1,073,741,824 bytes)
```

## Security Considerations

1. **Resource Usage**: Large upload limits increase memory and storage requirements
2. **DoS Protection**: Consider rate limiting in addition to size limits
3. **Disk Space**: Ensure adequate storage for maximum possible uploads
4. **Memory Limits**: The system automatically calculates safe memory limits

## Troubleshooting

### Upload Still Fails with "Content-Length exceeds limit"

This usually indicates:

1. **Web server limit**: Check Nginx `client_max_body_size` or Apache `LimitRequestBody`
2. **PHP-FPM limit**: Verify PHP-FPM pool configuration
3. **System limit**: Some hosting providers have hard limits

### Settings Not Applied

1. Verify environment variable is correctly set
2. Clear configuration cache: `php artisan config:clear`
3. Restart web server and PHP-FPM
4. Check logs for error messages

### Memory Errors During Upload

The system automatically sets memory limits, but for very large files:

1. Consider increasing server RAM
2. Use chunked upload methods (TUS protocol)
3. Implement background processing for large files

## Migration from Hard-coded Limits

The old hard-coded files have been updated with comments pointing to this new system:

- `.user.ini` - Now has fallback values only
- `php_upload.ini` - Marked as deprecated
- `bootstrap/upload-config.php` - Contains legacy code in comments
- `start-server.sh` - No longer sets manual limits

These files are kept for backwards compatibility but are no longer actively used.

## Testing

### Unit Tests

Run the upload limits test suite:

```bash
php artisan test --filter=SizeFormatterTest
php artisan test --filter=DynamicUploadLimitsTest
```

### Manual Testing

1. Set a small limit (e.g., 10MB): `GUEST_UPLOAD_MAX_FILE_SIZE=10485760`
2. Clear config and restart server
3. Try uploading files above and below the limit
4. Verify appropriate validation errors

## Additional Notes

- Changes require application restart to take effect
- The system enforces a minimum 1MB limit for safety
- All calculations use binary (1024-based) units internally
- The admin UI will display the configured limits automatically
