<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Progress Demo</title>
    <link rel="stylesheet" href="../public/css/upload-progress.css">
    <style>
        body {
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .demo-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
        }
        
        .demo-controls button {
            display: block;
            width: 100%;
            margin-bottom: 10px;
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #6366f1;
            color: white;
            cursor: pointer;
            font-size: 14px;
        }
        
        .demo-controls button:hover {
            background: #5856eb;
        }
        
        .demo-title {
            color: white;
            text-align: center;
            margin-bottom: 40px;
            font-size: 32px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <div class="demo-title">Upload Progress Interface</div>
    
    <div class="demo-controls">
        <h4 style="margin-top: 0;">Demo Controls</h4>
        <button onclick="startDemo()">Start Upload Demo</button>
        <button onclick="simulateError()">Simulate Error</button>
        <button onclick="resetDemo()">Reset</button>
        <button onclick="toggleFileList()">Toggle File List</button>
    </div>

    <div class="upload-container">
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
                <h3 class="upload-title">Creating your transfer</h3>
                <div class="upload-stats">
                    <p class="file-size">
                        <span class="uploaded">0.0 MB</span> out of <span class="total">612.1 MB</span>
                    </p>
                    <p class="time-remaining">3m25s remaining</p>
                </div>
            </div>

            <!-- Cancel Button -->
            <button class="cancel-btn" onclick="cancelUpload()">Cancel</button>
        </div>

        <!-- File List -->
        <div class="file-list" id="fileList" style="display: none;">
            <div class="file-item">
                <div class="file-info">
                    <div class="file-name">presentation.pdf</div>
                    <div class="file-size">45.2 MB</div>
                </div>
                <div class="file-status uploading">Uploading...</div>
            </div>
            <div class="file-item">
                <div class="file-info">
                    <div class="file-name">videos.zip</div>
                    <div class="file-size">234.5 MB</div>
                </div>
                <div class="file-status uploading">Uploading...</div>
            </div>
            <div class="file-item">
                <div class="file-info">
                    <div class="file-name">documents.docx</div>
                    <div class="file-size">332.4 MB</div>
                </div>
                <div class="file-status uploading">Uploading...</div>
            </div>
        </div>
    </div>

    <script src="../public/js/upload-progress.js"></script>
    <script>
        let demoInterval = null;
        let isDemo = false;

        function startDemo() {
            if (demoInterval) clearInterval(demoInterval);
            
            const container = document.querySelector('.upload-container');
            container.classList.remove('success', 'error');
            
            let progress = 0;
            const totalMB = 612.1;
            let uploadedMB = 16.0; // Start at 16MB like in the image
            
            // Update initial state
            updateProgress(Math.round((uploadedMB / totalMB) * 100));
            updateFileSize(uploadedMB, totalMB);
            updateTimeRemaining('3m25s remaining');
            setTitle('Creating your transfer');
            
            isDemo = true;
            
            demoInterval = setInterval(() => {
                if (uploadedMB < totalMB) {
                    uploadedMB += Math.random() * 8; // Random increment
                    if (uploadedMB > totalMB) uploadedMB = totalMB;
                    
                    progress = (uploadedMB / totalMB) * 100;
                    
                    updateProgress(Math.round(progress));
                    updateFileSize(uploadedMB, totalMB);
                    
                    // Calculate fake time remaining
                    const remaining = totalMB - uploadedMB;
                    const timeInSeconds = (remaining / 8) * 2; // Rough estimate
                    if (timeInSeconds > 60) {
                        const minutes = Math.floor(timeInSeconds / 60);
                        const seconds = Math.floor(timeInSeconds % 60);
                        updateTimeRemaining(`${minutes}m${seconds}s remaining`);
                    } else {
                        updateTimeRemaining(`${Math.floor(timeInSeconds)}s remaining`);
                    }
                    
                    if (progress >= 100) {
                        clearInterval(demoInterval);
                        setSuccess();
                        updateCompletedFiles();
                        isDemo = false;
                    }
                }
            }, 300);
        }

        function simulateError() {
            if (demoInterval) clearInterval(demoInterval);
            
            const container = document.querySelector('.upload-container');
            container.classList.add('error');
            
            setTitle('Upload failed');
            updateTimeRemaining('Connection error occurred');
            document.querySelector('.cancel-btn').textContent = 'Retry';
            
            // Mark some files as error
            const fileItems = document.querySelectorAll('.file-status');
            fileItems.forEach((status, index) => {
                if (index < 2) {
                    status.className = 'file-status error';
                    status.textContent = 'Failed';
                }
            });
            
            isDemo = false;
        }

        function resetDemo() {
            if (demoInterval) clearInterval(demoInterval);
            
            const container = document.querySelector('.upload-container');
            container.classList.remove('success', 'error');
            
            updateProgress(0);
            updateFileSize(0, 612.1);
            updateTimeRemaining('Calculating...');
            setTitle('Creating your transfer');
            document.querySelector('.cancel-btn').textContent = 'Cancel';
            
            // Reset file statuses
            const fileItems = document.querySelectorAll('.file-status');
            fileItems.forEach(status => {
                status.className = 'file-status uploading';
                status.textContent = 'Uploading...';
            });
            
            isDemo = false;
        }

        function toggleFileList() {
            const fileList = document.getElementById('fileList');
            fileList.style.display = fileList.style.display === 'none' ? 'block' : 'none';
        }

        function updateProgress(percentage) {
            document.querySelector('.percentage').textContent = percentage;
            const circumference = 2 * Math.PI * 85;
            const offset = circumference - (percentage / 100) * circumference;
            document.querySelector('.progress-ring-circle').style.strokeDashoffset = offset;
        }

        function updateFileSize(uploaded, total) {
            document.querySelector('.uploaded').textContent = `${uploaded.toFixed(1)} MB`;
            document.querySelector('.total').textContent = `${total.toFixed(1)} MB`;
        }

        function updateTimeRemaining(text) {
            document.querySelector('.time-remaining').textContent = text;
        }

        function setTitle(title) {
            document.querySelector('.upload-title').textContent = title;
        }

        function setSuccess() {
            const container = document.querySelector('.upload-container');
            container.classList.add('success');
            setTitle('Transfer completed');
            updateTimeRemaining('Upload completed successfully');
            document.querySelector('.cancel-btn').textContent = 'Close';
        }

        function updateCompletedFiles() {
            const fileItems = document.querySelectorAll('.file-status');
            fileItems.forEach(status => {
                status.className = 'file-status completed';
                status.textContent = 'Completed';
            });
        }

        function cancelUpload() {
            if (isDemo && confirm('Are you sure you want to cancel the upload?')) {
                resetDemo();
            } else if (!isDemo) {
                alert('Upload completed or not running');
            }
        }

        // Initialize with the state shown in your image
        window.addEventListener('load', () => {
            updateProgress(25);
            updateFileSize(16.0, 612.1);
            updateTimeRemaining('3m25s remaining');
        });
    </script>
</body>
</html>
