<?php

namespace App\Console\Commands;

use App\Models\User;
use Common\Auth\Roles\Role;
use Common\Auth\Permissions\Permission;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create {--reset : Reset password for existing admin user}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create an admin user with full permissions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = 'admin@example.com';
        $password = 'password123';
        
        // Check if admin user exists
        $admin = User::where('email', $email)->first();
        
        if ($admin && !$this->option('reset')) {
            $this->error('Admin user already exists!');
            $this->info('Email: ' . $email);
            $this->info('Use --reset flag to reset the password');
            return 1;
        }
        
        if ($admin && $this->option('reset')) {
            // Reset password
            $admin->password = Hash::make($password);
            $admin->email_verified_at = now();
            $admin->save();
            $this->info('Admin password reset successfully!');
        } else {
            // Create new admin user
            $admin = User::create([
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => $email,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
                'available_space' => 1024 * 1024 * 1024, // 1GB
            ]);
            $this->info('Admin user created successfully!');
        }
        
        // Ensure admin role exists with all permissions
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
        ], [
            'display_name' => 'Administrator',
            'description' => 'Site administrator with full access',
            'internal' => false,
            'default' => false,
            'guests' => false,
        ]);
        
        // Create all admin permissions
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
        }
        
        $this->info('');
        $this->info('✅ Admin setup complete!');
        $this->info('📧 Email: ' . $email);
        $this->info('🔑 Password: ' . $password);
        $this->info('🌐 Admin URL: http://localhost:8000/admin');
        $this->info('🌐 Login URL: http://localhost:8000/login');
        $this->info('');
        
        return 0;
    }
}
