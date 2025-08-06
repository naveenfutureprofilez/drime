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

## Development & Troubleshooting

### Tailwind CSS Issues

If you encounter issues with Tailwind CSS not applying styles correctly, follow these troubleshooting steps:

#### Build Check
Run the Tailwind CSS build check to ensure all classes are valid:
```bash
npx tailwindcss -i resources/client/App.css --content "./resources/**/*.{php,jsx,tsx,js,ts}" "./common/**/*.{php,jsx,tsx,js,ts}" -o /dev/null
```

#### Configuration Validation
If you have Jest configured, run the Tailwind configuration tests:
```bash
npm test -- --testPathPattern=tailwind-config
```

#### Common Issues

1. **Classes not applying**: 
   - Ensure your files are included in the `content` array of `tailwind.config.js`
   - Check that the file extensions match those specified in the config
   - Verify that the classes are spelled correctly

2. **Custom colors/spacing not working**:
   - Check that custom values are properly defined in `common/foundation/resources/client/shared.tailwind.js`
   - Ensure the shared configuration is correctly imported in your main config
   - Verify CSS custom properties are available in the browser

3. **Build errors**:
   - Run `npm ci` to ensure all dependencies are properly installed
   - Check for syntax errors in your Tailwind configuration files
   - Ensure Node.js version compatibility (recommended: Node 18+)

4. **Hot Module Replacement (HMR) issues**:
   - The Vite configuration includes `followSymlinks: true` to handle symlinked packages
   - Restart the dev server if HMR stops working: `npm run dev`

#### Dark Mode
The application supports dark mode through the `dark:` prefix. Toggle dark mode by adding/removing the `dark` class from the HTML element:
```javascript
document.documentElement.classList.toggle('dark');
```

### CI/CD Integration

The project includes a GitHub Actions workflow (`.github/workflows/tailwind-build-check.yml`) that:
- Automatically runs on pull requests affecting CSS-related files
- Validates that all Tailwind classes compile successfully
- Runs Tailwind configuration tests if available
- Provides detailed summaries of build results

### Testing

Run all tests:
```bash
npm test
```

Run only Tailwind-related tests:
```bash
npm test -- --testPathPattern=tailwind
```

