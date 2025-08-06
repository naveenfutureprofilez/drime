<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $appName }} - Download Notification</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 30px;
        }
        .content {
            margin-bottom: 30px;
        }
        .file-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .download-stats {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #666;
            font-size: 0.9em;
        }
        .view-link {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.9em;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $appName }}</h1>
        <h2>📥 Your shared file was downloaded</h2>
    </div>

    <div class="content">
        <p>Hi there,</p>
        
        <p>Great news! Your shared file has been downloaded.</p>
        
        <div class="file-info">
            <h3>📁 {{ $fileName }}</h3>
            <p><strong>File size:</strong> {{ number_format($fileSize / 1024 / 1024, 2) }} MB</p>
            <p><strong>Downloaded:</strong> {{ $downloadedAt->format('F j, Y g:i A') }}</p>
            @if($expiresAt)
                <p><strong>Link expires:</strong> {{ $expiresAt->format('F j, Y g:i A') }}</p>
            @endif
        </div>

        <div class="download-stats">
            <h3>📊 Download Statistics</h3>
            <p><strong>Total downloads:</strong> {{ $downloadCount }}</p>
            @if($maxDownloads)
                <p><strong>Remaining downloads:</strong> {{ max(0, $maxDownloads - $downloadCount) }}</p>
            @endif
        </div>

        @if($maxDownloads && $downloadCount >= $maxDownloads)
            <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <strong>⚠️ Download Limit Reached:</strong> This file has reached its maximum download limit and is no longer available for download.
            </div>
        @else
            <div style="text-align: center;">
                <a href="{{ $linkUrl }}" class="view-link">View Shared Link</a>
            </div>
        @endif

        <p>This is an automated notification to keep you informed about the activity on your shared files.</p>
    </div>

    <div class="footer">
        <p>This email was sent by {{ $appName }}</p>
        <p>Please do not reply to this email.</p>
    </div>
</body>
</html>
