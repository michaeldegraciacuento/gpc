import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowDownLeft, ArrowLeft, ArrowUpRight } from 'lucide-react';

interface Props {
    categoriesIn: string[];
    categoriesOut: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transactions', href: '/transactions' },
    { title: 'New Transaction', href: '/transactions/create' },
];

export default function TransactionsCreate({ categoriesIn, categoriesOut }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        type: 'in' as 'in' | 'out',
        category: '',
        description: '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const categories = data.type === 'in' ? categoriesIn : categoriesOut;

    const handleTypeChange = (type: 'in' | 'out') => {
        setData((prev) => ({ ...prev, type, category: '' }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/transactions');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Transaction" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/transactions">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Transactions
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">New Transaction</h1>
                        <p className="text-muted-foreground">Record a money in or money out transaction</p>
                    </div>
                </div>

                <form onSubmit={submit} className="mx-auto w-full max-w-2xl space-y-6">
                    {/* Transaction Type Toggle */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Type</CardTitle>
                            <CardDescription>Select whether this is incoming or outgoing money</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('in')}
                                    className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                                        data.type === 'in'
                                            ? 'border-green-500 bg-green-50 dark:bg-green-950/30 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                                    }`}
                                >
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${data.type === 'in' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        <ArrowDownLeft className={`h-5 w-5 ${data.type === 'in' ? 'text-green-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-semibold ${data.type === 'in' ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>Money In</p>
                                        <p className="text-xs text-muted-foreground">Incoming funds</p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange('out')}
                                    className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                                        data.type === 'out'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-950/30 shadow-sm'
                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                                    }`}
                                >
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${data.type === 'out' ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        <ArrowUpRight className={`h-5 w-5 ${data.type === 'out' ? 'text-red-600' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-semibold ${data.type === 'out' ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>Money Out</p>
                                        <p className="text-xs text-muted-foreground">Outgoing expenses</p>
                                    </div>
                                </button>
                            </div>
                            {errors.type && <p className="mt-2 text-sm text-destructive">{errors.type}</p>}
                        </CardContent>
                    </Card>

                    {/* Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Details</CardTitle>
                            <CardDescription>Fill in the transaction information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                                    <Select value={data.category} onValueChange={(v) => setData('category', v)}>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (₱) <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                    />
                                    {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="Brief description of the transaction"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="space-y-2">
                                    <Label htmlFor="transaction_date">Transaction Date <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="transaction_date"
                                        type="date"
                                        value={data.transaction_date}
                                        onChange={(e) => setData('transaction_date', e.target.value)}
                                    />
                                    {errors.transaction_date && <p className="text-sm text-destructive">{errors.transaction_date}</p>}
                                </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Link href="/transactions">
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Transaction'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
