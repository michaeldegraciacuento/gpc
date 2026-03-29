import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Shield } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    permission: Permission;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Roles & Permissions',
        href: '/roles',
    },
    {
        title: 'Permissions',
        href: '/permissions',
    },
    {
        title: 'View Permission',
        href: '#',
    },
];

export default function ShowPermission({ permission }: Props) {
    const [module, action] = permission.name.split('.');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Permission: ${permission.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/permissions">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Permissions
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Shield className="h-8 w-8" />
                            {permission.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Permission details
                        </p>
                    </div>
                    <Link href={`/permissions/${permission.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Permission
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Permission Information</CardTitle>
                        <CardDescription>
                            Details about this permission
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">Permission Name</Label>
                                <p className="text-sm text-muted-foreground mt-1">{permission.name}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Module</Label>
                                <p className="text-sm text-muted-foreground mt-1 capitalize">
                                    {module?.replace('_', ' ') || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Action</Label>
                                <p className="text-sm text-muted-foreground mt-1 capitalize">
                                    {action || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Created</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {new Date(permission.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Last Updated</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {new Date(permission.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={className}>{children}</div>;
}
