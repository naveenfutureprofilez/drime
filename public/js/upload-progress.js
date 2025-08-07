/**
 * Upload Progress Manager
 * Handles the upload progress interface including circular progress,
 * file size updates, time estimation, and upload cancellation
 */

class UploadProgress {
    constructor() {
        this.progressCircle = document.querySelector('.progress-ring-circle');
        this.percentageText = document.querySelector('.percentage');
        this.uploadedText = document.querySelector('.uploaded');
        this.totalText = document.querySelector('.total');
        this.timeRemainingText = document.querySelector('.time-remaining');
        this.uploadTitle = document.querySelector('.upload-title');
        this.fileList = document.getElementById('fileList');
        this.container = document.querySelector('.upload-container');
        
        // Progress calculation
        this.circumference = 2 * Math.PI * 85; // radius = 85
        this.startTime = Date.now();
        this.totalBytes = 0;
        this.uploadedBytes = 0;
        this.files = [];
        
        // Initialize
        this.setupProgressCircle();
        
        // Simulate upload for demo (remove in production)
        this.simulateUpload();
    }
    
    setupProgressCircle() {
        // Set up the stroke-dasharray
        this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.progressCircle.style.strokeDashoffset = this.circumference;
    }
    
    updateProgress(percentage) {
        // Update percentage text
        this.percentageText.textContent = Math.round(percentage);
        
        // Update progress circle
        const offset = this.circumference - (percentage / 100) * this.circumference;
        this.progressCircle.style.strokeDashoffset = offset;
    }
    
    updateFileSize(uploaded, total) {
        this.uploadedBytes = uploaded;
        this.totalBytes = total;
        
        this.uploadedText.textContent = this.formatBytes(uploaded);
        this.totalText.textContent = this.formatBytes(total);
    }
    
    updateTimeRemaining() {
        const elapsed = (Date.now() - this.startTime) / 1000; // seconds
        const uploadRate = this.uploadedBytes / elapsed; // bytes per second
        const remainingBytes = this.totalBytes - this.uploadedBytes;
        const remainingTime = remainingBytes / uploadRate; // seconds
        
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
        const formatted = (bytes / Math.pow(1024, i)).toFixed(1);
        
        return `${formatted} ${sizes[i]}`;
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
    
    addFile(file) {
        this.files.push(file);
        this.totalBytes += file.size;
        this.updateFileSize(this.uploadedBytes, this.totalBytes);
        this.renderFileList();
    }
    
    renderFileList() {
        if (this.files.length > 0) {
            this.fileList.style.display = 'block';
            this.fileList.innerHTML = this.files.map(file => `
                <div class="file-item" data-file-id="${file.id}">
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatBytes(file.size)}</div>
                    </div>
                    <div class="file-status ${file.status}">${file.statusText}</div>
                </div>
            `).join('');
        }
    }
    
    updateFileStatus(fileId, status, statusText) {
        const file = this.files.find(f => f.id === fileId);
        if (file) {
            file.status = status;
            file.statusText = statusText;
            this.renderFileList();
        }
    }
    
    setSuccess() {
        this.container.classList.add('success');
        this.setTitle('Transfer completed');
        this.timeRemainingText.textContent = 'Upload completed successfully';
        document.querySelector('.cancel-btn').textContent = 'Close';
    }
    
    setError(message = 'Upload failed') {
        this.container.classList.add('error');
        this.setTitle('Upload failed');
        this.timeRemainingText.textContent = message;
        document.querySelector('.cancel-btn').textContent = 'Retry';
    }
    
    // Demo simulation (remove in production)
    simulateUpload() {
        // Add demo files
        this.addFile({ id: 1, name: 'document.pdf', size: 612.1 * 1024 * 1024, status: 'uploading', statusText: 'Uploading...' });
        
        let progress = 0;
        let uploaded = 0;
        const total = 612.1 * 1024 * 1024; // 612.1 MB
        
        const interval = setInterval(() => {
            progress += Math.random() * 3; // Random increment
            uploaded = (progress / 100) * total;
            
            if (progress >= 100) {
                progress = 100;
                uploaded = total;
                clearInterval(interval);
                this.setSuccess();
                this.updateFileStatus(1, 'completed', 'Completed');
            }
            
            this.updateProgress(progress);
            this.updateFileSize(uploaded, total);
            this.updateTimeRemaining();
        }, 200);
    }
}

// Global functions
function cancelUpload() {
    if (confirm('Are you sure you want to cancel the upload?')) {
        // Implement cancel logic here
        window.location.reload(); // Simple reload for demo
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uploadProgress = new UploadProgress();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UploadProgress;
}
