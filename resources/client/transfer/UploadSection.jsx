import { useState } from "react";
import { FileUploadWidget } from "./components/FileUploadWidget";

export default function UploadSection({
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
  
  return <div className="relative h-full flex items-center w-full justify-center" onClick={() => {
    if (showSettings) {
      setShowSettings(false);
    }
  }}
  >
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