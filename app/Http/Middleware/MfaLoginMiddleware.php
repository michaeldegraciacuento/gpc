<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MfaLoginMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Skip MFA if user is not authenticated or doesn't have MFA enabled
        if (!$user || !$user->mfa_enabled) {
            return $next($request);
        }
        
        // Check for the correct session key that's set in MfaController
        $sessionKey = 'mfa_verified_login';
        
        if (!$request->session()->has($sessionKey)) {
            return redirect()->route('mfa.verify');
        }
        
        // Check if MFA session is still valid (24 hours for login)
        $verifiedAt = $request->session()->get($sessionKey);
        if ($verifiedAt && now()->diffInMinutes($verifiedAt) > 1440) {
            $request->session()->forget($sessionKey);
            return redirect()->route('mfa.verify');
        }
        
        return $next($request);
    }
}