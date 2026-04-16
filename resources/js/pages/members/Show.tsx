import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, AlertCircle, CreditCard, Edit, Mail, MapPin, Phone, Plus, Trash2, User } from 'lucide-react';
import { useState } from 'react';

interface PaymentRecord {
    id: number;
    or_number: string | null;
    amount: string;
    payment_date: string;
    payment_method: string;
    status: string;
    notes: string | null;
    payment_type: { id: number; name: string } | null;
    recorder: { id: number; name: string } | null;
}

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
    address: string | null;
    birthdate: string | null;
    gender: string | null;
    civil_status: string | null;
    membership_type: string;
    position: string;
    status: string;
    joined_at: string;
    notes: string | null;
    member_image: string | null;
    member_image_url: string | null;
    created_at: string;
    payments: PaymentRecord[];
}

interface OutstandingDue {
    payment_type_id: number;
    payment_type_name: string;
    billing_cycle: string;
    amount: number;
    billing_period: string | null;
    billing_period_label: string;
}

interface PositionHistoryRecord {
    position: string;
    term_year: number;
}

interface Props {
    member: Member;
    totalPaid: number;
    positionHistory: PositionHistoryRecord[];
    outstandingDues: OutstandingDue[];
}

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
        case 'active':
        case 'paid':
            return 'default';
        case 'inactive':
        case 'pending':
            return 'secondary';
        case 'suspended':
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
    const labels: Record<string, string> = {
        cash: 'Cash',
        gcash: 'GCash',
        bank_transfer: 'Bank Transfer',
    };
    return labels[method] || method;
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

const billingCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = {
        monthly: 'Monthly',
        yearly: 'Yearly',
        one_time: 'One-time',
    };
    return labels[cycle] || cycle;
};

