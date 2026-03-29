import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, ChevronsUpDown, ImagePlus, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface MemberOption {
    id: number;
    member_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
}

interface PaymentTypeOption {
    id: number;
    name: string;
    amount: string | null;
    billing_cycle: string;
}

interface Payment {
    id: number;
    member_id: number;
    payment_type_id: number;
    or_number: string | null;
    amount: string;
    payment_date: string;
    payment_method: string;
    status: string;
    notes: string | null;
    billing_period: string | null;
    proof_image: string | null;
    proof_image_url: string | null;
    member: MemberOption;
    payment_type: PaymentTypeOption;
}

interface Props {
    payment: Payment;
    members: MemberOption[];
    paymentTypes: PaymentTypeOption[];
    memberPaidPeriods: Record<string, Record<string, string[]>>;
    memberPaidOneTime: Record<string, number[]>;
    currentYear: number;
}

const memberFullName = (m: MemberOption) => {
    return [m.first_name, m.middle_name, m.last_name, m.suffix].filter(Boolean).join(' ');
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const generateMonthOptions = () => {
    const now = new Date();
    const options: { value: string; label: string }[] = [];
    for (let i = -12; i <= 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        options.push({ value: `${y}-${m}`, label: `${MONTH_NAMES[d.getMonth()]} ${y}` });
    }
    return options;
};

const generateYearOptions = (currentYear: number) => {
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => ({
        value: String(y),
        label: String(y),
    }));
};

