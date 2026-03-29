import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { ArrowLeft, Shield, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    mfa_enabled?: boolean;
    roles: Array<{ id: number; name: string }>;
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    user: User;
    roles: Role[];
}

export default function Edit({ user, roles }: Props) {
    const [togglingMfa, setTogglingMfa] = useState(false);
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Settings',
            href: '/roles',
        },
        {
            title: 'Users',
            href: '/users',
        },
        {
            title: user.name,
            href: `/users/${user.id}`,
        },
        {
            title: 'Edit',
            href: `/users/${user.id}/edit`,
        },
    ];

    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles.map(role => role.id),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/users/${user.id}`);
    };

    const handleMfaToggle = () => {
        const action = user.mfa_enabled ? 'disable' : 'enable';
        const actionText = user.mfa_enabled ? 'disable' : 'enable';
        
        if (confirm(`Are you sure you want to ${actionText} MFA for ${user.name}?`)) {
            setTogglingMfa(true);
            router.post(`/users/${user.id}/${action}-mfa`, {}, {
                onFinish: () => setTogglingMfa(false),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User: ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/users">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Users
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Edit User: {user.name}</h1>
                        <p className="text-muted-foreground">
                            Update user information and roles
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Information</CardTitle>
                                <CardDescription>
                                    Update the user details and assign roles
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={errors.name ? 'border-destructive' : ''}
                                            />
                                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={errors.email ? 'border-destructive' : ''}
                                            />
                                            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className={errors.password ? 'border-destructive' : ''}
                                            />
                                            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Roles</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {roles.map((role) => (
                                                <div key={role.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`role-${role.id}`}
                                                        checked={data.roles.includes(role.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setData('roles', [...data.roles, role.id]);
                                                            } else {
                                                                setData('roles', data.roles.filter(id => id !== role.id));
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={`role-${role.id}`} className="text-sm font-normal">
                                                        {role.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end space-x-2">
                                        <Link href="/users">
                                            <Button variant="outline" type="button">
                                                Cancel
                                            </Button>
                                        </Link>
                                        <Button type="submit" disabled={processing}>
                                            Update User
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>
                                    Manage user security preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <Label>Multi-Factor Authentication</Label>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-2">
                                            {user.mfa_enabled ? (
                                                <>
                                                    <ShieldCheck className="h-4 w-4 text-green-600" />
                                                    <div>
                                                        <p className="text-sm font-medium">Enabled</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Email verification required
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">Disabled</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            No additional verification
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <Button
                                            variant={user.mfa_enabled ? "destructive" : "default"}
                                            size="sm"
                                            onClick={handleMfaToggle}
                                            disabled={togglingMfa}
                                        >
                                            {user.mfa_enabled ? 'Disable' : 'Enable'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
