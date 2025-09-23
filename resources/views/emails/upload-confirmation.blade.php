<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $appName }} - Upload Successful</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f0f0f0;
            margin: 0;
            padding: 20px;
        }
        .email-container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            /* box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); */
            overflow: hidden;
        }
        .header {
            text-align: center;
            padding: 40px 30px 30px;
            /* background: #fbfbfb; */
            color: rgb(0, 0, 0);
            position: relative;
        }
        .logo-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            width: 100%;
        }
        .logo {
            width: 100%;
            height: 100%;
            max-width:150px; margin:auto;
        }
        .logo img {
            width: 100%;
            height: 100%;max-width:150px;
        }
        
        .success-icon {
            font-size: 48px;
            margin: 10px 0;
        }
        .title1 { 
         margin-top: 50px !important;
        }
        .header-title {
            font-size: 24px;
            font-weight: 600; text-align: center;
            margin: 10px 0 0 0;
            line-height: 1.2;
        }
        .header-title.title2 {
         text-align: center;
            font-size: 22px !important;
        }
        .stats {
            margin-top: 15px;
            font-size: 14px; text-align: center;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .success-message {
            text-align: center;
            margin-bottom: 60px;
        }
        .success-title {
            font-size: 20px;
            font-weight: 600;
            color: #2e7d32;
            margin-bottom: 10px;
        }
        .success-subtitle {
            color: #666; margin-top: 30px;
            font-size: 16px;
        }
        .download-button {
            display: inline-block;
            background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
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
            margin: 25px 0;
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
        .download-link {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0 0px 0;
            word-break: break-all;
        }
        .download-link-title {
            font-weight: 600;
            margin-bottom: 5px;
            color: #333;
        }
        .download-link a {
            color: #4fc3f7;
            text-decoration: none;
            font-size: 14px;
        }
        .expiry-notice {
            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
            border: 1px solid #ffcc02;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .expiry-notice .icon {
            font-size: 20px;
            margin-bottom: 5px;
        }
        .expiry-text {
            color: #e65100;
            font-weight: 500;
            font-size: 14px;
        }
        .footer {
            padding: 10px;
            text-align: center;
            background-color: #f8f9fa;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 8px 0;
            color: #666;
            font-size: 14px;
        }
        .footer a {
            color: #4fc3f7;
            text-decoration: none;
        }
        .social-proof {
            background-color: #e3f2fd;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            text-align: center;
        }
        .social-proof-text {
            color: #1565c0;
            font-size: 14px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="email-container">
        
      <div class="content">
            <div class="logo-container">
                  <div class="logo">
                  <img src="https://framerusercontent.com/images/YhGPy2lP1gtKzS0mhb6SSgDA.png?scale-down-to=512" />
                  </div>
            </div>
            <h1 class="header-title title1">You’ve received {{ $itemsCount }} {{ $itemsCount === 1 ? 'file' : 'files' }} </h1> 
            <h1 class="header-title title2">with a total size of {{ $totalSizeFormatted }}.</h1>
            <div class="stats">
                  {{ $itemsCount }} {{ $itemsCount === 1 ? 'item' : 'items' }}, {{ $totalSizeFormatted }} in total
                  @if($expiresAtFormatted)
                     • Expires on {{ $expiresAtFormatted }}
                  @endif
            </div>
            

            <!-- <div style="text-align: center;">
                <a href="{{ $linkUrl }}" class="download-button">View transfer</a>
            </div> -->

            <!-- @if(count($filesList) > 0)
                <div class="files-section">
                    <div class="section-title">{{ $itemsCount }} {{ $itemsCount === 1 ? 'item' : 'items' }}</div>
                    @foreach($filesList as $file)
                        <div class="file-item">
                            <span class="file-name">{{ $file['name'] }}</span>
                            <span class="file-size">{{ number_format($file['size'] / 1024) }} KB</span>
                        </div>
                    @endforeach
                </div>
            @endif -->

            <div class="download-link">
                <div class="download-link-title">Download link</div>
                <a href="{{ $linkUrl }}">{{ $linkUrl }}</a>
            </div>

            <div class="success-message">
                <br class="success-subtitle">
                    Thanks for using Drime! </br>
We help you share files quickly, securely, and without hassle.
                    <!-- We'll email you a confirmation as soon as your files have been downloaded. -->
                </div>
            </div>

            <!-- @if($expiresAtFormatted)
                <div class="expiry-notice">
                    <div class="icon">⏰</div>
                    <div class="expiry-text">Expires on {{ $expiresAtFormatted }}</div>
                </div>
            @endif -->

            <!-- <div class="social-proof">
                <div class="social-proof-text">
                    Want to send more files? Start a new transfer.
                </div>
            </div> -->
            <div class="footer">
                <p>Need to send more files? <a href="{{ config('app.url') }}">Start a new transfer</a></p>
                <!-- <p><a href="{{ config('app.url') }}">DRIME</a></p> -->
            </div>
        </div>

    </div>
</body>
</html>
