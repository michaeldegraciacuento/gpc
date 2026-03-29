<?php

namespace App\Http\Controllers;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')
            ->select(['id', 'name', 'email', 'created_at', 'mfa_enabled'])
            ->paginate(10);
        
        return Inertia::render('settings/Users/Index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        
        return Inertia::render('settings/Users/Create', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'roles' => 'array',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        if ($request->roles) {
            $user->assignRole($request->roles);
        }

        return redirect()->route('users.index')
            ->with('success', 'User created successfully.');
    }

    public function show(User $user)
    {
        $user->load(['roles', 'permissions']);
        
        return Inertia::render('settings/Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $user->load('roles');
        $roles = Role::all();
        
        return Inertia::render('settings/Users/Edit', [
            'user' => $user->makeVisible(['mfa_enabled']),
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'roles' => 'array',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password ? Hash::make($request->password) : $user->password,
        ]);

        $user->syncRoles($request->roles ?? []);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        
        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully.');
    }

    public function toggleMfa(User $user)
    {
        $newMfaStatus = !$user->mfa_enabled;
        
        $user->update([
            'mfa_enabled' => $newMfaStatus,
            // If disabling MFA, clear MFA-related data
            'mfa_secret' => $newMfaStatus ? $user->mfa_secret : null,
            'mfa_recovery_codes' => $newMfaStatus ? $user->mfa_recovery_codes : null,
        ]);

        $statusText = $newMfaStatus ? 'enabled' : 'disabled';
        
        return redirect()->back()
            ->with('success', "Multi-Factor Authentication {$statusText} for {$user->name}.");
    }

    public function enableMfa(User $user)
    {
        $user->update(['mfa_enabled' => 1]);
        
        return redirect()->back()
            ->with('success', 'Multi-Factor Authentication enabled for ' . $user->name . '. Email verification will now be required.');
    }

    public function disableMfa(User $user)
    {
        $user->update([
            'mfa_enabled' => 0,
            'mfa_secret' => null,
            'mfa_recovery_codes' => null
        ]);
        
        return redirect()->back()
            ->with('success', 'Multi-Factor Authentication disabled for ' . $user->name . '. Email verification is no longer required.');
    }
}
