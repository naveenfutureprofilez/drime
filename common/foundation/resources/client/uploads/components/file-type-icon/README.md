# File Type Icon System

This directory contains the complete file type icon system that directly uses SVG files from the `public/fileicons` folder via `<img>` tags for 100% accuracy.

## Overview

The system directly loads all 11 file type icons from your `public/fileicons` directory:

- **archive.svg** → Archive files (.zip, .rar, .7z, etc.)
- **audio.svg** → Audio files (.mp3, .wav, .m4a, etc.)
- **docs.svg** → Document files (.docx, .doc, .odt, etc.)
- **file.svg** → Default/generic files
- **folder.svg** → Folder/directory icons
- **pdf.svg** → PDF files
- **photos.svg** → Image files (.jpg, .png, .gif, etc.)
- **sheet.svg** → Spreadsheet files (.xlsx, .xls, .csv, etc.)
- **slide.svg** → Presentation files (.pptx, .ppt, .odp, etc.)
- **txt.svg** → Text files (.txt, .md, .log, etc.)
- **video.svg** → Video files (.mp4, .avi, .mov, etc.)

## Usage

### Basic Usage

```jsx
import { FileTypeIcon } from './components/file-type-icon/file-type-icon';

// Auto-detect from MIME type
<FileTypeIcon mime=\"application/pdf\" />
<FileTypeIcon mime=\"image/jpeg\" />
<FileTypeIcon mime=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document\" />

// Explicit type specification
<FileTypeIcon type=\"pdf\" />
<FileTypeIcon type=\"photos\" />
<FileTypeIcon type=\"docs\" />
<FileTypeIcon type=\"sheet\" />
<FileTypeIcon type=\"slide\" />
```

### With Custom Styling

```jsx
<FileTypeIcon 
  type=\"pdf\" 
  size=\"large\" 
  className=\"my-custom-class\" 
/>
```

## Available Icon Types

| Type | Description | File Extensions | MIME Types |
|------|-------------|-----------------|------------|
| `archive` | Archive files | .zip, .rar, .7z, .tar | application/zip, application/x-rar |
| `audio` | Audio files | .mp3, .wav, .m4a | audio/* |
| `docs` | Document files | .docx, .doc, .odt | application/*word*, application/*document* |
| `file` | Default/generic | Any unknown type | - |
| `folder` | Directories | - | - |
| `pdf` | PDF files | .pdf | application/pdf |
| `photos` | Image files | .jpg, .png, .gif | image/* |
| `sheet` | Spreadsheets | .xlsx, .xls, .csv | application/*sheet*, application/*excel* |
| `slide` | Presentations | .pptx, .ppt, .odp | application/*presentation*, application/*powerpoint* |
| `txt` | Text files | .txt, .md, .log | text/plain |
| `video` | Video files | .mp4, .avi, .mov | video/* |

## Automatic MIME Type Detection

The component automatically detects file types from MIME types:

```jsx
// These will all show the correct icons automatically
<FileTypeIcon mime=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document\" /> // docs icon
<FileTypeIcon mime=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\" /> // sheet icon
<FileTypeIcon mime=\"application/vnd.openxmlformats-officedocument.presentationml.presentation\" /> // slide icon
<FileTypeIcon mime=\"application/zip\" /> // archive icon
<FileTypeIcon mime=\"text/plain\" /> // txt icon
<FileTypeIcon mime=\"image/jpeg\" /> // photos icon
```

## How it Works

The component now uses `<img>` elements to directly load SVG files from `/public/fileicons/`:

```jsx
// Results in:
<img 
  src="/fileicons/pdf.svg" 
  alt="pdf file icon"
  className="file-type-icon pdf-file-color"
  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
/>
```

This ensures 100% accuracy with your original SVG designs since no conversion or transformation is applied.

## CSS Classes

Since we use direct SVG files, the colors are already built into the SVG files themselves. The CSS classes are maintained for backward compatibility but don't affect the visual appearance:

## Size Classes

```css
.file-type-icon { width: 24px; height: 24px; } /* default */
.file-type-icon.small { width: 16px; height: 16px; }
.file-type-icon.medium { width: 32px; height: 32px; }
.file-type-icon.large { width: 48px; height: 48px; }
.file-type-icon.xl { width: 64px; height: 64px; }
```

## Adding New Icons

1. Add your new SVG file to `public/fileicons/` (e.g., `newtype.svg`)
2. Update the `getSvgFileName()` function in `file-type-icon.jsx` to include your new type mapping
3. That's it! The icon will be automatically loaded via the `<img>` tag

```jsx
// In getSvgFileName() function:
const svgMap = {
  // ... existing mappings
  newtype: 'newtype.svg',  // Add this line
};
```

## File Structure

```
file-type-icon/
├── file-type-icon.jsx          # Main component that loads SVG files directly
├── file-type-icon-colors.css   # CSS classes (for backward compatibility)
├── icons/
│   └── [legacy icons...]       # Original icon components (kept for compatibility)
└── README.md                   # This file

// SVG files are loaded from:
public/fileicons/
├── archive.svg
├── audio.svg
├── docs.svg
├── file.svg
├── folder.svg
├── pdf.svg
├── photos.svg
├── sheet.svg
├── slide.svg
├── txt.svg
└── video.svg
```

## Backward Compatibility

All existing icon mappings are maintained for backward compatibility:
- `powerPoint` → `SlideIcon`
- `sharedFolder` → `SharedFolderFileIcon` (legacy)
- `spreadsheet` → `SheetIcon`
- `image` → `PhotosIcon`

## Migration Guide

If you were using the old system, most code should work without changes. However, you may want to update to use the new type names for better semantics:

```jsx
// Old way (still works)
<FileTypeIcon type=\"image\" />
<FileTypeIcon type=\"powerPoint\" />
<FileTypeIcon type=\"spreadsheet\" />

// New way (recommended)
<FileTypeIcon type=\"photos\" />
<FileTypeIcon type=\"slide\" />
<FileTypeIcon type=\"sheet\" />
```