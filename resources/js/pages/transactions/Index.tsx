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
import { ArrowDownLeft, ArrowUpRight, Edit, Eye, MoreHorizontal, Plus, Search, Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';

interface Transaction {
    id: number;
    type: 'in' | 'out';
    category: string;
    description: string | null;
    amount: string;
    transaction_date: string;
    payment_id: number | null;
    member_id: number | null;
    member: { id: number; member_id: string; full_name: string } | null;
    recorder: { id: number; name: string } | null;
    created_at: string;
}

interface PaginatedTransactions {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    transactions: PaginatedTransactions;
    filters: {
        search?: string;
        type?: string;
        category?: string;
    };
    categoriesIn: string[];
    categoriesOut: string[];
    summary: {
        total_in: number;
        total_out: number;
        balance: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transactions', href: '/transactions' },
];

const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount));
};

export default function TransactionsIndex({ transactions, filters, categoriesIn, categoriesOut, summary }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const allCategories = [...categoriesIn, ...categoriesOut];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/transactions', { ...filters, search }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get('/transactions', { ...filters, search, [key]: value === 'all' ? undefined : value }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            setDeletingId(id);
            router.delete(`/transactions/${id}`, { onFinish: () => setDeletingId(null) });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="mb-2 flex items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                        <p className="text-muted-foreground">Track all money in and money out</p>
                    </div>
                    <Link href="/transactions/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Transaction
                        </Button>
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-green-700 dark:text-green-300">Money In</p>
                                <p className="text-2xl font-bold text-green-800 dark:text-green-200">{formatCurrency(summary.total_in)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900">
                                <TrendingDown className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-red-700 dark:text-red-300">Money Out</p>
                                <p className="text-2xl font-bold text-red-800 dark:text-red-200">{formatCurrency(summary.total_out)}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
                                <Wallet className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Balance</p>
                                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{formatCurrency(summary.balance)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Table */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                                <div className="relative flex-1">
                                    <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                    <Input placeholder="Search by category, description, reference #..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                                </div>
                                <Button type="submit" variant="secondary">Search</Button>
                            </form>
                            <div className="flex flex-wrap gap-2">
                                <Select value={filters.type || 'all'} onValueChange={(v) => handleFilterChange('type', v)}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="in">Money In</SelectItem>
                                        <SelectItem value="out">Money Out</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filters.category || 'all'} onValueChange={(v) => handleFilterChange('category', v)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {[...categoriesIn, ...categoriesOut].map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
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
                                    <TableHead>Type</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="hidden md:table-cell">Member</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="hidden lg:table-cell">Recorded By</TableHead>
                                    <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.map((txn) => (
                                    <TableRow key={txn.id}>
                                        <TableCell className="whitespace-nowrap">{new Date(txn.transaction_date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={txn.type === 'in' ? 'default' : 'destructive'} className="gap-1">
                                                {txn.type === 'in' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                                {txn.type === 'in' ? 'IN' : 'OUT'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{txn.category}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-[200px] truncate">{txn.description || '—'}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {txn.member ? (
                                                <Link href={`/members/${txn.member.id}`} className="hover:underline">
                                                    <div className="font-medium">{txn.member.full_name}</div>
                                                    <div className="text-muted-foreground text-xs font-mono">{txn.member.member_id}</div>
                                                </Link>
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell className={`font-mono font-semibold ${txn.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                                            {txn.type === 'in' ? '+' : '-'}{formatCurrency(txn.amount)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground hidden lg:table-cell">{txn.recorder?.name || '—'}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/transactions/${txn.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" /> View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/transactions/${txn.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(txn.id)} className="text-destructive" disabled={deletingId === txn.id}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {transactions.data.length === 0 && (
                            <div className="py-12 text-center">
                                <Wallet className="text-muted-foreground mx-auto h-12 w-12" />
                                <h3 className="mt-2 text-sm font-semibold">No transactions found</h3>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {filters.search ? 'Try a different search term.' : 'Record the first transaction to get started.'}
                                </p>
                                {!filters.search && (
                                    <div className="mt-6">
                                        <Link href="/transactions/create">
                                            <Button><Plus className="mr-2 h-4 w-4" /> New Transaction</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {transactions.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">
                                    Showing {(transactions.current_page - 1) * transactions.per_page + 1} to{' '}
                                    {Math.min(transactions.current_page * transactions.per_page, transactions.total)} of {transactions.total} transactions
                                </p>
                                <div className="flex gap-1">
                                    {transactions.links.map((link, i) => (
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
