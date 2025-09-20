<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null)
    {
        if (Auth::guard($guard)->check()) {
            $user = Auth::guard($guard)->user();
            
            // Check if user has admin role and redirect accordingly
            if ($user && $user->roles->contains('name', 'admin')) {
                return redirect('/admin');
            }
            
            // Default redirect for regular users (remove drive reference)
            return redirect('/');
        }

        return $next($request);
    }
}
