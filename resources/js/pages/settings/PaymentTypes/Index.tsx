import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, MoreHorizontal, Plus, Tags, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PaymentType {
    id: number;
    name: string;
    description: string | null;
    amount: string | null;
    billing_cycle: string;
    is_active: boolean;
    payments_count: number;
    created_at: string;
}

interface PaginatedPaymentTypes {
    data: PaymentType[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    paymentTypes: PaginatedPaymentTypes;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '/roles' },
    { title: 'Payment Types', href: '/payment-types' },
];

const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount));
};

const billingCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = {
        one_time: 'One-Time',
        monthly: 'Monthly',
        quarterly: 'Quarterly',
        semi_annual: 'Semi-Annual',
        annual: 'Annual',
    };
    return labels[cycle] || cycle;
};

export default function PaymentTypesIndex({ paymentTypes }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = (pt: PaymentType) => {
        if (pt.payments_count > 0) {
            alert(`Cannot delete "${pt.name}" because it has ${pt.payments_count} associated payment(s).`);
            return;
        }
        if (confirm(`Are you sure you want to delete "${pt.name}"?`)) {
            setDeletingId(pt.id);
            router.delete(`/payment-types/${pt.id}`, { onFinish: () => setDeletingId(null) });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payment Types" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Payment Types</h1>
                        <p className="text-muted-foreground">Configure the types of payments you collect from members</p>
                    </div>
                    <Link href="/payment-types/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Payment Type
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Payment Types</CardTitle>
                        <CardDescription>These categories appear when recording a payment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Default Amount</TableHead>
                                    <TableHead>Billing Cycle</TableHead>
                                    <TableHead>Payments</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentTypes.data.map((pt) => (
                                    <TableRow key={pt.id}>
                                        <TableCell className="font-medium">{pt.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{pt.description || '—'}</TableCell>
                                        <TableCell className="font-mono">{pt.amount ? formatCurrency(pt.amount) : '—'}</TableCell>
                                        <TableCell className="text-sm">{billingCycleLabel(pt.billing_cycle)}</TableCell>
                                        <TableCell>{pt.payments_count}</TableCell>
                                        <TableCell>
                                            <Badge variant={pt.is_active ? 'default' : 'secondary'}>{pt.is_active ? 'Active' : 'Inactive'}</Badge>
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
                                                        <Link href={`/payment-types/${pt.id}/edit`}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(pt)}
                                                        className="text-destructive"
                                                        disabled={deletingId === pt.id}
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

                        {paymentTypes.data.length === 0 && (
                            <div className="py-12 text-center">
                                <Tags className="text-muted-foreground mx-auto h-12 w-12" />
                                <h3 className="mt-2 text-sm font-semibold">No payment types yet</h3>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    Create payment types like "Membership Fee", "Monthly Dues", or "T-Shirt Payment".
                                </p>
                                <div className="mt-6">
                                    <Link href="/payment-types/create">
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Payment Type
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
