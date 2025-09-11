import React, { useState, useCallback } from 'react';
import { FileUploadWidget } from './components/FileUploadWidget';
import { TransferProgress } from './components/TransferProgress';
import { SettingsPanel } from './components/SettingsPanel';
import { EmailPanel } from './components/email-panel';
import { Trans } from '@ui/i18n/trans';
import Layout from '@app/components/Layout';
import TransferSuccessPage from './components/TransferSuccessPage';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';


export function TransferHomepage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentStep, setCurrentStep] = useState('upload');
  const [showEmailPanel, setShowEmailPanel] = useState(false);
  const [transferSettings, setTransferSettings] = useState({
    password: '',
    expiresInHours: 72,
    maxDownloads: null
  });

  // Upload progress state
  const [uploadData, setUploadData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadStartTime, setUploadStartTime] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const handleSettingsChange = useCallback((newSettings) => {
    setTransferSettings(newSettings);
  }, []);

  const handleUploadStart = useCallback(async ({ files, totalSize, settings, formData: uploadFormData }) => {
    console.log('🚀 Homepage received upload start - switching to progress view');
    
    // Set upload data and switch to progress view
    setUploadData({ files, totalSize, settings, formData: uploadFormData });
    setCurrentStep('progress');
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadedBytes(0);
  }, []);

  const handleUploadCancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

  const handleProgressComplete = useCallback(() => {
    console.log('🎯 handleProgressComplete called with status:', uploadStatus, 'completedFiles in storage:', !!window.completedUploadFiles);
    
    if (uploadStatus === 'success') {
      // Get the completed files from the window storage
      const completedFiles = window.completedUploadFiles;
      
      if (completedFiles && completedFiles.length > 0) {
        console.log('🎉 Found completed files - transitioning to share page:', completedFiles);
        setUploadedFiles(completedFiles);
        setCurrentStep('share');
        // Clean up the temporary storage
        delete window.completedUploadFiles;
      } else {
        console.error('❌ No completed files found in storage - staying on progress screen');
        // Don't go back to upload, let user try again or handle error
        console.log('⚠️ Staying on progress screen for manual retry');
      }
    } else if (uploadStatus === 'error' || uploadStatus === 'retrying') {
      console.log('🔄 Staying on progress screen for error/retry status:', uploadStatus);
      // Don't switch away from progress screen during errors or retries
    } else {
      // Handle other cases (like cancelled uploads or user clicking continue with idle status)
      console.log('⚠️ Unexpected status for progress complete:', uploadStatus, '- going back to upload');
      setCurrentStep('upload');
      setUploadData(null);
      setUploadProgress(0);
      setUploadStatus('idle');
      setUploadedBytes(0);
    }
  }, [uploadStatus]);

  const handleProgressUpdate = useCallback(({ progress, uploadedBytes, totalBytes, uploadSpeed, timeRemaining, status }) => {
    console.log('🏠 Homepage received progress update:', {
      progress: `${progress}% (type: ${typeof progress})`,
      uploadedBytes: `${uploadedBytes} (${prettyBytes(uploadedBytes)})`,
      totalBytes: `${totalBytes} (${prettyBytes(totalBytes)})`,
      uploadSpeed: `${uploadSpeed} (${prettyBytes(uploadSpeed)}/s)`,
      timeRemaining,
      status,
      timestamp: new Date().toISOString().split('T')[1]
    });
    
    setUploadProgress(progress);
    setUploadedBytes(uploadedBytes);
    setUploadSpeed(uploadSpeed);
    setTimeRemaining(timeRemaining);
    setUploadStatus(status);
    
    console.log('📎 Homepage state after update:', {
      uploadProgress: progress,
      uploadedBytes,
      uploadStatus: status
    });
  }, []);

  const handleUploadComplete = useCallback(files => {
    console.log('🎉 Homepage handleUploadComplete called with:', files?.length, 'files:', files);
    console.log('⚠️ Note: This direct callback bypasses the progress screen');
    setUploadedFiles(files);
    setCurrentStep('share');
    console.log('🔄 Homepage switched to share step with', files?.length, 'files');
  }, []);

  const handleNewTransfer = useCallback(() => {
    setUploadedFiles([]);
    setCurrentStep('upload');
    setShowEmailPanel(false);
    setUploadData(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setUploadedBytes(0);
  }, []);
  // Debug logging
  console.log('🏠 Homepage render - currentStep:', currentStep, 'uploadData:', !!uploadData);
  
  return <>
    {/* <DefaultMetaTags /> */}
    <Layout>
      <div className=" bg-white text-black">
        {currentStep !== 'progress' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {currentStep === 'upload' && (
              <UPLOAD_SECTION
                settings={transferSettings}
                onSettingsChange={handleSettingsChange}
                onUploadComplete={handleUploadComplete}
                onUploadStart={handleUploadStart}
                onProgressUpdate={handleProgressUpdate}
                uploadProgress={uploadProgress}
                uploadState={uploadStatus === 'success' ? 'completed' : uploadStatus}
                uploadSpeed={uploadSpeed}
                timeRemaining={uploadSpeed > 0 ? ((uploadData?.totalSize * (100 - uploadProgress)) / 100) / uploadSpeed : 0}
                uploadedBytes={uploadedBytes}
                totalBytes={uploadData?.totalSize || 0}
              />)}

            {currentStep === 'share' && <SHARE_SECTION files={uploadedFiles} transferSettings={transferSettings} onNewTransfer={handleNewTransfer} onShowEmailPanel={() => setShowEmailPanel(true)} uploadResponse={uploadResponse} />}
          </div>
        )}


        {currentStep === 'progress' && uploadData && (
          <TransferProgress
            files={uploadData.files}
            progress={uploadProgress}
            totalSize={uploadData.totalSize}
            uploadSpeed={uploadSpeed}
            timeRemaining={timeRemaining}
            onCancel={handleUploadCancel}
            onComplete={handleProgressComplete}
            status={uploadStatus}
            uploadedBytes={uploadedBytes}
          />
        )}
        {showEmailPanel && <EmailPanel files={uploadedFiles} onClose={() => setShowEmailPanel(false)} />}
      </div>
    </Layout>
  </>;
}

