import React, { useState, useCallback } from 'react';
import { Button } from '@ui/buttons/button';
import { FileUploadIcon } from '@ui/icons/material/FileUpload';
import { AddIcon } from '@ui/icons/material/Add';
import { Trans } from '@ui/i18n/trans';
import { openUploadWindow } from '@ui/utils/files/open-upload-window';
import { ProgressBar } from '@ui/progress/progress-bar';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
import { apiClient } from '@common/http/query-client';
export function FileUploadWidget({
  settings,
  onUploadComplete
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
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
      setSelectedFiles(prevFiles => prevFiles.length > 0 ? [...prevFiles, ...files] : files);
    }
  }, []);
  const handleFileSelect = useCallback(() => {
    openUploadWindow({
      multiple: true,
      types: ['*']
    }).then(files => {
      if (files?.length) {
        setSelectedFiles(files);
      }
    });
  }, []);
  const handleAddMoreFiles = useCallback(() => {
    openUploadWindow({
      multiple: true,
      types: ['*']
    }).then(files => {
      if (files?.length) {
        setSelectedFiles(prevFiles => [...prevFiles, ...files]);
      }
    });
  }, []);
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    try {
      setUploadProgress(0);
      const formData = new FormData();
      selectedFiles.forEach(file => {
        // Handle both File and UploadedFile objects
        const actualFile = file.native || file;
        formData.append('files[]', actualFile);
      });
      if (settings.password) {
        formData.append('password', settings.password);
      }
      formData.append('expires_in_hours', settings.expiresInHours.toString());
      if (settings.maxDownloads) {
        formData.append('max_downloads', settings.maxDownloads.toString());
      }
      const response = await apiClient.post('guest/upload', formData, {
        onUploadProgress: progressEvent => {
          if (progressEvent.total) {
            const progress = Math.round(progressEvent.loaded * 100 / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });
      setUploadProgress(null);
      console.log('Upload API response:', response.data.data); // Debug log to check API structure
      onUploadComplete(response.data.data.files);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(null);
      // TODO: Show error message
    }
  }, [selectedFiles, settings, onUploadComplete]);
  const removeFile = useCallback(index => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  }, []);
  if (uploadProgress !== null) {
    return <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileUploadIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          <Trans message="Uploading files..." />
        </h3>
        <div className="max-w-xs mx-auto">
          <ProgressBar value={uploadProgress} />
          <p className="text-sm text-gray-500 mt-2">
            {uploadProgress}% <Trans message="complete" />
          </p>
        </div>
      </div>;
  }
  return <div className="text-center">
      {selectedFiles.length === 0 ? <div className={`border-2 border-dashed rounded-2xl p-4 transition-colors ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AddIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-black-900 mb-2">
            <Trans message="Click to upload or drag and drop" />
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            <Trans message="Share up to 3GB per file for free" />
          </p>
          <Button variant="flat" color="primary" size="lg" onClick={handleFileSelect} className="px-8">
            <Trans message="Choose files" />
          </Button>
        </div> : <div>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-medium  mb-4">
              <Trans message="Selected files" />
            </h3>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-black rounded-lg">
                  <div className="flex items-center gap-3 ">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <FileUploadIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium ">{file.name}</div>
                      <div className="text-xs ">{prettyBytes(file.size)}</div>
                    </div>
                  </div>
                  <button onClick={() => removeFile(index)} className=" p-1">
                    ✕
                  </button>
                </div>)}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  <Trans message="Total size:" />
                </span>
                <span className="font-medium">
                  {prettyBytes(selectedFiles.reduce((total, file) => total + file.size, 0))}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button className="border-2 border-dashed rounded-2xl p-4 transition-colors" onClick={handleAddMoreFiles}>
              <Trans message="Add more files" />
            </button>
            <button className="border-2 border-dashed rounded-2xl p-4 transition-colors" onClick={() => setSelectedFiles([])}>
              <Trans message="Clear all" />
            </button>
            <button className="border-2 border-dashed rounded-2xl p-4 transition-colors" onClick={handleUpload}>
              <Trans message="Upload files" />
            </button>
          </div>
        </div>}
    </div>;
}