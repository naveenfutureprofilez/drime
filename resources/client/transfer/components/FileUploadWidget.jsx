import React, { useState, useCallback, useRef } from 'react';
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
  onProgressUpdate
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
  const createTusUpload = useCallback((file) => {
    console.log(`🚀 Creating TUS upload for: ${file.name} (${prettyBytes(file.size)})`);
    
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
        upload_group_hash: guestUploadGroupHash || '',
      },

      onError: (error) => {
        console.error(`❌ TUS Upload Error for ${file.name}:`, error);
        
        // Handle 429 rate limiting and other retry-able errors
        const statusCode = error.originalResponse?.getStatus();
        const isRetryableError = statusCode === 429 || statusCode >= 500;
        
        if (isRetryableError) {
          console.log(`⏱️ ${statusCode === 429 ? 'Rate limit (429)' : `Server error (${statusCode})`} for ${file.name}, TUS will retry automatically`);
          
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: { 
              ...prev[file.name], 
              status: 'retrying', 
              error: statusCode === 429 ? 'Rate limited, retrying...' : 'Connection error, retrying...',
              retryCount: (prev[file.name]?.retryCount || 0) + 1
            }
          }));
          
          // Keep upload state as uploading during retries
          setUploadState('uploading');
          console.log(`🔄 Retry attempt ${(uploadProgress[file.name]?.retryCount || 0) + 1} for ${file.name}`);
          return; // Let TUS handle the retry
        }
        
        // Only set error state for non-retryable errors
        console.log(`💥 Non-retryable error for ${file.name}: ${error.message}`);
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { ...prev[file.name], status: 'error', error: error.message }
        }));
        
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
        
        console.log(`📊 TUS Progress ${file.name}: ${progress}% (${prettyBytes(bytesUploaded)}/${prettyBytes(bytesTotal)})`);
        
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
        
        // Always notify homepage of progress updates (not just during speed calculations)
        console.log(`📤 Sending progress to homepage: ${totalProgressValue}% (${prettyBytes(totalUploaded)}/${prettyBytes(totalSize)})`);
        if (onProgressUpdate) {
          onProgressUpdate({
            progress: totalProgressValue,
            uploadedBytes: totalUploaded,
            totalBytes: totalSize,
            uploadSpeed: currentSpeed,
            timeRemaining: currentTimeRemaining,
            status: 'uploading'
          });
        } else {
          console.warn('⚠️ onProgressUpdate callback is not defined');
        }
      },

      onSuccess: async () => {
        console.log(`✅ TUS Upload Complete for: ${file.name}`);
        
        try {
          const uploadKey = upload.url?.split('/').pop();
          
          if (!uploadKey) {
            throw new Error('No upload key received from TUS server');
          }

          console.log(`🔑 Creating file entry with upload key: ${uploadKey}`);
          
          const response = await apiClient.post('guest/tus/entries', {
            uploadKey,
            upload_group_hash: guestUploadGroupHash,
            password: settings?.password,
            expires_in_hours: settings?.expiresInHours || 72,
            max_downloads: settings?.maxDownloads
          });

          console.log(`📝 File entry created:`, response.data);
          
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
            console.log(`🎉 All TUS uploads completed!`);
            
            // Send final progress update
            onProgressUpdate?.({
              progress: 100,
              uploadedBytes: totalSize,
              totalBytes: totalSize,
              uploadSpeed: 0,
              timeRemaining: 0,
              status: 'success'
            });
            
            // Get all file entries from completed uploads
            const allFileEntries = [];
            completedUploads.forEach(({ file }) => {
              const fileProgress = uploadProgress[file.name];
              if (fileProgress?.fileEntry) {
                allFileEntries.push(fileProgress.fileEntry);
              }
            });
            
            setTimeout(() => {
              if (allFileEntries.length > 0) {
                onUploadComplete?.(allFileEntries);
              }
            }, 1000);
          }

        } catch (error) {
          console.error(`❌ Failed to create file entry for ${file.name}:`, error);
          
          let errorMessage = 'Failed to create file entry';
          if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: { 
              ...prev[file.name], 
              status: 'error', 
              error: errorMessage
            }
          }));
          
          // Send error status to parent
          onProgressUpdate?.({
            progress: totalProgress,
            uploadedBytes: totalUploaded,
            totalBytes: totalSize,
            uploadSpeed: 0,
            timeRemaining: 0,
            status: 'error',
            error: errorMessage
          });
        }
      }
    });

    return upload;
  }, [settings, guestUploadGroupHash, uploadProgress, onProgressUpdate, onUploadComplete, uploadSpeed, timeRemaining]);

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
    
    setUploadState('uploading');
    setUploadProgress({});
    setTotalProgress(0);
    speedCalculatorRef.current = { lastBytes: 0, lastTime: Date.now() };

    const allFiles = selectedFiles.flatMap(item => item.files ? item.files : item);
    const totalSize = allFiles.reduce((total, file) => total + file.size, 0);
    setTotalBytes(totalSize);

    // Create and start TUS uploads for all files with delay
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
      
      // Add delay between uploads to prevent rate limiting
      if (i > 0) {
        console.log(`⏱️ Waiting 3 seconds before starting next upload...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
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
    
    // Notify parent that upload started so it can switch to progress view
    onUploadStart?.({
      files: allFiles,
      totalSize,
      settings,
      formData: data
    });
    
    // Send initial progress update
    onProgressUpdate?.({
      progress: 0,
      uploadedBytes: 0,
      totalBytes: totalSize,
      uploadSpeed: 0,
      timeRemaining: 0,
      status: 'uploading'
    });
    
    console.log('📤 Sent initial progress to homepage: 0%');
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
  }, []);
  
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
              
              {/* TUS Upload Controls */}
              <div className="flex gap-2">
                {uploadState === 'idle' && (
                  <button className="button-sm md:button-md" onClick={handleUpload}>
                    Create Transfer
                  </button>
                )}
                
                {uploadState === 'uploading' && (
                  <>
                    <button className="button-sm md:button-md !bg-yellow-500 hover:!bg-yellow-600" onClick={handlePauseUpload}>
                      Pause
                    </button>
                    <button className="button-sm md:button-md !bg-red-500 hover:!bg-red-600" onClick={handleCancelUpload}>
                      Cancel
                    </button>
                  </>
                )}
                
                {uploadState === 'paused' && (
                  <>
                    <button className="button-sm md:button-md !bg-blue-500 hover:!bg-blue-600" onClick={handleResumeUpload}>
                      Resume
                    </button>
                    <button className="button-sm md:button-md !bg-red-500 hover:!bg-red-600" onClick={handleCancelUpload}>
                      Cancel
                    </button>
                  </>
                )}
                
                {uploadState === 'completed' && (
                  <button className="button-sm md:button-md !bg-green-500 hover:!bg-green-600" onClick={() => {
                    setUploadState('idle');
                    setUploadProgress({});
                    setTotalProgress(0);
                    setSelectedFiles([]);
                    setGuestUploadGroupHash(null);
                  }}>
                    Upload Complete
                  </button>
                )}
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