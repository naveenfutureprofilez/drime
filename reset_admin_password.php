<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Common\Auth\Roles\Role;
use Common\Auth\Permissions\Permission;
use Illuminate\Support\Facades\Hash;

// Find admin user
$admin = User::where('email', 'admin@example.com')->first();

if (!$admin) {
    echo "Admin user not found. Creating new one...\n";
    
    $admin = User::create([
        'first_name' => 'Admin',
        'last_name' => 'User',
        'email' => 'admin@example.com',
        'password' => Hash::make('password123'),
        'email_verified_at' => now(),
        'available_space' => 1024 * 1024 * 1024, // 1GB
    ]);
} else {
    // Reset password
    $admin->password = Hash::make('password123');
    $admin->save();
    echo "Password reset for admin user.\n";
}

// Ensure admin has proper role and permissions
$adminRole = Role::where('name', 'admin')->first();

if (!$adminRole) {
    echo "Creating admin role...\n";
    $adminRole = Role::create([
        'name' => 'admin',
        'display_name' => 'Administrator',
        'description' => 'Site administrator with full access',
        'internal' => false,
        'default' => false,
        'guests' => false,
    ]);
}

// Create all necessary permissions and attach to admin role
$adminPermissions = [
    'admin.access',
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'roles.view',
    'roles.create', 
    'roles.update',
    'roles.delete',
    'files.view',
    'files.create',
    'files.update',
    'files.delete',
    'settings.view',
    'settings.update',
    'appearance.update',
    'plans.view',
    'plans.create',
    'plans.update',
    'plans.delete',
    'custom_pages.view',
    'custom_pages.create',
    'custom_pages.update',
    'custom_pages.delete',
    'tags.view',
    'tags.create',
    'tags.update',
    'tags.delete',
    'localizations.view',
    'localizations.create',
    'localizations.update',
    'localizations.delete',
    'api.access',
    'subscriptions.update',
    'invoices.view',
];

foreach ($adminPermissions as $permissionName) {
    $permission = Permission::firstOrCreate(['name' => $permissionName]);
    
    // Attach permission to admin role if not already attached
    if (!$adminRole->permissions()->where('name', $permissionName)->exists()) {
        $adminRole->permissions()->attach($permission->id);
    }
}

// Assign admin role to user if not already assigned
if (!$admin->roles()->where('name', 'admin')->exists()) {
    $admin->roles()->attach($adminRole->id);
    echo "Admin role assigned to user.\n";
}

echo "\n✅ Admin user setup complete!\n";
echo "📧 Email: admin@example.com\n"; 
echo "🔑 Password: password123\n";
echo "🌐 Admin URL: http://localhost/admin\n";
echo "🌐 Drive URL: http://localhost/drive\n";
echo "🌐 Login URL: http://localhost/login\n\n";
