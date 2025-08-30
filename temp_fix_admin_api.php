<?php
require 'vendor/autoload.php';

// Bootstrap the Laravel application
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Adding API access permission to admin role...\n";
    
    // Find or create the api.access permission
    $permission = \Common\Auth\Permissions\Permission::firstOrCreate([
        'name' => 'api.access'
    ], [
        'display_name' => 'API Access',
        'description' => 'Access API endpoints',
        'group' => 'api'
    ]);
    
    echo "API access permission created/found: {$permission->id}\n";
    
    // Find admin role
    $adminRole = \Common\Auth\Roles\Role::where('name', 'admin')->first();
    
    if (!$adminRole) {
        echo "Admin role not found!\n";
        exit(1);
    }
    
    echo "Found admin role: {$adminRole->id}\n";
    
    // Attach permission to admin role if not already attached
    if (!$adminRole->permissions->contains($permission)) {
        $adminRole->permissions()->attach($permission);
        echo "API access permission attached to admin role.\n";
    } else {
        echo "API access permission already attached to admin role.\n";
    }
    
    echo "Admin API access fix completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
