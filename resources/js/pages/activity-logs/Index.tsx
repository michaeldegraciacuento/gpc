import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ClipboardList, Search } from 'lucide-react';
import { useState } from 'react';

interface ChangeEntry {
    field: string;
    from: string;
    to: string;
}

interface LogEntry {
    id: number;
    action: string;
    subject_type: string;
    subject_id: number;
    description: string;
    changes: ChangeEntry[] | null;
    user_name: string;
    created_at: string;
    created_at_full: string;
}

interface PaginatedLogs {
    data: LogEntry[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    logs: PaginatedLogs;
    filters: {
        search?: string;
        action?: string;
        type?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Activity Logs', href: '/activity-logs' },
];

const actionVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (action) {
        case 'created':
            return 'default';
        case 'updated':
            return 'secondary';
        case 'deleted':
            return 'destructive';
        default:
            return 'outline';
    }
};

const typeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
        case 'Member':
            return 'default';
        case 'Payment':
            return 'secondary';
        case 'Payment Type':
            return 'outline';
        default:
            return 'outline';
    }
};

export default function ActivityLogsIndex({ logs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (overrides: Record<string, string> = {}) => {
        const params: Record<string, string> = {
            ...(search ? { search } : {}),
            ...(filters.action ? { action: filters.action } : {}),
            ...(filters.type ? { type: filters.type } : {}),
            ...overrides,
        };

        // Remove empty values and "all" filters
        Object.keys(params).forEach((key) => {
            if (!params[key] || params[key] === 'all') delete params[key];
        });

        router.get('/activity-logs', params, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Logs" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
                        <p className="text-muted-foreground">Track all actions performed across the system.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="relative flex-1">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Search activity logs..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </form>

                            {/* Action filter */}
                            <Select
                                value={filters.action ?? 'all'}
                                onValueChange={(v) => applyFilters({ action: v })}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="created">Created</SelectItem>
                                    <SelectItem value="updated">Updated</SelectItem>
                                    <SelectItem value="deleted">Deleted</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Type filter */}
                            <Select
                                value={filters.type ?? 'all'}
                                onValueChange={(v) => applyFilters({ type: v })}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="payment">Payment</SelectItem>
                                    <SelectItem value="payment_type">Payment Type</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {logs.data.length > 0 ? (
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Action</TableHead>
                                            <TableHead className="w-[120px]">Type</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="hidden md:table-cell">By</TableHead>
                                            <TableHead className="text-right">When</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>
                                                    <Badge variant={actionVariant(log.action)} className="capitalize">
                                                        {log.action}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={typeVariant(log.subject_type)} className="text-xs">
                                                        {log.subject_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[500px]">
                                                    <div className="truncate">{log.description}</div>
                                                    {log.changes && log.changes.length > 0 && (
                                                        <div className="mt-1 space-y-0.5">
                                                            {log.changes.map((c, i) => (
                                                                <div key={i} className="text-muted-foreground text-xs">
                                                                    <span className="font-medium capitalize">{c.field}:</span>{' '}
                                                                    <span className="text-red-500 line-through">{c.from}</span>{' '}
                                                                    <span className="mx-0.5">&rarr;</span>{' '}
                                                                    <span className="text-green-600 font-medium">{c.to}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground hidden md:table-cell">{log.user_name}</TableCell>
                                                <TableCell className="text-muted-foreground text-right whitespace-nowrap">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="cursor-default">{log.created_at}</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{log.created_at_full}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                    <ClipboardList className="text-muted-foreground h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-medium">No activity logs found</h3>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {filters.search || filters.action || filters.type
                                        ? 'Try adjusting your filters.'
                                        : 'Activity will appear here as actions are performed.'}
                                </p>
                            </div>
                        )}

                        {logs.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">
                                    Showing {(logs.current_page - 1) * logs.per_page + 1} to{' '}
                                    {Math.min(logs.current_page * logs.per_page, logs.total)} of {logs.total} logs
                                </p>
                                <div className="flex gap-1">
                                    {logs.links.map((link, i) => (
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
