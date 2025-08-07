@props([
    'uploadId' => 'upload-progress',
    'progress' => 25,
    'uploaded' => '16.0 MB',
    'total' => '612.1 MB',
    'timeRemaining' => '3m25s remaining',
    'title' => 'Creating your transfer',
    'showCancel' => true,
    'cancelText' => 'Cancel',
    'onCancel' => null
])

<div class="upload-progress-container" id="{{ $uploadId }}">
    <div class="progress-section">
        <!-- Circular Progress Ring -->
        <div class="circular-progress">
            <svg class="progress-svg" viewBox="0 0 120 120">
                <!-- Background Circle -->
                <circle
                    class="progress-bg"
                    cx="60"
                    cy="60"
                    r="54"
                />
                <!-- Progress Circle -->
                <circle
                    class="progress-fill"
                    cx="60"
                    cy="60"
                    r="54"
                    style="--progress: {{ $progress }}%"
                />
            </svg>
        </div>
        
        <!-- Progress Percentage -->
        <div class="progress-percentage">{{ $progress }} %</div>
        
        <!-- Upload Information -->
        <div class="upload-info">
            <h3 class="upload-title">{{ $title }}</h3>
            <p class="upload-stats">{{ $uploaded }} out of {{ $total }}</p>
            <p class="upload-time">{{ $timeRemaining }}</p>
        </div>
        
        <!-- Cancel Button -->
        @if($showCancel)
        <button 
            class="cancel-button" 
            onclick="{{ $onCancel ?? 'handleUploadCancel()' }}"
        >
            {{ $cancelText }}
        </button>
        @endif
    </div>
</div>

<style>
.upload-progress-container {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 24px;
    padding: 48px 32px;
    max-width: 420px;
    width: 100%;
    margin: 0 auto;
    text-align: center;
    position: relative;
    overflow: hidden;
}

/* Background pattern overlay */
.upload-progress-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%);
    pointer-events: none;
}

.progress-section {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
}

/* Circular Progress */
.circular-progress {
    position: relative;
    width: 180px;
    height: 180px;
}

.progress-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.progress-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.2);
    stroke-width: 8;
}

.progress-fill {
    fill: none;
    stroke: #ffffff;
    stroke-width: 8;
    stroke-linecap: round;
    stroke-dasharray: 339.292; /* 2 * π * 54 */
    stroke-dashoffset: calc(339.292 - (339.292 * var(--progress)) / 100);
    transition: stroke-dashoffset 0.5s ease-in-out;
    filter: drop-shadow(0 0 6px rgba(255,255,255,0.3));
}

/* Progress Percentage Text */
.progress-percentage {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 32px;
    font-weight: 700;
    color: white;
    text-shadow: 0 2px 8px rgba(0,0,0,0.2);
    letter-spacing: -0.5px;
}

/* Upload Information */
.upload-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.upload-title {
    font-size: 28px;
    font-weight: 700;
    color: white;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    letter-spacing: -0.5px;
}

.upload-stats {
    font-size: 18px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.upload-time {
    font-size: 16px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
}

/* Cancel Button */
.cancel-button {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 14px 28px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    min-width: 100px;
}

.cancel-button:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

.cancel-button:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Responsive Design */
@media (max-width: 480px) {
    .upload-progress-container {
        padding: 32px 24px;
        margin: 16px;
    }
    
    .circular-progress {
        width: 140px;
        height: 140px;
    }
    
    .progress-percentage {
        font-size: 24px;
    }
    
    .upload-title {
        font-size: 22px;
    }
    
    .upload-stats {
        font-size: 16px;
    }
    
    .upload-time {
        font-size: 14px;
    }
}

/* Animation for progress updates */
@keyframes progressPulse {
    0%, 100% { 
        filter: drop-shadow(0 0 6px rgba(255,255,255,0.3));
    }
    50% { 
        filter: drop-shadow(0 0 12px rgba(255,255,255,0.5));
    }
}

.progress-fill.updating {
    animation: progressPulse 2s ease-in-out infinite;
}

/* Loading state */
.upload-progress-container.loading .progress-percentage::after {
    content: '';
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    display: inline-block;
    margin-left: 8px;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Success state */
.upload-progress-container.success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.upload-progress-container.success .progress-fill {
    stroke: #ffffff;
    animation: progressPulse 1s ease-in-out 3;
}

/* Error state */
.upload-progress-container.error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.upload-progress-container.error .progress-fill {
    stroke: #ffffff;
}
</style>

<script>
// Upload Progress Manager
class ImprovedUploadProgress {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.progressFill = this.container.querySelector('.progress-fill');
        this.progressText = this.container.querySelector('.progress-percentage');
        this.uploadedText = this.container.querySelector('.upload-stats');
        this.timeText = this.container.querySelector('.upload-time');
        this.titleText = this.container.querySelector('.upload-title');
        this.cancelBtn = this.container.querySelector('.cancel-button');
        
        this.currentProgress = {{ $progress }};
        this.circumference = 339.292; // 2 * π * 54
    }
    
    updateProgress(progress, uploaded = null, total = null, timeRemaining = null) {
        // Update progress ring
        this.currentProgress = Math.max(0, Math.min(100, progress));
        const offset = this.circumference - (this.circumference * this.currentProgress) / 100;
        
        this.progressFill.style.setProperty('--progress', `${this.currentProgress}%`);
        this.progressText.textContent = `${Math.round(this.currentProgress)} %`;
        
        // Update file sizes if provided
        if (uploaded && total) {
            this.uploadedText.textContent = `${uploaded} out of ${total}`;
        }
        
        // Update time remaining if provided
        if (timeRemaining) {
            this.timeText.textContent = timeRemaining;
        }
        
        // Add updating animation
        this.progressFill.classList.add('updating');
        setTimeout(() => {
            this.progressFill.classList.remove('updating');
        }, 500);
    }
    
    setTitle(title) {
        this.titleText.textContent = title;
    }
    
    setLoading(loading = true) {
        this.container.classList.toggle('loading', loading);
    }
    
    setSuccess() {
        this.container.classList.remove('loading', 'error');
        this.container.classList.add('success');
        this.setTitle('Transfer completed');
        this.timeText.textContent = 'Upload completed successfully';
        this.cancelBtn.textContent = 'Close';
        this.updateProgress(100);
    }
    
    setError(message = 'Upload failed') {
        this.container.classList.remove('loading', 'success');
        this.container.classList.add('error');
        this.setTitle('Upload failed');
        this.timeText.textContent = message;
        this.cancelBtn.textContent = 'Retry';
    }
    
    reset() {
        this.container.classList.remove('loading', 'success', 'error');
        this.setTitle('Creating your transfer');
        this.updateProgress(0, '0.0 MB', '0.0 MB', 'Calculating...');
        this.cancelBtn.textContent = 'Cancel';
    }
}

// Initialize the upload progress manager
window.addEventListener('DOMContentLoaded', () => {
    if (!window.uploadManagers) window.uploadManagers = {};
    if (document.getElementById('{{ $uploadId }}')) {
        window.uploadManagers['{{ $uploadId }}'] = new ImprovedUploadProgress('{{ $uploadId }}');
    }
});

// Global cancel handler (can be overridden)
function handleUploadCancel() {
    if (confirm('Are you sure you want to cancel the upload?')) {
        // Add your cancel logic here
        console.log('Upload cancelled');
        // Example: window.location.reload();
    }
}
</script>
