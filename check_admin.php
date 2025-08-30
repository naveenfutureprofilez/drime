<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->boot();

try {
    $user = \App\Models\User::where('email', 'admin@example.com')->with(['roles.permissions'])->first();
    
    if ($user) {
        echo "✅ User found: " . $user->email . PHP_EOL;
        echo "✅ User ID: " . $user->id . PHP_EOL;
        echo "✅ Email verified: " . ($user->email_verified_at ? 'Yes' : 'No') . PHP_EOL;
        echo "✅ Roles: " . $user->roles->pluck('name')->implode(', ') . PHP_EOL;
        
        // Check permissions
        $hasApiAccess = false;
        try {
            $hasApiAccess = $user->hasPermissionTo('api.access');
        } catch (Exception $e) {
            echo "⚠️ Error checking api.access permission: " . $e->getMessage() . PHP_EOL;
        }
        echo "✅ Has api.access: " . ($hasApiAccess ? 'Yes' : 'No') . PHP_EOL;
        
        // Check password
        if (Hash::check('password123', $user->password)) {
            echo "✅ Password verification: Correct" . PHP_EOL;
        } else {
            echo "❌ Password verification: Incorrect" . PHP_EOL;
        }
        
        // List all permissions
        echo "✅ All permissions: " . PHP_EOL;
        foreach ($user->getAllPermissions() as $permission) {
            echo "  - " . $permission->name . PHP_EOL;
        }
        
    } else {
        echo "❌ User not found" . PHP_EOL;
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
    echo "Stack trace: " . $e->getTraceAsString() . PHP_EOL;
}
