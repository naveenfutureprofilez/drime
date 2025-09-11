<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class ClearFrontendCache extends Command
{
    protected $signature = 'frontend:clear-cache';
    protected $description = 'Clear frontend build cache and rebuild assets';

    public function handle()
    {
        $this->info('🧹 Clearing frontend cache...');
        
        // Clear build directories
        $buildPaths = [
            public_path('build'),
            public_path('js'),
            public_path('css'),
        ];
        
        foreach ($buildPaths as $path) {
            if (File::exists($path)) {
                File::deleteDirectory($path);
                $this->line("✅ Cleared: $path");
            }
        }
        
        // Clear Laravel caches
        $this->info('🧹 Clearing Laravel caches...');
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');
        $this->line('✅ Laravel caches cleared');
        
        // Rebuild frontend
        $this->info('🔨 Rebuilding frontend assets...');
        $result = shell_exec('cd ' . base_path() . ' && npm run build 2>&1');
        
        if ($result) {
            $this->line($result);
        }
        
        $this->info('✅ Frontend cache cleared and assets rebuilt!');
        $this->warn('💡 Remember to hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)');
        
        return 0;
    }
}
