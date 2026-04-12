<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $currentYear = now()->year;

        // ── Filter parameters ─────────────────────────────────
        $filterYear  = $request->input('year', (string) $currentYear);
        $filterMonth = $request->input('month');      // e.g. "01".."12"
        $filterFrom  = $request->input('from');        // date string
        $filterTo    = $request->input('to');           // date string

        // Helper: apply date filters to a query on a given date column
        $applyDateFilters = function ($query, string $dateCol = 'payment_date') use ($filterYear, $filterMonth, $filterFrom, $filterTo) {
            if ($filterFrom && $filterTo) {
                $query->whereBetween($dateCol, [$filterFrom, $filterTo]);
            } elseif ($filterMonth && $filterYear) {
                $query->whereYear($dateCol, $filterYear)
                      ->whereMonth($dateCol, $filterMonth);
            } elseif ($filterYear) {
                $query->whereYear($dateCol, $filterYear);
            }
            return $query;
        };

        // Summary cards
        $totalMembers  = Member::count();
        $activeMembers = Member::where('status', 'active')->count();
        $totalUsers    = User::count();

        $totalCollected = (float) Payment::where('status', 'paid')->sum('amount');

        $collectedFiltered = (float) $applyDateFilters(
            Payment::where('status', 'paid'),
            'payment_date'
        )->sum('amount');

        // Running balance from transactions (all-time)
        $totalIn  = (float) Transaction::where('type', 'in')->sum('amount');
        $totalOut = (float) Transaction::where('type', 'out')->sum('amount');
        $runningBalance = $totalIn - $totalOut;

        // Outgoing expenses (filtered period)
        $outgoingExpenses = (float) $applyDateFilters(
            Transaction::where('type', 'out'),
            'transaction_date'
        )->sum('amount');

        // Monthly collection chart data (for filterYear)
        $chartYear = (int) $filterYear;
        $monthlyCollections = Payment::where('status', 'paid')
            ->whereYear('payment_date', $chartYear)
            ->selectRaw("MONTH(payment_date) as month, SUM(amount) as total")
            ->groupBy(DB::raw('MONTH(payment_date)'))
            ->orderBy('month')
            ->pluck('total', 'month')
            ->toArray();

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $chartMonthly = [];
        for ($i = 1; $i <= 12; $i++) {
            $chartMonthly[] = [
                'month' => $months[$i - 1],
                'total' => (float) ($monthlyCollections[$i] ?? 0),
            ];
        }

        // Payment method breakdown (pie chart)
        $methodQuery = Payment::where('status', 'paid');
        $applyDateFilters($methodQuery);
        $methodBreakdown = $methodQuery
            ->selectRaw("payment_method, COUNT(*) as count, SUM(amount) as total")
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($row) => [
                'method' => match ($row->payment_method) {
                    'cash'          => 'Cash',
                    'gcash'         => 'GCash',
                    'bank_transfer' => 'Bank Transfer',
                    default         => $row->payment_method,
                },
                'count' => (int) $row->count,
                'total' => (float) $row->total,
            ])
            ->values()
            ->toArray();

        // Recent payments
        $recentPayments = Payment::with(['member', 'paymentType'])
            ->where('status', 'paid')
            ->latest('payment_date')
            ->take(5)
            ->get()
            ->map(fn ($p) => [
                'id'           => $p->id,
                'member_name'  => $p->member->full_name,
                'member_id'    => $p->member->member_id,
                'type'         => $p->paymentType->name,
                'amount'       => (float) $p->amount,
                'payment_date' => $p->payment_date,
                'method'       => $p->payment_method,
            ]);

        return Inertia::render('dashboard', [
            'stats' => [
                'totalMembers'      => $totalMembers,
                'activeMembers'     => $activeMembers,
                'totalUsers'        => $totalUsers,
                'totalCollected'    => $totalCollected,
                'collectedFiltered' => $collectedFiltered,
                'runningBalance'    => $runningBalance,
                'outgoingExpenses'  => $outgoingExpenses,
            ],
            'chartMonthly'    => $chartMonthly,
            'methodBreakdown' => $methodBreakdown,
            'recentPayments'  => $recentPayments,
            'currentYear'     => $currentYear,
            'filters'         => [
                'year'  => $filterYear,
                'month' => $filterMonth,
                'from'  => $filterFrom,
                'to'    => $filterTo,
            ],
        ]);
    }
}
