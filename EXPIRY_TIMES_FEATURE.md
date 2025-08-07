# Extended Expiry Times Feature

## Overview

We have implemented extended expiry times for guest uploads, allowing users to set expiry times ranging from 1 hour up to 1 year.

## Available Expiry Options

The following expiry options are now available in the settings panel:

- **1 hour** - For temporary sharing
- **6 hours** - Short-term sharing
- **1 day (24 hours)** - Daily sharing
- **3 days (72 hours)** - Default option
- **5 days (120 hours)** - Extended sharing
- **7 days (168 hours)** - Weekly sharing
- **10 days (240 hours)** - Extended period
- **20 days (480 hours)** - Long-term sharing
- **30 days (720 hours)** - Monthly sharing
- **1 year (8760 hours)** - Maximum retention period

## Technical Implementation

### Backend Changes

1. **Validation Rules Updated**: All controllers now accept expiry periods up to 8760 hours (1 year)
   - `GuestTusController.php`
   - `GuestUploadController.php` 
   - `QuickShareController.php`

2. **Service Layer**: `GuestUploadService` updated to handle the new maximum expiry period

3. **Configuration**: Maximum expiry hours increased from 168 to 8760 hours

### Frontend Changes

1. **Settings Panel**: Updated with all new expiry options
   - Added 10 days, 20 days, 30 days, and 1 year options
   - User-friendly labels for each option

2. **Transfer Homepage**: Enhanced to show human-readable expiry times
   - Displays "Expires in X days" instead of just hours
   - Automatically formats based on the time period selected

### API Endpoints

All guest upload endpoints now accept `expires_in_hours` parameter with values from 1 to 8760:

- `POST /api/v1/guest/upload` - Direct multi-file upload
- `POST /api/v1/tus/entries` - TUS resumable upload completion  
- `POST /api/v1/quick-share` - Quick share single file upload

### Validation

- **Minimum**: 1 hour
- **Maximum**: 8760 hours (1 year)
- **Default**: 72 hours (3 days) if not specified

## User Experience

### Settings Panel
Users can now select from a comprehensive list of expiry options ranging from 1 hour to 1 year, giving them full control over how long their files remain accessible.

### Status Display
The upload interface shows user-friendly expiry times:
- "Expires in 1 hour"
- "Expires in 3 days" 
- "Expires in 1 week"
- "Expires in 1 month"
- "Expires in 1 year"

## Benefits

1. **Flexibility**: Users can choose the appropriate retention period for their specific use case
2. **Long-term sharing**: Supports business and personal use cases requiring longer retention
3. **Temporary sharing**: Still supports quick, short-term file sharing
4. **User-friendly**: Clear, readable expiry time display
5. **Consistent**: All upload methods (direct, TUS, quick-share) support the same options

## Compatibility

This feature is fully backward compatible. Existing uploads and API clients will continue to work without changes, using the default 3-day expiry period if no expiry time is specified.
