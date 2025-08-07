<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Progress Demo - Available Routes</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
            padding: 40px 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 60px;
        }
        
        .header h1 {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 16px;
            text-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 20px;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .demos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 60px;
        }
        
        .demo-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }
        
        .demo-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.15);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        
        .demo-card h3 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #fff;
        }
        
        .demo-card p {
            font-size: 16px;
            line-height: 1.6;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .demo-card .route {
            font-family: 'Monaco', 'Menlo', monospace;
            background: rgba(0, 0, 0, 0.3);
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 20px;
            color: #a7f3d0;
        }
        
        .demo-card .features {
            list-style: none;
            margin-bottom: 25px;
        }
        
        .demo-card .features li {
            font-size: 14px;
            margin-bottom: 6px;
            opacity: 0.8;
        }
        
        .demo-card .features li:before {
            content: "✓ ";
            color: #10b981;
            font-weight: bold;
            margin-right: 8px;
        }
        
        .demo-link {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        
        .demo-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
        }
        
        .technical-info {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 16px;
            padding: 30px;
            margin-top: 40px;
        }
        
        .technical-info h3 {
            font-size: 20px;
            margin-bottom: 20px;
        }
        
        .file-structure {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
            line-height: 1.4;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 36px;
            }
            
            .demos-grid {
                grid-template-columns: 1fr;
            }
            
            .demo-card {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Upload Progress Interface</h1>
            <p>Interactive demos showcasing the circular progress upload interface with various implementation approaches</p>
        </div>
        
        <div class="demos-grid">
            <div class="demo-card">
                <h3>🚀 Interactive Demo</h3>
                <p>Full-featured demo with live progress simulation, controls for testing different states, and file list display.</p>
                <div class="route">{{ url('/demo/upload-progress') }}</div>
                <ul class="features">
                    <li>Live progress simulation</li>
                    <li>Demo controls (start, error, reset)</li>
                    <li>File list with status updates</li>
                    <li>25% initial state (matches your design)</li>
                    <li>Real-time calculations</li>
                </ul>
                <a href="{{ url('/demo/upload-progress') }}" class="demo-link">View Interactive Demo</a>
            </div>
            
            <div class="demo-card">
                <h3>📝 Laravel Blade Component</h3>
                <p>Demonstrates the reusable Laravel Blade component with proper Laravel integration and routing.</p>
                <div class="route">{{ url('/demo/upload-progress-blade') }}</div>
                <ul class="features">
                    <li>Laravel Blade component</li>
                    <li>Customizable props</li>
                    <li>Server-side integration</li>
                    <li>Built-in JavaScript manager</li>
                    <li>Cancel URL routing</li>
                </ul>
                <a href="{{ url('/demo/upload-progress-blade') }}" class="demo-link">View Blade Demo</a>
            </div>
            
            <div class="demo-card">
                <h3>✨ Improved Design (Recommended)</h3>
                <p>Matches your exact design with purple gradient background and proper circular progress ring.</p>
                <div class="route">{{ url('/demo/upload-progress-improved') }}</div>
                <ul class="features">
                    <li>Purple gradient background</li>
                    <li>Proper circular progress ring</li>
                    <li>White progress stroke with glow</li>
                    <li>Production ready</li>
                    <li>Exact match to your design</li>
                </ul>
                <a href="{{ url('/demo/upload-progress-improved') }}" class="demo-link">View Improved Demo</a>
            </div>
            
            <div class="demo-card">
                <h3>🎨 Basic Interface</h3>
                <p>Clean, basic version of the upload interface perfect for understanding the core HTML/CSS structure.</p>
                <div class="route">{{ url('/demo/upload-progress-basic') }}</div>
                <ul class="features">
                    <li>Vanilla HTML/CSS/JS</li>
                    <li>Core functionality</li>
                    <li>Easy to customize</li>
                    <li>Standalone implementation</li>
                    <li>Educational example</li>
                </ul>
                <a href="{{ url('/demo/upload-progress-basic') }}" class="demo-link">View Basic Demo</a>
            </div>
        </div>
        
        <div class="technical-info">
            <h3>📁 Files & Implementation</h3>
            <div class="file-structure">
# Laravel Routes (web.php)
Route::get('demo/upload-progress', function () {
    return view('upload-demo');
})->name('demo.upload-progress');

# Blade Components
resources/views/components/upload-progress.blade.php

# CSS & JavaScript
public/css/upload-progress.css
public/js/upload-progress.js

# React Component (if needed)
resources/client/components/UploadProgress.jsx

# Key Features:
- Circular SVG progress indicator
- Real-time file size formatting (B, KB, MB, GB)  
- Time remaining calculations
- Multi-file support with status tracking
- Responsive design for mobile devices
- Success/error state handling
- Smooth CSS animations and transitions
            </div>
        </div>
    </div>
</body>
</html>
