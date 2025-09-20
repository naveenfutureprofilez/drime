<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class TestUserLogin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:test-login {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test user login and admin access';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->with('roles')->first();
        
        if (!$user) {
            $this->error('User not found: ' . $email);
            return 1;
        }
        
        $this->info('User Details:');
        $this->info('- Email: ' . $user->email);
        $this->info('- ID: ' . $user->id);
        $this->info('- Email verified: ' . ($user->email_verified_at ? 'Yes' : 'No'));
        $this->info('- Roles: ' . $user->roles->pluck('name')->implode(', '));
        
        // Test admin role check (same logic as RedirectIfAuthenticated middleware)
        $hasAdminRole = $user->roles->contains('name', 'admin');
        $this->info('- Has admin role: ' . ($hasAdminRole ? 'Yes' : 'No'));
        
        if ($hasAdminRole) {
            $this->info('✅ User should be redirected to /admin after login');
        } else {
            $this->info('ℹ️  User will be redirected to / after login');
        }
        
        return 0;
    }
}