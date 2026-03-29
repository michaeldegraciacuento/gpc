import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface PaymentType {
    id: number;
    name: string;
    description: string | null;
    amount: string | null;
    billing_cycle: string;
    is_active: boolean;
}

interface Props {
    paymentType: PaymentType;
}

export default function PaymentTypesEdit({ paymentType }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Settings', href: '/roles' },
        { title: 'Payment Types', href: '/payment-types' },
        { title: paymentType.name, href: `/payment-types/${paymentType.id}/edit` },
    ];

    const { data, setData, patch, processing, errors } = useForm({
        name: paymentType.name,
        description: paymentType.description || '',
        amount: paymentType.amount || '',
        billing_cycle: paymentType.billing_cycle || 'one_time',
        is_active: paymentType.is_active as boolean,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/payment-types/${paymentType.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${paymentType.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/payment-types">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Payment Types
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Edit Payment Type</h1>
                        <p className="text-muted-foreground">Update "{paymentType.name}"</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Type Details</CardTitle>
                        <CardDescription>Update the payment type information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Default Amount (₱)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    <p className="text-muted-foreground text-xs">This amount will be pre-filled when recording payments.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="billing_cycle">
                                        Billing Cycle <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.billing_cycle} onValueChange={(v) => setData('billing_cycle', v)}>
                                        <SelectTrigger className={errors.billing_cycle ? 'border-destructive' : ''}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="one_time">One-Time</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                            <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                                            <SelectItem value="annual">Annual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.billing_cycle && <p className="text-destructive text-sm">{errors.billing_cycle}</p>}
                                    <p className="text-muted-foreground text-xs">Annual payments show a "Paid" indicator when a member has already paid for the year.</p>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked as boolean)} />
                                    <Label htmlFor="is_active" className="text-sm font-normal">
                                        Active — available when recording payments
                                    </Label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2">
                                <Link href="/payment-types">
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Update Payment Type'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
