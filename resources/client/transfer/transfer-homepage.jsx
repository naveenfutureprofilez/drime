import React, { useState, useCallback } from 'react';
import { Button } from '@ui/buttons/button';
import { FileUploadIcon } from '@ui/icons/material/FileUpload';
import { LinkIcon } from '@ui/icons/material/Link';
import { SettingsIcon } from '@ui/icons/material/Settings';
import { EmailIcon } from '@ui/icons/material/Email';
import { LockIcon } from '@ui/icons/material/Lock';
import { ScheduleIcon } from '@ui/icons/material/Schedule';
import { Navbar } from '@common/ui/navigation/navbar/navbar';
import { FileUploadWidget } from './components/file-upload-widget';
import { TransferProgress } from './components/transfer-progress';
import { ShareLinkPanel } from './components/share-link-panel';
import { SettingsPanel } from './components/settings-panel';
import { EmailPanel } from './components/email-panel';
import { Trans } from '@ui/i18n/trans';
import { DefaultMetaTags } from '@common/seo/default-meta-tags';
export function TransferHomepage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentStep, setCurrentStep] = useState('upload');
  const [showSettings, setShowSettings] = useState(false);
  const [showEmailPanel, setShowEmailPanel] = useState(false);
  const [transferSettings, setTransferSettings] = useState({
    password: '',
    expiresInHours: 72,
    maxDownloads: null
  });
  const handleUploadComplete = useCallback(files => {
    setUploadedFiles(files);
    setCurrentStep('share');
  }, []);
  const handleNewTransfer = useCallback(() => {
    setUploadedFiles([]);
    setCurrentStep('upload');
    setShowSettings(false);
    setShowEmailPanel(false);
  }, []);
  return <>
      <DefaultMetaTags />
      <div className="min-h-screen bg-white text-black">
        {/* <Navbar color="transparent" className="bg-white shadow-sm" menuPosition="homepage-navbar" /> */}
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Trans message="Service Online" />
              </div>
              <h1 className="text-5xl font-bold  mb-6 tracking-tight">
                <Trans message="Drime Transfer" />
              </h1>
              <p className="text-xl   max-w-3xl mx-auto leading-relaxed">
                <Trans message="Send files up to 3GB per file for free. Secure, fast, and reliable file sharing with automatic cleanup after 7 days." />
              </p>
              <div className="mt-6 flex justify-center gap-6 text-sm  ">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No registration required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure transfers</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Auto-delete in 7 days</span>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {currentStep === 'upload' && <UploadSection settings={transferSettings} onUploadComplete={handleUploadComplete} onShowSettings={() => setShowSettings(true)} />}
              
              {currentStep === 'progress' && <TransferProgress onComplete={() => setCurrentStep('share')} />}
              
              {currentStep === 'share' && <ShareSection files={uploadedFiles} onNewTransfer={handleNewTransfer} onShowEmailPanel={() => setShowEmailPanel(true)} />}
            </div>

            {/* Settings Panel */}
            {showSettings && <SettingsPanel settings={transferSettings} onSettingsChange={setTransferSettings} onClose={() => setShowSettings(false)} />}

            {/* Email Panel */}
            {showEmailPanel && <EmailPanel files={uploadedFiles} onClose={() => setShowEmailPanel(false)} />}
          </div>
        </main>
      </div>
    </>;
}
function UploadSection({
  settings,
  onUploadComplete,
  onShowSettings
}) {
  return <div className="shadow-md p-8 rounded-xl">
      {/* Top Actions */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-2">
          <button className="!bg-gray-300 text-black px-2 py-2 rounded-[30px]">
            <LinkIcon /> <Trans message="Link transfer" />
          </button>
          <button className="!bg-gray-300 text-black px-2 py-2 rounded-[30px]">
            <EmailIcon /> <Trans message="Email transfer" />
          </button>
        </div>
        <button onClick={onShowSettings} className="!bg-gray-300 text-black px-2 py-2 rounded-[30px]">
          <SettingsIcon /> <Trans message="Settings" />
        </button>
      </div>

      {/* Upload Widget */}
      <FileUploadWidget settings={settings} onUploadComplete={onUploadComplete} />

      {/* Upload Options */}
      <div className="mt-6 flex justify-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <LockIcon className="w-4 h-4" />
          <span>
            {settings.password ? <Trans message="Password protected" /> : <Trans message="No password" />}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ScheduleIcon className="w-4 h-4" />
          <span>
            <Trans message="Expires in :hours hours" values={{
            hours: settings.expiresInHours
          }} />
          </span>
        </div>
      </div>
    </div>;
}
function ShareSection({
  files,
  onNewTransfer,
  onShowEmailPanel
}) {
  // All files should share the same upload/share URL
  const shareUrl = files && files.length > 0 ? files[0]?.share_url || '' : '';
  console.log('ShareSection received files:', files); // Debug log to see all files
  
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