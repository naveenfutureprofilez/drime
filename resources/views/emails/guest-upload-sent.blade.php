<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $appName }} - Files shared</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f6fa;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            text-align: center;
            padding: 40px 30px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: -1px;
        }
        .header-title {
            font-size: 28px;
            font-weight: 600;
            margin: 0;
            line-height: 1.2;
        }
        .stats {
            margin-top: 15px;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #666;
        }
        .sender-info {
            margin-bottom: 30px;
        }
        .sender-name {
            font-weight: 600;
            color: #333;
        }
        .download-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .download-button:hover {
            transform: translateY(-1px);
        }
        .files-section {
            margin: 30px 0;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #333;
        }
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .file-item:last-child {
            border-bottom: none;
        }
        .file-name {
            font-weight: 500;
            color: #333;
        }
        .file-size {
            color: #666;
            font-size: 14px;
        }
        .message-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .message-title {
            font-weight: 600;
            margin-bottom: 8px;
            color: #333;
        }
        .message-content {
            color: #555;
            font-style: italic;
        }
        .download-link {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
        }
        .download-link-title {
            font-weight: 600;
            margin-bottom: 5px;
            color: #333;
        }
        .download-link a {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
        }
        .footer {
            padding: 30px;
            text-align: center;
            background-color: #f8f9fa;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .security-notice {
            background-color: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #ffeaa7;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">{{ $appName }}</div>
            <h1 class="header-title">Your files have been shared</h1>
            <div class="stats">
                {{ $itemsCount }} {{ $itemsCount === 1 ? 'item' : 'items' }}, {{ $totalSizeFormatted }} in total
                @if($expiresAtFormatted)
                    • Expires on {{ $expiresAtFormatted }}
                @endif
            </div>
        </div>

        <div class="content">
            <div class="greeting">
                <div class="sender-info">
                    <span class="sender-name">{{ $senderName }}</span> has shared {{ $itemsCount === 1 ? 'a file' : 'files' }} with you.
                </div>
            </div>

            <div style="text-align: center;">
                <a href="{{ $linkUrl }}" class="download-button">Download {{ $itemsCount === 1 ? 'File' : 'Files' }}</a>
            </div>

            @if(count($filesList) > 0)
                <div class="files-section">
                    <div class="section-title">{{ $itemsCount }} {{ $itemsCount === 1 ? 'item' : 'items' }}</div>
                    @foreach($filesList as $file)
                        <div class="file-item">
                            <span class="file-name">{{ $file['name'] }}</span>
                            <span class="file-size">{{ number_format($file['size'] / 1024) }} KB</span>
                        </div>
                    @endforeach
                </div>
            @endif

            @if($customMessage)
                <div class="message-section">
                    <div class="message-title">Message</div>
                    <div class="message-content">{{ $customMessage }}</div>
                </div>
            @endif

            <div class="download-link">
                <div class="download-link-title">Download link</div>
                <a href="{{ $linkUrl }}">{{ $linkUrl }}</a>
            </div>

            <div class="security-notice">
                <strong>🔒 Security Notice:</strong> This link will expire automatically for security. Make sure to download the files before they expire.
            </div>
        </div>

        <div class="footer">
            <p>To make sure our emails arrive, please add <a href="mailto:noreply@{{ parse_url(env('DOMAIN_URL', config('app.url')), PHP_URL_HOST) }}">noreply@{{ parse_url(env('DOMAIN_URL', config('app.url')), PHP_URL_HOST) }}</a> to your contacts.</p>
            <p>If you don't want us to email you when your link transfers have been downloaded, you can unsubscribe from these updates.</p>
            <p style="margin-top: 20px;">
                <a href="#">About {{ $appName }}</a> • 
                <a href="#">Help</a> • 
                <a href="#">Legal</a>
            </p>
        </div>
    </div>
</body>
</html>
