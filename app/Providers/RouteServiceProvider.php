<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * This namespace is applied to your controller routes.
     *
     * In addition, it is set as the URL generator's root namespace.
     *
     * @var string
     */
    //protected $namespace = 'App\Http\Controllers';

    /**
     * The path to the "home" route for your application.
     *
     * @var string
     */
    public const HOME = '/';

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @return void
     */
    public function boot()
    {
        $this->configureRateLimiting();

        parent::boot();
    }

    /**
     * Define the routes for the application.
     *
     * @return void
     */
    public function map()
    {
        $this->mapApiRoutes();

        $this->mapWebRoutes();

        //
    }

    /**
     * Define the "web" routes for the application.
     *
     * These routes all receive session state, CSRF protection, etc.
     *
     * @return void
     */
    protected function mapWebRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(base_path('routes/web.php'));
    }

    /**
     * Define the "api" routes for the application.
     *
     * These routes are typically stateless.
     *
     * @return void
     */
    protected function mapApiRoutes()
    {
        Route::prefix('api')
            ->middleware('api')
            ->namespace($this->namespace)
            ->group(base_path('routes/api.php'));
    }

    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        // General API rate limiting
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Guest upload rate limiting (more restrictive for uploads)
        RateLimiter::for('guest-uploads', function (Request $request) {
            return [
                // 10 uploads per hour per IP
                Limit::perHour(10)->by($request->ip())->response(function () {
                    return response()->json([
                        'message' => 'Too many upload attempts',
                        'error' => 'You have exceeded the upload limit. Please try again later.'
                    ], 429);
                }),
                // 3 uploads per 10 minutes per IP (burst protection)
                Limit::perMinutes(10, 3)->by($request->ip())->response(function () {
                    return response()->json([
                        'message' => 'Upload rate limit exceeded',
                        'error' => 'Please wait before uploading more files.'
                    ], 429);
                }),
            ];
        });

        // Guest download rate limiting (less restrictive for downloads)
        RateLimiter::for('guest-downloads', function (Request $request) {
            return [
                // 100 downloads per hour per IP
                Limit::perHour(100)->by($request->ip())->response(function () {
                    return response()->json([
                        'message' => 'Too many download attempts',
                        'error' => 'You have exceeded the download limit. Please try again later.'
                    ], 429);
                }),
                // 30 downloads per 10 minutes per IP
                Limit::perMinutes(10, 30)->by($request->ip())->response(function () {
                    return response()->json([
                        'message' => 'Download rate limit exceeded',
                        'error' => 'Please wait before downloading more files.'
                    ], 429);
                }),
            ];
        });
    }
}
