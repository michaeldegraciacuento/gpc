import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Shield, Mail, Clock, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
    stats: {
        total_generated: number;
        total_used: number;
        total_expired: number;
        active_codes: number;
        by_purpose: Record<string, number>;
    };
    sensitive_actions: Record<string, string>;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Settings',
        href: '/settings',
    },
    {
        title: 'Multi-Factor Authentication',
        href: '/settings/mfa',
    },
];

export default function MfaSettings({ stats, sensitive_actions, user }: Props) {
    const getPurposeLabel = (purpose: string): string => {
        const labels: Record<string, string> = {
            'login': 'Login Verification',
            'sensitive_action': 'Sensitive Actions',
            'password_reset': 'Password Reset',
        };
        return labels[purpose] || purpose;
    };

    const getPurposeBadgeVariant = (purpose: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            'login': 'default',
            'sensitive_action': 'destructive',
            'password_reset': 'secondary',
        };
        return variants[purpose] || 'outline';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Multi-Factor Authentication Settings" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Multi-Factor Authentication</h1>
                            <p className="text-muted-foreground">
                                Manage your account security and view MFA statistics
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* MFA Status */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">MFA Status</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Active</div>
                            <p className="text-xs text-muted-foreground">
                                Email OTP verification enabled
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total OTP Codes */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total OTP Codes</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_generated}</div>
                            <p className="text-xs text-muted-foreground">
                                Generated for your account
                            </p>
                        </CardContent>
                    </Card>

                    {/* Active Codes */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_codes}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently valid codes
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* MFA Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Email OTP Configuration
                            </CardTitle>
                            <CardDescription>
                                Your current MFA settings and configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Email Address</span>
                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">OTP Method</span>
                                    <Badge variant="outline">Email</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Code Length</span>
                                    <span className="text-sm text-muted-foreground">6 digits</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Expiry Time</span>
                                    <span className="text-sm text-muted-foreground">10 minutes</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Rate Limit</span>
                                    <span className="text-sm text-muted-foreground">5 codes/hour</span>
                                </div>
                            </div>

                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    MFA is required for all login attempts and sensitive actions.
                                    Future updates will support SMS and TOTP authentication.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    {/* Usage Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Usage Statistics
                            </CardTitle>
                            <CardDescription>
                                Your MFA usage breakdown by purpose
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                {Object.entries(stats.by_purpose).map(([purpose, count]) => (
                                    <div key={purpose} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getPurposeBadgeVariant(purpose)} className="text-xs">
                                                {getPurposeLabel(purpose)}
                                            </Badge>
                                        </div>
                                        <span className="text-sm font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Success Rate</span>
                                    <span className="font-medium">
                                        {stats.total_generated > 0 
                                            ? Math.round((stats.total_used / stats.total_generated) * 100)
                                            : 0
                                        }%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Expired Codes</span>
                                    <span className="font-medium">{stats.total_expired}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sensitive Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Protected Actions
                        </CardTitle>
                        <CardDescription>
                            Actions that require additional MFA verification for security
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {Object.entries(sensitive_actions).map(([action, label]) => (
                                <div key={action} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    <span className="text-sm font-medium">{label}</span>
                                </div>
                            ))}
                        </div>
                        
                        <Alert className="mt-4">
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                                These actions require fresh MFA verification (valid for 30 minutes) 
                                even if you're already logged in. This provides an additional 
                                security layer for critical operations.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