export default function MembersShow({ member, totalPaid, positionHistory, outstandingDues }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Members', href: '/members' },
        { title: member.full_name, href: `/members/${member.id}` },
    ];

    const handleDeletePayment = (paymentId: number) => {
        if (confirm('Are you sure you want to delete this payment record?')) {
            setDeletingId(paymentId);
            router.delete(`/payments/${paymentId}`, {
                onFinish: () => setDeletingId(null),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${member.full_name} — ${member.member_id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/members">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Members
                        </Button>
                    </Link>
                    <div className="flex flex-1 items-center gap-4">
                        {member.member_image_url ? (
                            <img src={member.member_image_url} alt={member.full_name} className="h-14 w-14 rounded-full border-2 border-gray-200 object-cover" />
                        ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-bold text-muted-foreground">
                                {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">{member.full_name}</h1>
                                <Badge variant={statusVariant(member.status)} className="capitalize">
                                    {member.status}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground font-mono">{member.member_id}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/payments/create?member_id=${member.id}`}>
                            <Button variant="outline">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Record Payment
                            </Button>
                        </Link>
                        <Link href={`/members/${member.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Member
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Info Cards Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Personal & Contact Info */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Member Information</CardTitle>
                            <CardDescription>Personal details and contact information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <User className="text-muted-foreground mt-0.5 h-4 w-4" />
                                        <div>
                                            <p className="text-sm font-medium">Full Name</p>
                                            <p className="text-muted-foreground text-sm">{member.full_name}</p>
                                        </div>
                                    </div>

                                    {member.birthdate && (
                                        <div className="flex items-start gap-3">
                                            <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                                            <div>
                                                <p className="text-sm font-medium">Date of Birth</p>
                                                <p className="text-muted-foreground text-sm">{new Date(member.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    )}

                                    {member.gender && (
                                        <div className="flex items-start gap-3">
                                            <User className="text-muted-foreground mt-0.5 h-4 w-4" />
                                            <div>
                                                <p className="text-sm font-medium">Gender</p>
                                                <p className="text-muted-foreground text-sm capitalize">{member.gender}</p>
                                            </div>
                                        </div>
                                    )}

                                    {member.civil_status && (
                                        <div className="flex items-start gap-3">
                                            <User className="text-muted-foreground mt-0.5 h-4 w-4" />
                                            <div>
                                                <p className="text-sm font-medium">Civil Status</p>
                                                <p className="text-muted-foreground text-sm capitalize">{member.civil_status}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Mail className="text-muted-foreground mt-0.5 h-4 w-4" />
                                        <div>
                                            <p className="text-sm font-medium">Email</p>
                                            <p className="text-muted-foreground text-sm">{member.email || '—'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Phone className="text-muted-foreground mt-0.5 h-4 w-4" />
                                        <div>
                                            <p className="text-sm font-medium">Phone</p>
                                            <p className="text-muted-foreground text-sm">{member.phone || '—'}</p>
                                        </div>
                                    </div>

                                    {member.address && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                                            <div>
                                                <p className="text-sm font-medium">Address</p>
                                                <p className="text-muted-foreground text-sm">{member.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {member.notes && (
                                <div className="mt-6 rounded-lg border p-3">
                                    <p className="text-sm font-medium">Notes</p>
                                    <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">{member.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Membership & Payment Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Membership</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Type</span>
                                    <Badge variant="outline" className="capitalize">
                                        {member.membership_type}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Position</span>
                                    <Badge variant={member.position !== 'member' ? 'default' : 'outline'} className="capitalize">
                                        {POSITION_LABELS[member.position] || member.position}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Status</span>
                                    <Badge variant={statusVariant(member.status)} className="capitalize">
                                        {member.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Joined</span>
                                    <span className="text-sm">{new Date(member.joined_at).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Total Paid</span>
                                    <span className="text-lg font-bold">{formatCurrency(totalPaid)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-sm">Payments</span>
                                    <span className="text-sm">{member.payments.length} records</span>
                                </div>
                            </CardContent>
                        </Card>

                        {positionHistory.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Position History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {positionHistory.map((h, i) => (
                                            <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2">
                                                <span className="text-sm font-medium">{h.position}</span>
                                                <Badge variant="outline">{h.term_year}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Outstanding Dues */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className={`h-5 w-5 ${outstandingDues.length > 0 ? 'text-destructive' : 'text-green-500'}`} />
                            <div>
                                <CardTitle>Outstanding Dues</CardTitle>
                                <CardDescription>
                                    {outstandingDues.length > 0
                                        ? `${outstandingDues.length} unpaid item${outstandingDues.length > 1 ? 's' : ''} — ${formatCurrency(outstandingDues.reduce((sum, d) => sum + d.amount, 0))} total balance`
                                        : 'All dues are paid up!'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {outstandingDues.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Due Type</TableHead>
                                        <TableHead>Billing Cycle</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {outstandingDues.map((due, index) => (
                                        <TableRow key={`${due.payment_type_id}-${due.billing_period ?? index}`}>
                                            <TableCell className="font-medium">{due.payment_type_name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {billingCycleLabel(due.billing_cycle)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{due.billing_period_label}</TableCell>
                                            <TableCell className="font-mono">{formatCurrency(due.amount)}</TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">Unpaid</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-6 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                    <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="mt-2 text-sm font-semibold">All caught up!</h3>
                                <p className="text-muted-foreground mt-1 text-sm">This member has no outstanding dues.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payment History */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Payment History</CardTitle>
                                <CardDescription>All payments recorded for this member</CardDescription>
                            </div>
                            <Link href={`/payments/create?member_id=${member.id}`}>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Record Payment
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {member.payments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>OR #</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Recorded By</TableHead>
                                        <TableHead className="w-[80px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {member.payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">{payment.payment_type?.name || '—'}</TableCell>
                                            <TableCell className="font-mono">{formatCurrency(payment.amount)}</TableCell>
                                            <TableCell>{paymentMethodLabel(payment.payment_method)}</TableCell>
                                            <TableCell className="text-muted-foreground">{payment.or_number || '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariant(payment.status)} className="capitalize">
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{payment.recorder?.name || '—'}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Link href={`/payments/${payment.id}/edit`}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive h-8 w-8 p-0"
                                                        onClick={() => handleDeletePayment(payment.id)}
                                                        disabled={deletingId === payment.id}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-8 text-center">
                                <CreditCard className="text-muted-foreground mx-auto h-12 w-12" />
                                <h3 className="mt-2 text-sm font-semibold">No payments yet</h3>
                                <p className="text-muted-foreground mt-1 text-sm">Record the first payment for this member.</p>
                                <div className="mt-4">
                                    <Link href={`/payments/create?member_id=${member.id}`}>
                                        <Button size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Record Payment
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
