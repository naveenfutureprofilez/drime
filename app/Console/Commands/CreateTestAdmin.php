<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Common\Auth\User;

class CreateTestAdmin extends Command
{
    protected $signature = 'test:admin';
    protected $description = 'Create a test admin user';

    public function handle()
    {
        // Create or find admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Test Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Make user admin
        if (!$user->hasRole('admin')) {
            $adminRole = \Common\Auth\Role::where('name', 'admin')->first();
            if ($adminRole) {
                $user->roles()->attach($adminRole->id);
            }
        }

        $this->info("Admin user created/updated:");
        $this->info("Email: admin@test.com");
        $this->info("Password: password");
        
        return 0;
    }
}
