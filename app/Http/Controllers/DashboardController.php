<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $currentYear = now()->year;

        // Summary cards
        $totalMembers  = Member::count();
        $activeMembers = Member::where('status', 'active')->count();
        $totalUsers    = User::count();

        $totalCollected = (float) Payment::where('status', 'paid')->sum('amount');
        $collectedThisYear = (float) Payment::where('status', 'paid')
            ->whereYear('payment_date', $currentYear)
            ->sum('amount');
        $pendingAmount = (float) Payment::where('status', 'pending')->sum('amount');

        $paymentsThisMonth = Payment::where('status', 'paid')
            ->whereYear('payment_date', $currentYear)
            ->whereMonth('payment_date', now()->month)
            ->count();

        // Monthly collection chart data for current year (Jan - Dec)
        $monthlyCollections = Payment::where('status', 'paid')
            ->whereYear('payment_date', $currentYear)
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
        $methodBreakdown = Payment::where('status', 'paid')
            ->whereYear('payment_date', $currentYear)
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
                'collectedThisYear' => $collectedThisYear,
                'pendingAmount'     => $pendingAmount,
                'paymentsThisMonth' => $paymentsThisMonth,
            ],
            'chartMonthly'    => $chartMonthly,
            'methodBreakdown' => $methodBreakdown,
            'recentPayments'  => $recentPayments,
            'currentYear'     => $currentYear,
        ]);
    }
}
