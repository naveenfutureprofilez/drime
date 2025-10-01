import clsx from 'clsx';
export function FileTypeIcon({
  type,
  mime,
  className,
  size = '24'
}) {
  if (!type && mime) {
    type = mime.split('/')[0];
  }
  
  // Enhanced file type detection
  if (mime) {
    const mimeType = mime.toLowerCase();
    if (mimeType.includes('word') || mimeType.includes('document')) {
      type = 'docs';
    } else if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      type = 'sheet';
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      type = 'slide';
    } else if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('rar') || mimeType.includes('7z')) {
      type = 'archive';
    } else if (mimeType.includes('plain')) {
      type = 'txt';
    } else if (mimeType.startsWith('image/')) {
      type = 'photos';
    }
  }
  
  // Get the SVG file path
  const svgFile = getSvgFileName(type);
  const svgPath = `/fileicons/${svgFile}`;
  
  // Convert size to pixels if it's a number
  const sizeInPx = typeof size === 'string' ? (size.includes('px') ? size : `${size}px`) : `${size}px`;
  
  return (
    <img 
      src={svgPath}
      alt={`${type} file icon`}
      className={clsx('file-type-icon', className, `${type}-file-color`)}
      style={{
        width: "35px",
        height: "35px",
        objectFit: 'contain',
        display: 'block'
      }}
    />
  );
}

// Map file types to SVG filenames
function getSvgFileName(type) {
  const svgMap = {
    // Primary mappings
    file: 'file.svg',
    default: 'file.svg',
    audio: 'audio.svg',
    video: 'video.svg',
    text: 'txt.svg',
    txt: 'txt.svg',
    pdf: 'pdf.svg',
    archive: 'archive.svg',
    folder: 'folder.svg',
    image: 'photos.svg',
    photos: 'photos.svg',
    docs: 'docs.svg',
    document: 'docs.svg',
    word: 'docs.svg',
    sheet: 'sheet.svg',
    spreadsheet: 'sheet.svg',
    excel: 'sheet.svg',
    slide: 'slide.svg',
    powerpoint: 'slide.svg',
    presentation: 'slide.svg',
    
    // Legacy support
    sharedFolder: 'folder.svg',
    powerPoint: 'slide.svg',
  };
  
  return svgMap[type] || svgMap.default;
}
