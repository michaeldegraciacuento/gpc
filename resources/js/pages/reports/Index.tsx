import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Check, ChevronsUpDown, Download, FileText, Shield, User } from 'lucide-react';
import { useState } from 'react';

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
}

interface Props {
    members: MemberOption[];
    paymentTypes: PaymentTypeOption[];
    years: number[];
    currentYear: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reports', href: '/reports' },
];

const memberFullName = (m: MemberOption) => {
    return [m.first_name, m.middle_name, m.last_name, m.suffix].filter(Boolean).join(' ');
};

const MONTHS = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
];

export default function ReportsIndex({ members, paymentTypes, years, currentYear }: Props) {
    // Financial report state
    const [finPeriod, setFinPeriod] = useState('monthly');
    const [finYear, setFinYear] = useState(String(currentYear));
    const [finMonth, setFinMonth] = useState(String(new Date().getMonth() + 1));
    const [finTypeId, setFinTypeId] = useState('');
    const [finLoading, setFinLoading] = useState(false);

    // Member report state
    const [memMemberId, setMemMemberId] = useState('');
    const [memberOpen, setMemberOpen] = useState(false);
    const [memLoading, setMemLoading] = useState(false);

    // Officials report state
    const [offLoading, setOffLoading] = useState(false);

    const downloadFinancial = () => {
        setFinLoading(true);
        const params = new URLSearchParams({
            period: finPeriod,
            year: finYear,
        });
        if (finPeriod === 'monthly' && finMonth) {
            params.append('month', finMonth);
        }
        if (finTypeId && finTypeId !== 'all') {
            params.append('payment_type_id', finTypeId);
        }
        window.location.href = `/reports/financial?${params.toString()}`;
        setTimeout(() => setFinLoading(false), 2000);
    };

    const downloadMember = () => {
        if (!memMemberId) return;
        setMemLoading(true);
        const params = new URLSearchParams({ member_id: memMemberId });
        window.location.href = `/reports/member?${params.toString()}`;
        setTimeout(() => setMemLoading(false), 2000);
    };

    const downloadOfficials = () => {
        setOffLoading(true);
        window.location.href = '/reports/officials';
        setTimeout(() => setOffLoading(false), 2000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">Generate and download PDF reports for financial data and member records.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Financial Report Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <FileText className="h-5 w-5 text-green-700 dark:text-green-400" />
                                </div>
                                <div>
                                    <CardTitle>Financial Report</CardTitle>
                                    <CardDescription>Download payment collections data by month or year</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Report Period</Label>
                                <Select value={finPeriod} onValueChange={setFinPeriod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="annually">Annually</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Year</Label>
                                    <Select value={finYear} onValueChange={setFinYear}>
                                        <SelectTrigger>
                                            <SelectValue />
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

                                {finPeriod === 'monthly' && (
                                    <div className="space-y-2">
                                        <Label>Month</Label>
                                        <Select value={finMonth} onValueChange={setFinMonth}>
                                            <SelectTrigger>
                                                <SelectValue />
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
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Payment Type (Optional)</Label>
                                <Select value={finTypeId} onValueChange={setFinTypeId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All payment types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Payment Types</SelectItem>
                                        {paymentTypes.map((pt) => (
                                            <SelectItem key={pt.id} value={String(pt.id)}>
                                                {pt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={downloadFinancial} disabled={finLoading} className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                {finLoading ? 'Generating...' : 'Download Financial Report'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Member Report Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <User className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle>Member Report</CardTitle>
                                    <CardDescription>Download a member's complete payment history and summary</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>
                                    Select Member <span className="text-destructive">*</span>
                                </Label>
                                <Popover open={memberOpen} onOpenChange={setMemberOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={memberOpen}
                                            className={`w-full justify-between font-normal ${!memMemberId ? 'text-muted-foreground' : ''}`}
                                        >
                                            {memMemberId
                                                ? (() => {
                                                      const m = members.find((m) => String(m.id) === memMemberId);
                                                      return m ? `${m.member_id} — ${memberFullName(m)}` : 'Search member...';
                                                  })()
                                                : 'Search by ID or name...'}
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
                                                                setMemMemberId(String(member.id));
                                                                setMemberOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={`mr-2 h-4 w-4 ${memMemberId === String(member.id) ? 'opacity-100' : 'opacity-0'}`}
                                                            />
                                                            {member.member_id} — {memberFullName(member)}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="rounded-lg border border-dashed p-4">
                                <p className="text-muted-foreground text-sm">
                                    The member report includes:
                                </p>
                                <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1 text-sm">
                                    <li>Member personal information</li>
                                    <li>Payment summary by type</li>
                                    <li>Complete payment history with dates, amounts, and status</li>
                                    <li>Total paid and pending amounts</li>
                                </ul>
                            </div>

                            <Button onClick={downloadMember} disabled={memLoading || !memMemberId} className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                {memLoading ? 'Generating...' : 'Download Member Report'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Officials & Members Directory Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <Shield className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                            </div>
                            <div>
                                <CardTitle>Officials & Members Directory</CardTitle>
                                <CardDescription>Download a complete directory of all officers and members</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border border-dashed p-4">
                            <p className="text-muted-foreground text-sm">
                                The directory includes all members ordered by position:
                            </p>
                            <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1 text-sm">
                                <li>Club officers listed first (President, Vice-President, Secretary, Treasurer, Collector, Coordinator)</li>
                                <li>Regular members sorted alphabetically</li>
                                <li>Contact information and membership status</li>
                            </ul>
                        </div>

                        <Button onClick={downloadOfficials} disabled={offLoading} className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            {offLoading ? 'Generating...' : 'Download Officials & Members Directory'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
