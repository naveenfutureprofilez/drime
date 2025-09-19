import React, { useState, useCallback } from 'react';
import { FileUploadWidget } from './components/FileUploadWidget.jsx';
import { TransferProgress } from './components/TransferProgress';
import { SettingsPanel } from './components/SettingsPanel';
import { EmailPanel } from './components/email-panel';
import { Trans } from '@ui/i18n/trans';
import Layout from '@app/components/Layout';
import TransferSuccessPage from './components/TransferSuccessPage';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
import UploadSection from './UploadSection.jsx';
import ShareSection from './ShareSection.jsx';


export function TransferHomepage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentStep, setCurrentStep] = useState('upload');
  const [showEmailPanel, setShowEmailPanel] = useState(false);
  const [transferSettings, setTransferSettings] = useState({
    password: '',
    expiresInHours: 72,
    maxDownloads: null
  });

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
      return; 
    }
    
    if (uploadStatus === 'error' || uploadStatus === 'retrying') {
      return; 
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

  const handleUploadComplete = useCallback((files, response = null) => {
    setUploadedFiles(files);
    setUploadResponse(response);
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
    <Layout>
      <div className="bg-white h-full text-black">
        {currentStep === 'upload' && (
            <UploadSection
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
        )}

        {currentStep === 'share' && (
          <div className="p-[20px] md:p-[30px] h-full relative center-align ">
            <ShareSection
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
 