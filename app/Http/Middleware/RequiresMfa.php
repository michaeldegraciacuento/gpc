<?php

namespace App\Http\Middleware;

use App\Services\MfaService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class RequiresMfa
{
    public function __construct(
        private MfaService $mfaService
    ) {}

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ?string $action = null): Response
    {
        $user = Auth::user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Skip MFA if user doesn't have MFA enabled
        if (!$user->mfa_enabled) {
            return $next($request);
        }

        // Check if MFA is required for this action
        if ($action && !$this->mfaService->requiresMfaForAction($action, $user)) {
            return $next($request);
        }

        // Check if user has valid MFA session for this action
        $sessionKey = $action ? "mfa_verified_{$action}" : 'mfa_verified_login';
        
        if ($request->session()->has($sessionKey)) {
            $verifiedAt = $request->session()->get($sessionKey);
            
            // MFA session is valid for 30 minutes for sensitive actions, 24 hours for login
            $validDuration = $action ? 30 : 1440; // minutes
            
            if (now()->diffInMinutes($verifiedAt) <= $validDuration) {
                return $next($request);
            }
            
            // Remove expired session
            $request->session()->forget($sessionKey);
        }

        // Store the intended URL and action for after MFA verification
        $request->session()->put('mfa_intended_url', $request->fullUrl());
        if ($action) {
            $request->session()->put('mfa_intended_action', $action);
        }

        // Generate and send OTP for sensitive action
        if ($action) {
            $otpResult = $this->mfaService->generateSensitiveActionOtp(
                user: $user,
                action: $action,
                metadata: [
                    'request_url' => $request->fullUrl(),
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                ]
            );
        }

        // Redirect to MFA verification page
        return redirect()->route('mfa.verify')->with([
            'action' => $action,
            'actionText' => $action ? $this->getActionText($action) : null,
            'purpose' => $action ? MfaService::PURPOSE_SENSITIVE_ACTION : MfaService::PURPOSE_LOGIN,
            'otp_sent' => true,
            'message' => 'Additional verification required for this action.',
        ]);
    }

    /**
     * Get human-readable action text.
     */
    private function getActionText(string $action): string
    {
        $actions = [
            'delete_role' => 'Delete Role',
            'delete_permission' => 'Delete Permission',
            'delete_user' => 'Delete User Account',
            'edit_admin_user' => 'Edit Administrator Account',
            'change_user_role' => 'Change User Permissions',
            'export_sensitive_data' => 'Export Sensitive Data',
            'system_settings' => 'Modify System Settings',
            'backup_database' => 'Backup Database',
            'financial_transactions' => 'Process Financial Transactions',
        ];

        return $actions[$action] ?? ucwords(str_replace('_', ' ', $action));
    }
}
