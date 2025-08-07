import React, { useState, useEffect, useCallback, useRef } from 'react';

const UploadProgress = ({
    files = [],
    totalBytes = 0,
    uploadedBytes = 0,
    isUploading = false,
    onCancel,
    title = "Creating your transfer",
    showFileList = true
}) => {
    const [progress, setProgress] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState('Calculating...');
    const [startTime] = useState(Date.now());
    const intervalRef = useRef(null);

    // Calculate circumference for SVG circle (radius = 85)
    const circumference = 2 * Math.PI * 85;

    const formatBytes = useCallback((bytes) => {
        if (bytes === 0) return '0.0 MB';
        
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        const formatted = (bytes / Math.pow(1024, i)).toFixed(1);
        
        return `${formatted} ${sizes[i]}`;
    }, []);

    const formatTime = useCallback((seconds) => {
        if (seconds < 60) {
            return `${Math.round(seconds)}s remaining`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.round(seconds % 60);
            return `${minutes}m${remainingSeconds}s remaining`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h${minutes}m remaining`;
        }
    }, []);

    // Calculate progress and time remaining
    useEffect(() => {
        if (totalBytes > 0) {
            const progressPercent = (uploadedBytes / totalBytes) * 100;
            setProgress(progressPercent);

            if (isUploading && uploadedBytes > 0) {
                const elapsed = (Date.now() - startTime) / 1000; // seconds
                const uploadRate = uploadedBytes / elapsed; // bytes per second
                const remainingBytes = totalBytes - uploadedBytes;
                const remainingTime = remainingBytes / uploadRate; // seconds

                if (remainingTime > 0 && isFinite(remainingTime)) {
                    setTimeRemaining(formatTime(remainingTime));
                } else {
                    setTimeRemaining('Calculating...');
                }
            }
        }
    }, [uploadedBytes, totalBytes, isUploading, startTime, formatTime]);

    // Handle upload completion
    useEffect(() => {
        if (progress >= 100) {
            setTimeRemaining('Upload completed successfully');
        }
    }, [progress]);

    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel the upload?')) {
            onCancel?.();
        }
    };

    return (
        <div className={`upload-container ${progress >= 100 ? 'success' : ''}`}>
            <div className="progress-wrapper">
                {/* Circular Progress */}
                <div className="circular-progress">
                    <svg className="progress-ring" width="200" height="200">
                        <circle
                            className="progress-ring-background"
                            cx="100"
                            cy="100"
                            r="85"
                            fill="transparent"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                        />
                        <circle
                            className="progress-ring-circle"
                            cx="100"
                            cy="100"
                            r="85"
                            fill="transparent"
                            stroke="#10b981"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 100 100)"
                            style={{ 
                                transition: 'stroke-dashoffset 0.3s ease-in-out'
                            }}
                        />
                    </svg>
                    <div className="progress-text">
                        <span className="percentage">{Math.round(progress)}</span>
                        <span className="percent-symbol">%</span>
                    </div>
                </div>

                {/* Upload Details */}
                <div className="upload-details">
                    <h3 className="upload-title">{title}</h3>
                    <div className="upload-stats">
                        <p className="file-size">
                            <span className="uploaded">{formatBytes(uploadedBytes)}</span> out of{' '}
                            <span className="total">{formatBytes(totalBytes)}</span>
                        </p>
                        <p className="time-remaining">{timeRemaining}</p>
                    </div>
                </div>

                {/* Cancel Button */}
                <button 
                    className="cancel-btn" 
                    onClick={handleCancel}
                    disabled={!isUploading && progress < 100}
                >
                    {progress >= 100 ? 'Close' : 'Cancel'}
                </button>
            </div>

            {/* File List */}
            {showFileList && files.length > 0 && (
                <div className="file-list">
                    {files.map((file, index) => (
                        <div key={file.id || index} className="file-item">
                            <div className="file-info">
                                <div className="file-name">{file.name}</div>
                                <div className="file-size">{formatBytes(file.size)}</div>
                            </div>
                            <div className={`file-status ${file.status || 'uploading'}`}>
                                {file.statusText || (progress >= 100 ? 'Completed' : 'Uploading...')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .upload-container {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
                    padding: 40px;
                    text-align: center;
                    max-width: 400px;
                    width: 100%;
                    margin: 0 auto;
                }

                .progress-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 32px;
                }

                .circular-progress {
                    position: relative;
                    width: 200px;
                    height: 200px;
                }

                .progress-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    align-items: baseline;
                    justify-content: center;
                }

                .percentage {
                    font-size: 56px;
                    font-weight: 700;
                    color: #1f2937;
                    line-height: 1;
                }

                .percent-symbol {
                    font-size: 24px;
                    font-weight: 400;
                    color: #9ca3af;
                    margin-left: 4px;
                }

                .upload-details {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .upload-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 8px;
                }

                .upload-stats {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .file-size {
                    font-size: 16px;
                    color: #6b7280;
                    font-weight: 500;
                    margin: 0;
                }

                .uploaded,
                .total {
                    color: #1f2937;
                    font-weight: 600;
                }

                .time-remaining {
                    font-size: 14px;
                    color: #9ca3af;
                    margin: 0;
                }

                .cancel-btn {
                    background-color: #10b981;
                    color: white;
                    border: none;
                    padding: 14px 32px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
                }

                .cancel-btn:hover {
                    background-color: #059669;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
                }

                .cancel-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .file-list {
                    margin-top: 32px;
                }

                .file-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: #f9fafb;
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .file-info {
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                }

                .file-name {
                    font-weight: 500;
                    color: #1f2937;
                    font-size: 14px;
                }

                .file-size {
                    font-size: 12px;
                    color: #6b7280;
                }

                .file-status {
                    font-size: 12px;
                    font-weight: 500;
                }

                .file-status.uploading {
                    color: #10b981;
                }

                .file-status.completed {
                    color: #059669;
                }

                .file-status.error {
                    color: #ef4444;
                }

                .upload-container.success .upload-title {
                    color: #10b981;
                }

                @media (max-width: 480px) {
                    .upload-container {
                        margin: 16px;
                        padding: 24px;
                    }
                    
                    .circular-progress {
                        width: 160px;
                        height: 160px;
                    }
                    
                    .percentage {
                        font-size: 42px;
                    }
                    
                    .upload-title {
                        font-size: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default UploadProgress;
