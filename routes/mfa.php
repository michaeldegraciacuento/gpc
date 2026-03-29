<?php

use App\Http\Controllers\MfaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| MFA Routes
|--------------------------------------------------------------------------
|
| Multi-Factor Authentication routes for OTP verification and management.
| These routes handle email OTP generation, verification, and session management.
|
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // Note: These routes are NOT protected by 'mfa.login' middleware to prevent infinite redirects
    // MFA Verification Routes
    Route::get('/mfa/verify', [MfaController::class, 'show'])->name('mfa.verify');
    Route::post('/mfa/send-code', [MfaController::class, 'sendCode'])->name('mfa.send-code');
    Route::post('/mfa/verify', [MfaController::class, 'verify'])->name('mfa.verify.submit');
    Route::get('/mfa/status', [MfaController::class, 'status'])->name('mfa.status');
    Route::post('/mfa/revoke', [MfaController::class, 'revoke'])->name('mfa.revoke');
    
    // MFA Settings
    Route::get('/settings/mfa', [MfaController::class, 'settings'])->name('settings.mfa');
});
