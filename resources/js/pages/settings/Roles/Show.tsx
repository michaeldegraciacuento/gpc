import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Shield } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

interface Props {
    role: Role;
}

export default function ShowRole({ role }: Props) {
    const groupedPermissions = role.permissions.reduce((acc, permission) => {
        const group = permission.name.split('.')[0];
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <>
            <Head title={`Role: ${role.name}`} />
            
            <div className="container mx-auto py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/roles">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Roles
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Shield className="h-8 w-8" />
                            {role.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Role details and permissions
                        </p>
                    </div>
                    <Link href={`/roles/${role.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Role
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Information</CardTitle>
                            <CardDescription>
                                Basic details about this role
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Role Name</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{role.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Total Permissions</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{role.permissions.length}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Created</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {new Date(role.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Last Updated</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {new Date(role.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>
                                All permissions assigned to this role
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(groupedPermissions).length > 0 ? (
                                <div className="space-y-6">
                                    {Object.entries(groupedPermissions).map(([group, permissions]) => (
                                        <div key={group} className="space-y-3">
                                            <h3 className="text-sm font-semibold capitalize">
                                                {group.replace('_', ' ')} ({permissions.length})
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {permissions.map((permission) => (
                                                    <Badge key={permission.id} variant="secondary">
                                                        {permission.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-semibold">No permissions assigned</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        This role has no permissions assigned to it.
                                    </p>
                                    <div className="mt-6">
                                        <Link href={`/roles/${role.id}/edit`}>
                                            <Button>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Add Permissions
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={className}>{children}</div>;
}
