<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserOtpCode;
use App\Mail\OtpCodeMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class MfaService
{
    // OTP Configuration
    const OTP_LENGTH = 6;
    const OTP_EXPIRY_MINUTES = 10;
    const MAX_ATTEMPTS_PER_HOUR = 5;
    
    // OTP Purposes
    const PURPOSE_LOGIN = 'login';
    const PURPOSE_SENSITIVE_ACTION = 'sensitive_action';
    const PURPOSE_PASSWORD_RESET = 'password_reset';
    
    // OTP Types (extensible for future SMS/TOTP)
    const TYPE_EMAIL = 'email';
    const TYPE_SMS = 'sms';
    const TYPE_TOTP = 'totp';

    /**
     * Generate and send OTP code for user authentication.
     */
    public function generateLoginOtp(User $user): array
    {
        return $this->generateOtp(
            user: $user,
            purpose: self::PURPOSE_LOGIN,
            type: self::TYPE_EMAIL
        );
    }

    /**
     * Generate and send OTP code for sensitive actions.
     */
    public function generateSensitiveActionOtp(User $user, string $action, array $metadata = []): array
    {
        return $this->generateOtp(
            user: $user,
            purpose: self::PURPOSE_SENSITIVE_ACTION,
            type: self::TYPE_EMAIL,
            action: $action,
            metadata: $metadata
        );
    }

    /**
     * Generate and send OTP code for password reset.
     */
    public function generatePasswordResetOtp(User $user): array
    {
        return $this->generateOtp(
            user: $user,
            purpose: self::PURPOSE_PASSWORD_RESET,
            type: self::TYPE_EMAIL
        );
    }

    /**
     * Core OTP generation method.
     */
    private function generateOtp(
        User $user,
        string $purpose,
        string $type = self::TYPE_EMAIL,
        ?string $action = null,
        array $metadata = []
    ): array {
        // Check if there's already a valid OTP for this purpose/action
        $existingOtp = UserOtpCode::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->when($action, fn($query) => $query->where('action', $action))
            ->valid()
            ->first();

        if ($existingOtp) {
            return [
                'success' => true,
                'message' => 'OTP already sent. Please check your email.',
                'expires_at' => $existingOtp->expires_at,
                'otp_id' => $existingOtp->id,
                'existing' => true,
            ];
        }

        // Check rate limiting
        if ($this->isRateLimited($user, $purpose)) {
            return [
                'success' => false,
                'message' => 'Too many OTP requests. Please try again later.',
                'retry_after' => $this->getRateLimitRetryAfter($user, $purpose)
            ];
        }

        // Invalidate any existing valid OTPs for this purpose/action
        $this->invalidateExistingOtps($user, $purpose, $action);

        // Generate new OTP code
        $code = $this->generateSecureCode();
        $expiresAt = now()->addMinutes(self::OTP_EXPIRY_MINUTES);

        // Create OTP record
        $otpRecord = UserOtpCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'type' => $type,
            'purpose' => $purpose,
            'action' => $action,
            'expires_at' => $expiresAt,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'metadata' => $metadata,
        ]);

        // Send OTP based on type
        $sent = $this->sendOtp($user, $otpRecord);

        if (!$sent) {
            $otpRecord->delete();
            return [
                'success' => false,
                'message' => 'Failed to send OTP. Please try again.',
            ];
        }

        return [
            'success' => true,
            'message' => 'OTP sent successfully.',
            'expires_at' => $expiresAt,
            'otp_id' => $otpRecord->id,
        ];
    }

    /**
     * Verify OTP code.
     */
    public function verifyOtp(User $user, string $code, string $purpose, ?string $action = null): array
    {
        $query = UserOtpCode::where('user_id', $user->id)
            ->where('code', $code)
            ->where('purpose', $purpose)
            ->valid();

        if ($action) {
            $query->where('action', $action);
        }

        $otpRecord = $query->first();

        if (!$otpRecord) {
            return [
                'success' => false,
                'message' => 'Invalid or expired OTP code.',
            ];
        }

        // Mark as used
        $otpRecord->markAsUsed();

        return [
            'success' => true,
            'message' => 'OTP verified successfully.',
            'otp_record' => $otpRecord,
        ];
    }

    /**
     * Check if user requires MFA for login.
     */
    public function requiresMfaForLogin(User $user): bool
    {
        // Check if user has MFA enabled
        return (bool) $user->mfa_enabled;
    }

    /**
     * Check if action requires forced re-authentication.
     */
    public function requiresMfaForAction(string $action, User $user): bool
    {
        // If user doesn't have MFA enabled, skip all MFA checks
        if (!$user->mfa_enabled) {
            return false;
        }

        $sensitiveActions = [
            'delete_role',
            'delete_permission',
            'delete_user',
            'edit_admin_user',
            'change_user_role',
            'export_sensitive_data',
            'system_settings',
            'backup_database',
            'financial_transactions',
        ];

        return in_array($action, $sensitiveActions);
    }

    /**
     * Get list of actions that require MFA.
     */
    public function getSensitiveActions(): array
    {
        return [
            'delete_role' => 'Delete Role',
            'delete_permission' => 'Delete Permission',
            'delete_user' => 'Delete User',
            'edit_admin_user' => 'Edit Admin User',
            'change_user_role' => 'Change User Role',
            'export_sensitive_data' => 'Export Sensitive Data',
            'system_settings' => 'System Settings',
            'backup_database' => 'Database Backup',
            'financial_transactions' => 'Financial Transactions',
        ];
    }

    /**
     * Check if user is rate limited for OTP requests.
     */
    private function isRateLimited(User $user, string $purpose): bool
    {
        $recentAttempts = UserOtpCode::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        return $recentAttempts >= self::MAX_ATTEMPTS_PER_HOUR;
    }

    /**
     * Get retry after time for rate limited users.
     */
    private function getRateLimitRetryAfter(User $user, string $purpose): Carbon
    {
        $oldestAttempt = UserOtpCode::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->where('created_at', '>=', now()->subHour())
            ->oldest()
            ->first();

        return $oldestAttempt ? $oldestAttempt->created_at->addHour() : now();
    }

    /**
     * Invalidate existing valid OTPs for user/purpose/action.
     */
    private function invalidateExistingOtps(User $user, string $purpose, ?string $action = null): void
    {
        $query = UserOtpCode::where('user_id', $user->id)
            ->where('purpose', $purpose)
            ->valid();

        if ($action) {
            $query->where('action', $action);
        }

        $query->update([
            'is_used' => true,
            'used_at' => now(),
        ]);
    }

    /**
     * Generate secure random OTP code.
     */
    private function generateSecureCode(): string
    {
        return str_pad(random_int(0, 999999), self::OTP_LENGTH, '0', STR_PAD_LEFT);
    }

    /**
     * Send OTP based on type.
     */
    private function sendOtp(User $user, UserOtpCode $otpRecord): bool
    {
        try {
            switch ($otpRecord->type) {
                case self::TYPE_EMAIL:
                    return $this->sendEmailOtp($user, $otpRecord);
                case self::TYPE_SMS:
                    // Future implementation
                    return $this->sendSmsOtp($user, $otpRecord);
                case self::TYPE_TOTP:
                    // Future implementation - TOTP doesn't need sending
                    return true;
                default:
                    return false;
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send OTP', [
                'user_id' => $user->id,
                'otp_id' => $otpRecord->id,
                'type' => $otpRecord->type,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Send OTP via email.
     */
    private function sendEmailOtp(User $user, UserOtpCode $otpRecord): bool
    {
        Mail::to($user->email)->send(new OtpCodeMail($user, $otpRecord));
        return true;
    }

    /**
     * Send OTP via SMS (future implementation).
     */
    private function sendSmsOtp(User $user, UserOtpCode $otpRecord): bool
    {
        // TODO: Implement SMS sending logic
        // This could use services like Twilio, AWS SNS, etc.
        return false;
    }

    /**
     * Clean up expired OTP codes.
     */
    public function cleanupExpiredOtps(): int
    {
        return UserOtpCode::expired()->delete();
    }

    /**
     * Get OTP statistics for monitoring.
     */
    public function getOtpStats(?User $user = null)
    {
        $query = UserOtpCode::query();
        
        if ($user) {
            $query->where('user_id', $user->id);
        }

        return [
            'total_generated' => $query->count(),
            'total_used' => $query->where('is_used', true)->count(),
            'total_expired' => $query->expired()->count(),
            'active_codes' => $query->valid()->count(),
            'by_purpose' => $query->groupBy('purpose')
                ->selectRaw('purpose, count(*) as count')
                ->pluck('count', 'purpose')
                ->toArray(),
        ];
    }
}
