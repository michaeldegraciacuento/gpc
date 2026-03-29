<?php

namespace App\Http\Middleware;

use App\Services\MfaService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class RequiresLoginMfa
{
    public function __construct(
        private MfaService $mfaService
    ) {}

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Skip MFA check for MFA-related routes to prevent infinite redirects
        $mfaRoutes = [
            'mfa.verify',
            'mfa.send-code',
            'mfa.verify.submit',
            'mfa.status',
            'mfa.revoke',
        ];

        if (in_array($request->route()->getName(), $mfaRoutes)) {
            return $next($request);
        }

        // Skip MFA check for logout route
        if ($request->route()->getName() === 'logout') {
            return $next($request);
        }

        // Check if MFA is required for login
        if ($this->mfaService->requiresMfaForLogin($user)) {
            // Check if user has valid MFA session for login
            if (!$request->session()->has('mfa_verified_login') || 
                now()->diffInMinutes($request->session()->get('mfa_verified_login')) > 1440) {
                
                // Store the intended URL for after MFA verification
                $request->session()->put('mfa_intended_url', $request->fullUrl());
                
                // Generate and send OTP for login if not already sent
                $otpResult = $this->mfaService->generateLoginOtp($user);
                
                // Redirect to MFA verification page
                return redirect()->route('mfa.verify')->with([
                    'otp_sent' => true,
                    'expires_at' => $otpResult['expires_at'] ?? null,
                    'message' => $otpResult['message'] ?? 'Verification code sent to your email address.',
                    'purpose' => MfaService::PURPOSE_LOGIN,
                ]);
            }
        }

        return $next($request);
    }
}
