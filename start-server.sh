#!/bin/bash

# Start Laravel development server with custom PHP settings for file uploads

echo "Starting Laravel development server with custom upload settings..."

# Set PHP configuration at runtime
export PHP_INI_SCAN_DIR="$(php --ini | grep "Scan for additional .ini files" | cut -d: -f2 | tr -d ' '):/$(pwd)"

# Start the server with custom ini settings
php -d upload_max_filesize=3G \
    -d post_max_size=3G \
    -d max_execution_time=0 \
    -d max_input_time=0 \
    -d memory_limit=1G \
    -d max_file_uploads=20 \
    artisan serve --host=127.0.0.1 --port=8000

echo "Server started on http://127.0.0.1:8000"
