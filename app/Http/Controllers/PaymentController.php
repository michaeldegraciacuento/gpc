<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Payment;
use App\Models\PaymentType;
use App\Models\Transaction;
use App\Traits\LogsActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class PaymentController extends Controller
{
    use LogsActivity;

    public function index(Request $request): Response
    {
        $query = Payment::with(['member', 'paymentType', 'recorder']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                  ->orWhereHas('member', function ($mq) use ($search) {
                      $mq->where('first_name', 'like', "%{$search}%")
                         ->orWhere('last_name', 'like', "%{$search}%")
                         ->orWhere('member_id', 'like', "%{$search}%");
                  });
            });
        }

        if ($typeId = $request->input('payment_type_id')) {
            $query->where('payment_type_id', $typeId);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($method = $request->input('payment_method')) {
            $query->where('payment_method', $method);
        }

        $payments = $query->latest('payment_date')->paginate(15)->withQueryString();
        $paymentTypes = PaymentType::where('is_active', true)->get();

        return Inertia::render('payments/Index', [
            'payments'     => $payments,
            'paymentTypes' => $paymentTypes,
            'filters'      => $request->only(['search', 'payment_type_id', 'status', 'payment_method']),
        ]);
    }

    public function create(Request $request): Response
    {
        $members = Member::where('status', 'active')
            ->orderBy('last_name')
            ->get(['id', 'member_id', 'first_name', 'middle_name', 'last_name', 'suffix']);

        $paymentTypes = PaymentType::where('is_active', true)->get();

        $currentYear = now()->year;

        // All paid billing periods: member_id => { payment_type_id => ["2026-01", "2026-03", ...] }
        $memberPaidPeriods = [];
        $rows = Payment::where('status', 'paid')
            ->whereNotNull('billing_period')
            ->selectRaw('member_id, payment_type_id, billing_period')
            ->distinct()
            ->get();
        foreach ($rows as $row) {
            $memberPaidPeriods[$row->member_id][$row->payment_type_id][] = $row->billing_period;
        }

        // One-time types already paid: member_id => [payment_type_id, ...]
        $oneTimeTypeIds = $paymentTypes->where('billing_cycle', 'one_time')->pluck('id')->toArray();
        $memberPaidOneTime = Payment::where('status', 'paid')
            ->whereIn('payment_type_id', $oneTimeTypeIds)
            ->selectRaw('member_id, payment_type_id')
            ->distinct()
            ->get()
            ->groupBy('member_id')
            ->map(fn ($rows) => $rows->pluck('payment_type_id')->values())
            ->toArray();

        return Inertia::render('payments/Create', [
            'members'            => $members,
            'paymentTypes'       => $paymentTypes,
            'selectedMemberId'   => $request->input('member_id') ? (int) $request->input('member_id') : null,
            'memberPaidPeriods'  => (object) $memberPaidPeriods,
            'memberPaidOneTime'  => (object) $memberPaidOneTime,
            'currentYear'        => $currentYear,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id'       => 'required|exists:members,id',
            'payment_type_id' => 'required|exists:payment_types,id',
            'or_number'       => 'nullable|string|max:50',
            'payment_receipt_number' => 'nullable|string|max:50|unique:payments,payment_receipt_number',
            'amount'          => 'required|numeric|min:0.01',
            'payment_date'    => 'required|date',
            'payment_method'  => 'required|in:cash,gcash,bank_transfer',
            'status'          => 'required|in:paid,pending,cancelled',
            'notes'           => 'nullable|string|max:2000',
            'billing_period'  => 'nullable|string|max:7',
            'proof_image'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        // Check for duplicate payment (same member + type + billing period)
        $paymentType = PaymentType::findOrFail($validated['payment_type_id']);

        if ($paymentType->billing_cycle === 'one_time') {
            $exists = Payment::where('member_id', $validated['member_id'])
                ->where('payment_type_id', $validated['payment_type_id'])
                ->where('status', 'paid')
                ->exists();

            if ($exists) {
                return back()->withErrors(['payment_type_id' => "This member has already paid for {$paymentType->name}."])->withInput();
            }
        } elseif (in_array($paymentType->billing_cycle, ['monthly', 'yearly']) && !empty($validated['billing_period'])) {
            $exists = Payment::where('member_id', $validated['member_id'])
                ->where('payment_type_id', $validated['payment_type_id'])
                ->where('billing_period', $validated['billing_period'])
                ->where('status', 'paid')
                ->exists();

            if ($exists) {
                $periodLabel = $paymentType->billing_cycle === 'monthly'
                    ? date('F Y', strtotime($validated['billing_period'] . '-01'))
                    : $validated['billing_period'];
                return back()->withErrors(['billing_period' => "This member has already paid {$paymentType->name} for {$periodLabel}."])->withInput();
            }
        }

        // Force amount from payment type
        if ($paymentType->amount) {
            $validated['amount'] = $paymentType->amount;
        }

        // Auto-generate payment_receipt_number if not provided
        if (empty($validated['payment_receipt_number'])) {
            $latest = Payment::orderByDesc('id')->first();
            $nextId = $latest ? $latest->id + 1 : 1;
            $year = now()->format('Y');
            $validated['payment_receipt_number'] = 'PR-' . $year . str_pad($nextId, 5, '0', STR_PAD_LEFT);
        }

        if ($request->hasFile('proof_image')) {
            $validated['proof_image'] = $request->file('proof_image')->store('payment-proofs', 'public');
        }

        $validated['recorded_by'] = $request->user()->id;

        $payment = Payment::create($validated);

        $member = Member::find($validated['member_id']);
        $type = PaymentType::find($validated['payment_type_id']);

        // Auto-create a corresponding Transaction (Money IN)
        Transaction::create([
            'type'             => 'in',
            'category'         => 'Incoming Funds',
            'description'      => $type->name . ' - ' . $member->full_name,
            'amount'           => $validated['amount'],
            'transaction_date' => $validated['payment_date'],
            'payment_id'       => $payment->id,
            'member_id'        => $member->id,
            'recorded_by'      => $request->user()->id,
        ]);

        $this->logActivity('created', $payment, "Recorded {$type->name} payment of ₱" . number_format($validated['amount'], 2) . " for {$member->full_name}");

        return redirect()->route('payments.index')
            ->with('success', 'Payment recorded successfully.');
    }

    public function show(Payment $payment): Response
    {
        $payment->load(['member', 'paymentType', 'recorder']);

        return Inertia::render('payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Download PDF receipt for a payment.
     */
    public function receiptPdf(Payment $payment)
    {
        $payment->load(['member', 'paymentType', 'recorder']);
        $pdf = Pdf::loadView('reports.payment_receipt', compact('payment'))->setPaper([0, 0, 165, 275], 'portrait');
        $filename = 'payment-receipt-' . ($payment->or_number ?? $payment->id) . '.pdf';
        return $pdf->download($filename);
    }

    public function edit(Payment $payment): Response
    {
        $payment->load(['member', 'paymentType']);

        $members = Member::where('status', 'active')
            ->orderBy('last_name')
            ->get(['id', 'member_id', 'first_name', 'middle_name', 'last_name', 'suffix']);

        $paymentTypes = PaymentType::where('is_active', true)->get();

        $currentYear = now()->year;

        // All paid billing periods (exclude current payment)
        $memberPaidPeriods = [];
        $rows = Payment::where('status', 'paid')
            ->whereNotNull('billing_period')
            ->where('id', '!=', $payment->id)
            ->selectRaw('member_id, payment_type_id, billing_period')
            ->distinct()
            ->get();
        foreach ($rows as $row) {
            $memberPaidPeriods[$row->member_id][$row->payment_type_id][] = $row->billing_period;
        }

        // One-time types already paid (exclude current payment)
        $oneTimeTypeIds = $paymentTypes->where('billing_cycle', 'one_time')->pluck('id')->toArray();
        $memberPaidOneTime = Payment::where('status', 'paid')
            ->whereIn('payment_type_id', $oneTimeTypeIds)
            ->where('id', '!=', $payment->id)
            ->selectRaw('member_id, payment_type_id')
            ->distinct()
            ->get()
            ->groupBy('member_id')
            ->map(fn ($rows) => $rows->pluck('payment_type_id')->values())
            ->toArray();

        return Inertia::render('payments/Edit', [
            'payment'            => $payment,
            'members'            => $members,
            'paymentTypes'       => $paymentTypes,
            'memberPaidPeriods'  => (object) $memberPaidPeriods,
            'memberPaidOneTime'  => (object) $memberPaidOneTime,
            'currentYear'        => $currentYear,
        ]);
    }

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'member_id'       => 'required|exists:members,id',
            'payment_type_id' => 'required|exists:payment_types,id',
            'or_number'       => 'nullable|string|max:50',
            'payment_receipt_number' => 'required|string|max:50|unique:payments,payment_receipt_number,' . $payment->id,
            'amount'          => 'required|numeric|min:0.01',
            'payment_date'    => 'required|date',
            'payment_method'  => 'required|in:cash,gcash,bank_transfer',
            'status'          => 'required|in:paid,pending,cancelled',
            'notes'           => 'nullable|string|max:2000',
            'billing_period'  => 'nullable|string|max:7',
            'proof_image'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'remove_proof_image' => 'nullable|boolean',
        ]);

        if ($request->hasFile('proof_image')) {
            if ($payment->proof_image) {
                Storage::disk('public')->delete($payment->proof_image);
            }
            $validated['proof_image'] = $request->file('proof_image')->store('payment-proofs', 'public');
        } elseif ($request->boolean('remove_proof_image')) {
            if ($payment->proof_image) {
                Storage::disk('public')->delete($payment->proof_image);
            }
            $validated['proof_image'] = null;
        }

        unset($validated['remove_proof_image']);

        // Capture old values before update
        $oldValues = $payment->only(array_keys($validated));

        $payment->update($validated);

        $member = Member::find($validated['member_id']);

        // Build change log
        $diff = $this->buildChanges($oldValues, $validated, [
            'member_id' => 'member', 'payment_type_id' => 'payment type', 'or_number' => 'OR number',
            'payment_date' => 'date', 'payment_method' => 'method', 'billing_period' => 'period',
        ]);
        $desc = "Updated payment #{$payment->id} for {$member->full_name}";
        if ($diff['description']) {
            $desc .= ' — ' . $diff['description'];
        }
        $this->logActivity('updated', $payment, $desc, $diff['changes'] ?: null);

        return redirect()->route('payments.index')
            ->with('success', 'Payment updated successfully.');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        $payment->load(['member', 'paymentType']);
        $member = $payment->member;
        $typeName = $payment->paymentType ? $payment->paymentType->name : 'Unknown';
        $amount = '₱' . number_format($payment->amount, 2);
        $period = $payment->billing_period
            ? (strlen($payment->billing_period) === 4 ? $payment->billing_period : date('F Y', strtotime($payment->billing_period . '-01')))
            : '';

        $desc = "Deleted payment #{$payment->id}"
            . ($member ? " for {$member->full_name}" : '')
            . " — {$typeName} {$amount}"
            . ($period ? " ({$period})" : '');

        $this->logActivity('deleted', $payment, $desc);

        // Delete linked transaction
        $linkedTransaction = Transaction::where('payment_id', $payment->id)->first();
        if ($linkedTransaction) {
            $typeLabel = $linkedTransaction->type === 'in' ? 'Money IN' : 'Money OUT';
            $this->logActivity('transaction_deleted', $linkedTransaction, "Auto-deleted {$typeLabel} transaction #{$linkedTransaction->id} (linked payment #{$payment->id} was deleted)");

            if ($linkedTransaction->receipt_image) {
                Storage::disk('public')->delete($linkedTransaction->receipt_image);
            }
            $linkedTransaction->delete();
        }

        if ($payment->proof_image) {
            Storage::disk('public')->delete($payment->proof_image);
        }

        $payment->delete();

        return redirect()->route('payments.index')
            ->with('success', 'Payment and linked transaction deleted successfully.');
    }
}
