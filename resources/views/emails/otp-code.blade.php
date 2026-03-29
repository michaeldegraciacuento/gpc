<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .otp-code {
            background: #f1f5f9;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-number {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #1e40af;
            font-family: 'Courier New', monospace;
        }
        .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .warning-icon {
            color: #d97706;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
        }
        .action-info {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .action-info-icon {
            color: #1d4ed8;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Office for the Senior Citizens Affairs - Iligan City</div>
            <h1>Security Verification Required</h1>
        </div>

        <p>Hello {{ $user->name }},</p>

        <p>We received a request to {{ $purposeText }}. To ensure the security of your account, please use the verification code below:</p>

        <div class="otp-code">
            <div style="font-size: 14px; color: #64748b; margin-bottom: 10px;">Your verification code:</div>
            <div class="otp-number">{{ $otpCode->code }}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 10px;">
                This code expires in {{ $expiresInMinutes }} minutes
            </div>
        </div>

        @if($actionText)
        <div class="action-info">
            <div class="action-info-icon">🔒 Sensitive Action</div>
            <strong>Action:</strong> {{ $actionText }}
            <br>
            <small>This action requires additional verification for security purposes.</small>
        </div>
        @endif

        <div class="warning">
            <div class="warning-icon">⚠️ Security Notice</div>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Never share this code with anyone</li>
                <li>We will never ask for this code via phone or email</li>
                <li>This code expires in {{ $expiresInMinutes }} minutes</li>
                <li>If you didn't request this, please secure your account immediately</li>
            </ul>
        </div>

        <p>If you didn't initiate this request, please:</p>
        <ul>
            <li>Change your password immediately</li>
            <li>Review your recent account activity</li>
            <li>Contact our support team if you notice any suspicious activity</li>
        </ul>

        <div class="footer">
            <p><strong>OSCA Security Team</strong></p>
            <p>This is an automated security message. Please do not reply to this email.</p>
            <p style="font-size: 12px; margin-top: 15px;">
                Request Details:<br>
                Time: {{ $otpCode->created_at->format('M j, Y \a\t g:i A T') }}<br>
                IP Address: {{ $otpCode->ip_address }}<br>
                @if($otpCode->action)
                Action: {{ $actionText }}<br>
                @endif
            </p>
        </div>
    </div>
</body>
</html>