export default function PaymentsEdit({ payment, members, paymentTypes, memberPaidPeriods, memberPaidOneTime, currentYear }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(payment.proof_image_url);
    const [memberOpen, setMemberOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Payments', href: '/payments' },
        { title: `Edit Payment #${payment.id}`, href: `/payments/${payment.id}/edit` },
    ];

    const { data, setData, processing, errors } = useForm({
        member_id: String(payment.member_id),
        payment_type_id: String(payment.payment_type_id),
        or_number: payment.or_number || '',
        amount: payment.amount,
        payment_date: payment.payment_date ? payment.payment_date.split('T')[0] : '',
        payment_method: payment.payment_method,
        status: payment.status,
        notes: payment.notes || '',
        billing_period: payment.billing_period || '',
        proof_image: null as File | null,
        remove_proof_image: false,
    });

    const selectedPaymentType = paymentTypes.find((t) => String(t.id) === data.payment_type_id);
    const monthOptions = generateMonthOptions();
    const yearOptions = generateYearOptions(currentYear);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData((prev) => ({ ...prev, proof_image: file, remove_proof_image: false }));
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(payment.proof_image_url);
        }
    };

    const removeFile = () => {
        setData((prev) => ({ ...prev, proof_image: null, remove_proof_image: true }));
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/payments/${payment.id}`, {
            ...data,
            _method: 'PUT',
        }, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Payment #${payment.id}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/payments">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Payments
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Edit Payment</h1>
                        <p className="text-muted-foreground">
                            {payment.member.member_id} — {memberFullName(payment.member)}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Details</CardTitle>
                            <CardDescription>Update the payment information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="member_id">
                                        Member <span className="text-destructive">*</span>
                                    </Label>
                                    <Popover open={memberOpen} onOpenChange={setMemberOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={memberOpen}
                                                className={`w-full justify-between font-normal ${errors.member_id ? 'border-destructive' : ''} ${!data.member_id ? 'text-muted-foreground' : ''}`}
                                            >
                                                {data.member_id
                                                    ? (() => {
                                                          const m = members.find((m) => String(m.id) === data.member_id);
                                                          return m ? `${m.member_id} — ${memberFullName(m)}` : 'Select a member';
                                                      })()
                                                    : 'Select a member'}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Search by ID or name..." />
                                                <CommandList>
                                                    <CommandEmpty>No member found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {members.map((member) => (
                                                            <CommandItem
                                                                key={member.id}
                                                                value={`${member.member_id} ${memberFullName(member)}`}
                                                                onSelect={() => {
                                                                    setData('member_id', String(member.id));
                                                                    setMemberOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={`mr-2 h-4 w-4 ${data.member_id === String(member.id) ? 'opacity-100' : 'opacity-0'}`}
                                                                />
                                                                {member.member_id} — {memberFullName(member)}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    {errors.member_id && <p className="text-destructive text-sm">{errors.member_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payment_type_id">
                                        Payment Type <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.payment_type_id} onValueChange={(v) => setData('payment_type_id', v)}>
                                        <SelectTrigger className={errors.payment_type_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select payment type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentTypes.map((pt) => {
                                                const oneTimePaid = pt.billing_cycle === 'one_time' && data.member_id
                                                    ? (memberPaidOneTime[data.member_id] || []).includes(pt.id)
                                                    : false;
                                                return (
                                                    <SelectItem key={pt.id} value={String(pt.id)} disabled={oneTimePaid}>
                                                        <span className="flex items-center gap-2">
                                                            {pt.name}
                                                            {oneTimePaid && (
                                                                <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                    Paid
                                                                </span>
                                                            )}
                                                        </span>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {errors.payment_type_id && <p className="text-destructive text-sm">{errors.payment_type_id}</p>}
                                </div>

                                {selectedPaymentType && selectedPaymentType.billing_cycle !== 'one_time' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="billing_period">
                                            Billing Period <span className="text-destructive">*</span>
                                        </Label>
                                        <Select value={data.billing_period} onValueChange={(v) => setData('billing_period', v)}>
                                            <SelectTrigger className={errors.billing_period ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Select period" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedPaymentType.billing_cycle === 'monthly'
                                                    ? monthOptions.map((opt) => {
                                                          const paid = data.member_id && data.payment_type_id
                                                              ? (memberPaidPeriods[data.member_id]?.[data.payment_type_id] || []).includes(opt.value)
                                                              : false;
                                                          return (
                                                              <SelectItem key={opt.value} value={opt.value} disabled={paid}>
                                                                  <span className="flex items-center gap-2">
                                                                      {opt.label}
                                                                      {paid && (
                                                                          <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                              Paid
                                                                          </span>
                                                                      )}
                                                                  </span>
                                                              </SelectItem>
                                                          );
                                                      })
                                                    : yearOptions.map((opt) => {
                                                          const paid = data.member_id && data.payment_type_id
                                                              ? (memberPaidPeriods[data.member_id]?.[data.payment_type_id] || []).includes(opt.value)
                                                              : false;
                                                          return (
                                                              <SelectItem key={opt.value} value={opt.value} disabled={paid}>
                                                                  <span className="flex items-center gap-2">
                                                                      {opt.label}
                                                                      {paid && (
                                                                          <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                              Paid
                                                                          </span>
                                                                      )}
                                                                  </span>
                                                              </SelectItem>
                                                          );
                                                      })}
                                            </SelectContent>
                                        </Select>
                                        {errors.billing_period && <p className="text-destructive text-sm">{errors.billing_period}</p>}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="amount">
                                        Amount (₱) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className={errors.amount ? 'border-destructive' : ''}
                                    />
                                    {errors.amount && <p className="text-destructive text-sm">{errors.amount}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payment_date">
                                        Payment Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="payment_date"
                                        type="date"
                                        value={data.payment_date}
                                        onChange={(e) => setData('payment_date', e.target.value)}
                                        className={errors.payment_date ? 'border-destructive' : ''}
                                    />
                                    {errors.payment_date && <p className="text-destructive text-sm">{errors.payment_date}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payment_method">
                                        Payment Method <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="gcash">GCash</SelectItem>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="or_number">Official Receipt #</Label>
                                    <Input id="or_number" value={data.or_number} onChange={(e) => setData('or_number', e.target.value)} placeholder="e.g. OR-0001" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">
                                        Status <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={2} />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="proof_image">Proof of Payment</Label>
                                    <p className="text-muted-foreground text-xs">Upload a screenshot of GCash, bank transfer, or any proof of payment (JPG, PNG, WEBP, max 5MB)</p>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <Input
                                                ref={fileInputRef}
                                                id="proof_image"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={handleFileChange}
                                                className={errors.proof_image ? 'border-destructive' : ''}
                                            />
                                            {errors.proof_image && <p className="text-destructive mt-1 text-sm">{errors.proof_image}</p>}
                                        </div>
                                        {preview && (
                                            <div className="relative">
                                                <img src={preview} alt="Proof of payment" className="h-20 w-20 rounded-md border object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={removeFile}
                                                    className="bg-destructive text-destructive-foreground absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-xs"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                        {!preview && (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed">
                                                <ImagePlus className="text-muted-foreground h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end space-x-2">
                        <Link href="/payments">
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Update Payment'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
