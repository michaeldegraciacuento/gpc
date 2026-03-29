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
import { CreditCard, Edit, Eye, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PaymentType {
    id: number;
    name: string;
}

interface Payment {
    id: number;
    or_number: string | null;
    amount: string;
    payment_date: string;
    payment_method: string;
    status: string;
    notes: string | null;
    billing_period: string | null;
    member: {
        id: number;
        member_id: string;
        full_name: string;
    };
    payment_type: PaymentType;
    recorder: { id: number; name: string } | null;
}

interface PaginatedPayments {
    data: Payment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    payments: PaginatedPayments;
    paymentTypes: PaymentType[];
    filters: {
        search?: string;
        payment_type_id?: string;
        status?: string;
        payment_method?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Payments', href: '/payments' },
];

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'paid':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'cancelled':
            return 'destructive';
        default:
            return 'outline';
    }
};

const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount));
};

const paymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = { cash: 'Cash', gcash: 'GCash', bank_transfer: 'Bank Transfer' };
    return labels[method] || method;
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatPeriod = (period: string | null): string => {
    if (!period) return '—';
    if (period.length === 4) return period;
    const [year, month] = period.split('-');
    return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
};

export default function PaymentsIndex({ payments, paymentTypes, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/payments', { ...filters, search }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get('/payments', { ...filters, search, [key]: value === 'all' ? undefined : value }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this payment record?')) {
            setDeletingId(id);
            router.delete(`/payments/${id}`, { onFinish: () => setDeletingId(null) });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                        <p className="text-muted-foreground">Track and manage all member payments</p>
                    </div>
                    <Link href="/payments/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Record Payment
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                                <div className="relative flex-1">
                                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                    <Input placeholder="Search by member name, ID, or receipt #..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                                </div>
                                <Button type="submit" variant="secondary">
                                    Search
                                </Button>
                            </form>
                            <div className="flex flex-wrap gap-2">
                                <Select value={filters.payment_type_id || 'all'} onValueChange={(v) => handleFilterChange('payment_type_id', v)}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {paymentTypes.map((pt) => (
                                            <SelectItem key={pt.id} value={String(pt.id)}>
                                                {pt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={filters.status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
                                    <SelectTrigger className="w-[130px]">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filters.payment_method || 'all'} onValueChange={(v) => handleFilterChange('payment_method', v)}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="All Methods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Methods</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="gcash">GCash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Member</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="hidden md:table-cell">Period</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="hidden md:table-cell">Method</TableHead>
                                    <TableHead className="hidden md:table-cell">OR #</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.data.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Link href={`/members/${payment.member.id}`} className="hover:underline">
                                                <div className="font-medium">{payment.member.full_name}</div>
                                                <div className="text-muted-foreground text-xs font-mono">{payment.member.member_id}</div>
                                            </Link>
                                        </TableCell>
                                        <TableCell>{payment.payment_type.name}</TableCell>
                                        <TableCell className="text-muted-foreground hidden md:table-cell">{formatPeriod(payment.billing_period)}</TableCell>
                                        <TableCell className="font-mono font-medium">{formatCurrency(payment.amount)}</TableCell>
                                        <TableCell className="hidden md:table-cell">{paymentMethodLabel(payment.payment_method)}</TableCell>
                                        <TableCell className="text-muted-foreground hidden md:table-cell">{payment.or_number || '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(payment.status)} className="capitalize">
                                                {payment.status}
                                            </Badge>
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
                                                        <Link href={`/payments/${payment.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/payments/${payment.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(payment.id)} className="text-destructive" disabled={deletingId === payment.id}>
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

                        {payments.data.length === 0 && (
                            <div className="py-12 text-center">
                                <CreditCard className="text-muted-foreground mx-auto h-12 w-12" />
                                <h3 className="mt-2 text-sm font-semibold">No payments found</h3>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {filters.search ? 'Try a different search term.' : 'Record the first payment to get started.'}
                                </p>
                                {!filters.search && (
                                    <div className="mt-6">
                                        <Link href="/payments/create">
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Record Payment
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {payments.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">
                                    Showing {(payments.current_page - 1) * payments.per_page + 1} to{' '}
                                    {Math.min(payments.current_page * payments.per_page, payments.total)} of {payments.total} payments
                                </p>
                                <div className="flex gap-1">
                                    {payments.links.map((link, i) => (
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
