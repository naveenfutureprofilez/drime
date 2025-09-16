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

const TUS_CHUNK_SIZE = 8 * 1024 * 1024; // 8MB chunks - LARGER to reduce number of requests
const TUS_RETRY_DELAYS = [0, 2000, 8000, 20000, 45000]; // Reasonable retry delays
const MANUAL_RETRY_DELAYS = [5000, 15000, 30000, 60000, 120000]; // Manual retry delays
const CHUNK_DELAY = 100; // 100ms delay between chunks

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
  const [errorMessage, setErrorMessage] = useState(''); // For inline error messages
  
  const uploadsRef = useRef(new Map()); // Store TUS Upload instances
  const speedCalculatorRef = useRef({ lastBytes: 0, lastTime: Date.now() });
  

  // Create TUS upload for a single file
  const createTusUpload = useCallback((file, isFirstFile = false, groupHash = null, totalFilesCount = 1, formData = null) => {
    console.log(`🚀 Creating upload for: ${file.name} (${prettyBytes(file.size)}) - ${isFirstFile ? 'FIRST' : 'SUBSEQUENT'} file`);
    console.log('📧 Form data received in createTusUpload:', formData);
    
    // First file doesn't send upload_group_hash (creates new group)
    // Subsequent files use the hash from the first file's response
    const uploadGroupHash = isFirstFile ? '' : (groupHash || guestUploadGroupHash || '');
    
    const tusFingerprint = `guest-tus-${file.name}-${file.size}-${Date.now()}`;
    
    console.log(`🔧 TUS Upload Config for ${file.name}:`, {
      endpoint: `${window.location.origin}/api/v1/tus/upload`,
      chunkSize: TUS_CHUNK_SIZE,
      retryDelays: TUS_RETRY_DELAYS,
      fileSize: file.size,
      chunkStrategy: '8MB chunks (fewer requests to prevent rate limiting)',
      estimatedChunks: Math.ceil(file.size / TUS_CHUNK_SIZE),
      rateLimitPrevention: 'Larger chunks + reasonable delays'
    });
    
    const upload = new Upload(file, {
      fingerprint: () => Promise.resolve(tusFingerprint),
      endpoint: `${window.location.origin}/api/v1/tus/upload`,
      chunkSize: TUS_CHUNK_SIZE,
      retryDelays: TUS_RETRY_DELAYS,
      removeFingerprintOnSuccess: true,
      overridePatchMethod: true,
      
      // Add upload throttling to prevent rate limiting
      uploadDataDuringCreation: false, // Don't upload data immediately
      chunkSize: TUS_CHUNK_SIZE,
      
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
        // Form data fields
        sender_email: formData?.email || '',
        sender_name: formData?.name || '',
        message: formData?.message || '',
      },
      
      onError: (error) => {
        console.log('🔧 TUS Metadata being sent:', {
          sender_email: formData?.email || '',
          sender_name: formData?.name || '',
          message: formData?.message || '',
        });
        const statusCode = error.originalResponse?.getStatus();
        
        // Check if this is a manual pause - don't treat as error
        if (window.uploadsPaused || upload._manuallyPaused) {
          console.log(`⏸️ Upload manually paused for ${file.name}, ignoring error`);
          return; // Don't process as error when manually paused
        }
        
        console.error(`❌ Upload Error for ${file.name}:`, {
          statusCode,
          message: error.message,
          originalResponse: error.originalResponse?.getBody(),
          isRetryable: statusCode === 429 || statusCode >= 500 || !statusCode
        });
        
        // Handle different types of errors
        const isRateLimited = statusCode === 429;
        const isServerError = statusCode >= 500;
        const isNetworkError = !statusCode || statusCode === 0;
        const isRetryableError = isRateLimited || isServerError || isNetworkError;
        
        let errorMessage = 'Upload failed';
        if (isRateLimited) {
          errorMessage = 'Rate limited - server is busy, retrying with longer delays...';
          console.warn(`🚦 Rate limiting (429) detected for ${file.name}`);
          console.warn(`   Server response: Too Many Requests`);
          console.warn(`   TUS will auto-retry with exponential backoff: ${TUS_RETRY_DELAYS.map(d => d/1000 + 's').join(', ')}`);
        } else if (isServerError) {
          errorMessage = 'Server error, retrying...';
        } else if (isNetworkError) {
          errorMessage = 'Network error, retrying...';
        } else {
          errorMessage = error.message || 'Upload failed';
        }
        
        if (isRetryableError) {
          const retryCount = (uploadProgress[file.name]?.retryCount || 0) + 1;
          const maxTusRetries = TUS_RETRY_DELAYS.length;
          
          console.log(`🔄 [Retry ${retryCount}/${maxTusRetries}] ${errorMessage} for ${file.name}`);
          
          // Track rate limiting globally to slow down other uploads
          if (isRateLimited) {
            window.rateLimitDetected = true;
            window.rateLimitTimestamp = Date.now();
            console.warn(`⚠️ Global rate limit flag set - future uploads will use longer delays`);
            
            // Check if TUS retries are exhausted and we need manual intervention
            if (retryCount >= maxTusRetries) {
              console.error(`🚨 TUS retries exhausted for ${file.name} - implementing manual retry`);
              
              // Store upload state for manual retry
              if (!window.manualRetryUploads) {
                window.manualRetryUploads = new Map();
              }
              
              const currentUploadRef = uploadsRef.current.get(file.name);
              window.manualRetryUploads.set(file.name, {
                file,
                bytesUploaded: currentUploadRef?.bytesUploaded || 0,
                progress: currentUploadRef?.progress || 0,
                manualRetryCount: (window.manualRetryUploads.get(file.name)?.manualRetryCount || 0) + 1
              });
              
              const manualRetryCount = window.manualRetryUploads.get(file.name).manualRetryCount;
              const maxManualRetries = MANUAL_RETRY_DELAYS.length;
              
              if (manualRetryCount <= maxManualRetries) {
                const delayIndex = Math.min(manualRetryCount - 1, maxManualRetries - 1);
                const delay = MANUAL_RETRY_DELAYS[delayIndex];
                
                console.warn(`🔄 Manual retry ${manualRetryCount}/${maxManualRetries} for ${file.name} in ${delay/1000}s`);
                
                // Set status to manual retry
                setUploadProgress(prev => ({
                  ...prev,
                  [file.name]: {
                    ...prev[file.name],
                    status: 'retrying',
                    error: `Manual retry ${manualRetryCount}/${maxManualRetries} - waiting ${delay/1000}s`,
                    retryCount: retryCount,
                    progress: currentUploadRef?.progress || 0,
                    bytesUploaded: currentUploadRef?.bytesUploaded || 0
                  }
                }));
                
                // Schedule manual retry
                setTimeout(() => {
                  console.log(`🔄 Starting manual retry ${manualRetryCount} for ${file.name}`);
                  manualRetryUpload(file, currentUploadRef?.bytesUploaded || 0);
                }, delay);
                
                return; // Don't let TUS handle this - we'll do it manually
              } else {
                console.error(`🚨 All manual retries exhausted for ${file.name} - giving up`);
                // Fall through to set final error state
              }
            } else {
              // For severe rate limiting (multiple retries), increase delays
              if (retryCount >= 2) {
                console.warn(`🚨 Multiple rate limit retries (${retryCount}) - server heavily loaded`);
              }
            }
          }
          
          // Preserve current upload progress during retries
          const currentUploadRef = uploadsRef.current.get(file.name);
          const currentBytes = currentUploadRef?.bytesUploaded || 0;
          const currentProgress = currentUploadRef?.progress || 0;
          
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: { 
              ...prev[file.name], 
              status: 'retrying', 
              error: errorMessage,
              retryCount: retryCount,
              // ✅ Preserve current progress during retry
              progress: currentProgress,
              bytesUploaded: currentBytes
            }
          }));
          
          // Calculate current total progress to maintain accurate UI
          const allUploads = Array.from(uploadsRef.current.values());
          const completedFiles = window.completedUploadFiles?.length || 0;
          const completedBytes = window.completedUploadFiles?.reduce((sum, f) => sum + f.file_size, 0) || 0;
          const activeBytes = allUploads.reduce((sum, u) => sum + (u.bytesUploaded || 0), 0);
          const totalBytesAll = window.totalBytesToUpload || 0;
          const currentTotalUploaded = completedBytes + activeBytes;
          const currentOverallProgress = totalBytesAll > 0 ? Math.round((currentTotalUploaded * 100) / totalBytesAll) : 0;
          
          console.log(`📊 Retry progress: ${currentOverallProgress}% (${prettyBytes(currentTotalUploaded)}/${prettyBytes(totalBytesAll)})`);
          
          // Send retry status to parent with accurate progress
          onProgressUpdate?.({
            progress: currentOverallProgress,
            uploadedBytes: currentTotalUploaded, // ✅ Use calculated bytes, not stale state
            totalBytes: totalBytesAll,
            uploadSpeed: 0,
            timeRemaining: 0,
            status: 'retrying',
            error: `${errorMessage} (Attempt ${retryCount}/${TUS_RETRY_DELAYS.length})`
          });
          
          // Keep upload state as uploading during retries
          setUploadState('uploading');
          
          // Log the retry delay that TUS will use
          const retryDelayIndex = Math.min(retryCount - 1, TUS_RETRY_DELAYS.length - 1);
          const delayMs = TUS_RETRY_DELAYS[retryDelayIndex];
          console.log(`⏳ TUS will retry in ${delayMs/1000}s (delay ${retryDelayIndex + 1}/${TUS_RETRY_DELAYS.length})`);
          
          return; // Let TUS handle the retry with its built-in backoff
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
          totalBytes: window.totalBytesToUpload || 0,
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
        const now = Date.now();
        
        // Get the current upload state to see if this is a resumed upload
        const currentUpload = uploadsRef.current.get(file.name);
        
        // Check if we should throttle uploads based on recent rate limiting
        const rateLimitRecent = window.rateLimitDetected && 
          (now - (window.rateLimitTimestamp || 0)) < 120000; // 2 minutes
          
        if (rateLimitRecent) {
          // Slow down progress updates when rate limited recently
          const lastProgressTime = currentUpload?.lastProgressTime || 0;
          if (now - lastProgressTime < 1000) { // Only update progress every 1 second when rate limited
            return;
          }
        }
        const resumeOffset = currentUpload?.resumeOffset || 0;
        
        // For resumed uploads that couldn't use TUS resume, add the offset
        const actualBytesUploaded = bytesUploaded + resumeOffset;
        const progress = Math.round((actualBytesUploaded * 100) / bytesTotal);
        
        // For resumed uploads, ensure we never go backwards in progress
        const lastProgress = currentUpload?.progress || 0;
        const adjustedProgress = Math.max(progress, lastProgress);
        
        // For resumed uploads, bytesUploaded from TUS represents total bytes uploaded so far
        // including any previously uploaded chunks when TUS can resume properly
        
        // Detect stalled uploads (no progress for 30 seconds)
        const lastProgressTime = parseInt(localStorage.getItem(`lastProgressTime_${file.name}`) || now);
        const lastBytes = parseInt(localStorage.getItem(`lastBytes_${file.name}`) || '0');
        
        if (bytesUploaded > lastBytes) {
          // Progress made - update tracking
          localStorage.setItem(`lastProgressTime_${file.name}`, now.toString());
          localStorage.setItem(`lastBytes_${file.name}`, bytesUploaded.toString());
        } else if (now - lastProgressTime > 30000) {
          // No progress for 30 seconds - upload might be stalled
          console.warn(`⚠️ Upload stalled for ${file.name} - no progress for 30s`);
          console.warn(`   Current: ${prettyBytes(bytesUploaded)}, Last: ${prettyBytes(lastBytes)}`);
        }
        
        // Log only significant file progress changes
        const lastFileProgress = parseInt(localStorage.getItem(`fileProgress_${file.name}`) || '0');
        if (Math.abs(adjustedProgress - lastFileProgress) >= 10 || adjustedProgress === 0 || adjustedProgress === 100) {
          console.log(`📡 ${file.name}: ${adjustedProgress}% (${prettyBytes(actualBytesUploaded)}/${prettyBytes(bytesTotal)})`);
          localStorage.setItem(`fileProgress_${file.name}`, adjustedProgress.toString());
        }
        
        // Update the uploads ref first
        uploadsRef.current.set(file.name, {
          upload,
          file,
          bytesUploaded: actualBytesUploaded,
          bytesTotal,
          progress: adjustedProgress,
          resumeOffset, // Store the resume offset for future reference
          lastProgressTime: now // Track when progress was last updated for throttling
        });
        
        // Update progress state
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            progress: adjustedProgress,
            bytesUploaded: actualBytesUploaded,
            bytesTotal,
            status: 'uploading'
          }
        }));

        setUploadState('uploading');

        // Temporarily disable rate limiting to debug progress circle
        // const progressKey = `progressCalc_${file.name}`;
        // const lastCalcTime = parseInt(localStorage.getItem(progressKey) || '0');
        // const calcNow = Date.now();
        // 
        // // Only calculate progress at most once every 500ms per file
        // if (calcNow - lastCalcTime < 500) {
        //   return; // Skip this calculation to prevent spam
        // }
        // localStorage.setItem(progressKey, calcNow.toString());
        
        // Calculate overall progress for ALL files
        const allFiles = selectedFiles.flatMap(item => item.files ? item.files : item);
        const uploads = Array.from(uploadsRef.current.values());
        
        // Calculate bytes for currently uploading files (exclude completed ones)
        let currentUploadedBytes = 0;
        const completedFileNames = window.completedUploadFiles ? window.completedUploadFiles.map(f => f.name) : [];
        
        uploads.forEach(({ file: uploadFile, bytesUploaded: uploadBytesUploaded }) => {
          // Only count bytes from files that are still uploading (not completed)
          if (!completedFileNames.includes(uploadFile.name)) {
            // For the current file being processed in this onProgress callback
            if (uploadFile.name === file.name) {
              // Use raw bytesUploaded to avoid double-counting resume offset
              currentUploadedBytes += bytesUploaded || 0;
            } else {
              // For other active files, use their stored progress (which may include resume offset)
              currentUploadedBytes += uploadBytesUploaded || 0;
            }
          }
        });
        
        // Add completed files bytes
        let completedBytes = 0;
        if (window.completedUploadFiles && window.completedUploadFiles.length > 0) {
          completedBytes = window.completedUploadFiles.reduce((sum, f) => sum + (f.file_size || 0), 0);
        }
        
        // ✅ FIX: Only add resume offset for the current file being processed, not the total
        // Resume offset should only be added to currentUploadedBytes calculation, not to total
        const totalUploaded = completedBytes + currentUploadedBytes;
        // Use the globally stored totalBytes from handleUpload
        const totalSize = window.totalBytesToUpload || 0; // This was set in handleUpload
        
        // Safety check: ensure totalSize is valid
        if (totalSize === 0) {
          console.warn(`⚠️ window.totalBytesToUpload is 0 or undefined - progress will show 0%`);
          console.warn(`   This usually means handleUpload hasn't stored the total size yet`);
        }
        
        // Debug: Show which files are being counted (less frequently)
        const activeUploads = uploads.map(u => u.file.name).filter(name => !completedFileNames.includes(name));
        console.log(`📊 Bytes calculation (FIXED):`);
        console.log(`   Completed files (${completedFileNames.length}): ${completedFileNames.join(', ')} = ${prettyBytes(completedBytes)}`);
        console.log(`   Active uploads (${activeUploads.length}): ${activeUploads.join(', ')} = ${prettyBytes(currentUploadedBytes)}`);
        console.log(`   Total: ${prettyBytes(totalUploaded)} / ${prettyBytes(totalSize)} (${((totalUploaded * 100) / totalSize).toFixed(1)}%)`);
        
        // Safety check: uploaded bytes should never exceed total size
        if (totalUploaded > totalSize && totalSize > 0) {
          console.error(`🚨 BUG STILL EXISTS: uploadedBytes (${prettyBytes(totalUploaded)}) > totalSize (${prettyBytes(totalSize)})`);
          console.error(`   This suggests double-counting of completed files!`);
          console.error(`   completedBytes: ${prettyBytes(completedBytes)}`);
          console.error(`   currentUploadedBytes: ${prettyBytes(currentUploadedBytes)}`);
          console.error(`   Please check window.completedUploadFiles for duplicates`);
        } else {
          console.log(`✅ Progress calculation looks correct: ${prettyBytes(totalUploaded)} / ${prettyBytes(totalSize)}`);
        }
        // Ensure we don't get division by zero or invalid values
        const totalProgressValue = (totalSize > 0 && totalUploaded >= 0) ? Math.round((totalUploaded * 100) / totalSize) : 0;
        
        // Clamp progress between 0-100
        const clampedProgress = Math.max(0, Math.min(100, totalProgressValue));
        
        setTotalProgress(clampedProgress);
        setUploadedBytes(totalUploaded);
        setTotalBytes(totalSize);

        // Calculate speed
        const speedNow = Date.now();
        const timeDiff = (speedNow - speedCalculatorRef.current.lastTime) / 1000;
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
          speedCalculatorRef.current.lastTime = speedNow;
        }
        
        // Send progress updates to parent - ONLY during active upload
        if (onProgressUpdate && clampedProgress >= 0) {
          // Log only significant progress changes or every 10%
          const lastLoggedProgress = parseInt(localStorage.getItem('lastProgressLogged') || '0');
          if (Math.abs(clampedProgress - lastLoggedProgress) >= 10 || clampedProgress === 0 || clampedProgress === 100) {
            console.log(`📈 Progress update: ${clampedProgress}% (${prettyBytes(totalUploaded)}/${prettyBytes(totalSize)})`);
            localStorage.setItem('lastProgressLogged', clampedProgress.toString());
          }
          
          // Debug: Show what we're sending to progress circle
          console.log(`💰 Sending to progress circle: ${clampedProgress}% (${prettyBytes(totalUploaded)}/${prettyBytes(totalSize)})`);
          
          onProgressUpdate({
            progress: clampedProgress,
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
        console.log(`📊 File tracking: ${file.name} TUS upload successful, starting file entry creation...`);
        
        // Track all TUS completed files
        if (!window.tusCompletedFiles) {
          window.tusCompletedFiles = [];
        }
        window.tusCompletedFiles.push({
          name: file.name,
          size: file.size,
          tusCompleted: true,
          timestamp: new Date().toISOString()
        });
        console.log(`📋 TUS completed files: ${window.tusCompletedFiles.length}`);
        
        // Mark this file as completed immediately - no processing delay
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: 'completed',
            progress: 100
          }
        }));
        
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
            max_downloads: settings?.maxDownloads,
            sender_email: formData?.email, // Use formData parameter, not data
            sender_name: formData?.name, // Use formData parameter, not data
            message: formData?.message // Use formData parameter, not data
          };
          
          console.log(`📤 Sending file entry request:`, requestPayload);
          
          // Reasonable timeout for file entry creation
          const controller = new AbortController();
          const timeoutDuration = 120000; // 2 minutes - give enough time for large files
          console.log(`⏱️ Setting timeout to ${timeoutDuration/1000}s for ${file.name}`);
          
          const timeoutId = setTimeout(() => {
            console.warn(`⏰ File entry creation timeout after ${timeoutDuration/1000}s for ${file.name}`);
            controller.abort();
          }, timeoutDuration);
          
          const response = await apiClient.post('guest/tus/entries', requestPayload, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          console.log(`📝 File entry created successfully for ${file.name}:`, response.data);
          console.log(`🚀 SUCCESS: ${file.name} - TUS upload AND file entry creation both successful`);
          
          // Validate the response structure
          const actualFileEntry = response.data.fileEntry?.fileEntry || response.data.fileEntry;
          if (!actualFileEntry || !actualFileEntry.id) {
            throw new Error(`Invalid file entry response: missing fileEntry.id`);
          }
          
          console.log(`✅ File entry validated for ${file.name}:`, {
            id: actualFileEntry.id,
            name: actualFileEntry.name,
            file_size: actualFileEntry.file_size,
            upload_group_hash: response.data.upload_group_hash
          });
          
          // Track successful file entries
          if (!window.fileEntrySuccessful) {
            window.fileEntrySuccessful = [];
          }
          window.fileEntrySuccessful.push({
            name: file.name,
            id: actualFileEntry.id,
            timestamp: new Date().toISOString()
          });
          console.log(`✅ File entries created successfully: ${window.fileEntrySuccessful.length}`);
          console.log(`   Successfully processed: ${window.fileEntrySuccessful.map(f => f.name).join(', ')}`);
          
          // Store the upload group hash for subsequent files to use
          if (response.data.upload_group_hash) {
            setGuestUploadGroupHash(response.data.upload_group_hash);
            console.log(`🏷️ Upload group created: ${response.data.upload_group_hash}`);
            
            // Start remaining uploads now that we have the group hash
            if (window.pendingUploads && window.pendingUploads.length > 0) {
              console.log(`🚀 Starting ${window.pendingUploads.length} remaining files`);
              
              // Store the length before we set pendingUploads to null
              const totalPendingFiles = window.pendingUploads.length;
              
              const startUpload = async (file, index) => {
                console.log(`📤 Starting ${file.name}`);
                
                // Create new upload with the correct group hash - use stored length
                const newUpload = createTusUpload(file, false, response.data.upload_group_hash, totalPendingFiles, data);
                
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
                    newUpload.resumeFromPreviousUpload(previousUploads[0]);
                  }
                  newUpload.start();
                } catch (error) {
                  newUpload.start();
                }
              };
              
              // Start remaining uploads with delays - increased for large files
              window.pendingUploads.forEach(({ file }, index) => {
                // Check if rate limiting was detected recently
                const rateLimitRecent = window.rateLimitDetected && 
                  (Date.now() - (window.rateLimitTimestamp || 0)) < 60000; // Within last minute
                
                // Reasonable delays - max 3 seconds as requested
                let baseDelay = 2000; // 2 seconds base delay
                if (rateLimitRecent) {
                  baseDelay = 3000; // 3 seconds max if rate limited recently
                  console.warn(`😦 Using slightly longer delays due to recent rate limiting`);
                }
                
                const isLargeFile = file.size > 100 * 1024 * 1024; // 100MB threshold
                const additionalDelay = isLargeFile ? 1000 : 0; // Only 1s extra for large files
                const delay = (index + 1) * (baseDelay + additionalDelay);
                
                const delayReason = [
                  isLargeFile ? 'LARGE FILE' : 'normal',
                  rateLimitRecent ? 'RATE LIMITED' : null,
                  'backend: 5000/min'
                ].filter(Boolean).join(', ');
                
                console.log(`⏳ Scheduling ${file.name} to start in ${delay/1000}s (${delayReason})`);
                setTimeout(() => startUpload(file, index), delay);
              });
              
              window.pendingUploads = null;
            }
          }

          // Update progress state for this file (using already validated actualFileEntry)
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
          
          // Store the upload response data for the success page
          if (!window.uploadResponseData) {
            window.uploadResponseData = response.data;
          }
          
          // Remove this file from uploadsRef to prevent double counting in progress
          uploadsRef.current.delete(file.name);
          console.log(`🧹 Removed ${file.name} from active uploads tracking`);
          
          // CRITICAL: Use stored total to avoid stale closure
          const totalFiles = window.totalExpectedFiles || 1;
          const completedFiles = window.completedUploadFiles.length;
          
          console.log(`✅ ${file.name} completed. Files: ${completedFiles}/${totalFiles}`);
          
          // ONLY trigger completion when ALL files are done
          if (completedFiles >= totalFiles) {
            console.log(`🎉 ALL FILES DONE - showing share link`);
            
            // 📝 COMPLETION SUMMARY
            console.log(`📋 UPLOAD COMPLETION SUMMARY:`);
            console.log(`   Total files attempted: ${totalFiles}`);
            console.log(`   TUS uploads completed: ${window.tusCompletedFiles?.length || 0}`);
            console.log(`   File entries created: ${window.fileEntrySuccessful?.length || 0}`);
            console.log(`   Files successfully added to share link: ${completedFiles}`);
            
            console.log(`\n📝 DETAILED FILE STATUS:`);
            if (window.tusCompletedFiles) {
              window.tusCompletedFiles.forEach((f, i) => {
                const hasFileEntry = window.fileEntrySuccessful?.some(fe => fe.name === f.name);
                const inShareLink = window.completedUploadFiles.some(cf => cf.name === f.name);
                console.log(`   ${i + 1}. ${f.name}:`);
                console.log(`      - TUS Upload: ✅ Success`);
                console.log(`      - File Entry: ${hasFileEntry ? '✅ Success' : '❌ Failed'}`);
                console.log(`      - In Share Link: ${inShareLink ? '✅ Yes' : '❌ No'}`);
              });
            }
            
            console.log(`\n🔗 Share link will contain:`);
            window.completedUploadFiles.forEach((f, i) => {
              console.log(`     ${i + 1}. ${f.name} (${prettyBytes(f.file_size)})`);
            });
            
            if (completedFiles < totalFiles) {
              const missing = totalFiles - completedFiles;
              const tusCompleted = window.tusCompletedFiles?.length || 0;
              const fileEntriesCreated = window.fileEntrySuccessful?.length || 0;
              
              console.error(`🚨 MISSING FILES ANALYSIS:`);
              console.error(`   Files missing from share link: ${missing}`);
              console.error(`   TUS uploads that failed: ${totalFiles - tusCompleted}`);
              console.error(`   File entry creations that failed: ${tusCompleted - fileEntriesCreated}`);
              console.error(`   Check console logs above for specific failure details`);
            }
            
            setUploadState('completed');
            
            // Calculate totals from completedUploadFiles since allFiles might be stale
            const totalBytes = window.completedUploadFiles.reduce((sum, f) => sum + f.file_size, 0);
            
            onProgressUpdate?.({
              progress: 100,
              uploadedBytes: totalBytes,
              totalBytes: totalBytes,
              uploadSpeed: 0,
              timeRemaining: 0,
              status: 'success'
            });
            
            setTimeout(() => {
              onUploadComplete?.(window.completedUploadFiles, window.uploadResponseData);
            }, 100);
          } else {
            // More files still uploading - calculate progress from stored total
            const uploadedSizeAll = window.completedUploadFiles.reduce((sum, f) => sum + f.file_size, 0);
            // Use the globally stored totalBytes from handleUpload
            const totalSizeAll = window.totalBytesToUpload || 0;
            
            // Prevent division by zero
            const overallProgress = totalSizeAll > 0 ? Math.round((uploadedSizeAll * 100) / totalSizeAll) : 0;
            
            console.log(`⏳ ${completedFiles}/${totalFiles} files done, ${overallProgress}% overall progress`);
            console.log(`📊 Progress calculation: ${prettyBytes(uploadedSizeAll)} / ${prettyBytes(totalSizeAll)}`);
            
            onProgressUpdate?.({
              progress: overallProgress,
              uploadedBytes: uploadedSizeAll,
              totalBytes: totalSizeAll,
              uploadSpeed: 0,
              timeRemaining: 0,
              status: 'uploading'
            });
          }

        } catch (error) {
          console.error(`❌ CRITICAL: Failed to create file entry for ${file.name}:`, {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            uploadKey: upload.url?.split('/').pop(),
            groupHash: groupHash || guestUploadGroupHash
          });
          
          let errorMessage = 'Failed to create file entry';
          let shouldRetry = false;
          
          if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
            errorMessage = `File processing timeout after 2 minutes. File may still be processing.`;
            shouldRetry = false;
            console.warn(`⏰ File entry creation timed out for ${file.name} - this file will NOT appear in share link`);
          } else if (error.response?.status === 422) {
            errorMessage = `Validation error: ${error.response?.data?.message || 'Invalid upload data'}`;
            console.error(`🚨 Validation failed for ${file.name}:`, error.response?.data);
          } else if (error.response?.status >= 500) {
            errorMessage = `Server error: ${error.response?.data?.error || 'Internal server error'}`;
            shouldRetry = true;
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          console.error(`⚠️ ${file.name} will NOT appear in share link due to: ${errorMessage}`);
          
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
              totalBytes: window.totalBytesToUpload || 0,
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
  }, [settings, uploadProgress, onProgressUpdate, onUploadComplete, uploadSpeed, timeRemaining, selectedFiles]);

  // Manual retry function for persistent rate limiting
  const manualRetryUpload = useCallback(async (file, resumeFromBytes = 0) => {
    console.log(`🔄 Manual retry starting for ${file.name} from ${prettyBytes(resumeFromBytes)}`);
    
    try {
      // Create a new TUS upload instance
      const newUpload = createTusUpload(file, false, guestUploadGroupHash, 1, data);
      
      // Try to find previous upload and resume
      let actualResumeBytes = resumeFromBytes;
      try {
        const previousUploads = await newUpload.findPreviousUploads();
        if (previousUploads.length) {
          const previousUpload = previousUploads[0];
          actualResumeBytes = Math.max(previousUpload.size || 0, resumeFromBytes);
          console.log(`🔄 TUS found previous upload: ${prettyBytes(actualResumeBytes)}`);
          newUpload.resumeFromPreviousUpload(previousUpload);
        }
      } catch (error) {
        console.warn(`⚠️ Could not find previous uploads for manual retry: ${error.message}`);
      }
      
      // Update the uploads ref with the new upload
      uploadsRef.current.set(file.name, {
        upload: newUpload,
        file,
        bytesUploaded: actualResumeBytes,
        bytesTotal: file.size,
        progress: file.size > 0 ? Math.round((actualResumeBytes * 100) / file.size) : 0,
        resumeOffset: actualResumeBytes
      });
      
      // Update progress state to show we're resuming
      const resumeProgress = file.size > 0 ? Math.round((actualResumeBytes * 100) / file.size) : 0;
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: {
          ...prev[file.name],
          status: 'uploading',
          progress: resumeProgress,
          bytesUploaded: actualResumeBytes,
          error: null
        }
      }));
      
      console.log(`🚀 Starting manual retry upload for ${file.name} at ${resumeProgress}%`);
      newUpload.start();
      
    } catch (error) {
      console.error(`❌ Manual retry failed for ${file.name}:`, error);
      
      // Mark as failed
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: {
          ...prev[file.name],
          status: 'error',
          error: `Manual retry failed: ${error.message}`
        }
      }));
    }
  }, [createTusUpload, guestUploadGroupHash]);

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
    console.log('📧 Form data at upload time:', data);
    console.log('📧 Form data keys:', Object.keys(data || {}));
    console.log('📧 Form data values:', {
      email: data?.email,
      name: data?.name, 
      message: data?.message
    });
    
    const allFiles = selectedFiles.flatMap(item => item.files ? item.files : item);
    console.log('📋 Multi-file upload breakdown:', {
      selectedItems: selectedFiles.length,
      totalFiles: allFiles.length,
      fileDetails: allFiles.map(f => ({ name: f.name, size: prettyBytes(f.size), type: f.type })),
      uploadStrategy: 'sequential (first file creates group, others follow)'
    });
    
    const totalSize = allFiles.reduce((total, file) => total + file.size, 0);
    console.log(`📊 Total upload size: ${prettyBytes(totalSize)} across ${allFiles.length} files`);
    
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
    
    // Store total bytes globally so progress calculation can always access it
    window.totalBytesToUpload = totalSize;
    console.log(`💾 Stored totalBytesToUpload globally: ${prettyBytes(totalSize)}`);
    
    // Clear previous upload state and progress tracking
    window.completedUploadFiles = [];
    window.totalExpectedFiles = 0; // Reset expected files count
    
    // Clear rate limiting flags for fresh start
    window.rateLimitDetected = false;
    window.rateLimitTimestamp = null;
    console.log(`🔄 Cleared rate limiting flags for fresh upload session`);
    localStorage.removeItem('lastLoggedProgress'); 
    localStorage.removeItem('lastProgressLogged');
    // Clear individual file progress tracking
    allFiles.forEach(file => {
      localStorage.removeItem(`fileProgress_${file.name}`);
      localStorage.removeItem(`lastProgressTime_${file.name}`);
      localStorage.removeItem(`lastBytes_${file.name}`);
      localStorage.removeItem(`progressCalc_${file.name}`);
    });
    console.log('🧹 Cleared previous upload state and progress tracking');
    const maxFileSize = 3 * 1024 * 1024 * 1024; // 3GB in bytes
    const maxTotalSize = 5 * 1024 * 1024 * 1024; // 5GB total limit
    
    // Clear any existing group hash - first file will create the group
    setGuestUploadGroupHash(null);
    console.log(`🚀 Starting fresh multi-file upload`);
    
    // Validate individual file sizes
    const oversizedFiles = allFiles.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      console.error(`❌ File(s) too large: ${fileNames}. Maximum file size is 3GB.`);
      
      // Show inline error message
      if (oversizedFiles.length === 1) {
        setErrorMessage(`The file "${oversizedFiles[0].name}" is too large. Maximum file size is 3GB per file.`);
      } else {
        setErrorMessage(`${oversizedFiles.length} files are too large. Maximum file size is 3GB per file. Please select smaller files.`);
      }
      
      return;
    }
    
    // Validate total size
    if (totalSize > maxTotalSize) {
      console.error(`❌ Total upload size too large: ${prettyBytes(totalSize)}. Maximum total size is 5GB.`);
      
      // Show inline error message
      setErrorMessage(`Total upload size (${prettyBytes(totalSize)}) exceeds the 5GB limit. Please remove some files to continue.`);
      
      return;
    }
    
    // Clear any previous error messages
    setErrorMessage('');
    
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
    
    console.log(`🎬 Upload Strategy:`);
    console.log(`   1️⃣ First: ${firstFile.name} (${prettyBytes(firstFile.size)}) - creates upload group`);
    if (allFiles.length > 1) {
      allFiles.slice(1).forEach((file, index) => {
        console.log(`   ${index + 2}️⃣ Queued: ${file.name} (${prettyBytes(file.size)}) - waits for group hash`);
      });
    }
    
    // Create and start the first file upload immediately
    const firstUpload = createTusUpload(firstFile, true, null, selectedFiles.length, data);
    uploadsRef.current.set(firstFile.name, {
      upload: firstUpload,
      file: firstFile,
      bytesUploaded: 0,
      bytesTotal: firstFile.size,
      progress: 0
    });
    
    console.log(`🥇 Starting first file upload: ${firstFile.name}`);
    
    // Start first file
    const startUpload = async (upload, file) => {
      console.log(`🎬 Starting TUS upload for ${file.name}...`);
      try {
        const previousUploads = await upload.findPreviousUploads();
        if (previousUploads.length) {
          console.log(`🔄 Resuming previous upload for: ${file.name}`);
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        console.log(`▶️ Starting upload for ${file.name}`);
        upload.start();
        console.log(`🚀 Upload started for ${file.name}`);
      } catch (error) {
        console.error(`❌ Error starting upload for ${file.name}:`, error);
        console.warn(`⚠️ Could not check for previous uploads, starting fresh`);
        try {
          upload.start();
          console.log(`🚀 Fresh upload started for ${file.name}`);
        } catch (startError) {
          console.error(`❌ Failed to start upload for ${file.name}:`, startError);
        }
      }
    };
    
    startUpload(firstUpload, firstFile);
    
    // Store remaining files and total count for completion logic
    window.totalExpectedFiles = allFiles.length; // CRITICAL: Store total for closure
    if (allFiles.length > 1) {
      window.pendingUploads = allFiles.slice(1).map(file => ({ file }));
      console.log(`⏳ Queued ${window.pendingUploads.length} files for sequential upload after group creation`);
    }
  }, [selectedFiles, settings, createTusUpload, data]);

  
  // Pause all uploads
  const handlePauseUpload = useCallback(() => {
    console.log(`⏸️ Pausing all uploads at ${totalProgress}%`);
    console.log(`🏷️ Current upload group hash: ${guestUploadGroupHash || 'none'}`);
    console.log(`📋 Files currently uploading: ${Array.from(uploadsRef.current.keys()).join(', ')}`);

    // Store the current group hash for resume
    window.pausedUploadGroupHash = guestUploadGroupHash;
    
    // Store pending uploads that haven't started yet
    if (window.pendingUploads && window.pendingUploads.length > 0) {
      console.log(`🕰️ Preserving ${window.pendingUploads.length} pending uploads for resume`);
      window.pausedPendingUploads = [...window.pendingUploads];
      window.pendingUploads = null; // Clear to prevent them from starting
    }
    
    // Initialize paused progress map
    if (!window.pausedUploadProgress) {
      window.pausedUploadProgress = new Map();
    }

    let totalUploadedBytes = 0;

    // Set global pause flag to prevent auto-resume
    window.uploadsPaused = true;
    
    // Abort each active upload without removing fingerprint and store progress
    uploadsRef.current.forEach(({ upload, file, bytesUploaded, progress }, fileName) => {
      try {
        if (upload) {
          // Mark upload as manually paused before aborting to prevent TUS auto-retry
          upload._manuallyPaused = true;
          upload.abort(false); // keep fingerprint so we can resume
        }
      } catch (e) {
        console.warn(`⚠️ Error aborting upload for ${fileName}:`, e);
      }

      const safeBytes = typeof bytesUploaded === 'number' ? bytesUploaded : 0;
      const safeProgress = typeof progress === 'number' ? progress : (file?.size ? Math.round((safeBytes * 100) / file.size) : 0);
      
      // Add to total uploaded bytes
      totalUploadedBytes += safeBytes;

      console.log(`⏸️ Pausing ${fileName}: ${safeProgress}% (${prettyBytes(safeBytes)}/${prettyBytes(file?.size || 0)})`);

      // Persist per-file paused state
      window.pausedUploadProgress.set(fileName, {
        progress: safeProgress,
        bytesUploaded: safeBytes,
      });

      // Reflect paused state in UI state immediately
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: {
          ...prev[fileName],
          status: 'paused',
          progress: safeProgress,
          bytesUploaded: safeBytes,
          bytesTotal: file?.size || prev[fileName]?.bytesTotal || 0,
        },
      }));
    });

    // Update state to paused and capture current bytes
    setUploadState('paused');
    setUploadedBytes(totalUploadedBytes);
    
    console.log(`📊 Total paused at: ${totalProgress}% (${prettyBytes(totalUploadedBytes)}/${prettyBytes(window.totalBytesToUpload || totalBytes || 0)})`);

    // Inform parent of paused state with accurate uploaded bytes
    onProgressUpdate?.({
      progress: totalProgress,
      uploadedBytes: totalUploadedBytes, // ✅ Use calculated total, not state variable
      totalBytes: window.totalBytesToUpload || totalBytes || 0,
      uploadSpeed: 0,
      timeRemaining: 0,
      status: 'paused',
    });
  }, [onProgressUpdate, totalProgress, totalBytes]);

  // Resume all uploads
  const handleResumeUpload = useCallback(async () => {
    console.log(`▶️ Resuming all uploads`);
    
    // Use stored group hash from pause, or current one
    const resumeGroupHash = window.pausedUploadGroupHash || guestUploadGroupHash;
    console.log(`🏷️ Using group hash for resume: ${resumeGroupHash || 'none'}`);
    console.log(`📋 Files to resume: ${Array.from(uploadsRef.current.keys()).join(', ')}`);
    
    if (!resumeGroupHash && uploadsRef.current.size > 1) {
      console.error(`🚨 CRITICAL: Multi-file upload resuming without group hash! Files may not be linked.`);
    }
    
    // Restore pending uploads that were paused
    if (window.pausedPendingUploads && window.pausedPendingUploads.length > 0) {
      console.log(`🔄 Restoring ${window.pausedPendingUploads.length} pending uploads`);
      window.pendingUploads = [...window.pausedPendingUploads];
      window.pausedPendingUploads = null;
    }
    
    // Clear global pause flag to allow uploads to continue
    window.uploadsPaused = false;
    
    setUploadState('uploading');
    
    // Send uploading status to parent
    onProgressUpdate?.({
      progress: totalProgress,
      uploadedBytes: uploadedBytes,
      totalBytes: window.totalBytesToUpload || 0,
      uploadSpeed: 0,
      timeRemaining: 0,
      status: 'uploading'
    });

    for (const [fileName, { file }] of uploadsRef.current.entries()) {
      // ✅ FIX: Pass correct parameters - (file, isFirstFile=false, groupHash)
      const upload = createTusUpload(file, false, resumeGroupHash, 1, data);
      
      console.log(`🔄 Resuming ${fileName} with group hash: ${resumeGroupHash || 'none'}`);
      
      // Find and resume previous upload to get the current offset
      let resumedBytesUploaded = 0;
      let resumedProgress = 0;
      let tusResumed = false;
      
      try {
        const previousUploads = await upload.findPreviousUploads();
        
        if (previousUploads.length) {
          const previousUpload = previousUploads[0];
          resumedBytesUploaded = previousUpload.size || 0;
          resumedProgress = file.size > 0 ? Math.round((resumedBytesUploaded * 100) / file.size) : 0;
          
          console.log(`🔄 TUS Resuming ${fileName}: ${resumedProgress}% (${prettyBytes(resumedBytesUploaded)}/${prettyBytes(file.size)})`);
          
          upload.resumeFromPreviousUpload(previousUpload);
          tusResumed = true;
        }
      } catch (error) {
        console.warn(`⚠️ Error finding previous uploads for ${fileName}:`, error);
      }
      
      // If TUS couldn't resume, use stored paused progress
      if (!tusResumed) {
        const pausedProgress = window.pausedUploadProgress?.get(fileName);
        if (pausedProgress) {
          resumedBytesUploaded = pausedProgress.bytesUploaded || 0;
          resumedProgress = pausedProgress.progress || 0;
          console.log(`🔄 Using stored paused progress for ${fileName}: ${resumedProgress}% (${prettyBytes(resumedBytesUploaded)}/${prettyBytes(file.size)})`);
        } else {
          console.log(`🔄 No previous state found for ${fileName}, starting fresh`);
        }
      }
      
      // Preserve the resumed progress instead of resetting to 0
      uploadsRef.current.set(fileName, {
        upload,
        file,
        bytesUploaded: resumedBytesUploaded, // ✅ Use actual resumed bytes
        bytesTotal: file.size,
        progress: resumedProgress,           // ✅ Use actual resumed progress
        resumeOffset: tusResumed ? 0 : resumedBytesUploaded // Offset for non-TUS resumes
      });
      
      // Update progress state immediately to show resumed progress
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: {
          ...prev[fileName],
          progress: resumedProgress,
          bytesUploaded: resumedBytesUploaded,
          bytesTotal: file.size,
          status: 'uploading'
        }
      }));
      
      console.log(`✅ Progress restored for ${fileName}: ${resumedProgress}% (${prettyBytes(resumedBytesUploaded)}/${prettyBytes(file.size)})`);
      
      // Update total progress immediately to reflect resumed progress
      const allUploadBytes = Array.from(uploadsRef.current.values())
        .reduce((sum, { bytesUploaded }) => sum + (bytesUploaded || 0), 0);
      const totalSize = window.totalBytesToUpload || 0;
      const overallProgress = totalSize > 0 ? Math.round((allUploadBytes * 100) / totalSize) : 0;
      
      setTotalProgress(overallProgress);
      setUploadedBytes(allUploadBytes);
      
      console.log(`📊 Total progress after resume: ${overallProgress}% (${prettyBytes(allUploadBytes)}/${prettyBytes(totalSize)})`);
      
      // Send updated progress to parent immediately
      onProgressUpdate?.({
        progress: overallProgress,
        uploadedBytes: allUploadBytes,
        totalBytes: totalSize,
        uploadSpeed: 0,
        timeRemaining: 0,
        status: 'uploading'
      });
      
      upload.start();
    }
    
    // Start any pending uploads that were paused before they began
    if (window.pendingUploads && window.pendingUploads.length > 0 && resumeGroupHash) {
      console.log(`🚀 Starting ${window.pendingUploads.length} pending files that were paused`);
      
      window.pendingUploads.forEach(({ file }, index) => {
        setTimeout(async () => {
          console.log(`📤 Starting pending file: ${file.name}`);
          
          // Create new upload with the group hash
          const newUpload = createTusUpload(file, false, resumeGroupHash, 1, data);
          
          // Add to uploads ref
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
              newUpload.resumeFromPreviousUpload(previousUploads[0]);
            }
            newUpload.start();
          } catch (error) {
            newUpload.start();
          }
        }, index * 2000); // 2 second delay between files
      });
      
      window.pendingUploads = null;
    }
  }, [createTusUpload, onProgressUpdate, totalProgress, uploadedBytes]);

  // Cancel all uploads
  const handleCancelUpload = useCallback(() => {
    console.log(`🚫 Cancelling all uploads`);
    
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
    
    // Clear all pause-related state and manual retry state
    window.pausedUploadProgress = null;
    window.pausedUploadGroupHash = null;
    window.pausedPendingUploads = null;
    window.uploadsPaused = false;
    window.manualRetryUploads = null;
    window.totalBytesToUpload = 0;
    window.completedUploadFiles = [];
    window.tusCompletedFiles = [];
    window.fileEntrySuccessful = [];
    
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
    console.log('📝 Input change:', e.target.name, '=', e.target.value);
    setData((prevalue) => {
      const newData = {
        ...prevalue,
        [e.target.name]: e.target.value
      };
      console.log('📊 Updated data state:', newData);
      return newData;
    })
  }



  const addInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFilesSelected = (files) => {
    if (!files || files.length === 0) {
      console.log('❌ No files selected');
      return;
    }
    
    // Clear any previous error messages when new files are selected
    setErrorMessage('');
    
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
        className={`p-[20px] md:p-[30px] center-align flex-col h-[60vh] max-h-[500px] rounded-[15px] transition
                ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="column-center text-center">
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
        <div className=" relative ">
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
            
            {/* Error message display */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Upload Error
                    </h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>{errorMessage}</p>
                    </div>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        type="button"
                        className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                        onClick={() => setErrorMessage('')}
                      >
                        <span className="sr-only">Dismiss</span>
                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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
                <input autoComplete="email"
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
            
            <div className='md:between-align pt-[7px] md:pt-[20px] gap-5 md:gap-0'>
              <div className='flex items-center space-x-1 cursor-pointer hover:opacity-75 transition-opacity' onClick={handleSettingsClick}>
                <CiSettings size={28} className="text-black" />
                <div>
                  <h6 className="heading !font-[700] ps-0 text-start !text-[13px] ">
                    {formatExpiryTime(settings.expiresInHours)}
                  </h6>
                  <p className="normal-para text-start !text-[13px] ">
                    {settings.password ? "Password protected" : "No password added"}
                  </p>
                </div>
              </div>
              
              {/* Upload Control - Only show Create Transfer button */}
              <div className="mt-3 md:mt-0 md:flex gap-2">
                <button 
                  className="button-sm !text-[15px] w-full md:w-auto md:button-md" 
                  onClick={() => {
                    console.log('🔴 Button clicked - Current data state:', data);
                    console.log('🔴 Data state keys:', Object.keys(data || {}));
                    console.log('🔴 Data state email:', data?.email);
                    console.log('🔴 Data state name:', data?.name);
                    console.log('🔴 Data state message:', data?.message);
                    handleUpload();
                  }}
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