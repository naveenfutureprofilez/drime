import React, { useState, useCallback } from 'react';
import { Button } from '@ui/buttons/button';
import { FileUploadIcon } from '@ui/icons/material/FileUpload';
import { AddIcon } from '@ui/icons/material/Add';
import { Trans } from '@ui/i18n/trans';
import { openUploadWindow } from '@ui/utils/files/open-upload-window';
import { ProgressBar } from '@ui/progress/progress-bar';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
import { apiClient } from '@common/http/query-client';
import { useFileSelection } from './use-file-selection';
import { FilePreview } from './file-preview';
export function FileUploadWidget({
  settings,
  onUploadComplete,
  onSpeed,
  onETA,
  theme = 'light'
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const {
    selectedFiles,
    addFiles,
    removeFile,
    clearFiles,
    totalSize
  } = useFileSelection();
  const handleDragOver = useCallback(e => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback(e => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  const handleDrop = useCallback(e => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  }, [addFiles]);
  const handleFileSelect = useCallback(() => {
    openUploadWindow({
      multiple: true,
      types: ['*']
    }).then(files => {
      if (files?.length) {
        addFiles(files);
      }
    });
  }, [addFiles]);
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    try {
      setUploadProgress(0);
      const startTime = Date.now();
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files[]', file);
      });
      if (settings.password) {
        formData.append('password', settings.password);
      }
      if (settings.expiresInHours) {
        formData.append('expires_in_hours', settings.expiresInHours.toString());
      }
      if (settings.maxDownloads) {
        formData.append('max_downloads', settings.maxDownloads.toString());
      }
      const response = await apiClient.post('guest/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          if (progressEvent.total) {
            const progress = Math.round(progressEvent.loaded * 100 / progressEvent.total);
            setUploadProgress(progress);
            const elapsedTime = (Date.now() - startTime) / 1000; // in seconds
            const speed = progressEvent.loaded / elapsedTime; // bytes per second
            if (onSpeed) {
              onSpeed(speed);
            }
            if (onETA) {
              const remainingBytes = progressEvent.total - progressEvent.loaded;
              const eta = remainingBytes / speed; // in seconds
              onETA(eta);
            }
          }
        }
      });
      setUploadProgress(null);
      onUploadComplete(response.data.data.uploads);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(null);
      // TODO: Show error message
    }
  }, [selectedFiles, settings, onUploadComplete, onSpeed, onETA]);
  const containerClasses = theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  const dropzoneClasses = isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400';
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';
  if (uploadProgress !== null) {
    return <div className={`text-center py-12 ${containerClasses}`}>
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileUploadIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className={`text-lg font-medium mb-2`}>
          <Trans message="Uploading files..." />
        </h3>
        <div className="max-w-xs mx-auto">
          <ProgressBar value={uploadProgress} />
          <p className={`text-sm mt-2 ${textColor}`}>
            {uploadProgress}% <Trans message="complete" />
          </p>
        </div>
      </div>;
  }
  return <div className={`text-center ${containerClasses}`}>
      {selectedFiles.length === 0 ? <div className={`border-2 border-dashed rounded-2xl p-12 transition-colors ${dropzoneClasses}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AddIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            <Trans message="Click to upload or drag and drop" />
          </h3>
          <p className={`text-sm mb-6 ${textColor}`}>
            <Trans message="Share up to 3GB per file for free" />
          </p>
          <Button variant="flat" color="primary" size="lg" onClick={handleFileSelect} className="px-8">
            <Trans message="Choose files" />
          </Button>
        </div> : <div>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">
              <Trans message="Selected files" />
            </h3>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => <FilePreview key={index} file={file} onRemove={() => removeFile(index)} />)}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  <Trans message="Total size:" />
                </span>
                <span className="font-medium">{prettyBytes(totalSize)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={clearFiles}>
              <Trans message="Clear all" />
            </Button>
            <Button variant="flat" color="primary" onClick={handleUpload} className="px-8">
              <Trans message="Upload files" />
            </Button>
          </div>
        </div>}
    </div>;
}