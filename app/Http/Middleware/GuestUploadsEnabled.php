<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class GuestUploadsEnabled
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Gate::allows('guest_uploads_enabled')) {
            abort(403, 'Guest uploads are disabled.');
        }

        return $next($request);
    }
}
