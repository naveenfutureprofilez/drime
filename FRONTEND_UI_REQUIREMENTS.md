# Frontend UI Requirements - Guest Uploads Feature

This document outlines the UI/UX requirements for the guest uploads feature as requested in Step 11 of the implementation plan.

## Overview

The guest uploads feature allows unauthenticated users to upload files via shareable links and download files with configurable expiration and download limits. The frontend should handle different states including active, expired, and limit-reached scenarios.

## Page Requirements

### 1. Upload Page (Remains Unchanged)
- **Status**: No changes required to existing upload functionality
- **Current Behavior**: Continue using existing upload components and workflows
- **Note**: Upload page functionality is maintained as-is per requirements

### 2. Download Page UI Components

#### 2.1 File Listing Interface
**Location**: `resources/client/drive/shareable-link/shareable-link-page/guest-download-view.jsx`

**Requirements**:
- Display list of available files with metadata
- Show individual file information:
  - File name (using `file.name`, `file.filename`, or `file.original_filename`)
  - File size (formatted using `prettyBytes` utility)
- Display total size of all files
- Show expiration date when applicable

**Current Implementation**: 
```jsx
// Files are displayed in a clean list format with:
{files?.map((file, index) => (
  <div key={index} className="flex items-center gap-3 bg-white border border-black rounded-lg p-3">
    <div className="flex-1 text-left">
      <div className="text-sm font-medium">{file.name || file.filename || file.original_filename}</div>
      <div className="text-xs">{prettyBytes(file.file_size || file.size || 0)}</div>
    </div>
  </div>
))}
```

#### 2.2 Download Actions

**Individual File Downloads**:
- Each file should support individual download capability
- Use existing download URL pattern: `file.download_url` or `/download/${file.hash}`
- Open downloads in new tab/window for better UX

**Bulk Download**:
- Single "Download All" button for multiple files
- For single file: Direct download
- For multiple files: ZIP archive download (implementation pending)

**Current Implementation**:
```jsx
<button onClick={() => {
  if (files && files.length === 1) {
    // Single file - direct download
    const file = files[0];
    const downloadUrl = file.download_url || `/download/${file.hash}`;
    window.open(downloadUrl, '_blank');
  } else if (files && files.length > 1) {
    // Multiple files - ZIP download (future enhancement)
    alert('ZIP download for multiple files will be implemented soon.');
  }
}}>
  <Trans message="Download all" />
</button>
```

#### 2.3 Password Protection Modal

**Requirements**:
- Single password prompt for accessing protected content
- Modal should appear once per session
- After successful authentication, no re-prompts for subsequent downloads
- Handle authentication errors gracefully

**Expected Behavior**:
- Show password modal on first access to protected content
- Store authentication state for session duration
- Display appropriate error messages for incorrect passwords
- Seamless experience after authentication

### 3. State Management

#### 3.1 Active State
- Normal file listing and download functionality
- All download buttons enabled and functional
- Display expiration information if applicable

#### 3.2 Expired State
**Visual Requirements**:
- Show disabled/grayed out download buttons
- Display clear expiration message
- Maintain file listing for reference
- Use muted colors and disabled button styling

**Implementation Notes**:
```jsx
// Example disabled state styling
className={`button ${isExpired ? 'button-disabled opacity-50 cursor-not-allowed' : 'button-primary'}`}
disabled={isExpired}
```

#### 3.3 Download Limit Reached State
**Visual Requirements**:
- Similar to expired state - disabled download buttons
- Show "download limit reached" message
- Files remain visible but not downloadable
- Clear messaging about limit restrictions

#### 3.4 Error States
- Network errors: Show retry option
- File not found: Clear error message
- Permission denied: Appropriate access message

## Technical Implementation Notes

### File Components Structure
```
resources/client/
├── drive/shareable-link/shareable-link-page/
│   ├── guest-download-view.jsx (Main component)
│   └── shareable-link-page.jsx (Parent container)
└── guest-share/
    └── guest-share-page.jsx (Guest-specific wrapper)
```

### Key Props Interface
```typescript
interface GuestDownloadViewProps {
  files: Array<{
    name?: string;
    filename?: string;
    original_filename?: string;
    file_size?: number;
    size?: number;
    hash?: string;
    download_url?: string;
  }>;
  totalSize: number;
  expiresAt?: string;
}
```

### Styling Guidelines
- Use existing Tailwind CSS classes for consistency
- Maintain current design system patterns
- Ensure responsive design across devices
- Follow accessibility guidelines (ARIA labels, keyboard navigation)

### Integration Points
1. **Password Protection**: Integrate with `PasswordPage` component
2. **Authentication**: Use `useAuth` hook for user state
3. **File URLs**: Leverage `FileEntryUrlsContext` for URL generation
4. **Translations**: Use `Trans` component for all user-facing text

## User Experience Flow

1. **Initial Access**:
   - User visits shareable link
   - Password prompt appears if protected (once per session)
   - File list displays after authentication

2. **Normal Download Flow**:
   - Files listed with download options
   - Individual or bulk download available
   - Progress indication for downloads

3. **Expired/Limited Access**:
   - Files still visible for reference
   - Download buttons disabled with clear messaging
   - Appropriate error states displayed

## Browser Compatibility
- Support modern browsers (Chrome, Firefox, Safari, Edge)
- Ensure download functionality works across all supported browsers
- Handle browser-specific download behaviors

## Accessibility Requirements
- Screen reader compatible
- Keyboard navigation support
- High contrast mode support
- Focus management for modal interactions

---

**Note**: This document reflects the current implementation state and provides guidance for maintaining consistency while implementing the expired and limit-reached states as specified in Step 11 requirements.
