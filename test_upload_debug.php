<?php

// Create a simple test file
$testFile = tempnam(sys_get_temp_dir(), 'test_upload_debug');
file_put_contents($testFile, 'This is test content for debugging');

// Simulate the form data structure that JavaScript FormData creates
$curlFile = curl_file_create($testFile, 'text/plain', 'test.txt');

// Test the exact structure that JavaScript FormData.append('files[]', file) creates
$postData = [
    'files' => [$curlFile], // This should create files[0] structure
    'expires_in_hours' => 72
];

echo "Testing upload with debug logging...\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/v1/guest/upload');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
if ($error) {
    echo "cURL Error: $error\n";
}

// Clean up
unlink($testFile);

echo "\nNow check the Laravel logs to see the structure!\n";
