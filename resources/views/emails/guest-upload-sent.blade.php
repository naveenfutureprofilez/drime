<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $appName }} - File Shared</title>
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
        .download-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .file-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .custom-message {
            background-color: #e9ecef;
            padding: 15px;
            border-left: 4px solid #007bff;
            margin: 15px 0;
            font-style: italic;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #666;
            font-size: 0.9em;
        }
        .warning {
            background-color: #fff3cd;
            color: #856404;
            padding: 10px;
            border-radius: 4px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $appName }}</h1>
        <h2>You've received a shared file</h2>
    </div>

    <div class="content">
        <p>Hi there,</p>
        
        <p><strong>{{ $senderName }}</strong> has shared a file with you:</p>
        
        <div class="file-info">
            <h3>📁 {{ $fileName }}</h3>
            <p><strong>File size:</strong> {{ number_format($fileSize / 1024 / 1024, 2) }} MB</p>
            @if($expiresAt)
                <p><strong>Expires:</strong> {{ $expiresAt->format('F j, Y g:i A') }}</p>
            @endif
        </div>

        @if($customMessage)
            <div class="custom-message">
                <strong>Message from {{ $senderName }}:</strong><br>
                {{ $customMessage }}
            </div>
        @endif

        <div style="text-align: center;">
            <a href="{{ $linkUrl }}" class="download-button">Download File</a>
        </div>

        <div class="warning">
            <strong>⚠️ Security Notice:</strong> This link will expire automatically for security. Make sure to download the file before it expires.
        </div>

        <p>If you have any issues accessing the file, please contact the sender directly.</p>
    </div>

    <div class="footer">
        <p>This email was sent by {{ $appName }}</p>
        <p>Please do not reply to this email.</p>
    </div>
</body>
</html>
