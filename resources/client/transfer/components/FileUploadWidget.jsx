import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload } from 'tus-js-client';
import FileData from './FileData';
import { VscAdd } from "react-icons/vsc";

import Menu from '@app/components/Menu';
import { useFileDrop } from '@app/components/useFileDrop';
import { CiSettings } from 'react-icons/ci';
import { SettingsPanel } from './SettingsPanel';
import { FileSize } from '@app/components/FileSize';
import { apiClient } from '@common/http/query-client';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';

const TUS_CHUNK_SIZE = 512 * 1024; // 512KB chunks to reduce API calls
const TUS_RETRY_DELAYS = [0, 3000, 8000, 15000, 30000]; // Much longer delays for rate limiting

export function FileUploadWidget({
  settings,
  onUploadStart,
  onUploadComplete,
  onSettingsChange,
  onProgressUpdate,
  onSetUploadControls
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadState, setUploadState] = useState('idle'); // 'idle', 'uploading', 'completed', 'error'
  const [uploadProgress, setUploadProgress] = useState({});
  const [totalProgress, setTotalProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [guestUploadGroupHash, setGuestUploadGroupHash] = useState(null);
  
  const uploadsRef = useRef(new Map()); // Store TUS Upload instances
  const speedCalculatorRef = useRef({ lastBytes: 0, lastTime: Date.now() });
  
  console.log("TUS FileUploadWidget state:", {
    selectedFiles: selectedFiles.length,
    uploadState,
    totalProgress,
    uploadedBytes,
    totalBytes,
    hasProgressUpdate: !!onProgressUpdate
  });

  // Create TUS upload for a single file
  const createTusUpload = useCallback((file, isFirstFile = false, groupHash = null) => {
    console.log(`🚀 Creating TUS upload for: ${file.name} (${prettyBytes(file.size)}) - isFirstFile: ${isFirstFile}`);
    
    // First file doesn't send upload_group_hash (creates new group)
    // Subsequent files use the hash from the first file's response
    const uploadGroupHash = isFirstFile ? '' : (groupHash || guestUploadGroupHash || '');
    console.log(`🏷️ Using upload group hash: '${uploadGroupHash}' (empty means create new group)`);
    
    const tusFingerprint = `guest-tus-${file.name}-${file.size}-${Date.now()}`;
    
    const upload = new Upload(file, {
      fingerprint: () => Promise.resolve(tusFingerprint),
      endpoint: `${window.location.origin}/api/v1/tus/upload`,
      chunkSize: TUS_CHUNK_SIZE,
      retryDelays: TUS_RETRY_DELAYS,
      removeFingerprintOnSuccess: true,
      overridePatchMethod: true,
      
      metadata: {
        name: (() => {
          try {
            // Proper UTF-8 encoding for filenames with special characters
            const encoded = btoa(unescape(encodeURIComponent(file.name)));
            console.log(`📄 Encoded filename: ${file.name} → ${encoded}`);
            return encoded;
          } catch (e) {
            // Fallback for problematic characters
            const sanitized = file.name.replace(/[^\w\s.-]/g, '_');
            const fallback = btoa(sanitized);
            console.warn(`⚠️ Filename encoding failed, using fallback: ${file.name} → ${sanitized} → ${fallback}`);
            return fallback;
          }
        })(),
        clientName: file.name,
        clientExtension: file.name.split('.').pop() || '',
        clientMime: file.type || 'application/octet-stream',
        clientSize: file.size.toString(),
        // Guest upload settings  
        password: settings?.password || '',
        expires_in_hours: settings?.expiresInHours?.toString() || '72',
        max_downloads: settings?.maxDownloads?.toString() || '',
        upload_group_hash: uploadGroupHash,
      },

      onError: (error) => {
        console.error(`❌ TUS Upload Error for ${file.name}:`, error);
        
        // Handle different types of errors
        const statusCode = error.originalResponse?.getStatus();
        const isRateLimited = statusCode === 429;
        const isServerError = statusCode >= 500;
        const isNetworkError = !statusCode || statusCode === 0;
        const isRetryableError = isRateLimited || isServerError || isNetworkError;
        
        let errorMessage = 'Upload failed';
        if (isRateLimited) {
          errorMessage = 'Too many requests, retrying...';
        } else if (isServerError) {
          errorMessage = 'Server error, retrying...';
        } else if (isNetworkError) {
          errorMessage = 'Network error, retrying...';
        } else {
          errorMessage = error.message || 'Upload failed';
        }
        
        if (isRetryableError) {
          console.log(`⏱️ ${errorMessage} for ${file.name}, TUS will retry automatically`);
          
          const retryCount = (uploadProgress[file.name]?.retryCount || 0) + 1;
          
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: { 
              ...prev[file.name], 
              status: 'retrying', 
              error: errorMessage,
              retryCount: retryCount
            }
          }));
          
          // Send retry status to parent
          onProgressUpdate?.({
            progress: totalProgress,
            uploadedBytes: uploadedBytes,
            totalBytes: totalBytes,
            uploadSpeed: 0,
            timeRemaining: 0,
            status: 'retrying',
            error: `${errorMessage} (Attempt ${retryCount})`
          });
          
          // Keep upload state as uploading during retries
          setUploadState('uploading');
          console.log(`🔄 Retry attempt ${retryCount} for ${file.name}`);
          return; // Let TUS handle the retry
        }
        
        // Only set error state for non-retryable errors
        console.log(`💥 Non-retryable error for ${file.name}: ${errorMessage}`);
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { ...prev[file.name], status: 'error', error: errorMessage }
        }));
        
        // Send error status to parent
        onProgressUpdate?.({
          progress: totalProgress,
          uploadedBytes: uploadedBytes,
          totalBytes: totalBytes,
          uploadSpeed: 0,
          timeRemaining: 0,
          status: 'error',
          error: errorMessage
        });
        
        // Check if all uploads failed before setting global error state
        const currentUploads = Array.from(uploadsRef.current.values());
        const failedUploads = currentUploads.filter(u => 
          uploadProgress[u.file.name]?.status === 'error'
        );
        
        if (failedUploads.length === currentUploads.length) {
          setUploadState('error');
        }
      },

      onProgress: (bytesUploaded, bytesTotal) => {
        const progress = Math.round((bytesUploaded * 100) / bytesTotal);
        
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

        setUploadState('uploading');

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
        let currentSpeed = uploadSpeed; // Use existing speed as default
        let currentTimeRemaining = timeRemaining;
        
        if (timeDiff > 0.5) { // Update speed every 500ms
          const bytesDiff = totalUploaded - speedCalculatorRef.current.lastBytes;
          currentSpeed = bytesDiff / timeDiff;
          setUploadSpeed(currentSpeed);
          
          // Calculate time remaining
          if (currentSpeed > 0) {
            const remainingBytes = totalSize - totalUploaded;
            currentTimeRemaining = remainingBytes / currentSpeed;
            setTimeRemaining(currentTimeRemaining);
          }

          speedCalculatorRef.current.lastBytes = totalUploaded;
          speedCalculatorRef.current.lastTime = now;
        }
        
        // Send progress updates to parent
        if (onProgressUpdate) {
          onProgressUpdate({
            progress: totalProgressValue,
            uploadedBytes: totalUploaded,
            totalBytes: totalSize,
            uploadSpeed: currentSpeed,
            timeRemaining: currentTimeRemaining,
            status: 'uploading'
          });
        }
      },

      onSuccess: async () => {
        console.log(`✅ TUS Upload Complete for: ${file.name}`);
        
        // First, update the UI to show this file as "processing" (not stuck at uploading)
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: 'processing',
            progress: 100
          }
        }));
        
        // Send processing status to parent
        const currentUploads = Array.from(uploadsRef.current.values());
        const completedTusUploads = currentUploads.filter((_, index) => {
          const fileName = currentUploads[index].file.name;
          return uploadProgress[fileName]?.status === 'completed' || fileName === file.name;
        });
        
        const processingProgress = Math.round((completedTusUploads.length / currentUploads.length) * 95); // Cap at 95% until file entries are created
        
        onProgressUpdate?.({
          progress: processingProgress,
          uploadedBytes: uploadedBytes,
          totalBytes: totalBytes,
          uploadSpeed: 0,
          timeRemaining: 0,
          status: 'processing'
        });
        
        try {
          const uploadKey = upload.url?.split('/').pop();
          
          if (!uploadKey) {
            throw new Error('No upload key received from TUS server');
          }

          console.log(`🔑 Creating file entry with upload key: ${uploadKey}`);
          
          // Use the group hash that was passed to createTusUpload, or null for first file
          const useGroupHash = groupHash || guestUploadGroupHash;
          console.log(`📋 Using upload group hash:`, useGroupHash);
          
          const requestPayload = {
            uploadKey,
            upload_group_hash: useGroupHash,
            password: settings?.password,
            expires_in_hours: settings?.expiresInHours || 72,
            max_downloads: settings?.maxDownloads
          };
          
          console.log(`📤 Sending file entry request:`, requestPayload);
          
          // Add timeout to the API call - longer for large files
          const controller = new AbortController();
          const fileSize = file.size || 0;
          const timeoutDuration = Math.max(120000, fileSize / (1024 * 1024) * 5000); // At least 2 minutes, or 5 seconds per MB
          console.log(`⏱️ Setting timeout to ${timeoutDuration/1000}s for ${file.name} (${prettyBytes(fileSize)})`);
          
          const timeoutId = setTimeout(() => {
            console.warn(`⏰ File entry creation timeout after ${timeoutDuration/1000}s for ${file.name}`);
            controller.abort();
          }, timeoutDuration);
          
          const response = await apiClient.post('guest/tus/entries', requestPayload, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          console.log(`📝 File entry created:`, response.data);
          
          // Store the upload group hash for subsequent files to use
          if (response.data.upload_group_hash) {
            setGuestUploadGroupHash(response.data.upload_group_hash);
            console.log(`🚀 Stored upload group hash for subsequent files: ${response.data.upload_group_hash}`);
            
            // Start remaining uploads now that we have the group hash
            if (window.pendingUploads && window.pendingUploads.length > 0) {
              console.log(`🎬 Starting ${window.pendingUploads.length} remaining uploads with group hash`);
              
              const startUpload = async (file, index) => {
                console.log(`📤 Creating new upload for ${file.name} with group hash: ${response.data.upload_group_hash}`);
                
                // Create new upload with the correct group hash - pass it directly
                const newUpload = createTusUpload(file, false, response.data.upload_group_hash);
                
                // Update the uploads ref
                uploadsRef.current.set(file.name, {
                  upload: newUpload,
                  file,
                  bytesUploaded: 0,
                  bytesTotal: file.size,
                  progress: 0
                });
                
                try {
                  const previousUploads = await newUpload.findPreviousUploads();
                  if (previousUploads.length) {
                    console.log(`🔄 Resuming previous upload for: ${file.name}`);
                    newUpload.resumeFromPreviousUpload(previousUploads[0]);
                  }
                  newUpload.start();
                } catch (error) {
                  console.warn(`⚠️ Could not check for previous uploads for ${file.name}:`, error);
                  newUpload.start();
                }
              };
              
              // Start remaining uploads with small delays
              window.pendingUploads.forEach(({ file }, index) => {
                setTimeout(() => {
                  console.log(`🎬 Starting upload ${index + 2}: ${file.name}`);
                  startUpload(file, index);
                }, index * 200); // 200ms delay between starts
              });
              
              // Clear the pending uploads
              window.pendingUploads = null;
            }
          }

          // Update progress state for this file
          const actualFileEntry = response.data.fileEntry.fileEntry || response.data.fileEntry;
          
          // Update progress state
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: {
              ...prev[file.name],
              status: 'completed',
              fileEntry: actualFileEntry
            }
          }));
          
          // Create file entry with share URL
          const shareHash = guestUploadGroupHash || response.data.upload_group_hash;
          
          const fileEntry = {
            id: actualFileEntry.id,
            name: actualFileEntry.name !== 'unknown' ? actualFileEntry.name : file.name,
            file_name: actualFileEntry.file_name,
            mime: actualFileEntry.mime,
            file_size: actualFileEntry.file_size,
            extension: actualFileEntry.extension,
            share_url: `${window.location.origin}/share/${shareHash}`,
            download_url: `${window.location.origin}/download/${shareHash}/${actualFileEntry.id}`
          };
          
          // Store completed files in global array for multi-file support
          if (!window.completedUploadFiles) {
            window.completedUploadFiles = [];
          }
          window.completedUploadFiles.push(fileEntry);
          
          // Check if all files are completed
          const allUploads = Array.from(uploadsRef.current.values());
          const completedCount = Object.values(uploadProgress).filter(p => p.status === 'completed').length + 1; // +1 for current file
          const totalCount = allUploads.length;
          
          if (completedCount === totalCount) {
            // All files completed - mark upload as complete
            setUploadState('completed');
            console.log(`🎉 All ${totalCount} TUS uploads completed!`);
            
            // Send final progress update with success status
            onProgressUpdate?.({
              progress: 100,
              uploadedBytes: totalBytes,
              totalBytes: totalBytes,
              uploadSpeed: 0,
              timeRemaining: 0,
              status: 'success'
            });
            
            // Call onUploadComplete to trigger the success flow
            setTimeout(() => {
              onUploadComplete?.(window.completedUploadFiles);
            }, 100);
          } else {
            // Still more files to upload - update progress but don't complete
            const overallProgress = Math.round((completedCount / totalCount) * 100);
            onProgressUpdate?.({
              progress: overallProgress,
              uploadedBytes: window.completedUploadFiles.reduce((sum, f) => sum + f.file_size, 0),
              totalBytes: totalBytes,
              uploadSpeed: uploadSpeed,
              timeRemaining: timeRemaining,
              status: 'uploading'
            });
          }

        } catch (error) {
          console.error(`❌ Failed to create file entry for ${file.name}:`, error);
          
          let errorMessage = 'Failed to create file entry';
          let shouldRetry = false;
          
          if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
            const fileSize = file.size || 0;
            const timeoutDuration = Math.max(120000, fileSize / (1024 * 1024) * 5000);
            errorMessage = `File processing timed out after ${Math.round(timeoutDuration/1000)}s. This can happen with large files or slow servers.`;
            shouldRetry = true;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: { 
              ...prev[file.name], 
              status: 'error', 
              error: errorMessage,
              progress: 100, // Keep progress at 100 since TUS upload succeeded
              canRetry: shouldRetry
            }
          }));
          
          // Check if this was the only file or if other files succeeded
          const currentUploads = Array.from(uploadsRef.current.values());
          const failedUploads = Object.values(uploadProgress).filter(p => p.status === 'error').length + 1;
          
          if (failedUploads === currentUploads.length) {
            // All uploads failed - show global error
            const finalErrorMessage = shouldRetry 
              ? `${errorMessage} You can try uploading again.`
              : errorMessage;
              
            onProgressUpdate?.({
              progress: 100,
              uploadedBytes: uploadedBytes,
              totalBytes: totalBytes,
              uploadSpeed: 0,
              timeRemaining: 0,
              status: 'error',
              error: finalErrorMessage
            });
            setUploadState('error');
          } else {
            // Some files may have succeeded - let other files continue
            console.log(`⚠️ File entry creation failed for ${file.name}, but continuing with other files`);
          }
        }
      }
    });

    return upload;
  }, [settings, uploadProgress, onProgressUpdate, onUploadComplete, uploadSpeed, timeRemaining]);

  // Form data state - moved up to avoid temporal dead zone
  const [data, setData] = useState({
    email: "",
    name: "",
    message: ""
  });

  function formatExpiryTime(hours) {
    // Calculate the expiry date by adding hours to current date
    const currentDate = new Date();
    const expiryDate = new Date(currentDate.getTime() + (hours * 60 * 60 * 1000));
    
    // Format the date as MM/DD/YYYY
    const formattedDate = expiryDate.toLocaleDateString('en-US');
    
    return `Expires on ${formattedDate}`;
  }


  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    console.log(`🚀 Starting TUS upload for ${selectedFiles.length} files`);
    
    const allFiles = selectedFiles.flatMap(item => item.files ? item.files : item);
    console.log('📋 File breakdown:', {
      selectedFiles: selectedFiles.length,
      allFiles: allFiles.length,
      fileDetails: allFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
      totalFiles: allFiles.length
    });
    
    const totalSize = allFiles.reduce((total, file) => total + file.size, 0);
    console.log(`📊 Total size calculation: ${prettyBytes(totalSize)} from ${allFiles.length} files`);
    
    // Verify the calculation
    const individualSizes = allFiles.map(f => f.size);
    const recalculatedTotal = individualSizes.reduce((sum, size) => sum + size, 0);
    if (totalSize !== recalculatedTotal) {
      console.error('🚨 Size calculation mismatch!', {
        original: totalSize,
        recalculated: recalculatedTotal,
        files: allFiles.length
      });
    }
    const maxFileSize = 3 * 1024 * 1024 * 1024; // 3GB in bytes
    const maxTotalSize = 5 * 1024 * 1024 * 1024; // 5GB total limit
    
    // Clear any existing group hash - first file will create the group
    setGuestUploadGroupHash(null);
    console.log(`🚀 Starting fresh multi-file upload`);
    
    // Validate individual file sizes
    const oversizedFiles = allFiles.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      const errorMessage = `File(s) too large: ${fileNames}. Maximum file size is 3GB.`;
      console.error(`❌ ${errorMessage}`);
      
      onProgressUpdate?.({
        progress: 0,
        uploadedBytes: 0,
        totalBytes: totalSize,
        uploadSpeed: 0,
        timeRemaining: 0,
        status: 'error',
        error: errorMessage
      });
      return;
    }
    
    // Validate total size
    if (totalSize > maxTotalSize) {
      const errorMessage = `Total upload size too large: ${prettyBytes(totalSize)}. Maximum total size is 5GB.`;
      console.error(`❌ ${errorMessage}`);
      
      onProgressUpdate?.({
        progress: 0,
        uploadedBytes: 0,
        totalBytes: totalSize,
        uploadSpeed: 0,
        timeRemaining: 0,
        status: 'error',
        error: errorMessage
      });
      return;
    }
    
    setUploadState('uploading');
    setUploadProgress({});
    setTotalProgress(0);
    speedCalculatorRef.current = { lastBytes: 0, lastTime: Date.now() };
    setTotalBytes(totalSize);

    // Notify parent immediately that upload started so it can switch to progress view
    onUploadStart?.({
      files: allFiles,
      totalSize,
      settings,
      formData: data
    });
    
    // Send initial progress update immediately
    onProgressUpdate?.({
      progress: 0,
      uploadedBytes: 0,
      totalBytes: totalSize,
      uploadSpeed: 0,
      timeRemaining: 0,
      status: 'uploading'
    });

    // Create TUS upload only for the first file
    // Others will be created after we get the group hash
    const firstFile = allFiles[0];
    
    // Create and start the first file upload immediately
    const firstUpload = createTusUpload(firstFile, true);
    uploadsRef.current.set(firstFile.name, {
      upload: firstUpload,
      file: firstFile,
      bytesUploaded: 0,
      bytesTotal: firstFile.size,
      progress: 0
    });
    
    console.log(`🥇 Starting first file: ${firstFile.name}`);
    
    // Start first file
    const startUpload = async (upload, file) => {
      try {
        const previousUploads = await upload.findPreviousUploads();
        if (previousUploads.length) {
          console.log(`🔄 Resuming previous upload for: ${file.name}`);
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      } catch (error) {
        console.warn(`⚠️ Could not check for previous uploads for ${file.name}:`, error);
        upload.start();
      }
    };
    
    startUpload(firstUpload, firstFile);
    
    // Store remaining files (not uploads) to process after first completes
    if (allFiles.length > 1) {
      window.pendingUploads = allFiles.slice(1).map(file => ({ file }));
      console.log(`⏳ ${window.pendingUploads.length} files waiting for group hash`);
    }
  }, [selectedFiles, settings, createTusUpload]);

  // Pause all uploads
  const handlePauseUpload = useCallback(() => {
    console.log(`⏸️ Pausing all uploads`);
    
    uploadsRef.current.forEach(({ upload }) => {
      if (upload) {
        upload.abort(false); // Don't remove fingerprint to allow resume
      }
    });
    
    setUploadState('paused');
    
    // Send paused status to parent
    onProgressUpdate?.({
      progress: totalProgress,
      uploadedBytes: uploadedBytes,
      totalBytes: totalBytes,
      uploadSpeed: 0,
      timeRemaining: 0,
      status: 'paused'
    });
  }, [onProgressUpdate, totalProgress, uploadedBytes, totalBytes]);

  // Resume all uploads
  const handleResumeUpload = useCallback(async () => {
    console.log(`▶️ Resuming all uploads`);
    
    setUploadState('uploading');
    
    // Send uploading status to parent
    onProgressUpdate?.({
      progress: totalProgress,
      uploadedBytes: uploadedBytes,
      totalBytes: totalBytes,
      uploadSpeed: 0,
      timeRemaining: 0,
      status: 'uploading'
    });

    for (const [fileName, { file }] of uploadsRef.current.entries()) {
      const upload = createTusUpload(file, guestUploadGroupHash);
      
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
  }, [createTusUpload, onProgressUpdate, totalProgress, uploadedBytes, totalBytes]);

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
    setUploadedBytes(0);
    setTotalBytes(0);
    setGuestUploadGroupHash(null);
    
    // Send cancelled status to parent
    onProgressUpdate?.({
      progress: 0,
      uploadedBytes: 0,
      totalBytes: 0,
      uploadSpeed: 0,
      timeRemaining: 0,
      status: 'cancelled'
    });
  }, [onProgressUpdate]);
  
  // Format time remaining
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


  const [showSettings, setShowSettings] = useState(false);
  const handleSettingsClick = () => {
    setShowSettings(true);
  };
  const handleModalClose = () => {
    setShowSettings(false);
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleChange = (e) => {
    setData((prevalue) => {
      return {
        ...prevalue,
        [e.target.name]: e.target.value
      }
    })
  }



  const addInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFilesSelected = (files) => {
    if (!files || files.length === 0) {
      console.log('❌ No files selected');
      return;
    }
    
    console.log('📁 Files selected:', files.length, files);
    const arr = Array.from(files);

    const folderMap = {};
    const individualFiles = [];

    arr.forEach((file) => {
      if (file.webkitRelativePath) {
        const pathParts = file.webkitRelativePath.split('/');
        const folderName = pathParts.length > 1 ? pathParts[0] : "Root";
        if (!folderMap[folderName]) folderMap[folderName] = [];
        folderMap[folderName].push(file);
      } else {
        // Individual file
        individualFiles.push(file);
      }
    });

    // Convert folderMap to array
    const groupedFolders = Object.keys(folderMap).map((folderName) => ({
      folderName,
      files: folderMap[folderName],
    }));

    // Combine individual files and folders
    const newFiles = [...individualFiles, ...groupedFolders];
    console.log('➕ Adding files to state:', newFiles);
    setSelectedFiles((prev) => {
      const updated = [...prev, ...newFiles];
      console.log('📋 Updated selectedFiles:', updated);
      return updated;
    });
  };

  const handleDropAction = (newItems) => {
    setSelectedFiles((prev) => [...prev, ...newItems]);
    // setStep(2);
  };
  const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useFileDrop(handleDropAction);
  const [activeTab, setActiveTab] = useState('Link');

  const allFiles = selectedFiles.flatMap(item => item.files ? item.files : item);
  const totalSizeAll = allFiles.reduce((acc, f) => acc + (f.size || 0), 0);

  // Expose control methods to parent component
  useEffect(() => {
    if (onSetUploadControls) {
      onSetUploadControls({
        handlePauseUpload,
        handleResumeUpload,
        handleCancelUpload
      });
    }
  }, [onSetUploadControls, handlePauseUpload, handleResumeUpload, handleCancelUpload]);

  return <div className="text-center">
    {selectedFiles.length === 0 ?
      <div
        className={` center-align flex-col h-[60vh] max-h-[500px] rounded-[15px] transition
                ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="column-center text-center p-12">
          <input
            type="file"
            multiple
            ref={addInputRef}
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <input
            type="file"
            webkitdirectory=""
            multiple
            ref={folderInputRef}
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <label
            onClick={() => addInputRef.current.click()}
            className="btn-border rounded-[30px] p-4 mb-6 cursor-pointer inline-block"
          >
            <VscAdd size={56} />
          </label>


          <p className="para mt-[10px]">Let us begin by adding some files</p>
          <p
            onClick={() => folderInputRef.current.click()}
            className="transefer mt-1 inline-block cursor-pointer"
          >
            Or select folder
          </p>
        </div>
      </div>
      :
      <div>
        <div className=" overflow-hidden relative ">
          <div className='p-[20px] md:p-[30px]'>
            <div className="between-align">
              <div>
                <h2 className="heading-md mb-1 !text-left">{selectedFiles?.length} items</h2>
                <p className="para !text-[#999999]">{FileSize(selectedFiles.size || totalSizeAll)} out of 100 GB</p>
              </div>
              <div className="btn-border border-[3px] !bg-[#fff]  rounded-[16px] flex items-center justify-center p-2 py-[9px] cursor-pointer" onClick={toggleMenu}>
                <VscAdd size={24} color='#08cf65' />
              </div>
            </div>
            {isMenuOpen && <Menu setSelectedFiles={setSelectedFiles} toggleMenu={toggleMenu} />}
            <div className="flex space-x-8 border-b border-[#0002] border-b-[2px]   mt-3">
              <div
                className="column-center cursor-pointer mb-[-2px]"
                onClick={() => setActiveTab('Link')}
              >
                <span className={`text-lg p-1 font-medium transition-colors duration-200 ${activeTab === 'Link' ? 'text-[#08CF65] border-b-[2px] border-[#08CF65]' : 'text-[#999999]'}`}
                >
                  Link
                </span>
              </div>
              <div
                className="column-center cursor-pointer mb-[-2px]"
                onClick={() => setActiveTab('Email')}
              >
                <span
                  className={`text-lg p-1 font-medium transition-colors duration-200 ${activeTab === 'Email' ? 'text-[#08CF65] border-b-[2px] border-[#08CF65]' : 'text-[#999999]'
                    }`} >
                  Email
                </span>
              </div>
            </div>
            <FileData selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
            {activeTab === "Email" && (
              <>
                <input
                  type="email"
                  name='email'
                  value={data?.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="input"
                />
              </>
            )}
            <input
              type="text"
              placeholder="Title"
              className="input"
              name='name'
              value={data?.name}
              onChange={handleChange}
            />
            <textarea
              rows={3}
              placeholder="Message"
              className="textarea"
              name='message'
              value={data?.message}
              onChange={handleChange}
            />
            {/* Progress display removed - now handled by TransferProgress component */}
            
            <div className='between-align pt-[20px] gap-5 md:gap-0'>
              <div className='flex items-center space-x-1 cursor-pointer hover:opacity-75 transition-opacity' onClick={handleSettingsClick}>
                <CiSettings size={28} className="text-black" />
                <div>
                  <h6 className="heading !font-[700] ps-0 text-start text-sm">
                    {formatExpiryTime(settings.expiresInHours)}
                  </h6>
                  <p className="normal-para text-start text-sm ">
                    {settings.password ? "Password protected" : "No password added"}
                  </p>
                </div>
              </div>
              
              {/* Upload Control - Only show Create Transfer button */}
              <div className="flex gap-2">
                <button 
                  className="button-sm md:button-md" 
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0}
                >
                  Create Transfer
                </button>
              </div>
            </div>
          </div>
          {showSettings && (
            <SettingsPanel
              settings={settings}
              onSettingsChange={onSettingsChange}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>}
  </div>;
}