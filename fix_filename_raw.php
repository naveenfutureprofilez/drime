<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// The actual filename on disk
$actualFilename = '34ba846ee8291456b35fb66972893daaa7b6e9c51a68959933e377eee92e3e7b.pdf';

// Check current value
$current = \Illuminate\Support\Facades\DB::select('SELECT id, file_name, path FROM file_entries WHERE id = ?', [21]);
if (!empty($current)) {
    $record = $current[0];
    echo "Current record:\n";
    echo "- ID: " . $record->id . "\n";
    echo "- File Name: '" . $record->file_name . "'\n";
    echo "- Path: '" . $record->path . "'\n";
    echo "- File Name Length: " . strlen($record->file_name) . "\n";
    echo "- Target Length: " . strlen($actualFilename) . "\n";
    
    // Try raw SQL update
    try {
        $result = \Illuminate\Support\Facades\DB::update(
            'UPDATE file_entries SET file_name = ? WHERE id = ?', 
            [$actualFilename, 21]
        );
        echo "\nRaw SQL update affected: " . $result . " rows\n";
        
        if ($result > 0) {
            // Check the update
            $updated = \Illuminate\Support\Facades\DB::select('SELECT file_name FROM file_entries WHERE id = ?', [21]);
            echo "New file_name: '" . $updated[0]->file_name . "'\n";
            
            // Test full path
            $fullPath = storage_path('app/' . $record->path . '/' . $updated[0]->file_name);
            echo "Full path: " . $fullPath . "\n";
            echo "File exists: " . (file_exists($fullPath) ? 'YES' : 'NO') . "\n";
        }
    } catch (\Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "No record found with ID 21\n";
}
