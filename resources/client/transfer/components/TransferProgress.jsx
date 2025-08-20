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
  status = 'uploading' // 'uploading', 'success', 'error'
}) {
  const [displayProgress, setDisplayProgress] = useState(progress);
  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
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

  console.log("files", files)
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
            stroke="#08CF65"
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
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-gray-800">
          {Math.round(displayProgress)}%
        </span>
      </div>

      {/* Text and Button */}
      <div className="flex flex-col items-center text-center">
        <h3 className="normal-heading">Creating your transfer</h3>
        <p className="normal-para mt-2">{uploadSpeed}</p>
        <p className="normal-para mt-2">
          {totalSize} out of {files.length}
        </p>
        <p className="normal-para !mb-6">{timeRemaining} remaining</p>
      </div>

      <button
        onClick={onComplete}
        className="px-8 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-opacity-90 transition-all duration-200 hover:scale-105"
      >
        {status === "success" ? "Continue" : "Try again"}
      </button>

      {(status === "success" || status === "error") && (
        <div className="text-center space-y-3 mt-6">
          {status === "success" && (
            <p className="normal-para !mb-6 text-black opacity-90">
              Your files have been uploaded successfully!
            </p>
          )}
          {status === "error" && (
            <p className="normal-para !mb-6 text-black opacity-90">
              Upload failed. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
