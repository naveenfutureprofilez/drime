class ProgressBar {
    constructor() {
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.progressIcon = document.getElementById('progressIcon');
        this.progressStats = document.getElementById('progressStats');
        this.speedValue = document.getElementById('speedValue');
        this.etaValue = document.getElementById('etaValue');
        
        this.currentProgress = 0;
        this.totalSize = 100; // MB
        this.startTime = null;
        this.intervalId = null;
        this.isCompleted = false;
        this.hasError = false;
        
        this.reset();
    }
    
    formatSpeed(bytesPerSecond) {
        if (bytesPerSecond < 1024) {
            return `${bytesPerSecond.toFixed(1)} B/s`;
        } else if (bytesPerSecond < 1024 * 1024) {
            return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
        } else {
            return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity) {
            return '--:--';
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateProgress(progress) {
        if (this.isCompleted || this.hasError) return;
        
        this.currentProgress = Math.min(progress, 100);
        this.progressFill.style.width = `${this.currentProgress}%`;
        this.progressText.textContent = `${Math.round(this.currentProgress)}%`;
        
        // Calculate speed and ETA
        if (this.startTime) {
            const elapsedTime = (Date.now() - this.startTime) / 1000; // seconds
            const completedSize = (this.currentProgress / 100) * this.totalSize * 1024 * 1024; // bytes
            const speed = completedSize / elapsedTime; // bytes per second
            
            this.speedValue.textContent = this.formatSpeed(speed);
            
            // Calculate ETA
            if (this.currentProgress > 0 && this.currentProgress < 100) {
                const remainingSize = ((100 - this.currentProgress) / 100) * this.totalSize * 1024 * 1024;
                const eta = remainingSize / speed;
                this.etaValue.textContent = this.formatTime(eta);
            } else {
                this.etaValue.textContent = '--:--';
            }
        }
        
        // Check if completed
        if (this.currentProgress >= 100) {
            this.complete();
        }
    }
    
    start() {
        if (this.isCompleted || this.hasError) {
            this.reset();
        }
        
        this.startTime = Date.now();
        this.progressStats.classList.remove('hidden');
        
        // Simulate progress with variable speed
        this.intervalId = setInterval(() => {
            // Vary the increment to simulate real-world conditions
            const increment = Math.random() * 2 + 0.5; // 0.5 to 2.5% increment
            this.updateProgress(this.currentProgress + increment);
        }, 100);
    }
    
    complete() {
        this.isCompleted = true;
        clearInterval(this.intervalId);
        
        // Hide percentage text and show success icon
        this.progressText.style.opacity = '0';
        this.progressIcon.classList.add('show', 'success');
        this.progressFill.classList.add('success');
        
        // Update final stats
        this.etaValue.textContent = 'Complete';
        
        // Hide stats after a delay
        setTimeout(() => {
            this.progressStats.classList.add('hidden');
        }, 2000);
    }
    
    error() {
        this.hasError = true;
        clearInterval(this.intervalId);
        
        // Hide percentage text and show error icon
        this.progressText.style.opacity = '0';
        this.progressIcon.classList.add('show', 'error');
        this.progressFill.classList.add('error');
        
        // Update stats to show error
        this.speedValue.textContent = '0 KB/s';
        this.etaValue.textContent = 'Error';
        
        // Hide stats after a delay
        setTimeout(() => {
            this.progressStats.classList.add('hidden');
        }, 2000);
    }
    
    reset() {
        clearInterval(this.intervalId);
        
        this.currentProgress = 0;
        this.startTime = null;
        this.isCompleted = false;
        this.hasError = false;
        
        this.progressFill.style.width = '0%';
        this.progressFill.classList.remove('success', 'error');
        this.progressText.textContent = '0%';
        this.progressText.style.opacity = '1';
        this.progressIcon.classList.remove('show', 'success', 'error');
        this.progressStats.classList.add('hidden');
        this.speedValue.textContent = '0 KB/s';
        this.etaValue.textContent = '--:--';
    }
}

// Initialize progress bar
const progressBarInstance = new ProgressBar();

// Global functions for buttons
function startProgress() {
    progressBarInstance.start();
}

function simulateError() {
    // Wait a bit then trigger error
    setTimeout(() => {
        progressBarInstance.error();
    }, Math.random() * 2000 + 1000); // Random delay between 1-3 seconds
}

function resetProgress() {
    progressBarInstance.reset();
}

// Auto-start demo on page load
document.addEventListener('DOMContentLoaded', () => {
    // Auto-start after 1 second for demo purposes
    setTimeout(() => {
        startProgress();
    }, 1000);
});
