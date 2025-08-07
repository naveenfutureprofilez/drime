<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Progress - Laravel Blade Demo</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .demo-header {
            color: white;
            text-align: center;
            margin-bottom: 40px;
        }
        
        .demo-header h1 {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 10px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .demo-header p {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
        }
        
        .demo-controls {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            text-align: center;
        }
        
        .demo-controls h3 {
            margin-top: 0;
            color: #1f2937;
        }
        
        .control-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .control-buttons button {
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #6366f1;
            color: white;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }
        
        .control-buttons button:hover {
            background: #5856eb;
        }
        
        .demo-info {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 12px;
            color: white;
            margin-top: 30px;
            max-width: 500px;
            text-align: center;
        }
        
        .demo-info h3 {
            margin-top: 0;
            color: white;
        }
        
        .route-info {
            background: rgba(0,0,0,0.2);
            padding: 10px;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="demo-header">
        <h1>Upload Progress Interface</h1>
        <p>Laravel Blade Component Demo</p>
    </div>
    
    <div class="demo-controls">
        <h3>Demo Controls</h3>
        <div class="control-buttons">
            <button onclick="startDemo()">Start Upload Demo</button>
            <button onclick="simulateError()">Simulate Error</button>
            <button onclick="resetDemo()">Reset</button>
            <button onclick="toggleFileList()">Toggle File List</button>
        </div>
    </div>

    {{-- Using the Upload Progress Blade Component --}}
    <x-upload-progress 
        uploadId="blade-demo-upload" 
        title="Creating your transfer"
        :showFileList="true" 
        cancelUrl="{{ route('demo.upload-progress') }}" 
    />
    
    <div class="demo-info">
        <h3>Laravel Blade Component Usage</h3>
        <div class="route-info">
            &lt;x-upload-progress 
                uploadId="blade-demo-upload" 
                title="Creating your transfer"
                :showFileList="true" 
                cancelUrl="{{ route('demo.upload-progress') }}" 
            /&gt;
        </div>
        <p>This demo uses the Laravel Blade component with built-in JavaScript functionality. 
        The component is reusable and can be customized with various props.</p>
    </div>

    <script>
        // Demo control functions
        let demoInterval = null;
        let isDemo = false;

        function startDemo() {
            if (demoInterval) clearInterval(demoInterval);
            
            const manager = window.uploadManagers['blade-demo-upload'];
            if (!manager) return;
            
            let progress = 0;
            const totalBytes = 612.1 * 1024 * 1024; // 612.1 MB
            let uploadedBytes = 16.0 * 1024 * 1024; // Start at 16MB
            
            manager.container.classList.remove('success', 'error');
            manager.setTitle('Creating your transfer');
            manager.updateProgress((uploadedBytes / totalBytes) * 100, uploadedBytes, totalBytes);
            
            isDemo = true;
            
            demoInterval = setInterval(() => {
                if (uploadedBytes < totalBytes) {
                    uploadedBytes += Math.random() * 8 * 1024 * 1024; // Random increment
                    if (uploadedBytes > totalBytes) uploadedBytes = totalBytes;
                    
                    progress = (uploadedBytes / totalBytes) * 100;
                    manager.updateProgress(progress, uploadedBytes, totalBytes);
                    
                    if (progress >= 100) {
                        clearInterval(demoInterval);
                        manager.setSuccess();
                        isDemo = false;
                    }
                }
            }, 300);
        }

        function simulateError() {
            if (demoInterval) clearInterval(demoInterval);
            
            const manager = window.uploadManagers['blade-demo-upload'];
            if (!manager) return;
            
            manager.setError('Connection error occurred');
            isDemo = false;
        }

        function resetDemo() {
            if (demoInterval) clearInterval(demoInterval);
            
            const manager = window.uploadManagers['blade-demo-upload'];
            if (!manager) return;
            
            manager.container.classList.remove('success', 'error');
            manager.setTitle('Creating your transfer');
            manager.updateProgress(0, 0, 612.1 * 1024 * 1024);
            manager.container.querySelector('.cancel-btn').textContent = 'Cancel';
            isDemo = false;
        }

        function toggleFileList() {
            const manager = window.uploadManagers['blade-demo-upload'];
            if (!manager || !manager.fileList) return;
            
            if (manager.fileList.style.display === 'none' || !manager.fileList.style.display) {
                // Show file list with demo files
                manager.fileList.style.display = 'block';
                manager.fileList.innerHTML = `
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
                `;
            } else {
                manager.fileList.style.display = 'none';
            }
        }

        // Initialize with the state from your image
        window.addEventListener('load', () => {
            setTimeout(() => {
                const manager = window.uploadManagers['blade-demo-upload'];
                if (manager) {
                    const totalBytes = 612.1 * 1024 * 1024;
                    const uploadedBytes = 16.0 * 1024 * 1024;
                    manager.updateProgress(25, uploadedBytes, totalBytes);
                    
                    // Set custom time remaining
                    manager.timeRemainingText.textContent = '3m25s remaining';
                }
            }, 100);
        });
    </script>
</body>
</html>
