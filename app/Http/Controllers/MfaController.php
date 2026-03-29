<?php

namespace App\Http\Controllers;

use App\Services\MfaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MfaController extends Controller
{
    public function __construct(
        private MfaService $mfaService
    ) {}

    /**
     * Show MFA verification form.
     */
    public function show(Request $request): Response
    {
        $user = Auth::user();
        
        // If user doesn't have MFA enabled, redirect to dashboard
        if (!$user || !$user->mfa_enabled) {
            return redirect('/dashboard');
        }

        $action = $request->session()->get('mfa_intended_action');
        $purpose = $action ? MfaService::PURPOSE_SENSITIVE_ACTION : MfaService::PURPOSE_LOGIN;

        return Inertia::render('auth/mfa-verify', [
            'action' => $action,
            'actionText' => $action ? $this->getActionText($action) : null,
            'purpose' => $purpose,
            'canResend' => true,
        ]);
    }

    /**
     * Send OTP code to user.
     */
    public function sendCode(Request $request)
    {
        $user = Auth::user();
        
        // Skip if user doesn't have MFA enabled
        if (!$user->mfa_enabled) {
            return response()->json([
                'success' => true,
                'message' => 'MFA not required for this user.',
                'redirect_url' => '/dashboard',
            ]);
        }

        $action = $request->input('action');
        $purpose = $request->input('purpose', MfaService::PURPOSE_LOGIN);

        // Generate appropriate OTP based on purpose
        $result = match ($purpose) {
            MfaService::PURPOSE_SENSITIVE_ACTION => $this->mfaService->generateSensitiveActionOtp(
                user: $user,
                action: $action,
                metadata: [
                    'request_url' => $request->session()->get('mfa_intended_url'),
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                ]
            ),
            MfaService::PURPOSE_PASSWORD_RESET => $this->mfaService->generatePasswordResetOtp($user),
            default => $this->mfaService->generateLoginOtp($user),
        };

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'expires_at' => $result['expires_at'],
                'existing' => $result['existing'] ?? false,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'],
            'retry_after' => $result['retry_after'] ?? null,
        ], 429);
    }

    /**
     * Verify OTP code.
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
            'purpose' => 'required|string|in:login,sensitive_action,password_reset',
            'action' => 'nullable|string',
        ]);

        $user = Auth::user();
        
        // Skip MFA verification if user doesn't have MFA enabled
        if (!$user->mfa_enabled) {
            return response()->json([
                'success' => true,
                'message' => 'MFA not required for this user.',
                'redirect_url' => '/dashboard',
            ]);
        }
        
        $code = $request->input('code');
        $purpose = $request->input('purpose');
        $action = $request->input('action');

        // Verify OTP
        $result = $this->mfaService->verifyOtp($user, $code, $purpose, $action);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        // Set MFA session
        $sessionKey = $action ? "mfa_verified_{$action}" : 'mfa_verified_login';
        $request->session()->put($sessionKey, now());

        // For login MFA, complete the session regeneration that was deferred
        if ($purpose === MfaService::PURPOSE_LOGIN) {
            $request->session()->regenerate();
        }

        // Get intended URL and clean up session
        $intendedUrl = $request->session()->pull('mfa_intended_url', '/dashboard');
        $request->session()->forget('mfa_intended_action');

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'redirect_url' => $intendedUrl,
        ]);
    }

    /**
     * Check MFA status for current session.
     */
    public function status(Request $request)
    {
        $action = $request->input('action');
        $sessionKey = $action ? "mfa_verified_{$action}" : 'mfa_verified_login';
        
        $verifiedAt = $request->session()->get($sessionKey);
        $isVerified = false;
        $expiresAt = null;

        if ($verifiedAt) {
            $validDuration = $action ? 30 : 1440; // minutes
            $expiresAt = $verifiedAt->addMinutes($validDuration);
            $isVerified = now()->isBefore($expiresAt);
        }

        return response()->json([
            'is_verified' => $isVerified,
            'verified_at' => $verifiedAt,
            'expires_at' => $expiresAt,
            'action' => $action,
        ]);
    }

    /**
     * Revoke MFA session.
     */
    public function revoke(Request $request)
    {
        $action = $request->input('action');
        
        if ($action) {
            $request->session()->forget("mfa_verified_{$action}");
        } else {
            // Revoke all MFA sessions
            $sessionData = $request->session()->all();
            foreach ($sessionData as $key => $value) {
                if (str_starts_with($key, 'mfa_verified_')) {
                    $request->session()->forget($key);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'MFA session revoked successfully.',
        ]);
    }

    /**
     * Get MFA settings and statistics.
     */
    public function settings(Request $request): Response
    {
        $user = Auth::user();
        $stats = $this->mfaService->getOtpStats($user);
        $sensitiveActions = $this->mfaService->getSensitiveActions();

        return Inertia::render('settings/mfa', [
            'stats' => $stats,
            'sensitive_actions' => $sensitiveActions,
            'user' => $user,
        ]);
    }

    /**
     * Get human-readable action text.
     */
    private function getActionText(string $action): string
    {
        return $this->mfaService->getSensitiveActions()[$action] ?? ucwords(str_replace('_', ' ', $action));
    }
}
