<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Payment;
use App\Models\PaymentType;
use App\Models\PositionHistory;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Show the reports page.
     */
    public function index(): Response
    {
        $members = Member::select('id', 'member_id', 'first_name', 'middle_name', 'last_name', 'suffix')
            ->orderBy('last_name')
            ->get();

        $paymentTypes = PaymentType::where('is_active', true)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $currentYear = now()->year;
        $years = range($currentYear - 5, $currentYear);

        return Inertia::render('reports/Index', [
            'members'      => $members,
            'paymentTypes' => $paymentTypes,
            'years'        => $years,
            'currentYear'  => $currentYear,
        ]);
    }

    /**
     * Generate financial report PDF.
     */
    public function financial(Request $request)
    {
        $request->validate([
            'period'         => 'required|in:monthly,annually',
            'year'           => 'required|integer|min:2000|max:2100',
            'month'          => 'nullable|integer|min:1|max:12',
            'payment_type_id' => 'nullable|integer|exists:payment_types,id',
        ]);

        $period  = $request->input('period');
        $year    = (int) $request->input('year');
        $month   = $request->input('month') ? (int) $request->input('month') : null;
        $typeId  = $request->input('payment_type_id');

        // Build query
        $query = Payment::with(['member', 'paymentType'])
            ->whereYear('payment_date', $year);

        if ($period === 'monthly' && $month) {
            $query->whereMonth('payment_date', $month);
        }

        if ($typeId) {
            $query->where('payment_type_id', $typeId);
        }


        $payments = $query->orderBy('payment_date', 'desc')->get();

        // Find unpaid members (no payment for this period/type)
        $allMembers = Member::orderBy('last_name')->get();
        $paidMemberIds = $payments->pluck('member_id')->unique();
        $unpaidMembers = $allMembers->whereNotIn('id', $paidMemberIds)->values();

        // Summary
        $paidPayments = $payments->where('status', 'paid');
        $totalCollected = (float) $paidPayments->sum('amount');
        $totalPayments  = $paidPayments->count();
        $pendingAmount  = (float) $payments->where('status', 'pending')->sum('amount');

        // By type
        $byType = $paidPayments->groupBy(fn ($p) => $p->paymentType->name)
            ->map(fn ($group, $name) => [
                'name'  => $name,
                'count' => $group->count(),
                'total' => (float) $group->sum('amount'),
            ])->values()->toArray();

        // By method
        $byMethod = $paidPayments->groupBy('payment_method')
            ->map(fn ($group, $method) => [
                'method' => ucfirst(str_replace('_', ' ', $method)),
                'count'  => $group->count(),
                'total'  => (float) $group->sum('amount'),
            ])->values()->toArray();

        // Period label
        $months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        $periodLabel = $period === 'monthly' && $month
            ? "{$months[$month]} {$year}"
            : "Year {$year}";

        $title = "Financial Report — {$periodLabel}";


        $pdf = Pdf::loadView('reports.financial', compact(
            'title', 'periodLabel', 'totalCollected', 'totalPayments', 'pendingAmount',
            'byType', 'byMethod', 'payments', 'unpaidMembers'
        ))->setPaper('a4', 'portrait');

        $filename = 'financial-report-' . strtolower(str_replace(' ', '-', $periodLabel)) . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Generate member report PDF.
     */
    public function member(Request $request)
    {
        $request->validate([
            'member_id' => 'required|integer|exists:members,id',
        ]);

        $member = Member::findOrFail($request->input('member_id'));
        $payments = Payment::with('paymentType')
            ->where('member_id', $member->id)
            ->orderBy('payment_date', 'desc')
            ->get();

        $paidPayments  = $payments->where('status', 'paid');
        $totalPayments = $payments->count();
        $totalPaid     = (float) $paidPayments->sum('amount');
        $pendingCount  = $payments->where('status', 'pending')->count();
        $pendingAmount = (float) $payments->where('status', 'pending')->sum('amount');

        // By type summary
        $byType = $paidPayments->groupBy(fn ($p) => $p->paymentType->name)
            ->map(fn ($group, $name) => [
                'name'  => $name,
                'count' => $group->count(),
                'total' => (float) $group->sum('amount'),
            ])->values()->toArray();

        // Outstanding dues
        $outstandingDues = $this->calculateOutstandingDues($member, $paidPayments);
        $totalOutstanding = collect($outstandingDues)->sum('amount');

        $title = "Member Report — {$member->member_id} — {$member->full_name}";

        $pdf = Pdf::loadView('reports.member', compact(
            'title', 'member', 'payments', 'totalPayments', 'totalPaid',
            'pendingCount', 'pendingAmount', 'byType', 'outstandingDues', 'totalOutstanding'
        ))->setPaper('a4', 'portrait');

        $filename = 'member-report-' . strtolower($member->member_id) . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Calculate all outstanding (unpaid) dues for a member.
     */
    private function calculateOutstandingDues(Member $member, $paidPayments): array
    {
        $paymentTypes = PaymentType::where('is_active', true)->get();
        $outstandingDues = [];

        foreach ($paymentTypes as $type) {
            if ($type->billing_cycle === 'monthly') {
                $startDate = $member->joined_at->copy()->startOfMonth();
                $endDate   = now()->startOfMonth();
                $current   = $startDate->copy();

                while ($current->lte($endDate)) {
                    $billingPeriod = $current->format('Y-m');

                    $isPaid = $paidPayments
                        ->where('payment_type_id', $type->id)
                        ->where('billing_period', $billingPeriod)
                        ->isNotEmpty();

                    if (!$isPaid) {
                        $outstandingDues[] = [
                            'payment_type_name'    => $type->name,
                            'billing_cycle'        => 'Monthly',
                            'amount'               => (float) $type->amount,
                            'billing_period_label' => $current->format('M Y'),
                        ];
                    }

                    $current->addMonth();
                }
            } elseif ($type->billing_cycle === 'yearly') {
                $startYear = (int) $member->joined_at->format('Y');
                $endYear   = (int) now()->format('Y');

                for ($year = $startYear; $year <= $endYear; $year++) {
                    $billingPeriod = (string) $year;

                    $isPaid = $paidPayments
                        ->where('payment_type_id', $type->id)
                        ->where('billing_period', $billingPeriod)
                        ->isNotEmpty();

                    if (!$isPaid) {
                        $outstandingDues[] = [
                            'payment_type_name'    => $type->name,
                            'billing_cycle'        => 'Yearly',
                            'amount'               => (float) $type->amount,
                            'billing_period_label' => $billingPeriod,
                        ];
                    }
                }
            } elseif ($type->billing_cycle === 'one_time') {
                $isPaid = $paidPayments
                    ->where('payment_type_id', $type->id)
                    ->isNotEmpty();

                if (!$isPaid) {
                    $outstandingDues[] = [
                        'payment_type_name'    => $type->name,
                        'billing_cycle'        => 'One-time',
                        'amount'               => (float) $type->amount,
                        'billing_period_label' => 'One-time',
                    ];
                }
            }
        }

        return $outstandingDues;
    }

    /**
     * Generate officials & members directory PDF.
     */
    public function officials()
    {
        $positionLabels = PositionHistory::POSITION_LABELS;

        // Officers sorted by position rank
        $officers = Member::where('position', '!=', 'member')
            ->orderByRaw("FIELD(position, 'president','vice_president','secretary','treasurer','collector','coordinator')")
            ->get();

        // Regular members sorted by last name
        $regularMembers = Member::where('position', 'member')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $totalMembers  = $officers->count() + $regularMembers->count();
        $officerCount  = $officers->count();
        $regularCount  = $regularMembers->count();

        $title = 'Officials & Members Directory';

        $pdf = Pdf::loadView('reports.officials', compact(
            'title', 'officers', 'regularMembers', 'positionLabels',
            'totalMembers', 'officerCount', 'regularCount'
        ))->setPaper('a4', 'portrait');

        return $pdf->download('officials-members-directory.pdf');
    }

    /**
     * Generate transaction report PDF.
     */
    public function transaction(Request $request)
    {
        $request->validate([
            'period'   => 'required|in:monthly,annually',
            'year'     => 'required|integer|min:2000|max:2100',
            'month'    => 'nullable|integer|min:1|max:12',
            'type'     => 'nullable|in:in,out',
            'category' => 'nullable|string',
        ]);

        $period   = $request->input('period');
        $year     = (int) $request->input('year');
        $month    = $request->input('month') ? (int) $request->input('month') : null;
        $typeFilter    = $request->input('type');
        $categoryFilter = $request->input('category');

        // Build query
        $query = Transaction::with(['recorder', 'member', 'payment'])
            ->whereYear('transaction_date', $year);

        if ($period === 'monthly' && $month) {
            $query->whereMonth('transaction_date', $month);
        }

        if ($typeFilter) {
            $query->where('type', $typeFilter);
        }

        if ($categoryFilter && $categoryFilter !== 'all') {
            $query->where('category', $categoryFilter);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->get();

        // Summary
        $totalIn  = (float) $transactions->where('type', 'in')->sum('amount');
        $totalOut = (float) $transactions->where('type', 'out')->sum('amount');
        $netBalance = $totalIn - $totalOut;
        $totalCount = $transactions->count();

        // By category
        $byCategory = $transactions->groupBy('category')
            ->map(fn ($group, $category) => [
                'category' => $category,
                'type'     => $group->first()->type,
                'count'    => $group->count(),
                'total'    => (float) $group->sum('amount'),
            ])->values()->toArray();

        // By type
        $byType = $transactions->groupBy('type')
            ->map(fn ($group, $type) => [
                'type'  => $type === 'in' ? 'Money In' : 'Money Out',
                'count' => $group->count(),
                'total' => (float) $group->sum('amount'),
            ])->values()->toArray();

        // Period label
        $months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        $periodLabel = $period === 'monthly' && $month
            ? "{$months[$month]} {$year}"
            : "Year {$year}";

        $title = "Transaction Report — {$periodLabel}";

        $pdf = Pdf::loadView('reports.transaction', compact(
            'title', 'periodLabel', 'totalIn', 'totalOut', 'netBalance',
            'totalCount', 'byCategory', 'byType', 'transactions'
        ))->setPaper('a4', 'portrait');

        $filename = 'transaction-report-' . strtolower(str_replace(' ', '-', $periodLabel)) . '.pdf';

        return $pdf->download($filename);
    }
}
