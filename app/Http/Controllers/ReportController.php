<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Payment;
use App\Models\PaymentType;
use App\Models\PositionHistory;
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
            'byType', 'byMethod', 'payments'
        ))->setPaper('a4', 'landscape');

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

        $title = "Member Report — {$member->member_id} — {$member->full_name}";

        $pdf = Pdf::loadView('reports.member', compact(
            'title', 'member', 'payments', 'totalPayments', 'totalPaid',
            'pendingCount', 'pendingAmount', 'byType'
        ))->setPaper('a4', 'landscape');

        $filename = 'member-report-' . strtolower($member->member_id) . '.pdf';

        return $pdf->download($filename);
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
        ))->setPaper('a4', 'landscape');

        return $pdf->download('officials-members-directory.pdf');
    }
}