function UPLOAD_SECTION({
  settings,
  onSettingsChange,
  onUploadComplete,
  onUploadStart,
  onProgressUpdate,
  uploadProgress = 0,
  uploadState = 'idle',
  uploadSpeed = 0,
  timeRemaining = 0,
  uploadedBytes = 0,
  totalBytes = 0
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [testMode, setTestMode] = useState(false);
  
  // Debug logging for UPLOAD_SECTION
  console.log('📍 UPLOAD_SECTION props:', {
    uploadProgress,
    uploadState,
    uploadSpeed,
    timeRemaining,
    uploadedBytes,
    totalBytes,
    hasProgressUpdate: !!onProgressUpdate
  });
  
  // Test function to force upload state
  const handleTestProgress = () => {
    console.log('🧪 Activating test mode...');
    setTestMode(true);
  };

  return <div className="shadow-md p-1 rounded-xl overflow-hidden relative" onClick={() => {
    if (showSettings) {
      setShowSettings(false);
    }
  }}
  >
    {/* File Upload Widget with regular upload functionality */}
    <FileUploadWidget
      settings={settings}
      onUploadStart={onUploadStart}
      onUploadComplete={onUploadComplete}
      onSettingsChange={onSettingsChange}
      onProgressUpdate={onProgressUpdate}
    />

 
    {/* Settings Modal */}
    {showSettings && (
      <SettingsPanel
        settings={settings}
        onSettingsChange={onSettingsChange}
        onClose={() => setShowSettings(false)}
      />
    )}
  </div>;
}

function SHARE_SECTION({
  files,
  transferSettings,
  onNewTransfer,
  onShowEmailPanel,
  uploadResponse
}) {
  // All files should share the same upload/share URL
  const shareUrl = files && files.length > 0 ? files[0]?.share_url || '' : '';
  console.log('🎁 SHARE_SECTION received:', {
    filesCount: files?.length,
    files: files,
    shareUrl: shareUrl,
    firstFile: files?.[0],
    transferSettings: transferSettings
  });

  // Early return if no files are provided
  if (!files || files.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600">
          <Trans message="No files to share. Please upload files first." />
        </div>
        <button onClick={onNewTransfer} className="px-8 text-primary mt-4">
          <Trans message="Start new transfer" />
        </button>
      </div>
    );
  }
  return <div className="p-8">
    <TransferSuccessPage 
      downloadLink={shareUrl} 
      onEmailTransfer={onShowEmailPanel} 
      files={files} 
      expiresInHours={transferSettings?.expiresInHours}
      onNewTransfer={onNewTransfer}
      uploadResponse={uploadResponse}
    />
    {/* <ShareLinkPanel shareUrl={shareUrl} files={files}  onEmailTransfer={onShowEmailPanel}  /> */}
  </div>;
}
