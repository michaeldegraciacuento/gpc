import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Edit, ImageIcon, Trash2 } from 'lucide-react';

interface Transaction {
    id: number;
    type: 'in' | 'out';
    category: string;
    description: string | null;
    amount: string;
    transaction_date: string;
    receipt_image: string | null;
    payment_id: number | null;
    member_id: number | null;
    member: { id: number; member_id: string; full_name: string } | null;
    payment: { id: number; or_number: string | null } | null;
    recorder: { id: number; name: string } | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    transaction: Transaction;
}

const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount));
};

export default function TransactionsShow({ transaction }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Transactions', href: '/transactions' },
        { title: transaction.category, href: `/transactions/${transaction.id}` },
    ];

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            router.delete(`/transactions/${transaction.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Transaction — ${transaction.category}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/transactions">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Transactions
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/transactions/${transaction.id}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-2xl space-y-6">
                    {/* Type & Amount Header Card */}
                    <Card className={transaction.type === 'in' ? 'border-green-200 bg-green-50 dark:bg-green-950/30' : 'border-red-200 bg-red-50 dark:bg-red-950/30'}>
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${transaction.type === 'in' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                    {transaction.type === 'in' ? <ArrowDownLeft className="h-7 w-7 text-green-600" /> : <ArrowUpRight className="h-7 w-7 text-red-600" />}
                                </div>
                                <div>
                                    <Badge variant={transaction.type === 'in' ? 'default' : 'destructive'} className="mb-1">
                                        {transaction.type === 'in' ? 'Money In' : 'Money Out'}
                                    </Badge>
                                    <p className="text-lg font-semibold">{transaction.category}</p>
                                </div>
                            </div>
                            <p className={`text-3xl font-bold font-mono ${transaction.type === 'in' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                {transaction.type === 'in' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="divide-y">
                                <div className="flex justify-between py-3">
                                    <dt className="text-muted-foreground">Date</dt>
                                    <dd className="font-medium">{new Date(transaction.transaction_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                                </div>
                                <div className="flex justify-between py-3">
                                    <dt className="text-muted-foreground">Category</dt>
                                    <dd className="font-medium">{transaction.category}</dd>
                                </div>
                                {transaction.description && (
                                    <div className="flex justify-between py-3">
                                        <dt className="text-muted-foreground">Description</dt>
                                        <dd className="font-medium text-right max-w-xs">{transaction.description}</dd>
                                    </div>
                                )}
                                {transaction.member && (
                                    <div className="flex justify-between py-3">
                                        <dt className="text-muted-foreground">Member</dt>
                                        <dd className="font-medium">
                                            <Link href={`/members/${transaction.member.id}`} className="text-primary hover:underline">
                                                {transaction.member.full_name}
                                            </Link>
                                            <div className="text-muted-foreground text-xs font-mono">{transaction.member.member_id}</div>
                                        </dd>
                                    </div>
                                )}
                                {transaction.payment && (
                                    <div className="flex justify-between py-3">
                                        <dt className="text-muted-foreground">Linked Payment</dt>
                                        <dd className="font-medium">
                                            <Link href={`/payments/${transaction.payment.id}`} className="text-primary hover:underline">
                                                #{transaction.payment.id}{transaction.payment.or_number ? ` (OR: ${transaction.payment.or_number})` : ''}
                                            </Link>
                                        </dd>
                                    </div>
                                )}
                                <div className="flex justify-between py-3">
                                    <dt className="text-muted-foreground">Recorded By</dt>
                                    <dd className="font-medium">{transaction.recorder?.name || '—'}</dd>
                                </div>
                                <div className="flex justify-between py-3">
                                    <dt className="text-muted-foreground">Created</dt>
                                    <dd className="font-medium">{new Date(transaction.created_at).toLocaleString()}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    {/* Receipt / Invoice Image */}
                    {transaction.receipt_image && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    Receipt / Invoice
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <a
                                    href={`/storage/${transaction.receipt_image}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={`/storage/${transaction.receipt_image}`}
                                        alt="Receipt / Invoice"
                                        className="max-h-96 w-auto rounded-lg border object-contain transition-opacity hover:opacity-80"
                                    />
                                </a>
                                <p className="mt-2 text-xs text-muted-foreground">Click image to view full size</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
