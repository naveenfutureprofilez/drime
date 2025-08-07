<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Improved Upload Progress - Matches Your Design</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            min-height: 100vh;
            margin: 0;
            padding: 40px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .demo-header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .demo-header h1 {
            font-size: 36px;
            font-weight: 700;
            margin: 0 0 12px 0;
            color: #1f2937;
        }
        
        .demo-header p {
            font-size: 16px;
            color: #6b7280;
            margin: 0 0 20px 0;
        }
        
        .demo-controls {
            background: white;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            margin-bottom: 32px;
            text-align: center;
            max-width: 500px;
        }
        
        .demo-controls h3 {
            margin: 0 0 16px 0;
            color: #1f2937;
            font-size: 18px;
        }
        
        .control-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
            margin-bottom: 16px;
        }
        
        .control-buttons button {
            padding: 12px 16px;
            border: none;
            border-radius: 8px;
            background: #6366f1;
            color: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .control-buttons button:hover {
            background: #5856eb;
            transform: translateY(-1px);
        }
        
        .control-buttons button.success {
            background: #10b981;
        }
        
        .control-buttons button.success:hover {
            background: #059669;
        }
        
        .control-buttons button.error {
            background: #ef4444;
        }
        
        .control-buttons button.error:hover {
            background: #dc2626;
        }
        
        .progress-values {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            gap: 8px;
        }
        
        .progress-values button {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: white;
            color: #374151;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
        }
        
        .progress-values button:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
        }
        
        .integration-info {
            background: white;
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            margin-top: 32px;
            max-width: 600px;
        }
        
        .integration-info h3 {
            margin: 0 0 16px 0;
            color: #1f2937;
        }
        
        .code-block {
            background: #1f2937;
            color: #e5e7eb;
            padding: 16px;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            line-height: 1.5;
            overflow-x: auto;
            margin: 12px 0;
        }
        
        .feature-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin: 16px 0;
        }
        
        .feature-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #374151;
        }
        
        .feature-item::before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="demo-header">
        <h1>🎯 Improved Upload Progress</h1>
        <p>Matches your exact design with purple gradient background and proper circular progress ring</p>
    </div>
    
    <div class="demo-controls">
        <h3>Demo Controls</h3>
        <div class="control-buttons">
            <button onclick="simulateUpload()">Start Upload</button>
            <button onclick="setSuccess()" class="success">Show Success</button>
            <button onclick="setError()" class="error">Show Error</button>
            <button onclick="resetProgress()">Reset</button>
        </div>
        <div class="progress-values">
            <button onclick="setProgress(10)">10%</button>
            <button onclick="setProgress(25)">25%</button>
            <button onclick="setProgress(50)">50%</button>
            <button onclick="setProgress(75)">75%</button>
            <button onclick="setProgress(90)">90%</button>
            <button onclick="setProgress(100)">100%</button>
        </div>
    </div>

    {{-- Using the Improved Upload Progress Component --}}
    <x-upload-progress-improved 
        uploadId="improved-upload-demo" 
        :progress="25"
        uploaded="16.0 MB"
        total="612.1 MB" 
        timeRemaining="3m25s remaining"
        title="Creating your transfer"
        :showCancel="true"
        cancelText="Cancel"
    />
    
    <div class="integration-info">
        <h3>🚀 Integration Guide</h3>
        
        <h4>Laravel Blade Usage:</h4>
        <div class="code-block">&lt;x-upload-progress-improved 
    uploadId="my-upload" 
    :progress="25"
    uploaded="16.0 MB"
    total="612.1 MB" 
    timeRemaining="3m25s remaining"
    title="Creating your transfer"
    :showCancel="true"
    onCancel="myCustomCancelHandler()"
/&gt;</div>

        <h4>JavaScript API:</h4>
        <div class="code-block">// Get the manager instance
const uploader = window.uploadManagers['improved-upload-demo'];

// Update progress
uploader.updateProgress(75, '305.3 MB', '612.1 MB', '1m15s remaining');

// Show success
uploader.setSuccess();

// Show error
uploader.setError('Connection failed');

// Reset to initial state
uploader.reset();</div>

        <h4>Key Features:</h4>
        <div class="feature-list">
            <div class="feature-item">Purple gradient background (matches your design)</div>
            <div class="feature-item">Proper circular progress ring (not filled circle)</div>
            <div class="feature-item">White progress stroke with glow effect</div>
            <div class="feature-item">Responsive design for mobile</div>
            <div class="feature-item">Smooth animations and transitions</div>
            <div class="feature-item">Success/error state handling</div>
            <div class="feature-item">Real-time progress updates</div>
            <div class="feature-item">Customizable props and callbacks</div>
        </div>

        <p><strong>Ready for Production:</strong> This component can be directly integrated into your main upload system. Simply replace the existing upload progress with this improved version.</p>
    </div>

    <script>
        let uploadInterval = null;
        
        function getManager() {
            return window.uploadManagers['improved-upload-demo'];
        }
        
        function setProgress(percentage) {
            const manager = getManager();
            if (manager) {
                const total = 612.1;
                const uploaded = (percentage / 100) * total;
                const remaining = total - uploaded;
                const timeInSeconds = (remaining / 8) * 2; // Rough estimate
                
                let timeRemaining;
                if (timeInSeconds < 60) {
                    timeRemaining = `${Math.round(timeInSeconds)}s remaining`;
                } else {
                    const minutes = Math.floor(timeInSeconds / 60);
                    const seconds = Math.round(timeInSeconds % 60);
                    timeRemaining = `${minutes}m${seconds}s remaining`;
                }
                
                if (percentage >= 100) {
                    timeRemaining = 'Upload completed successfully';
                }
                
                manager.updateProgress(
                    percentage, 
                    `${uploaded.toFixed(1)} MB`, 
                    `${total.toFixed(1)} MB`, 
                    timeRemaining
                );
            }
        }
        
        function simulateUpload() {
            if (uploadInterval) clearInterval(uploadInterval);
            
            const manager = getManager();
            if (!manager) return;
            
            manager.reset();
            manager.setLoading(true);
            
            let progress = 0;
            uploadInterval = setInterval(() => {
                progress += Math.random() * 5; // Random increment
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(uploadInterval);
                    manager.setLoading(false);
                    manager.setSuccess();
                }
                setProgress(progress);
            }, 300);
        }
        
        function setSuccess() {
            if (uploadInterval) clearInterval(uploadInterval);
            const manager = getManager();
            if (manager) {
                manager.setSuccess();
            }
        }
        
        function setError() {
            if (uploadInterval) clearInterval(uploadInterval);
            const manager = getManager();
            if (manager) {
                manager.setError('Connection error occurred');
            }
        }
        
        function resetProgress() {
            if (uploadInterval) clearInterval(uploadInterval);
            const manager = getManager();
            if (manager) {
                manager.reset();
                // Set back to initial state from your image
                setProgress(25);
                manager.updateProgress(25, '16.0 MB', '612.1 MB', '3m25s remaining');
            }
        }
        
        // Initialize with your exact design state
        window.addEventListener('load', () => {
            setTimeout(() => {
                setProgress(25);
            }, 100);
        });
    </script>
</body>
</html>
