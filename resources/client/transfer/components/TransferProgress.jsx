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
  const [displayProgress, setDisplayProgress] = useState(progress);
  
  // Smooth progress animation with detailed logging
  useEffect(() => {
    console.log(`🎨 Progress Animation: ${displayProgress}% → ${progress}%`);
    
    // Use requestAnimationFrame for smoother updates
    const animate = () => {
      setDisplayProgress(prevDisplay => {
        const diff = progress - prevDisplay;
        if (Math.abs(diff) < 0.1) {
          return progress; // Close enough, snap to target
        }
        // Smooth interpolation
        const step = diff * 0.3;
        const newProgress = prevDisplay + step;
        console.log(`🎨 Animating: ${prevDisplay.toFixed(1)}% + ${step.toFixed(1)}% = ${newProgress.toFixed(1)}%`);
        return newProgress;
      });
    };
    
    const timer = setTimeout(animate, 16); // ~60fps
    return () => clearTimeout(timer);
  }, [progress, displayProgress]);

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
    progress: `${progress}%`, 
    displayProgress: `${displayProgress}%`,
    progressDiff: Math.abs(progress - displayProgress),
    status, 
    totalSize: prettyBytes(totalSize), 
    uploadedBytes: prettyBytes(uploadedBytes),
    uploadSpeed: formatSpeed(uploadSpeed),
    timeRemaining: formatTime(timeRemaining),
    timestamp: new Date().toISOString().split('T')[1]
  });
  
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
            stroke={status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#08CF65'}
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
           'Creating your transfer'}
        </h3>
        {status === 'uploading' && (
          <>
            <p className="normal-para mt-2">{formatSpeed(uploadSpeed)}</p>
            <p className="normal-para mt-2">
              {prettyBytes(uploadedBytes)} of {prettyBytes(totalSize)} • {files.length} file{files.length !== 1 ? 's' : ''}
            </p>
            <p className="normal-para !mb-6">{formatTime(timeRemaining)} remaining</p>
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
        onClick={status === 'uploading' ? undefined : onComplete}
        className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
          status === 'uploading' 
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
            : status === 'success'
            ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
            : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'
        }`}
        disabled={status === 'uploading'}
      >
        {status === "success" ? "Continue" : status === "uploading" ? "Uploading..." : "Try again"}
      </button>
    </div>
  );
}
