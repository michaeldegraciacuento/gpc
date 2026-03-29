import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, CreditCard, Edit, Hash, ImageIcon, Receipt, User } from 'lucide-react';
import { useState } from 'react';

interface Payment {
    id: number;
    or_number: string | null;
    amount: string;
    payment_date: string;
    payment_method: string;
    status: string;
    notes: string | null;
    billing_period: string | null;
    proof_image: string | null;
    proof_image_url: string | null;
    created_at: string;
    member: {
        id: number;
        member_id: string;
        full_name: string;
    };
    payment_type: {
        id: number;
        name: string;
    };
    recorder: {
        id: number;
        name: string;
    } | null;
}

interface Props {
    payment: Payment;
}

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

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatBillingPeriod = (period: string | null): string | null => {
    if (!period) return null;
    if (period.length === 4) return period;
    const [year, month] = period.split('-');
    return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
};

export default function PaymentsShow({ payment }: Props) {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Payments', href: '/payments' },
        { title: `Payment #${payment.id}`, href: `/payments/${payment.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Payment #${payment.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/payments">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Payments
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{formatCurrency(payment.amount)}</h1>
                            <Badge variant={statusVariant(payment.status)} className="capitalize">
                                {payment.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            {payment.payment_type.name} — {payment.member.full_name}
                        </p>
                    </div>
                    <Link href={`/payments/${payment.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Payment
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                            <CardDescription>Details about this payment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <CreditCard className="text-muted-foreground mt-0.5 h-4 w-4" />
                                <div>
                                    <p className="text-sm font-medium">Amount</p>
                                    <p className="text-lg font-bold">{formatCurrency(payment.amount)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Receipt className="text-muted-foreground mt-0.5 h-4 w-4" />
                                <div>
                                    <p className="text-sm font-medium">Payment Type</p>
                                    <p className="text-muted-foreground text-sm">{payment.payment_type.name}</p>
                                </div>
                            </div>

                            {payment.billing_period && (
                                <div className="flex items-start gap-3">
                                    <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                                    <div>
                                        <p className="text-sm font-medium">Billing Period</p>
                                        <p className="text-muted-foreground text-sm">{formatBillingPeriod(payment.billing_period)}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                                <div>
                                    <p className="text-sm font-medium">Payment Date</p>
                                    <p className="text-muted-foreground text-sm">{new Date(payment.payment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CreditCard className="text-muted-foreground mt-0.5 h-4 w-4" />
                                <div>
                                    <p className="text-sm font-medium">Payment Method</p>
                                    <p className="text-muted-foreground text-sm">{paymentMethodLabel(payment.payment_method)}</p>
                                </div>
                            </div>

                            {payment.or_number && (
                                <div className="flex items-start gap-3">
                                    <Hash className="text-muted-foreground mt-0.5 h-4 w-4" />
                                    <div>
                                        <p className="text-sm font-medium">Official Receipt #</p>
                                        <p className="text-muted-foreground font-mono text-sm">{payment.or_number}</p>
                                    </div>
                                </div>
                            )}

                            {payment.notes && (
                                <div className="mt-4 rounded-lg border p-3">
                                    <p className="text-sm font-medium">Notes</p>
                                    <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">{payment.notes}</p>
                                </div>
                            )}

                            {payment.proof_image_url && (
                                <div className="mt-4 rounded-lg border p-3">
                                    <div className="mb-2 flex items-center gap-2">
                                        <ImageIcon className="text-muted-foreground h-4 w-4" />
                                        <p className="text-sm font-medium">Proof of Payment</p>
                                    </div>
                                    <button type="button" onClick={() => setLightboxOpen(true)} className="group relative">
                                        <img
                                            src={payment.proof_image_url}
                                            alt="Proof of payment"
                                            className="h-32 w-auto rounded-md border object-cover transition-opacity group-hover:opacity-80"
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                            <span className="text-xs font-medium text-white">Click to enlarge</span>
                                        </span>
                                    </button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Member & Recording Info</CardTitle>
                            <CardDescription>Who paid and who recorded it</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="text-muted-foreground mt-0.5 h-4 w-4" />
                                <div>
                                    <p className="text-sm font-medium">Member</p>
                                    <Link href={`/members/${payment.member.id}`} className="text-sm hover:underline">
                                        {payment.member.full_name}
                                    </Link>
                                    <p className="text-muted-foreground font-mono text-xs">{payment.member.member_id}</p>
                                </div>
                            </div>

                            {payment.recorder && (
                                <div className="flex items-start gap-3">
                                    <User className="text-muted-foreground mt-0.5 h-4 w-4" />
                                    <div>
                                        <p className="text-sm font-medium">Recorded By</p>
                                        <p className="text-muted-foreground text-sm">{payment.recorder.name}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                                <div>
                                    <p className="text-sm font-medium">Record Date</p>
                                    <p className="text-muted-foreground text-sm">{new Date(payment.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxOpen && payment.proof_image_url && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setLightboxOpen(false)}>
                    <div className="relative max-h-[90vh] max-w-[90vw]">
                        <img src={payment.proof_image_url} alt="Proof of payment" className="max-h-[85vh] rounded-lg object-contain" />
                        <button
                            type="button"
                            onClick={() => setLightboxOpen(false)}
                            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-gray-100"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
