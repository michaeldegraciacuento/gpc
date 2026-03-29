import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Head, router } from '@inertiajs/react';
import { Shield, Mail, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';
import axios from 'axios';

interface Props {
    action?: string;
    actionText?: string;
    purpose: string;
    canResend?: boolean;
    otp_sent?: boolean;
    expires_at?: string;
    message?: string;
}

export default function MfaVerify({ action, actionText, purpose, canResend = true, otp_sent = false, expires_at, message }: Props) {
    const [code, setCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [canResendCode, setCanResendCode] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Auto-send OTP on component mount (only if not already sent)
    useEffect(() => {
        if (otp_sent) {
            // OTP already sent by server, show success message
            if (message) {
                setSuccess(message);
            }
            setCanResendCode(true);
            setResendCooldown(60); // 1 minute cooldown
        } else {
            // Need to send OTP
            sendOtpCode();
        }
    }, []);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setError('Verification code has expired. Please request a new one.');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else {
            setCanResendCode(true);
        }
    }, [resendCooldown]);

    const sendOtpCode = async () => {
        if (isSending) return;
        
        setIsSending(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('/mfa/send-code', {
                action,
                purpose,
            });

            if (response.data.success) {
                const message = response.data.existing 
                    ? 'Using existing verification code. Please check your email.'
                    : 'Verification code sent to your email address.';
                setSuccess(message);
                setTimeLeft(600); // Reset timer
                setCanResendCode(false);
                setResendCooldown(60); // 1 minute cooldown
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to send verification code.';
            setError(message);
            
            if (err.response?.data?.retry_after) {
                const retryAfter = new Date(err.response.data.retry_after);
                const secondsUntilRetry = Math.ceil((retryAfter.getTime() - Date.now()) / 1000);
                setResendCooldown(Math.max(secondsUntilRetry, 60));
            }
        } finally {
            setIsSending(false);
        }
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        
        if (isVerifying || code.length !== 6) return;

        setIsVerifying(true);
        setError('');

        try {
            const response = await axios.post('/mfa/verify', {
                code,
                purpose,
                action,
            });

            if (response.data.success) {
                setSuccess('Verification successful! Redirecting...');
                
                // Redirect after a brief delay
                setTimeout(() => {
                    window.location.href = response.data.redirect_url;
                }, 1000);
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Verification failed. Please try again.';
            setError(message);
            setCode(''); // Clear the code on error
        } finally {
            setIsVerifying(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getPurposeText = (): string => {
        switch (purpose) {
            case 'login':
                return 'sign in to your account';
            case 'sensitive_action':
                return actionText ? `perform: ${actionText}` : 'perform a sensitive action';
            case 'password_reset':
                return 'reset your password';
            default:
                return 'verify your identity';
        }
    };

    return (
        <>
            <Head title="Security Verification" />
            
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <Shield className="mx-auto h-12 w-12 text-blue-600" />
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Security Verification
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Additional verification required to {getPurposeText()}
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Enter Verification Code
                            </CardTitle>
                            <CardDescription>
                                We've sent a 6-digit verification code to your email address. 
                                Enter it below to continue.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {action && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>Sensitive Action:</strong> {actionText}
                                        <br />
                                        <small className="text-muted-foreground">
                                            This action requires additional verification for security.
                                        </small>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Verification Code</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        value={code}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setCode(value);
                                        }}
                                        placeholder="Enter 6-digit code"
                                        className="text-center text-2xl font-mono tracking-widest"
                                        maxLength={6}
                                        autoComplete="one-time-code"
                                        autoFocus
                                    />
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            Expires in {formatTime(timeLeft)}
                                        </span>
                                        <span>{code.length}/6</span>
                                    </div>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                {success && (
                                    <Alert>
                                        <AlertDescription className="text-green-700">
                                            {success}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        disabled={isVerifying || code.length !== 6 || timeLeft === 0}
                                        className="flex-1"
                                    >
                                        {isVerifying ? 'Verifying...' : 'Verify Code'}
                                    </Button>
                                    
                                    {canResend && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={sendOtpCode}
                                            disabled={isSending || !canResendCode || resendCooldown > 0}
                                        >
                                            <RefreshCw className={`h-4 w-4 mr-2 ${isSending ? 'animate-spin' : ''}`} />
                                            {resendCooldown > 0 
                                                ? `Resend (${resendCooldown}s)`
                                                : isSending 
                                                    ? 'Sending...' 
                                                    : 'Resend'
                                            }
                                        </Button>
                                    )}
                                </div>
                            </form>

                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Didn't receive the code? Check your spam folder or{' '}
                                    <button
                                        onClick={sendOtpCode}
                                        disabled={isSending || !canResendCode || resendCooldown > 0}
                                        className="text-blue-600 hover:text-blue-500 underline disabled:text-gray-400 disabled:no-underline"
                                    >
                                        request a new one
                                    </button>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            For security reasons, this verification will expire in {formatTime(timeLeft)}.
                            <br />
                            If you didn't request this, please contact support immediately.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
