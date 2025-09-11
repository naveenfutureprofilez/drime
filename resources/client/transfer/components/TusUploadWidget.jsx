import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload } from 'tus-js-client';
import { Button } from '@ui/buttons/button';
import { FileUploadIcon } from '@ui/icons/material/FileUpload';
import { AddIcon } from '@ui/icons/material/Add';
import { PauseIcon } from '@ui/icons/material/Pause';
import { PlayArrowIcon } from '@ui/icons/material/PlayArrow';
import { StopIcon } from '@ui/icons/material/Stop';
import { DeleteIcon } from '@ui/icons/material/Delete';
import { Trans } from '@ui/i18n/trans';
import { openUploadWindow } from '@ui/utils/files/open-upload-window';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
import { apiClient } from '@common/http/query-client';
import { useFileSelection } from './FileUploadWidget/use-file-selection';
import { FilePreview } from './FileUploadWidget/file-preview';

const CHUNK_SIZE = 64 * 1024; // 64KB chunks for better progress visibility
const RETRY_DELAYS = [0, 1000, 3000, 5000, 10000]; // Progressive delays for retries

export function TusUploadWidget({
  settings,
  onUploadStart,
  onUploadComplete,
  onUploadProgress,
  onUploadError,
  theme = 'light'
}) {
  console.log('🔄 TUS Upload Widget Rendered');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // 'idle', 'uploading', 'paused', 'completed', 'error'
  const [uploadProgress, setUploadProgress] = useState({});
  const [totalProgress, setTotalProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [guestUploadGroupHash, setGuestUploadGroupHash] = useState(null);
  
  const uploadsRef = useRef(new Map()); // Store TUS Upload instances
  const speedCalculatorRef = useRef({ lastBytes: 0, lastTime: Date.now() });

  const {
    selectedFiles,
    addFiles,
    removeFile,
    clearFiles,
    totalSize
  } = useFileSelection();
  
  // Debug logging for selected files
  console.log('🗂 Selected files state:', selectedFiles.length, selectedFiles.map(f => f.name));

  // Event handlers for drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    console.log('🎯 Files dropped:', files.length, files);
    if (files.length > 0) {
      console.log('➕ Adding dropped files to selection...');
      addFiles(files);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback(() => {
    console.log('📁 Opening file selection dialog...');
    openUploadWindow({
      multiple: true,
      types: ['*']
    }).then(files => {
      console.log('📁 Files selected:', files?.length || 0, files);
      if (files?.length) {
        console.log('➕ Adding files to selection...');
        addFiles(files);
      }
    }).catch(error => {
      console.error('❌ File selection error:', error);
    });
  }, [addFiles]);


  // Create TUS upload for a single file
  const createTusUpload = useCallback((file) => {
    console.log(`🚀 Creating TUS upload for: ${file.name} (${prettyBytes(file.size)})`);
    
    const tusFingerprint = `guest-tus-${file.name}-${file.size}-${Date.now()}`;
    
    const upload = new Upload(file, {
      fingerprint: () => Promise.resolve(tusFingerprint),
      endpoint: `${window.location.origin}/api/v1/tus/upload`,
      chunkSize: CHUNK_SIZE,
      retryDelays: RETRY_DELAYS,
      removeFingerprintOnSuccess: true,
      overridePatchMethod: true,
      
      metadata: {
        name: btoa(file.name),
        clientName: file.name,
        clientExtension: file.name.split('.').pop() || '',
        clientMime: file.type || 'application/octet-stream',
        clientSize: file.size.toString(),
        // Guest upload settings
        password: settings?.password || '',
        expires_in_hours: settings?.expiresInHours?.toString() || '72',
        max_downloads: settings?.maxDownloads?.toString() || '',
        upload_group_hash: guestUploadGroupHash || '',
      },

      onError: (error) => {
        console.error(`❌ TUS Upload Error for ${file.name}:`, error);
        
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { ...prev[file.name], status: 'error', error: error.message }
        }));
        
        setUploadState('error');
        onUploadError?.(error, file);
      },

      onProgress: (bytesUploaded, bytesTotal) => {
        const progress = Math.round((bytesUploaded * 100) / bytesTotal);
        
        console.log(`📊 Progress ${file.name}: ${progress}% (${prettyBytes(bytesUploaded)}/${prettyBytes(bytesTotal)})`);
        
        // Update the uploads ref first
        uploadsRef.current.set(file.name, {
          upload,
          file,
          bytesUploaded,
          bytesTotal,
          progress
        });
        
        // Update progress state
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            progress,
            bytesUploaded,
            bytesTotal,
            status: 'uploading'
          }
        }));

        // Calculate and update total progress immediately
        const uploads = Array.from(uploadsRef.current.values());
        let totalUploaded = 0;
        let totalSize = 0;

        uploads.forEach(({ bytesUploaded, bytesTotal }) => {
          totalUploaded += bytesUploaded || 0;
          totalSize += bytesTotal || 0;
        });

        const totalProgressValue = totalSize > 0 ? Math.round((totalUploaded * 100) / totalSize) : 0;
        setTotalProgress(totalProgressValue);
        setUploadedBytes(totalUploaded);
        setTotalBytes(totalSize);

        // Calculate speed
        const now = Date.now();
        const timeDiff = (now - speedCalculatorRef.current.lastTime) / 1000;
        if (timeDiff > 0.5) { // Update speed every 500ms
          const bytesDiff = totalUploaded - speedCalculatorRef.current.lastBytes;
          const speed = bytesDiff / timeDiff;
          setUploadSpeed(speed);
          
          // Calculate time remaining
          if (speed > 0) {
            const remainingBytes = totalSize - totalUploaded;
            setTimeRemaining(remainingBytes / speed);
          }

          speedCalculatorRef.current.lastBytes = totalUploaded;
          speedCalculatorRef.current.lastTime = now;
        }

        // Report progress to parent
        onUploadProgress?.({
          progress: totalProgressValue,
          uploadedBytes: totalUploaded,
          totalBytes: totalSize,
          speed: uploadSpeed,
          timeRemaining
        });
      },

      onSuccess: async () => {
        console.log(`✅ TUS Upload Complete for: ${file.name}`);
        
        try {
          // Get the upload key from TUS URL
          const uploadKey = upload.url?.split('/').pop();
          
          if (!uploadKey) {
            throw new Error('No upload key received from TUS server');
          }

          console.log(`🔑 Creating file entry with upload key: ${uploadKey}`);
          
          // Create guest upload entry
          const response = await apiClient.post('guest/tus/entries', {
            uploadKey,
            upload_group_hash: guestUploadGroupHash,
            password: settings?.password,
            expires_in_hours: settings?.expiresInHours || 72,
            max_downloads: settings?.maxDownloads
          });

          console.log(`📝 File entry created:`, response.data);

          // Store group hash for subsequent uploads
          if (response.data.upload_group_hash) {
            setGuestUploadGroupHash(response.data.upload_group_hash);
          }

          setUploadProgress(prev => ({
            ...prev,
            [file.name]: {
              ...prev[file.name],
              status: 'completed',
              fileEntry: response.data.fileEntry
            }
          }));

          // Check if all files are completed
          const allUploads = Array.from(uploadsRef.current.values());
          const completedUploads = allUploads.filter(u => 
            uploadProgress[u.file.name]?.status === 'completed'
          );

          if (completedUploads.length === allUploads.length) {
            setUploadState('completed');
            console.log(`🎉 All uploads completed!`);
            onUploadComplete?.(response.data);
          }

        } catch (error) {
          console.error(`❌ Failed to create file entry for ${file.name}:`, error);
          
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: { 
              ...prev[file.name], 
              status: 'error', 
              error: 'Failed to create file entry' 
            }
          }));
          
          onUploadError?.(error, file);
        }
      }
    });

    return upload;
  }, [settings, guestUploadGroupHash, uploadProgress, onUploadComplete, onUploadError, onUploadProgress, uploadSpeed, timeRemaining]);

  // Start uploading all selected files
  const handleStartUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    console.log(`🚀 Starting TUS upload for ${selectedFiles.length} files`);
    
    setUploadState('uploading');
    setUploadProgress({});
    setTotalProgress(0);
    speedCalculatorRef.current = { lastBytes: 0, lastTime: Date.now() };

    onUploadStart?.({ files: selectedFiles, totalSize });

    // Create and start TUS uploads for all files
    for (const file of selectedFiles) {
      const upload = createTusUpload(file);
      uploadsRef.current.set(file.name, {
        upload,
        file,
        bytesUploaded: 0,
        bytesTotal: file.size,
        progress: 0
      });

      // Find previous uploads for resuming
      const previousUploads = await upload.findPreviousUploads();
      if (previousUploads.length) {
        console.log(`🔄 Resuming previous upload for: ${file.name}`);
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }

      upload.start();
    }
  }, [selectedFiles, totalSize, createTusUpload, onUploadStart]);

  // Pause all uploads
  const handlePauseUpload = useCallback(() => {
    console.log(`⏸️ Pausing all uploads`);
    
    uploadsRef.current.forEach(({ upload }) => {
      if (upload) {
        upload.abort(false); // Don't remove fingerprint to allow resume
      }
    });
    
    setUploadState('paused');
  }, []);

  // Resume all uploads
  const handleResumeUpload = useCallback(async () => {
    console.log(`▶️ Resuming all uploads`);
    
    setUploadState('uploading');

    for (const [fileName, { file }] of uploadsRef.current.entries()) {
      const upload = createTusUpload(file);
      
      // Find and resume previous upload
      const previousUploads = await upload.findPreviousUploads();
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      
      uploadsRef.current.set(fileName, {
        upload,
        file,
        bytesUploaded: 0,
        bytesTotal: file.size,
        progress: 0
      });
      
      upload.start();
    }
  }, [createTusUpload]);

  // Cancel all uploads
  const handleCancelUpload = useCallback(() => {
    console.log(`🛑 Cancelling all uploads`);
    
    uploadsRef.current.forEach(({ upload }) => {
      if (upload) {
        upload.abort(true); // Remove fingerprint
      }
    });
    
    uploadsRef.current.clear();
    setUploadState('idle');
    setUploadProgress({});
    setTotalProgress(0);
    setGuestUploadGroupHash(null);
    clearFiles();
  }, [clearFiles]);

  // Format time remaining
  const formatTime = useCallback((seconds) => {
    if (!seconds || seconds === Infinity) return '--';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  }, []);

  // Format speed
  const formatSpeed = useCallback((bytesPerSecond) => {
    if (!bytesPerSecond) return '--';
    return `${prettyBytes(bytesPerSecond)}/s`;
  }, []);

  const containerClasses = theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  const dropzoneClasses = isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400';
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';

  // Upload progress view
  if (uploadState === 'uploading' || uploadState === 'paused' || uploadState === 'completed') {
    return (
      <div className={`text-center py-8 ${containerClasses}`}>
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileUploadIcon className="w-10 h-10 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-semibold mb-4">
          {uploadState === 'uploading' && <Trans message="Uploading files..." />}
          {uploadState === 'paused' && <Trans message="Upload paused" />}
          {uploadState === 'completed' && <Trans message="Upload completed!" />}
        </h3>

        {/* Overall Progress */}
        <div className="max-w-md mx-auto mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{totalProgress}%</span>
            <span>{prettyBytes(uploadedBytes)} / {prettyBytes(totalBytes)}</span>
          </div>
          
          {uploadState === 'uploading' && (
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatSpeed(uploadSpeed)}</span>
              <span>{formatTime(timeRemaining)} remaining</span>
            </div>
          )}
        </div>

        {/* Individual File Progress */}
        <div className="max-w-lg mx-auto space-y-2 mb-6">
          {selectedFiles.map((file) => {
            const fileProgress = uploadProgress[file.name];
            const progress = fileProgress?.progress || 0;
            const status = fileProgress?.status || 'pending';
            
            return (
              <div key={file.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate font-medium">{file.name}</span>
                    <span className={`
                      ${status === 'completed' ? 'text-green-600' : ''}
                      ${status === 'error' ? 'text-red-600' : ''}
                      ${status === 'uploading' ? 'text-blue-600' : ''}
                    `}>
                      {status === 'completed' ? '✓' : 
                       status === 'error' ? '✗' : 
                       `${progress}%`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        status === 'completed' ? 'bg-green-500' :
                        status === 'error' ? 'bg-red-500' : 
                        'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 justify-center">
          {uploadState === 'uploading' && (
            <Button variant="outline" onClick={handlePauseUpload} startIcon={<PauseIcon />}>
              <Trans message="Pause" />
            </Button>
          )}
          
          {uploadState === 'paused' && (
            <Button variant="flat" color="primary" onClick={handleResumeUpload} startIcon={<PlayArrowIcon />}>
              <Trans message="Resume" />
            </Button>
          )}
          
          {uploadState !== 'completed' && (
            <Button variant="outline" color="danger" onClick={handleCancelUpload} startIcon={<StopIcon />}>
              <Trans message="Cancel" />
            </Button>
          )}

          {uploadState === 'completed' && (
            <Button variant="flat" color="primary" onClick={() => {
              setUploadState('idle');
              setUploadProgress({});
              setTotalProgress(0);
              clearFiles();
              setGuestUploadGroupHash(null);
            }}>
              <Trans message="Upload more files" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // File selection view
  return (
    <div className={`text-center ${containerClasses}`}>
      {selectedFiles.length === 0 ? (
        <div 
          className={`border-2 border-dashed rounded-2xl p-12 transition-colors ${dropzoneClasses}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AddIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            <Trans message="Click to upload or drag and drop" />
          </h3>
          <p className={`text-sm mb-6 ${textColor}`}>
            <Trans message="Large files supported with pause/resume" />
          </p>
          <Button 
            variant="flat" 
            color="primary" 
            size="lg" 
            onClick={handleFileSelect} 
            className="px-8"
          >
            <Trans message="Choose files" />
          </Button>
        </div>
      ) : (
        <div>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">
              <Trans message="Selected files" />
            </h3>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => (
                <FilePreview 
                  key={index} 
                  file={file} 
                  onRemove={() => removeFile(index)} 
                />
              ))}
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
            <Button 
              variant="flat" 
              color="primary" 
              onClick={handleStartUpload} 
              className="px-8"
              startIcon={<FileUploadIcon />}
            >
              <Trans message="Start upload" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
