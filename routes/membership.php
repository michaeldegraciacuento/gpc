<?php

use App\Http\Controllers\MemberController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentTypeController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Membership Routes
|--------------------------------------------------------------------------
|
| Club membership management routes: Members, Payments, and Payment Types.
| All routes require authentication, email verification, and MFA login.
|
*/

Route::middleware(['auth', 'verified', 'mfa.login'])->group(function () {

    // ─── Members ─────────────────────────────────────────────────────

    Route::middleware(['permission:members.create'])->group(function () {
        Route::get('members/create', [MemberController::class, 'create'])
             ->name('members.create');
        Route::post('members', [MemberController::class, 'store'])
             ->name('members.store');
    });

    Route::middleware(['permission:members.view'])->group(function () {
        Route::get('members', [MemberController::class, 'index'])
             ->name('members.index');
        Route::get('members/{member}', [MemberController::class, 'show'])
             ->name('members.show');
    });

    Route::middleware(['permission:members.edit'])->group(function () {
        Route::get('members/{member}/edit', [MemberController::class, 'edit'])
             ->name('members.edit');
        Route::match(['put', 'patch'], 'members/{member}', [MemberController::class, 'update'])
             ->name('members.update');
    });

    Route::middleware(['permission:members.delete'])->group(function () {
        Route::delete('members/{member}', [MemberController::class, 'destroy'])
             ->name('members.destroy');
    });

    // ─── Payments ────────────────────────────────────────────────────

    Route::middleware(['permission:payments.create'])->group(function () {
        Route::get('payments/create', [PaymentController::class, 'create'])
             ->name('payments.create');
        Route::post('payments', [PaymentController::class, 'store'])
             ->name('payments.store');
    });

     Route::middleware(['permission:payments.view'])->group(function () {
        Route::get('payments', [PaymentController::class, 'index'])
             ->name('payments.index');
        Route::get('payments/{payment}', [PaymentController::class, 'show'])
             ->name('payments.show');
        Route::get('payments/{payment}/receipt-pdf', [PaymentController::class, 'receiptPdf'])
             ->name('payments.receipt_pdf');
    });

    Route::middleware(['permission:payments.edit'])->group(function () {
        Route::get('payments/{payment}/edit', [PaymentController::class, 'edit'])
             ->name('payments.edit');
        Route::match(['put', 'patch'], 'payments/{payment}', [PaymentController::class, 'update'])
             ->name('payments.update');
    });

    Route::middleware(['permission:payments.delete'])->group(function () {
        Route::delete('payments/{payment}', [PaymentController::class, 'destroy'])
             ->name('payments.destroy');
    });

    // ─── Payment Types (Admin Configuration) ─────────────────────────

    Route::middleware(['permission:members.edit'])->group(function () {
        Route::get('payment-types', [PaymentTypeController::class, 'index'])
             ->name('payment-types.index');
        Route::get('payment-types/create', [PaymentTypeController::class, 'create'])
             ->name('payment-types.create');
        Route::post('payment-types', [PaymentTypeController::class, 'store'])
             ->name('payment-types.store');
        Route::get('payment-types/{paymentType}/edit', [PaymentTypeController::class, 'edit'])
             ->name('payment-types.edit');
        Route::match(['put', 'patch'], 'payment-types/{paymentType}', [PaymentTypeController::class, 'update'])
             ->name('payment-types.update');
        Route::delete('payment-types/{paymentType}', [PaymentTypeController::class, 'destroy'])
             ->name('payment-types.destroy');
    });

    // ─── Reports ─────────────────────────────────────────────────────

    Route::middleware(['permission:payments.view'])->group(function () {
        Route::get('reports', [ReportController::class, 'index'])
             ->name('reports.index');
        Route::get('reports/financial', [ReportController::class, 'financial'])
             ->name('reports.financial');
        Route::get('reports/member', [ReportController::class, 'member'])
             ->name('reports.member');
        Route::get('reports/officials', [ReportController::class, 'officials'])
             ->name('reports.officials');
        Route::get('reports/transaction', [ReportController::class, 'transaction'])
             ->name('reports.transaction');
    });

    // ─── Activity Logs ───────────────────────────────────────────────

    Route::middleware(['permission:members.view'])->group(function () {
        Route::get('activity-logs', [ActivityLogController::class, 'index'])
             ->name('activity-logs.index');
    });

    // ─── Transactions ────────────────────────────────────────────────

    Route::middleware(['permission:payments.create'])->group(function () {
        Route::get('transactions/create', [TransactionController::class, 'create'])
             ->name('transactions.create');
        Route::post('transactions', [TransactionController::class, 'store'])
             ->name('transactions.store');
    });

    Route::middleware(['permission:payments.view'])->group(function () {
        Route::get('transactions', [TransactionController::class, 'index'])
             ->name('transactions.index');
        Route::get('transactions/{transaction}', [TransactionController::class, 'show'])
             ->name('transactions.show');
    });

    Route::middleware(['permission:payments.edit'])->group(function () {
        Route::get('transactions/{transaction}/edit', [TransactionController::class, 'edit'])
             ->name('transactions.edit');
        Route::match(['put', 'patch'], 'transactions/{transaction}', [TransactionController::class, 'update'])
             ->name('transactions.update');
    });

    Route::middleware(['permission:payments.delete'])->group(function () {
        Route::delete('transactions/{transaction}', [TransactionController::class, 'destroy'])
             ->name('transactions.destroy');
    });
});
