<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Transaction;
use App\Traits\LogsActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    use LogsActivity;

    public function index(Request $request): Response
    {
        $query = Transaction::with(['recorder', 'member', 'payment']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('category', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('member', function ($mq) use ($search) {
                      $mq->where('first_name', 'like', "%{$search}%")
                         ->orWhere('last_name', 'like', "%{$search}%")
                         ->orWhere('member_id', 'like', "%{$search}%");
                  });
            });
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        $transactions = $query->latest('transaction_date')->latest('id')->paginate(15)->withQueryString();

        // Summary stats
        $totalIn = Transaction::where('type', 'in')->sum('amount');
        $totalOut = Transaction::where('type', 'out')->sum('amount');

        return Inertia::render('transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'type', 'category']),
            'categoriesIn' => Transaction::CATEGORIES_IN,
            'categoriesOut' => Transaction::CATEGORIES_OUT,
            'summary' => [
                'total_in' => (float) $totalIn,
                'total_out' => (float) $totalOut,
                'balance' => (float) ($totalIn - $totalOut),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('transactions/Create', [
            'categoriesIn' => Transaction::CATEGORIES_IN,
            'categoriesOut' => Transaction::CATEGORIES_OUT,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['in', 'out'])],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'transaction_date' => ['required', 'date'],
            'receipt_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('receipt_image')) {
            $validated['receipt_image'] = $request->file('receipt_image')->store('transaction-receipts', 'public');
        }

        $validated['recorded_by'] = $request->user()->id;

        $transaction = Transaction::create($validated);

        $typeLabel = $transaction->type === 'in' ? 'Money IN' : 'Money OUT';
        $this->logActivity(
            'transaction_created',
            $transaction,
            "Recorded {$typeLabel} transaction: {$transaction->category} — ₱" . number_format($transaction->amount, 2)
        );

        return redirect()->route('transactions.index')
            ->with('success', 'Transaction recorded successfully.');
    }

    public function show(Transaction $transaction): Response
    {
        $transaction->load(['recorder', 'member', 'payment']);

        return Inertia::render('transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    public function edit(Transaction $transaction): Response
    {
        return Inertia::render('transactions/Edit', [
            'transaction' => $transaction,
            'categoriesIn' => Transaction::CATEGORIES_IN,
            'categoriesOut' => Transaction::CATEGORIES_OUT,
        ]);
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['in', 'out'])],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'transaction_date' => ['required', 'date'],
            'receipt_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_receipt_image' => ['nullable', 'boolean'],
        ]);

        if ($request->hasFile('receipt_image')) {
            if ($transaction->receipt_image) {
                Storage::disk('public')->delete($transaction->receipt_image);
            }
            $validated['receipt_image'] = $request->file('receipt_image')->store('transaction-receipts', 'public');
        } elseif ($request->boolean('remove_receipt_image')) {
            if ($transaction->receipt_image) {
                Storage::disk('public')->delete($transaction->receipt_image);
            }
            $validated['receipt_image'] = null;
        }

        unset($validated['remove_receipt_image']);

        $transaction->update($validated);

        $typeLabel = $transaction->type === 'in' ? 'Money IN' : 'Money OUT';
        $this->logActivity(
            'transaction_updated',
            $transaction,
            "Updated {$typeLabel} transaction: {$transaction->category} — ₱" . number_format($transaction->amount, 2)
        );

        return redirect()->route('transactions.index')
            ->with('success', 'Transaction updated successfully.');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        $typeLabel = $transaction->type === 'in' ? 'Money IN' : 'Money OUT';
        $desc = "Deleted {$typeLabel} transaction: {$transaction->category} — ₱" . number_format($transaction->amount, 2);

        $transactionCopy = $transaction->replicate();
        $transactionCopy->id = $transaction->id;

        // Delete linked payment
        if ($transaction->payment_id) {
            $linkedPayment = Payment::with(['member', 'paymentType'])->find($transaction->payment_id);
            if ($linkedPayment) {
                $memberName = $linkedPayment->member ? $linkedPayment->member->full_name : 'Unknown';
                $typeName = $linkedPayment->paymentType ? $linkedPayment->paymentType->name : 'Unknown';
                $amount = '₱' . number_format($linkedPayment->amount, 2);
                $period = $linkedPayment->billing_period
                    ? (strlen($linkedPayment->billing_period) === 4 ? $linkedPayment->billing_period : date('F Y', strtotime($linkedPayment->billing_period . '-01')))
                    : '';

                $paymentDesc = "Auto-deleted payment #{$linkedPayment->id} for {$memberName} — {$typeName} {$amount}"
                    . ($period ? " ({$period})" : '')
                    . " (linked transaction #{$transaction->id} was deleted)";

                $this->logActivity('deleted', $linkedPayment, $paymentDesc);

                if ($linkedPayment->proof_image) {
                    Storage::disk('public')->delete($linkedPayment->proof_image);
                }
                $linkedPayment->delete();
            }
        }

        if ($transaction->receipt_image) {
            Storage::disk('public')->delete($transaction->receipt_image);
        }

        $transaction->delete();

        $this->logActivity('transaction_deleted', $transactionCopy, $desc);

        return redirect()->route('transactions.index')
            ->with('success', 'Transaction and linked payment deleted successfully.');
    }
}
