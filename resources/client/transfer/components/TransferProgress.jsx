import React, { useState, useEffect, useCallback } from 'react';
import { prettyBytes } from '@ui/utils/files/pretty-bytes';
export function TransferProgress({
  files = [],
  progress = 0,
  totalSize = 0,
  uploadSpeed = 0,
  timeRemaining = 0,
  onCancel,
  onPause,
  onResume,
  onComplete,
  status = 'uploading', // 'uploading', 'processing', 'paused', 'success', 'error', 'retrying'
  uploadedBytes = 0
}) {
  const [displayProgress, setDisplayProgress] = useState(progress);
  
  // Smooth progress animation - simplified
  useEffect(() => {
    // Debug: Track progress updates received by TransferProgress
    if (Math.abs(progress - displayProgress) > 5) {
      console.log(`🎭 TransferProgress: Received ${progress}%, updating display from ${displayProgress}%`);
    }
    
    // For resumed uploads, don't go backwards unless it's a genuine restart
    if ((status === 'uploading' || status === 'retrying') && progress < displayProgress && displayProgress > 10) {
      console.log(`⚠️ Ignoring backwards progress: ${progress}% < ${displayProgress}% during ${status}`);
      return; // Don't update display progress backwards during resume or retries
    }
    
    if (status === 'paused' && progress === 0 && displayProgress > 0) {
      console.log(`⏸️ Maintaining paused progress at ${displayProgress}%`);
      return; // Don't reset to 0 when paused
    }
    
    setDisplayProgress(progress);
  }, [progress, status, displayProgress]);

  // Auto complete when progress reaches 100% and status is success
  useEffect(() => {
    if (progress >= 100 && status === 'success') {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, status, onComplete]);

  const formatTime = useCallback((seconds) => {
    if (!seconds || seconds === Infinity) return '';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  }, []);

  const formatSpeed = useCallback((bytesPerSecond) => {
    if (!bytesPerSecond) return '';
    return `${prettyBytes(bytesPerSecond)}/s`;
  }, []);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
   
  return (
    <div className="column-center  h-full bg-white  m-4">
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            stroke={status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : status === 'retrying' ? '#f59e0b' : status === 'paused' ? '#6b7280' : '#08CF65'}
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
          <span className="text-[45px] font-bold text-gray-800 flex items-center justify-center"> 
            {Math.round(displayProgress)}<sup className='text-[20px] !text-[#0006] inline ms-[2px]'>%</sup>
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center text-center">
        <h3 className="font-semibold !text-[18px] text-black">
          {status === 'success' ? 'Transfer Complete!' : 
           status === 'error' ? 'Upload Failed' : 
           status === 'retrying' ? 'Retrying Upload...' :
           status === 'paused' ? 'Transfer Paused' :
           'Creating your transfer'}
        </h3>
        {(status === 'uploading' || status === 'retrying' || status === 'paused') && (
          <>

            <p className="font-normal !text-[16px] text-gray-500 mt-1">
              {prettyBytes(uploadedBytes)} out of {prettyBytes(totalSize)}
               {/* • {files.length} file{files.length !== 1 ? 's' : ''} */}
            </p>
            <p className="font-normal !text-[16px] text-gray-500 mt-1 mb-2">
              3m25Sec remaining
            </p>


            {/* <p className="font-normal !text-[16px] text-gray-500 mt-2 mb-4">
              {status === 'retrying' ? 'Retrying upload...' : 
               status === 'paused' ? 'Click resume to continue': ''}
            </p> */}
          </>
        )}

        {status === 'success' && (
          <p className="font-normal !text-[16px] text-green-500 mt-2 mb-4">
            {files.length} file{files.length !== 1 ? 's' : ''} uploaded successfully!
          </p>
        )}

        {status === 'error' && (
          <p className="font-normal !text-[16px] text-red-500 mt-2 mb-4">
            Please check your connection and try again.
          </p>
        )}

      </div>

      {/* Action buttons based on status */}
      <div className="flex gap-3 mt-3">
        {status === 'uploading' && (
          <>
            <button
            onClick={() => onPause?.()}
              className="button" >
              Pause
            </button>
            {/* <button
            onClick={() => onCancel?.()}
              className="!text-black px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-red-500 text-black hover:bg-red-600 hover:scale-105"
            >
              Cancel
            </button> */}
          </>
        )}
        
        {status === 'paused' && (
          <>
            <button
            onClick={() => onResume?.()}
              className="button"
            >
              Resume
            </button>
            {/* <button
            onClick={() => onCancel?.()}
              className="px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-red-500 text-white hover:bg-red-600 hover:scale-105"
            >
              Cancel
            </button> */}
          </>
        )}
        
        
        {status === 'retrying' && (
          <button
            onClick={() => onCancel?.()}
            className="button" >
            Cancel
          </button>
        )}
        
        {(status === 'success' || status === 'error') && (
          <button
            onClick={() => onComplete?.()}
            className={`button ${
              status === 'success'
                ? 'bg-green-500 text-black hover:bg-green-600 hover:scale-105'
                : 'bg-red-500 text-black hover:bg-red-600 hover:scale-105'
            }`}
          >
            {status === "success" ? "Continue" : "Try again"}
          </button>
        )}
      </div>
    </div>
  );
}
