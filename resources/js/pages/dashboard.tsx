import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDownRight, CreditCard, DollarSign, TrendingUp, Users, Wallet } from 'lucide-react';
import { useCallback } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';

interface Stats {
    totalMembers: number;
    activeMembers: number;
    totalUsers: number;
    totalCollected: number;
    collectedFiltered: number;
    runningBalance: number;
    outgoingExpenses: number;
}

interface Filters {
    year: string;
    month: string | null;
    from: string | null;
    to: string | null;
}

interface ChartMonthly {
    month: string;
    total: number;
}

interface MethodBreakdown {
    method: string;
    count: number;
    total: number;
}

interface RecentPayment {
    id: number;
    member_name: string;
    member_id: string;
    type: string;
    amount: number;
    payment_date: string;
    method: string;
}

interface Props {
    stats: Stats;
    chartMonthly: ChartMonthly[];
    methodBreakdown: MethodBreakdown[];
    recentPayments: RecentPayment[];
    currentYear: number;
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

const barChartConfig = {
    total: {
        label: 'Collections',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

const PIE_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

const paymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = { cash: 'Cash', gcash: 'GCash', bank_transfer: 'Bank Transfer' };
    return labels[method] || method;
};

const MONTHS = [
    { value: 'all', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

export default function Dashboard({ stats, chartMonthly, methodBreakdown, recentPayments, currentYear, filters }: Props) {
    const pieChartConfig: ChartConfig = Object.fromEntries(
        methodBreakdown.map((m, i) => [
            m.method,
            { label: m.method, color: PIE_COLORS[i % PIE_COLORS.length] },
        ]),
    );

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const applyFilter = useCallback(
        (key: string, value: string) => {
            const params: Record<string, string> = {
                year: filters.year,
                ...(filters.month ? { month: filters.month } : {}),
                ...(filters.from ? { from: filters.from } : {}),
                ...(filters.to ? { to: filters.to } : {}),
            };

            if (value && value !== 'all') {
                params[key] = value;
            } else {
                delete params[key];
            }

            // If date range is set, remove month (and vice-versa)
            if (key === 'from' || key === 'to') {
                delete params.month;
            }
            if (key === 'month') {
                delete params.from;
                delete params.to;
            }

            router.get('/dashboard', params, { preserveState: true, preserveScroll: true });
        },
        [filters],
    );

    const filterLabel = filters.month
        ? `${MONTHS.find((m) => m.value === filters.month)?.label ?? ''} ${filters.year}`
        : filters.from && filters.to
          ? `${filters.from} — ${filters.to}`
          : filters.year;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Date Filters */}
                <div>
                    <CardContent className="flex flex-wrap items-end gap-4 pt-1">
                        <div className="grid gap-1.5">
                            <Label htmlFor="filter-year">Year</Label>
                            <Select
                                value={filters.year}
                                onValueChange={(v) => applyFilter('year', v)}
                            >
                                <SelectTrigger id="filter-year" className="w-[120px]">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={String(y)}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="filter-month">Month</Label>
                            <Select
                                value={filters.month ?? 'all'}
                                onValueChange={(v) => applyFilter('month', v)}
                            >
                                <SelectTrigger id="filter-month" className="w-[150px]">
                                    <SelectValue placeholder="All Months" />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-muted-foreground flex items-center pb-2 text-sm">or</div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="filter-from">From</Label>
                            <Input
                                id="filter-from"
                                type="date"
                                className="w-[160px]"
                                value={filters.from ?? ''}
                                onChange={(e) => applyFilter('from', e.target.value)}
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="filter-to">To</Label>
                            <Input
                                id="filter-to"
                                type="date"
                                className="w-[160px]"
                                value={filters.to ?? ''}
                                onChange={(e) => applyFilter('to', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalMembers}</div>
                            <p className="text-muted-foreground text-xs">
                                {stats.activeMembers} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Collected ({filterLabel})</CardTitle>
                            <DollarSign className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.collectedFiltered)}</div>
                            <p className="text-muted-foreground text-xs">
                                {formatCurrency(stats.totalCollected)} all time
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Running Balance</CardTitle>
                            <Wallet className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stats.runningBalance < 0 ? 'text-destructive' : ''}`}>
                                {formatCurrency(stats.runningBalance)}
                            </div>
                            <p className="text-muted-foreground text-xs">Income minus expenses</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Outgoing Expenses</CardTitle>
                            <ArrowDownRight className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.outgoingExpenses)}</div>
                            <p className="text-muted-foreground text-xs">
                                {stats.totalUsers} system {stats.totalUsers === 1 ? 'user' : 'users'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Monthly Collections Bar Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Monthly Collections ({filters.year})
                            </CardTitle>
                            <CardDescription>Total payments collected per month</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                                <BarChart data={chartMonthly} accessibilityLayer>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                formatter={(value) => formatCurrency(Number(value))}
                                            />
                                        }
                                    />
                                    <Bar dataKey="total" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Payment Method Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Methods ({filterLabel})</CardTitle>
                            <CardDescription>Breakdown by payment method</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {methodBreakdown.length > 0 ? (
                                <>
                                    <ChartContainer config={pieChartConfig} className="mx-auto h-[200px] w-full">
                                        <PieChart>
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent
                                                        formatter={(value, name) => `${name}: ${value} payments`}
                                                    />
                                                }
                                            />
                                            <Pie data={methodBreakdown} dataKey="count" nameKey="method" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                                                {methodBreakdown.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ChartContainer>
                                    <div className="mt-4 space-y-2">
                                        {methodBreakdown.map((m, i) => (
                                            <div key={m.method} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                    <span>{m.method}</span>
                                                </div>
                                                <span className="text-muted-foreground">{m.count} ({formatCurrency(m.total)})</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground py-12 text-center text-sm">No payment data yet</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Payments Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Payments</CardTitle>
                            <CardDescription>Latest 5 recorded payments</CardDescription>
                        </div>
                        <Link href="/payments" className="text-primary text-sm hover:underline">
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentPayments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="hidden md:table-cell">Method</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentPayments.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                <div className="font-medium">{p.member_name}</div>
                                                <div className="text-muted-foreground font-mono text-xs">{p.member_id}</div>
                                            </TableCell>
                                            <TableCell>{p.type}</TableCell>
                                            <TableCell className="font-mono font-medium">{formatCurrency(p.amount)}</TableCell>
                                            <TableCell className="hidden md:table-cell">{paymentMethodLabel(p.method)}</TableCell>
                                            <TableCell>{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-12 text-center">
                                <CreditCard className="text-muted-foreground mx-auto h-12 w-12" />
                                <p className="text-muted-foreground mt-2 text-sm">No payments recorded yet</p>
                                <Link href="/payments/create" className="text-primary mt-1 inline-block text-sm hover:underline">
                                    Record your first payment
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
