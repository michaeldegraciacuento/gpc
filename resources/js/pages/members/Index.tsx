import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, MoreHorizontal, Plus, Search, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Member {
    id: number;
    member_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    full_name: string;
    email: string | null;
    phone: string | null;
    membership_type: string;
    position: string;
    status: string;
    joined_at: string;
    member_image_url: string | null;
}

interface PaginatedMembers {
    data: Member[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    members: PaginatedMembers;
    filters: {
        search?: string;
        status?: string;
        membership_type?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Members', href: '/members' },
];

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'active':
            return 'default';
        case 'inactive':
            return 'secondary';
        case 'suspended':
            return 'destructive';
        default:
            return 'outline';
    }
};

const POSITION_LABELS: Record<string, string> = {
    president: 'President',
    vice_president: 'Vice-President',
    secretary: 'Secretary',
    treasurer: 'Treasurer',
    collector: 'Collector',
    coordinator: 'Coordinator',
    member: 'Member',
};

export default function MembersIndex({ members, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/members', { ...filters, search }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get('/members', { ...filters, search, [key]: value === 'all' ? undefined : value }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this member? All their payment records will also be removed.')) {
            setDeletingId(id);
            router.delete(`/members/${id}`, {
                onFinish: () => setDeletingId(null),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Members" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
                        <p className="text-muted-foreground">Manage club members and their information</p>
                    </div>
                    <Link href="/members/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Member
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                                <div className="relative flex-1">
                                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                    <Input
                                        placeholder="Search by name, member ID, email, or phone..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">
                                    Search
                                </Button>
                            </form>
                            <div className="flex gap-2">
                                <Select value={filters.status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filters.membership_type || 'all'} onValueChange={(v) => handleFilterChange('membership_type', v)}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="regular">Regular</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Member ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden sm:table-cell">Joined</TableHead>
                                    <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.data.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-mono text-sm">{member.member_id}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {member.member_image_url ? (
                                                    <img src={member.member_image_url} alt={member.full_name} className="h-8 w-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                                        {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="font-medium">{member.full_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground hidden md:table-cell">
                                            <div className="text-sm">{member.email || '—'}</div>
                                            {member.phone && <div className="text-xs">{member.phone}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={member.position !== 'member' ? 'default' : 'outline'} className="capitalize">
                                                {POSITION_LABELS[member.position] || member.position}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(member.status)} className="capitalize">
                                                {member.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground hidden sm:table-cell">
                                            {new Date(member.joined_at).toLocaleDateString()}
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
                                                        <Link href={`/members/${member.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/members/${member.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(member.id)}
                                                        className="text-destructive"
                                                        disabled={deletingId === member.id}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {members.data.length === 0 && (
                            <div className="py-12 text-center">
                                <Users className="text-muted-foreground mx-auto h-12 w-12" />
                                <h3 className="mt-2 text-sm font-semibold">No members found</h3>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {filters.search ? 'Try a different search term.' : 'Get started by adding your first member.'}
                                </p>
                                {!filters.search && (
                                    <div className="mt-6">
                                        <Link href="/members/create">
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Member
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {members.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">
                                    Showing {(members.current_page - 1) * members.per_page + 1} to{' '}
                                    {Math.min(members.current_page * members.per_page, members.total)} of {members.total} members
                                </p>
                                <div className="flex gap-1">
                                    {members.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
