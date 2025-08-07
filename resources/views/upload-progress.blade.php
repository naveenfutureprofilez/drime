<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Progress</title>
    <link rel="stylesheet" href="css/upload-progress.css">
</head>
<body>
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
                        <span class="uploaded">0.0 MB</span> out of <span class="total">0.0 MB</span>
                    </p>
                    <p class="time-remaining">Calculating...</p>
                </div>
            </div>

            <!-- Cancel Button -->
            <button class="cancel-btn" onclick="cancelUpload()">Cancel</button>
        </div>

        <!-- File List (optional) -->
        <div class="file-list" id="fileList">
            <!-- Files will be populated here -->
        </div>
    </div>

    <script src="js/upload-progress.js"></script>
</body>
</html>
