<?php

namespace App\Http\Controllers;

use App\Models\PaymentType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentTypeController extends Controller
{
    public function index(): Response
    {
        $paymentTypes = PaymentType::withCount('payments')->paginate(15);

        return Inertia::render('settings/PaymentTypes/Index', [
            'paymentTypes' => $paymentTypes,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('settings/PaymentTypes/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string|max:1000',
            'amount'        => 'nullable|numeric|min:0',
            'billing_cycle' => 'required|in:one_time,monthly,quarterly,semi_annual,annual',
            'is_active'     => 'boolean',
        ]);

        PaymentType::create($validated);

        return redirect()->route('payment-types.index')
            ->with('success', 'Payment type created successfully.');
    }

    public function edit(PaymentType $paymentType): Response
    {
        return Inertia::render('settings/PaymentTypes/Edit', [
            'paymentType' => $paymentType,
        ]);
    }

    public function update(Request $request, PaymentType $paymentType): RedirectResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string|max:1000',
            'amount'        => 'nullable|numeric|min:0',
            'billing_cycle' => 'required|in:one_time,monthly,quarterly,semi_annual,annual',
            'is_active'     => 'boolean',
        ]);

        $paymentType->update($validated);

        return redirect()->route('payment-types.index')
            ->with('success', 'Payment type updated successfully.');
    }

    public function destroy(PaymentType $paymentType): RedirectResponse
    {
        if ($paymentType->payments()->exists()) {
            return redirect()->route('payment-types.index')
                ->with('error', 'Cannot delete a payment type that has existing payments.');
        }

        $paymentType->delete();

        return redirect()->route('payment-types.index')
            ->with('success', 'Payment type deleted successfully.');
    }
}
