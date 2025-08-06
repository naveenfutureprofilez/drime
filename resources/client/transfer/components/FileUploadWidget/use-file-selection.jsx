import { useState, useCallback, useMemo, useEffect } from 'react';
/**
 * Generates a thumbnail for an image file using FileReader API
 */
function generateImageThumbnail(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate new dimensions while maintaining aspect ratio
        const maxWidth = 64;
        const maxHeight = 64;
        let {
          width,
          height
        } = img;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnailDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generates a thumbnail for a video file using video element
 */
function generateVideoThumbnail(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    video.addEventListener('loadedmetadata', () => {
      // Calculate new dimensions while maintaining aspect ratio
      const maxWidth = 64;
      const maxHeight = 64;
      let {
        videoWidth: width,
        videoHeight: height
      } = video;
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;

      // Seek to 1 second or 10% of duration, whichever is smaller
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime;
    });
    video.addEventListener('seeked', () => {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnailDataUrl);

      // Clean up
      URL.revokeObjectURL(video.src);
    });
    video.addEventListener('error', () => {
      reject(new Error('Failed to load video'));
    });
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Gets the appropriate icon type based on file mime type
 */
function getIconType(mimeType) {
  const type = mimeType.toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('word') || type.includes('doc')) return 'document';
  if (type.includes('excel') || type.includes('sheet')) return 'spreadsheet';
  if (type.includes('powerpoint') || type.includes('presentation')) return 'presentation';
  if (type.startsWith('text/')) return 'text';
  if (type.includes('zip') || type.includes('rar') || type.includes('tar') || type.includes('7z')) return 'archive';
  if (type.includes('javascript') || type.includes('typescript') || type.includes('json')) return 'code';
  return 'file';
}
export function useFileSelection() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const addFiles = useCallback(async files => {
    const filesWithPreviews = await Promise.all(files.map(async file => {
      const fileWithPreview = file;

      // Add icon type for all files
      fileWithPreview.iconType = getIconType(file.type);

      // Generate preview URL for all files
      fileWithPreview.preview = URL.createObjectURL(file);

      // Generate thumbnail for images and videos using FileReader API
      try {
        if (file.type.startsWith('image/')) {
          fileWithPreview.thumbnail = await generateImageThumbnail(file);
        } else if (file.type.startsWith('video/')) {
          fileWithPreview.thumbnail = await generateVideoThumbnail(file);
        }
      } catch (error) {
        console.warn('Failed to generate thumbnail for', file.name, error);
      }
      return fileWithPreview;
    }));
    setSelectedFiles(prev => [...prev, ...filesWithPreviews]);
  }, []);
  const removeFile = useCallback(index => {
    setSelectedFiles(files => {
      const newFiles = files.filter((_, i) => i !== index);

      // Clean up object URLs to prevent memory leaks
      const removedFile = files[index];
      if (removedFile?.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return newFiles;
    });
  }, []);
  const clearFiles = useCallback(() => {
    selectedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setSelectedFiles([]);
  }, [selectedFiles]);

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);
  const totalSize = useMemo(() => selectedFiles.reduce((total, file) => total + file.size, 0), [selectedFiles]);
  return {
    selectedFiles,
    addFiles,
    removeFile,
    clearFiles,
    totalSize
  };
}