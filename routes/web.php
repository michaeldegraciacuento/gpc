<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberProfileController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Public member profile (RFID / QR card scan)
Route::get('/member/{memberId}', [MemberProfileController::class, 'show'])->name('member.profile');

Route::middleware(['auth', 'verified', 'mfa.login'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    
    // Role and Permission Management Routes with middleware protection
    // Create & Store must come first
    Route::middleware(['permission:users.create'])->group(function () {
        Route::get('roles/create', [RoleController::class, 'create'])
             ->name('roles.create');
        Route::post('roles',       [RoleController::class, 'store'])
             ->name('roles.store');
        Route::get('permissions/create', [PermissionController::class, 'create'])
             ->name('permissions.create');
        Route::post('permissions', [PermissionController::class, 'store'])
             ->name('permissions.store');
     Route::get('users/create', [UserController::class, 'create'])
             ->name('users.create');
        Route::post('users',       [UserController::class, 'store'])
             ->name('users.store');
    });

    // View (index + show)
    Route::middleware(['permission:users.view'])->group(function () {
        Route::get('roles',         [RoleController::class, 'index'])
             ->name('roles.index');
        Route::get('roles/{role}',  [RoleController::class, 'show'])
             ->name('roles.show');
        Route::get('permissions',   [PermissionController::class, 'index'])
             ->name('permissions.index');
        Route::get('permissions/{permission}', [PermissionController::class, 'show'])
             ->name('permissions.show');
        Route::get('users',         [UserController::class, 'index'])
             ->name('users.index');
        Route::get('users/{user}',  [UserController::class, 'show'])
             ->name('users.show');
    });

    // Edit & Update
    Route::middleware(['permission:users.edit'])->group(function () {
        Route::get('roles/{role}/edit', [RoleController::class, 'edit'])
             ->name('roles.edit');
        Route::match(['put','patch'],'roles/{role}', [RoleController::class, 'update'])
             ->name('roles.update');
        Route::get('permissions/{permission}/edit', [PermissionController::class, 'edit'])
             ->name('permissions.edit');
        Route::match(['put','patch'],'permissions/{permission}', [PermissionController::class, 'update'])
             ->name('permissions.update');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])
             ->name('users.edit');
        Route::match(['put','patch'],'users/{user}', [UserController::class, 'update'])
             ->name('users.update');

        // MFA Management for Users
        Route::post('users/{user}/enable-mfa', [UserController::class, 'enableMfa'])
             ->name('users.enable-mfa');
        Route::post('users/{user}/disable-mfa', [UserController::class, 'disableMfa'])
             ->name('users.disable-mfa');
    });

    // Delete (with MFA protection for sensitive actions)
    Route::middleware(['permission:users.delete', 'mfa:delete_role'])->group(function () {
        Route::delete('roles/{role}', [RoleController::class, 'destroy'])
             ->name('roles.destroy');
    });
    
    Route::middleware(['permission:users.delete', 'mfa:delete_permission'])->group(function () {
        Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])
             ->name('permissions.destroy');
    });
    
    Route::middleware(['permission:users.delete', 'mfa:delete_user'])->group(function () {
        Route::delete('users/{user}', [UserController::class, 'destroy'])
             ->name('users.destroy');
    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/mfa.php';
require __DIR__.'/membership.php';
