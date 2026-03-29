import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { MoreHorizontal, Plus, Shield, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface Permission {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedPermissions {
    data: Permission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    permissions: PaginatedPermissions;
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
];

export default function PermissionsIndex({ permissions }: Props) {
    const [deletingPermission, setDeletingPermission] = useState<number | null>(null);

    const handleDelete = (permissionId: number) => {
        if (confirm('Are you sure you want to delete this permission?')) {
            setDeletingPermission(permissionId);
            router.delete(`/permissions/${permissionId}`, {
                onFinish: () => setDeletingPermission(null),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/roles">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Roles
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
                        <p className="text-muted-foreground">
                            Manage system permissions
                        </p>
                    </div>
                    <Link href="/permissions/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Permission
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                        <CardDescription>
                            A list of all available permissions in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Module</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.data.map((permission) => {
                                    const [module, action] = permission.name.split('.');
                                    return (
                                        <TableRow key={permission.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                                    {permission.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {module?.replace('_', ' ') || 'N/A'}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {action || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(permission.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/permissions/${permission.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/permissions/${permission.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(permission.id)}
                                                            className="text-destructive"
                                                            disabled={deletingPermission === permission.id}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {permissions.data.length === 0 && (
                            <div className="text-center py-8">
                                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold">No permissions found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Get started by creating a new permission.
                                </p>
                                <div className="mt-6">
                                    <Link href="/permissions/create">
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Permission
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
