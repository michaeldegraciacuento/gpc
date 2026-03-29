import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CreditCard, DollarSign, TrendingUp, Users, Clock } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';

interface Stats {
    totalMembers: number;
    activeMembers: number;
    totalUsers: number;
    totalCollected: number;
    collectedThisYear: number;
    pendingAmount: number;
    paymentsThisMonth: number;
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

export default function Dashboard({ stats, chartMonthly, methodBreakdown, recentPayments, currentYear }: Props) {
    const pieChartConfig: ChartConfig = Object.fromEntries(
        methodBreakdown.map((m, i) => [
            m.method,
            { label: m.method, color: PIE_COLORS[i % PIE_COLORS.length] },
        ]),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
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
                            <CardTitle className="text-sm font-medium">Total Collected ({currentYear})</CardTitle>
                            <DollarSign className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.collectedThisYear)}</div>
                            <p className="text-muted-foreground text-xs">
                                {formatCurrency(stats.totalCollected)} all time
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                            <Clock className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</div>
                            <p className="text-muted-foreground text-xs">
                                Awaiting confirmation
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payments This Month</CardTitle>
                            <CreditCard className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.paymentsThisMonth}</div>
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
                                Monthly Collections ({currentYear})
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
                            <CardTitle>Payment Methods ({currentYear})</CardTitle>
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
