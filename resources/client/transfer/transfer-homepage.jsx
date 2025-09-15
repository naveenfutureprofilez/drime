import React, { useState, useCallback } from 'react';
import { FileUploadWidget } from './components/FileUploadWidget.jsx';
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
  const [uploadControlsRef, setUploadControlsRef] = useState(null);

  const handleSettingsChange = useCallback((newSettings) => {
    setTransferSettings(newSettings);
  }, []);

  const handleUploadStart = useCallback(async ({ files, totalSize, settings, formData: uploadFormData }) => {
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
    // Also cancel via upload controls if available
    if (uploadControlsRef?.handleCancelUpload) {
      uploadControlsRef.handleCancelUpload();
    }
  }, [abortController, uploadControlsRef]);

  const handleUploadPause = useCallback(() => {
    if (uploadControlsRef?.handlePauseUpload) {
      uploadControlsRef.handlePauseUpload();
      setUploadStatus('paused');
    }
  }, [uploadControlsRef]);

  const handleUploadResume = useCallback(() => {
    if (uploadControlsRef?.handleResumeUpload) {
      uploadControlsRef.handleResumeUpload();
      setUploadStatus('uploading');
    }
  }, [uploadControlsRef]);

  const handleProgressComplete = useCallback(() => {
    // Check for completed files first
    const completedFiles = window.completedUploadFiles;
    
    if (completedFiles && completedFiles.length > 0) {
      setUploadedFiles(completedFiles);
      setCurrentStep('share');
      setUploadStatus('success');
      delete window.completedUploadFiles;
      return;
    }
    
    // Handle different states
    if (uploadStatus === 'success') {
      return; // Stay on progress screen
    }
    
    if (uploadStatus === 'error' || uploadStatus === 'retrying') {
      return; // Stay on progress screen
    }
    
    if (uploadStatus === 'cancelled' || uploadStatus === 'idle') {
      setCurrentStep('upload');
      setUploadData(null);
      setUploadProgress(0);
      setUploadStatus('idle');
      setUploadedBytes(0);
    }
  }, [uploadStatus]);

  const handleProgressUpdate = useCallback(({ progress, uploadedBytes, totalBytes, uploadSpeed, timeRemaining, status }) => {
    setUploadProgress(progress);
    setUploadedBytes(uploadedBytes);
    setUploadSpeed(uploadSpeed);
    setTimeRemaining(timeRemaining);
    setUploadStatus(status);
  }, []);

  const handleUploadComplete = useCallback(files => {
    setUploadedFiles(files);
    setCurrentStep('share');
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
  
  return <>
    {/* <DefaultMetaTags /> */}
    <Layout>
      <div className=" bg-white text-black">
        {currentStep === 'upload' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
              setUploadControlsRef={setUploadControlsRef}
            />
          </div>
        )}

        {currentStep === 'share' && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <SHARE_SECTION 
              files={uploadedFiles} 
              transferSettings={transferSettings} 
              onNewTransfer={handleNewTransfer} 
              onShowEmailPanel={() => setShowEmailPanel(true)} 
              uploadResponse={uploadResponse} 
            />
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
            onPause={handleUploadPause}
            onResume={handleUploadResume}
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
  totalBytes = 0,
  setUploadControlsRef
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [testMode, setTestMode] = useState(false);
  
  

  return <div className="shadow-md rounded-xl overflow-hidden relative" onClick={() => {
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
      onSetUploadControls={setUploadControlsRef}
    />
 
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
