import React, { useState, useEffect, useCallback } from 'react';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
export function TransferProgress({
  files = [],
  progress = 0,
  totalSize = 0,
  uploadSpeed = 0,
  timeRemaining = 0,
  onCancel,
  onComplete,
  status = 'uploading', // 'uploading', 'success', 'error'
  uploadedBytes = 0
}) {
  console.log('🚨 🚨 🚨 TRANSFER PROGRESS COMPONENT RENDERING 🚨 🚨 🚨');
  console.log('TransferProgress props:', { files: files?.length, progress, status, uploadedBytes, totalSize });
  const [displayProgress, setDisplayProgress] = useState(progress);
  
  // Smooth progress animation - simplified
  useEffect(() => {
    console.log(`🎨 TransferProgress: updating displayProgress from ${displayProgress}% to ${progress}%`);
    setDisplayProgress(progress); // Direct update for now to debug
  }, [progress]);

  // Auto complete when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && status === 'uploading') {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, status, onComplete]);

  const formatTime = useCallback((seconds) => {
    if (!seconds || seconds === Infinity) return '--';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  }, []);

  const formatSpeed = useCallback((bytesPerSecond) => {
    if (!bytesPerSecond) return '--';
    return `${prettyBytes(bytesPerSecond)}/s`;
  }, []);

  // Calculate stroke dash properties for circular progress
  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  // const getStatusColor = () => {
  //   switch (status) {
  //     case 'success':
  //       return {
  //         ring: '#10b981', // green
  //         bg: 'rgba(16, 185, 69, 0.1)',
  //         text: '#10b981'
  //       };
  //     case 'error':
  //       return {
  //         ring: '#ef4444', // red
  //         bg: 'rgba(239, 68, 68, 0.1)',
  //         text: '#ef4444'
  //       };
  //     default:
  //       return {
  //         ring: '#ffffff', // white
  //         bg: 'rgba(255, 255, 255, 0.1)',
  //         text: '#ffffff'
  //       };
  //   }
  // };

  // const colors = getStatusColor();

  console.log("🔄 TransferProgress Render:", {
    files: files?.length, 
    progress: `${progress}% (type: ${typeof progress})`,
    displayProgress: `${displayProgress}% (type: ${typeof displayProgress})`,
    progressDiff: Math.abs(progress - displayProgress),
    status, 
    totalSize: prettyBytes(totalSize), 
    uploadedBytes: prettyBytes(uploadedBytes),
    uploadSpeed: formatSpeed(uploadSpeed),
    timeRemaining: formatTime(timeRemaining),
    timestamp: new Date().toISOString().split('T')[1]
  });
  
  // Log when we receive a new progress value
  const prevProgressRef = React.useRef(progress);
  if (prevProgressRef.current !== progress) {
    console.log(`📈 Progress changed: ${prevProgressRef.current}% -> ${progress}%`);
    prevProgressRef.current = progress;
  }
  
  // Log when progress changes significantly
  const prevProgress = React.useRef(0);
  if (Math.abs(progress - prevProgress.current) >= 5) {
    console.log(`📊 Progress Jump: ${prevProgress.current}% → ${progress}%`);
    prevProgress.current = progress;
  }
  return (
    <div className="column-center !h-[576px]">
      {/* Circle */}
      <div className="relative w-64 h-64 mx-auto mb-6">
        <svg className="w-full h-full" viewBox="0 0 140 140">
          {/* Background Circle */}
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress Circle */}
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke={status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : status === 'retrying' ? '#f59e0b' : '#08CF65'}
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 60}
            strokeDashoffset={
              2 * Math.PI * 60 -
              (displayProgress / 100) * (2 * Math.PI * 60)
            }
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="text-4xl font-bold text-gray-800">
            {Math.round(displayProgress)}%
          </span>
          {/* Debug info - remove in production */}
          <div className="text-xs text-gray-500 mt-1">
            Real: {progress}% | Display: {displayProgress.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Text and Button */}
      <div className="flex flex-col items-center text-center">
        <h3 className="normal-heading">
          {status === 'success' ? 'Transfer Complete!' : 
           status === 'error' ? 'Upload Failed' : 
           status === 'retrying' ? 'Retrying Upload...' :
           'Creating your transfer'}
        </h3>
        {(status === 'uploading' || status === 'retrying') && (
          <>
            <p className="normal-para mt-2">
              {status === 'retrying' ? 'Reconnecting...' : formatSpeed(uploadSpeed)}
            </p>
            <p className="normal-para mt-2">
              {prettyBytes(uploadedBytes)} of {prettyBytes(totalSize)} • {files.length} file{files.length !== 1 ? 's' : ''}
            </p>
            <p className="normal-para !mb-6">
              {status === 'retrying' ? 'Retrying upload...' : `${formatTime(timeRemaining)} remaining`}
            </p>
          </>
        )}
        {status === 'success' && (
          <p className="normal-para mt-2 text-green-600">
            {files.length} file{files.length !== 1 ? 's' : ''} uploaded successfully!
          </p>
        )}
        {status === 'error' && (
          <p className="normal-para mt-2 text-red-600">
            Please check your connection and try again.
          </p>
        )}
      </div>

      <button
        onClick={() => {
          console.log('🔘 Continue/Try Again button clicked with status:', status);
          console.log('💾 Files in storage before onComplete:', !!window.completedUploadFiles, window.completedUploadFiles?.length);
          if (status !== 'uploading' && status !== 'retrying' && onComplete) {
            onComplete();
          } else {
            console.log('⚠️ Button click ignored - status:', status, 'onComplete:', !!onComplete);
          }
        }}
        className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
          status === 'uploading' || status === 'retrying'
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
            : status === 'success'
            ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
            : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'
        }`}
        disabled={status === 'uploading' || status === 'retrying'}
      >
        {status === "success" ? "Continue" : 
         status === "uploading" ? "Uploading..." : 
         status === "retrying" ? "Retrying..." : 
         "Try again"}
      </button>
    </div>
  );
}
