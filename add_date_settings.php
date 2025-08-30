<?php
require __DIR__ . '/bootstrap/app.php';
$app = \Illuminate\Foundation\Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (\Illuminate\Foundation\Configuration\Middleware $middleware) {
        //
    })
    ->withExceptions(function (\Illuminate\Foundation\Configuration\Exceptions $exceptions) {
        //
    })
    ->create();

// Boot the application
$app->boot();

try {
    echo "Getting Settings instance...\n";
    $settings = $app->make('App\Services\Settings\Settings');
    
    echo "Current settings count: " . count($settings->all()) . "\n";
    
    // Check if dates settings exist
    $datesSettings = [];
    foreach ($settings->all() as $key => $value) {
        if (strpos($key, 'date') !== false || strpos($key, 'time') !== false) {
            $datesSettings[$key] = $value;
        }
    }
    
    echo "Current date-related settings: " . json_encode($datesSettings, JSON_PRETTY_PRINT) . "\n";
    
    // Add missing dates settings
    $toAdd = [
        'dates.default_timezone' => 'UTC',
        'dates.format' => 'relative',
        'dates.locale' => 'en'
    ];
    
    foreach ($toAdd as $key => $value) {
        if (!$settings->get($key)) {
            echo "Adding missing setting: $key = $value\n";
            $settings->save([$key => $value]);
        } else {
            echo "Setting already exists: $key = " . $settings->get($key) . "\n";
        }
    }
    
    echo "Settings addition complete.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
