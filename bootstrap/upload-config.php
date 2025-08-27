<?php
// Custom PHP upload configuration
// NOTE: This file is deprecated in favor of bootstrap/dynamic-upload-limits.php
// which provides dynamic configuration based on GUEST_UPLOAD_MAX_FILE_SIZE environment variable.

// This file is kept for backwards compatibility but should not be used.
// The dynamic configuration is loaded automatically in public/index.php.

// If you need to override these settings, modify the GUEST_UPLOAD_MAX_FILE_SIZE
// environment variable in your .env file instead.

// Legacy code (commented out - now handled dynamically):
/*
ini_set('upload_max_filesize', '3G');
ini_set('post_max_size', '3G');
ini_set('max_execution_time', '0');
ini_set('max_input_time', '0');
ini_set('memory_limit', '1G');
ini_set('max_file_uploads', '20');

putenv('PHP_UPLOAD_MAX_FILESIZE=3G');
putenv('PHP_POST_MAX_SIZE=3G');
putenv('PHP_MAX_EXECUTION_TIME=0');
putenv('PHP_MEMORY_LIMIT=1G');
*/
