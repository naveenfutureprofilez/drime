import React, { useState, useCallback } from 'react';
import { FileUploadWidget } from './components/FileUploadWidget';
import { TransferProgress } from './components/TransferProgress';
import { SettingsPanel } from './components/SettingsPanel';
import { EmailPanel } from './components/email-panel';
import { Trans } from '@ui/i18n/trans';
import Layout from '@app/components/Layout';
import TransferSuccessPage from './components/TransferSuccessPage';


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
  const [uploadStatus, setUploadStatus] = useState('uploading');
  const [uploadStartTime, setUploadStartTime] = useState(null);
  const [abortController, setAbortController] = useState(null);

  // Debug log when settings change
  const handleSettingsChange = useCallback((newSettings) => {
    console.log('Settings being updated:', newSettings);
    setTransferSettings(newSettings);
  }, []);

  // Handle upload start - switch to progress view and start actual upload
  const handleUploadStart = useCallback(async ({ files, totalSize, settings }) => {
    setUploadData({ files, totalSize, settings });
    setCurrentStep('progress');
    setUploadProgress(0);
    setUploadSpeed(0);
    setUploadStatus('uploading');
    setUploadStartTime(Date.now());

    try {
      // Create abort controller for cancellation
      const controller = new AbortController();
      setAbortController(controller);

      const formData = new FormData();
      files.forEach(file => {
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

      let lastLoaded = 0;
      let lastTimestamp = Date.now();

      const { apiClient } = await import('@common/http/query-client');
      const response = await apiClient.post('guest/upload', formData, {
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);

            // Calculate upload speed
            const now = Date.now();
            const timeDiff = (now - lastTimestamp) / 1000; // seconds
            const bytesDiff = progressEvent.loaded - lastLoaded;
            if (timeDiff > 0.5) { // Update speed every 500ms
              const speed = bytesDiff / timeDiff;
              setUploadSpeed(speed);
              lastLoaded = progressEvent.loaded;
              lastTimestamp = now;
            }
          }
        }
      });

      setUploadStatus('success');
      setUploadedFiles(response.data.data.files);

      // Auto-continue to share step after success animation
      setTimeout(() => {
        setCurrentStep('share');
      }, 2000);

    } catch (error) {
      if (error.name === 'CanceledError') {
        // Upload was cancelled
        setCurrentStep('upload');
      } else {
        console.error('Upload failed:', error);
        setUploadStatus('error');
      }
    } finally {
      setAbortController(null);
    }
  }, []);

  // Handle upload cancellation
  const handleUploadCancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

  // Handle progress completion (continue or retry)
  const handleProgressComplete = useCallback(() => {
    if (uploadStatus === 'success') {
      setCurrentStep('share');
    } else if (uploadStatus === 'error') {
      setCurrentStep('upload');
      setUploadData(null);
      setUploadProgress(0);
      setUploadStatus('uploading');
    }
  }, [uploadStatus]);

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
    setUploadStatus('uploading');
  }, []);
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
              />)}

            {currentStep === 'share' && <SHARE_SECTION files={uploadedFiles} onNewTransfer={handleNewTransfer} onShowEmailPanel={() => setShowEmailPanel(true)} />}
          </div>
        )}


        {currentStep === 'progress' && uploadData && (
          <TransferProgress
            files={uploadData.files}
            progress={uploadProgress}
            totalSize={uploadData.totalSize}
            uploadSpeed={uploadSpeed}
            timeRemaining={uploadSpeed > 0 ? ((uploadData.totalSize * (100 - uploadProgress)) / 100) / uploadSpeed : 0}
            onCancel={handleUploadCancel}
            onComplete={handleProgressComplete}
            status={uploadStatus}
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
  onUploadStart
}) {
  const [showSettings, setShowSettings] = useState(false);

  return <div className="shadow-md p-1 rounded-xl overflow-hidden relative" onClick={() => {
    if (showSettings) {
      setShowSettings(false);
    }
  }}
  >
    {/* Upload Widget */}
    <FileUploadWidget
      settings={settings}
      onUploadComplete={onUploadComplete}
      onUploadStart={onUploadStart}
      onSettingsChange={onSettingsChange}
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
  onNewTransfer,
  onShowEmailPanel
}) {
  // All files should share the same upload/share URL
  const shareUrl = files && files.length > 0 ? files[0]?.share_url || '' : '';
  console.log('SHARE_SECTION received files:', files); // Debug log to see all files

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
    <TransferSuccessPage downloadLink={shareUrl} onEmailTransfer={onShowEmailPanel} files={files} onNewTransfer={onNewTransfer} />
    {/* <ShareLinkPanel shareUrl={shareUrl} files={files}  onEmailTransfer={onShowEmailPanel}  /> */}
  </div>;
}
