import React from 'react';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
import { FileUploadIcon } from '@ui/icons/material/FileUpload';
import { ImageIcon } from '@ui/icons/material/Image';
import { VideoFileIcon } from '@ui/icons/material/VideoFile';
import { AudioFileIcon } from '@ui/icons/material/AudioFile';
import { PictureAsPdfIcon } from '@ui/icons/material/PictureAsPdf';
import { DescriptionIcon } from '@ui/icons/material/Description';
import { FolderZipIcon } from '@ui/icons/material/FolderZip';
import { CodeIcon } from '@ui/icons/material/Code';
const iconMap = {
  image: ImageIcon,
  video: VideoFileIcon,
  audio: AudioFileIcon,
  pdf: PictureAsPdfIcon,
  document: DescriptionIcon,
  spreadsheet: DescriptionIcon,
  // Could be more specific
  presentation: DescriptionIcon,
  // Could be more specific
  text: DescriptionIcon,
  archive: FolderZipIcon,
  code: CodeIcon,
  file: FileUploadIcon
};
export function FilePreview({
  file,
  onRemove
}) {
  const IconComponent = iconMap[file.iconType || 'file'] || FileUploadIcon;
  return <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {file.thumbnail ? <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" /> : <IconComponent className="w-6 h-6 text-gray-500" />}
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-gray-800 truncate">
            {file.name}
          </div>
          <div className="text-xs text-gray-500">{prettyBytes(file.size)}</div>
        </div>
      </div>
      <button onClick={onRemove} className="text-gray-400 hover:text-red-600 p-1 rounded-full transition-colors" aria-label={`Remove ${file.name}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </button>
    </div>;
}