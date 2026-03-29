<?php

namespace App\Mail;

use App\Models\User;
use App\Models\UserOtpCode;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public UserOtpCode $otpCode;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, UserOtpCode $otpCode)
    {
        $this->user = $user;
        $this->otpCode = $otpCode;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match ($this->otpCode->purpose) {
            'login' => 'Your Login Verification Code',
            'sensitive_action' => 'Security Verification Required',
            'password_reset' => 'Password Reset Verification Code',
            default => 'Verification Code Required',
        };

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.otp-code',
            with: [
                'user' => $this->user,
                'otpCode' => $this->otpCode,
                'expiresInMinutes' => $this->otpCode->expires_at->diffInMinutes(now()),
                'purposeText' => $this->getPurposeText(),
                'actionText' => $this->getActionText(),
            ],
        );
    }

    /**
     * Get human-readable purpose text.
     */
    private function getPurposeText(): string
    {
        return match ($this->otpCode->purpose) {
            'login' => 'sign in to your account',
            'sensitive_action' => 'perform a sensitive action',
            'password_reset' => 'reset your password',
            default => 'verify your identity',
        };
    }

    /**
     * Get human-readable action text.
     */
    private function getActionText(): ?string
    {
        if (!$this->otpCode->action) {
            return null;
        }

        $actions = [
            'delete_role' => 'delete a role',
            'delete_permission' => 'delete a permission',
            'delete_user' => 'delete a user account',
            'edit_admin_user' => 'edit an administrator account',
            'change_user_role' => 'change user permissions',
            'export_sensitive_data' => 'export sensitive data',
            'system_settings' => 'modify system settings',
            'backup_database' => 'backup the database',
            'financial_transactions' => 'process financial transactions',
        ];

        return $actions[$this->otpCode->action] ?? $this->otpCode->action;
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
