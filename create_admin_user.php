<?php

require_once 'vendor/autoload.php';

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Common\Auth\Roles\Role;
use Illuminate\Support\Facades\Hash;

echo "🔧 Creating Admin User...\n\n";

try {
    // Check if admin user already exists
    $existingAdmin = User::where('email', 'admin@example.com')->first();
    
    if ($existingAdmin) {
        echo "⚠️  Admin user already exists with email: admin@example.com\n";
        echo "If you forgot the password, you can reset it in the database.\n";
        exit(1);
    }
    
    // Create admin user
    $user = User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => Hash::make('password123'),
        'email_verified_at' => now(),
    ]);
    
    echo "✅ User created: {$user->name} ({$user->email})\n";
    
    // Find or create admin role
    $adminRole = Role::where('name', 'admin')->first();
    
    if (!$adminRole) {
        echo "📝 Creating admin role...\n";
        $adminRole = Role::create([
            'name' => 'admin',
            'default' => false,
            'guests' => false,
        ]);
        echo "✅ Admin role created\n";
    } else {
        echo "✅ Admin role found\n";
    }
    
    // Assign admin role to user
    if (!$user->hasRole('admin')) {
        $user->roles()->attach($adminRole->id);
        echo "✅ Admin role assigned to user\n";
    }
    
    echo "\n🎉 Admin user created successfully!\n\n";
    echo "📋 Login Details:\n";
    echo "   Email: admin@example.com\n";
    echo "   Password: password123\n\n";
    echo "🌐 Access Admin Panel:\n";
    echo "   URL: http://127.0.0.1:8000/admin\n";
    echo "   or: http://127.0.0.1:8000/login\n\n";
    echo "💡 Make sure to change the password after first login!\n";
    
} catch (Exception $e) {
    echo "❌ Error creating admin user: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
