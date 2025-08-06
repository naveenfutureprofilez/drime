<?php
// Custom PHP upload configuration
// This file ensures upload limits are properly set for file sharing

ini_set('upload_max_filesize', '3G');
ini_set('post_max_size', '3G');
ini_set('max_execution_time', '0');
ini_set('max_input_time', '0');
ini_set('memory_limit', '1G');
ini_set('max_file_uploads', '20');

// Also set environment variables that Laravel might use
putenv('PHP_UPLOAD_MAX_FILESIZE=3G');
putenv('PHP_POST_MAX_SIZE=3G');
putenv('PHP_MAX_EXECUTION_TIME=0');
putenv('PHP_MEMORY_LIMIT=1G');
