import React, { useState, useEffect, useCallback } from 'react';
import { Trans } from '@ui/i18n/trans';
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
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return {
          ring: '#10b981', // green
          bg: 'rgba(16, 185, 129, 0.1)',
          text: '#10b981'
        };
      case 'error':
        return {
          ring: '#ef4444', // red
          bg: 'rgba(239, 68, 68, 0.1)',
          text: '#ef4444'
        };
      default:
        return {
          ring: '#ffffff', // white
          bg: 'rgba(255, 255, 255, 0.1)',
          text: '#ffffff'
        };
    }
  };

  const colors = getStatusColor();

  return (
    <div className="min-h-screen flex items-center justify-center" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="w-full max-w-md mx-auto p-8">
        {/* Circular Progress */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress Circle */}
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  stroke={colors.ring}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  style={{
                    transition: 'stroke-dashoffset 0.3s ease-in-out',
                    filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.5))'
                  }}
                />
              </svg>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {status === 'success' ? (
                    <div className="text-white">
                      <svg className="w-12 h-12 mx-auto mb-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div className="text-2xl font-bold">Complete!</div>
                    </div>
                  ) : status === 'error' ? (
                    <div className="text-white">
                      <svg className="w-12 h-12 mx-auto mb-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div className="text-2xl font-bold">Error</div>
                    </div>
                  ) : (
                    <div className="text-white">
                      <div className="text-5xl font-bold mb-2">
                        {Math.round(displayProgress)}%
                      </div>
                      <div className="text-lg opacity-90">
                        <Trans message="Uploading" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Stats */}
        {status === 'uploading' && (
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-6 text-white">
              <div>
                <div className="text-sm opacity-75 mb-1">
                  <Trans message="Total size" />
                </div>
                <div className="text-lg font-semibold">
                  {prettyBytes(totalSize)}
                </div>
              </div>
              <div>
                <div className="text-sm opacity-75 mb-1">
                  <Trans message="Speed" />
                </div>
                <div className="text-lg font-semibold">
                  {formatSpeed(uploadSpeed)}
                </div>
              </div>
              <div>
                <div className="text-sm opacity-75 mb-1">
                  <Trans message="Time remaining" />
                </div>
                <div className="text-lg font-semibold">
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <div>
                <div className="text-sm opacity-75 mb-1">
                  <Trans message="Files" />
                </div>
                <div className="text-lg font-semibold">
                  {files.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">
              <Trans message="Files" /> ({files.length})
            </h3>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 text-white">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {file.name}
                    </div>
                    <div className="text-xs opacity-75">
                      {prettyBytes(file.size)}
                    </div>
                  </div>
                  {status === 'uploading' && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-xs opacity-75">
                        <Trans message="Uploading" />
                      </span>
                    </div>
                  )}
                  {status === 'success' && (
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {status === 'error' && (
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Button */}
        {status === 'uploading' && onCancel && (
          <div className="text-center">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl text-white font-medium transition-all duration-200 hover:scale-105"
            >
              <Trans message="Cancel upload" />
            </button>
          </div>
        )}

        {/* Success/Error Actions */}
        {(status === 'success' || status === 'error') && (
          <div className="text-center space-y-3">
            {status === 'success' && (
              <div className="text-center text-white opacity-90 mb-4">
                <Trans message="Your files have been uploaded successfully!" />
              </div>
            )}
            {status === 'error' && (
              <div className="text-center text-white opacity-90 mb-4">
                <Trans message="Upload failed. Please try again." />
              </div>
            )}
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-opacity-90 transition-all duration-200 hover:scale-105"
            >
              {status === 'success' ? 
                <Trans message="Continue" /> : 
                <Trans message="Try again" />
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
