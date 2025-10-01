<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;

// Test the guest upload send email endpoint
$testData = [
    'from_email' => 'naveentehrpariya@gmail.com',
    'message' => 'Test message from the email transfer system',
    'share_url' => 'http://localhost:8000/share/dummy-hash',
    'files' => [
        [
            'filename' => 'test-file.pdf',
            'size' => 1024000
        ]
    ]
];

echo "Testing email transfer functionality...\n";
echo "Test data: " . json_encode($testData, JSON_PRETTY_PRINT) . "\n\n";

// Use curl to test the endpoint
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/v1/guest-uploads/send-email');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Response Code: $httpCode\n";
echo "Response: " . json_encode(json_decode($response), JSON_PRETTY_PRINT) . "\n";

if ($httpCode >= 200 && $httpCode < 300) {
    echo "\n✅ Email endpoint responded successfully!\n";
    echo "Check your logs and queue to see if the email was processed.\n";
} else {
    echo "\n❌ Email endpoint failed!\n";
    echo "Check the response above for error details.\n";
}