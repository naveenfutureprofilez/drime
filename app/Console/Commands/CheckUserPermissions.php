<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckUserPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:permissions {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check user permissions and roles in detail';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->with(['roles.permissions', 'permissions'])->first();
        
        if (!$user) {
            $this->error('User not found: ' . $email);
            return 1;
        }
        
        $this->info('=== USER DETAILS ===');
        $this->info('Email: ' . $user->email);
        $this->info('ID: ' . $user->id);
        
        $this->info('=== ROLES ===');
        foreach ($user->roles as $role) {
            $this->info('- Role: ' . $role->name . ' (ID: ' . $role->id . ')');
            if ($role->permissions->count() > 0) {
                $this->info('  Permissions from this role:');
                foreach ($role->permissions as $permission) {
                    $this->info('    - ' . $permission->name);
                }
            } else {
                $this->info('  No permissions from this role');
            }
        }
        
        $this->info('=== DIRECT PERMISSIONS ===');
        if ($user->permissions->count() > 0) {
            foreach ($user->permissions as $permission) {
                $this->info('- ' . $permission->name);
            }
        } else {
            $this->info('No direct permissions');
        }
        
        $this->info('=== PERMISSION CHECKS ===');
        $this->info('Has admin permission: ' . ($user->hasPermission('admin') ? 'Yes' : 'No'));
        $this->info('Has admin role: ' . ($user->roles->contains('name', 'admin') ? 'Yes' : 'No'));
        
        return 0;
    }
}