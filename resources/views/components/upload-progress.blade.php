@props([
    'uploadId' => 'upload-progress',
    'title' => 'Creating your transfer',
    'showFileList' => true,
    'cancelUrl' => null,
    'maxSize' => null
])

<div class="upload-container" id="{{ $uploadId }}">
    <div class="progress-wrapper">
        <!-- Circular Progress -->
        <div class="circular-progress">
            <svg class="progress-ring" width="200" height="200">
                <circle
                    class="progress-ring-background"
                    cx="100"
                    cy="100"
                    r="85"
                />
                <circle
                    class="progress-ring-circle"
                    cx="100"
                    cy="100"
                    r="85"
                    stroke-dasharray="534.07"
                    stroke-dashoffset="534.07"
                />
            </svg>
            <div class="progress-text">
                <span class="percentage">0</span>
                <span class="percent-symbol">%</span>
            </div>
        </div>

        <!-- Upload Details -->
        <div class="upload-details">
            <h3 class="upload-title">{{ $title }}</h3>
            <div class="upload-stats">
                <p class="file-size">
                    <span class="uploaded">0.0 MB</span> out of <span class="total">0.0 MB</span>
                </p>
                <p class="time-remaining">Calculating...</p>
            </div>
        </div>

        <!-- Cancel Button -->
        <button class="cancel-btn" onclick="handleCancel('{{ $uploadId }}', '{{ $cancelUrl }}')">
            Cancel
        </button>
    </div>

    @if($showFileList)
    <!-- File List -->
    <div class="file-list" id="{{ $uploadId }}-files">
        <!-- Files will be populated here via JavaScript -->
    </div>
    @endif
</div>

<style>
/* Include the CSS inline or reference external file */
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

.progress-ring {
    transform: rotate(-90deg);
}

.progress-ring-background {
    fill: transparent;
    stroke: #e5e7eb;
    stroke-width: 8;
}

.progress-ring-circle {
    fill: transparent;
    stroke: #10b981;
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.3s ease-in-out;
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

.file-list {
    margin-top: 32px;
    display: none;
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

.upload-container.success .progress-ring-circle {
    stroke: #10b981;
}

.upload-container.success .upload-title {
    color: #10b981;
}

.upload-container.error .progress-ring-circle {
    stroke: #ef4444;
}

.upload-container.error .upload-title {
    color: #ef4444;
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
    
    .progress-ring {
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
</style>

<script>
class UploadProgressManager {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.progressCircle = this.container.querySelector('.progress-ring-circle');
        this.percentageText = this.container.querySelector('.percentage');
        this.uploadedText = this.container.querySelector('.uploaded');
        this.totalText = this.container.querySelector('.total');
        this.timeRemainingText = this.container.querySelector('.time-remaining');
        this.uploadTitle = this.container.querySelector('.upload-title');
        this.fileList = this.container.querySelector('.file-list');
        
        this.circumference = 2 * Math.PI * 85;
        this.startTime = Date.now();
        this.totalBytes = 0;
        this.uploadedBytes = 0;
        
        this.setupProgressCircle();
    }
    
    setupProgressCircle() {
        this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.progressCircle.style.strokeDashoffset = this.circumference;
    }
    
    updateProgress(percentage, uploaded, total) {
        this.uploadedBytes = uploaded;
        this.totalBytes = total;
        
        // Update percentage
        this.percentageText.textContent = Math.round(percentage);
        
        // Update progress circle
        const offset = this.circumference - (percentage / 100) * this.circumference;
        this.progressCircle.style.strokeDashoffset = offset;
        
        // Update file sizes
        this.uploadedText.textContent = this.formatBytes(uploaded);
        this.totalText.textContent = this.formatBytes(total);
        
        // Update time remaining
        this.updateTimeRemaining();
    }
    
    updateTimeRemaining() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        const uploadRate = this.uploadedBytes / elapsed;
        const remainingBytes = this.totalBytes - this.uploadedBytes;
        const remainingTime = remainingBytes / uploadRate;
        
        if (remainingTime > 0 && isFinite(remainingTime)) {
            this.timeRemainingText.textContent = this.formatTime(remainingTime);
        } else {
            this.timeRemainingText.textContent = 'Calculating...';
        }
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0.0 MB';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }
    
    formatTime(seconds) {
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
    }
    
    setTitle(title) {
        this.uploadTitle.textContent = title;
    }
    
    setSuccess() {
        this.container.classList.add('success');
        this.setTitle('Transfer completed');
        this.timeRemainingText.textContent = 'Upload completed successfully';
        this.container.querySelector('.cancel-btn').textContent = 'Close';
    }
    
    setError(message) {
        this.container.classList.add('error');
        this.setTitle('Upload failed');
        this.timeRemainingText.textContent = message || 'Upload failed';
        this.container.querySelector('.cancel-btn').textContent = 'Retry';
    }
    
    addFile(file) {
        if (this.fileList) {
            this.fileList.style.display = 'block';
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatBytes(file.size)}</div>
                </div>
                <div class="file-status uploading">Uploading...</div>
            `;
            this.fileList.appendChild(fileItem);
        }
    }
}

// Global function for cancel button
function handleCancel(uploadId, cancelUrl) {
    if (confirm('Are you sure you want to cancel the upload?')) {
        if (cancelUrl) {
            window.location.href = cancelUrl;
        } else {
            // Default behavior
            window.location.reload();
        }
    }
}

// Initialize upload progress manager
window.uploadManagers = window.uploadManagers || {};
if (document.getElementById('{{ $uploadId }}')) {
    window.uploadManagers['{{ $uploadId }}'] = new UploadProgressManager('{{ $uploadId }}');
}
</script>
