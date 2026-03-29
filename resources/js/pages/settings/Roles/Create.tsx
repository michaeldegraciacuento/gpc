import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Permission {
    id: number;
    name: string;
}

interface GroupedPermissions {
    [key: string]: Permission[];
}

interface Props {
    permissions: GroupedPermissions;
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
        title: 'Create Role',
        href: '/roles/create',
    },
];

export default function CreateRole({ permissions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/roles');
    };

    const handlePermissionChange = (permissionName: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData('permissions', data.permissions.filter(p => p !== permissionName));
        }
    };

    const handleGroupToggle = (groupName: string, checked: boolean) => {
        const groupPermissions = permissions[groupName].map(p => p.name);
        if (checked) {
            const newPermissions = [...new Set([...data.permissions, ...groupPermissions])];
            setData('permissions', newPermissions);
        } else {
            setData('permissions', data.permissions.filter(p => !groupPermissions.includes(p)));
        }
    };

    const isGroupChecked = (groupName: string) => {
        const groupPermissions = permissions[groupName].map(p => p.name);
        return groupPermissions.every(p => data.permissions.includes(p));
    };

    const isGroupIndeterminate = (groupName: string) => {
        const groupPermissions = permissions[groupName].map(p => p.name);
        const checkedCount = groupPermissions.filter(p => data.permissions.includes(p)).length;
        return checkedCount > 0 && checkedCount < groupPermissions.length;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/roles">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Roles
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Role</h1>
                        <p className="text-muted-foreground">
                            Create a new role and assign permissions
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Details</CardTitle>
                            <CardDescription>
                                Enter the basic information for the new role
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter role name (e.g., sales_manager)"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>
                                Select the permissions for this role
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(permissions).map(([groupName, groupPermissions]) => (
                                <div key={groupName} className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`group-${groupName}`}
                                            checked={isGroupChecked(groupName)}
                                            onCheckedChange={(checked) => handleGroupToggle(groupName, checked as boolean)}
                                            className={isGroupIndeterminate(groupName) ? 'data-[state=checked]:bg-primary' : ''}
                                        />
                                        <Label 
                                            htmlFor={`group-${groupName}`}
                                            className="text-sm font-semibold capitalize cursor-pointer"
                                        >
                                            {groupName.replace('_', ' ')} ({groupPermissions.length})
                                        </Label>
                                    </div>
                                    <div className="ml-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {groupPermissions.map((permission) => (
                                            <div key={permission.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`permission-${permission.id}`}
                                                    checked={data.permissions.includes(permission.name)}
                                                    onCheckedChange={(checked) => 
                                                        handlePermissionChange(permission.name, checked as boolean)
                                                    }
                                                />
                                                <Label 
                                                    htmlFor={`permission-${permission.id}`}
                                                    className="text-sm cursor-pointer"
                                                >
                                                    {permission.name.split('.')[1] || permission.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {errors.permissions && (
                                <p className="text-sm text-destructive">{errors.permissions}</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href="/roles">
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Creating...' : 'Create Role'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
