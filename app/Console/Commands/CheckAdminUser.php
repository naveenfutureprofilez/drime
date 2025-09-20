<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check admin user status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $user = User::where('email', 'admin@example.com')->with(['roles.permissions'])->first();
        
        if ($user) {
            $this->info('User found: ' . $user->email);
            $this->info('User ID: ' . $user->id);
            $this->info('Email verified: ' . ($user->email_verified_at ? 'Yes' : 'No'));
            $this->info('Roles: ' . $user->roles->pluck('name')->implode(', '));
            $this->info('Has admin permission: ' . ($user->hasPermission('admin') ? 'Yes' : 'No'));
            
            // Check password
            if (\Hash::check('password123', $user->password)) {
                $this->info('Password verification: Correct');
            } else {
                $this->error('Password verification: Incorrect');
            }
        } else {
            $this->error('User not found');
        }
        
        return 0;
    }
}
