import React, { useState, useCallback } from 'react';
import { Button } from '@ui/buttons/button';
import { FileUploadIcon } from '@ui/icons/material/FileUpload';
import { LinkIcon } from '@ui/icons/material/Link';
import { SettingsIcon } from '@ui/icons/material/Settings';
import { EmailIcon } from '@ui/icons/material/Email';
import { LockIcon } from '@ui/icons/material/Lock';
import { ScheduleIcon } from '@ui/icons/material/Schedule';
import { Navbar } from '@common/ui/navigation/navbar/navbar';
import { FileUploadWidget } from './components/FileUploadWidget';
import { TransferProgress } from './components/transfer-progress';
import { ShareLinkPanel } from './components/share-link-panel';
import { SettingsPanel } from './components/SettingsPanel';
import { EmailPanel } from './components/email-panel';
import { Trans } from '@ui/i18n/trans';
import { DefaultMetaTags } from '@common/seo/default-meta-tags';
import { DialogTrigger } from '@ui/overlays/dialog/dialog-trigger';
import Layout from '@app/components/Layout';

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
    <FileUploadWidget
      settings={settings}
      onUploadComplete={onUploadComplete}
      onUploadStart={onUploadStart}
      onSettingsChange={onSettingsChange}
    />

    {/* Upload Options */}
    <div className="mt-6 mb-4 flex justify-center gap-4 text-sm text-gray-500   ">
      <div className="flex items-center gap-1">
        <LockIcon className="w-4 h-4" />
        <span>
          {settings.password ? <Trans message="Password protected" /> : <Trans message="No password" />}
        </span>
      </div>
      <div className="flex items-center gap-1 ">
        <ScheduleIcon className="w-4 h-4" />
        <button
          onClick={() => setShowSettings(true)}
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors flex items-top space-x-1"
          title="Click to change expiry time"
        >
          {formatExpiryTime(settings.expiresInHours)}
        </button>


        <span className="text-xs text-gray-400 ml-1">↑ Click to change</span>
      </div>
    </div>

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
    <div className="text-center mb-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileUploadIcon className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold  mb-2">
        <Trans message="Transfer ready!" />
      </h2>
      <p className="text-gray-600">
        <Trans message="Your files have been uploaded successfully" />
      </p>
    </div>

    <ShareLinkPanel shareUrl={shareUrl} files={files} onEmailTransfer={onShowEmailPanel} />

    <div className="mt-2 text-center">
      <button onClick={onNewTransfer} className="px-8 text-primary">
        <Trans message="Send another transfer" />
      </button>
    </div>
  </div>;
}


// Helper function to format expiry time in a user-friendly way
function formatExpiryTime(hours) {
  if (hours === 1) {
    return <Trans message="Expires in 1 hour" />;
  } else if (hours < 24) {
    return <Trans message="Expires in :hours hours" values={{ hours }} />;
  } else if (hours === 24) {
    return <Trans message="Expires in 1 day" />;
  } else if (hours < 168) {
    const days = Math.floor(hours / 24);
    return <Trans message="Expires in :days days" values={{ days }} />;
  } else if (hours === 168) {
    return <Trans message="Expires in 1 week" />;
  } else if (hours < 720) {
    const days = Math.floor(hours / 24);
    return <Trans message="Expires in :days days" values={{ days }} />;
  } else if (hours === 720) {
    return <Trans message="Expires in 1 month" />;
  } else if (hours < 8760) {
    const months = Math.floor(hours / 720);
    return <Trans message="Expires in :months months" values={{ months }} />;
  } else {
    return <Trans message="Expires in 1 year" />;
  }
}
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
    <DefaultMetaTags />
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
          {/* Progress Screen - Full screen overlay */}
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
          {/* Email Panel */}
          {showEmailPanel && <EmailPanel files={uploadedFiles} onClose={() => setShowEmailPanel(false)} />}
        {/* </div>
      </main> */}
    </div> 
    </Layout>
  </>;
}


