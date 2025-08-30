<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Common\Auth\Roles\Role;
use Common\Auth\Permissions\Permission;

echo "Adding API access permission to guest role...\n";

// Find or create the api.access permission
$apiAccessPermission = Permission::firstOrCreate(['name' => 'api.access']);
echo "API access permission created/found: " . $apiAccessPermission->id . "\n";

// Find the guest role
$guestRole = app('guestRole');
echo "Found guest role: " . $guestRole->id . "\n";

// Check if permission is already attached
if (!$guestRole->hasPermission('api.access')) {
    // Attach the permission to the guest role
    $guestRole->permissions()->attach($apiAccessPermission->id);
    echo "API access permission attached to guest role.\n";
} else {
    echo "API access permission already attached to guest role.\n";
}

echo "Guest API access fix completed successfully!\n";
