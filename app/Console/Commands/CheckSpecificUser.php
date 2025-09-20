<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckSpecificUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:check {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check specific user status and permissions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->with(['roles.permissions'])->first();
        
        if ($user) {
            $this->info('User found: ' . $user->email);
            $this->info('User ID: ' . $user->id);
            $this->info('Email verified: ' . ($user->email_verified_at ? 'Yes' : 'No'));
            $this->info('Roles: ' . $user->roles->pluck('name')->implode(', '));
            $this->info('Has admin role: ' . ($user->roles->contains('name', 'admin') ? 'Yes' : 'No'));
        } else {
            $this->error('User not found: ' . $email);
        }
        
        return 0;
    }
}