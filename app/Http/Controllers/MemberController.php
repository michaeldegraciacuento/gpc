<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\PaymentType;
use App\Models\PositionHistory;
use App\Traits\LogsActivity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    use LogsActivity;

    public function index(Request $request): Response
    {
        $query = Member::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('member_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($type = $request->input('membership_type')) {
            $query->where('membership_type', $type);
        }

        $members = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('members/Index', [
            'members' => $members,
            'filters' => $request->only(['search', 'status', 'membership_type']),
        ]);
    }

    public function create(): Response
    {
        // Positions already taken by other members (not 'member')
        $occupiedPositions = Member::where('position', '!=', 'member')
            ->pluck('position')
            ->toArray();

        return Inertia::render('members/Create', [
            'occupiedPositions' => $occupiedPositions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name'      => 'required|string|max:255',
            'middle_name'     => 'nullable|string|max:255',
            'last_name'       => 'required|string|max:255',
            'suffix'          => 'nullable|string|max:20',
            'email'           => 'required|email|max:255',
            'phone'           => 'required|string|max:20',
            'address'         => 'required|string|max:1000',
            'birthdate'       => 'nullable|date|before:today',
            'gender'          => 'nullable|in:male,female',
            'civil_status'    => 'nullable|in:single,married,widowed,separated,divorced',
            'membership_type' => 'required|in:regular',
            'position'        => 'required|in:member,president,vice_president,secretary,treasurer,collector,coordinator',
            'status'          => 'required|in:active,inactive,suspended',
            'joined_at'       => 'required|date',
            'notes'           => 'nullable|string|max:2000',
            'member_image'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // Check officer position uniqueness
        $position = $validated['position'];
        if ($position !== 'member') {
            $existing = Member::where('position', $position)->first();
            if ($existing) {
                return back()->withErrors(['position' => 'This position is already held by ' . $existing->full_name . '.'])->withInput();
            }
        }

        // Handle image upload
        if ($request->hasFile('member_image')) {
            $validated['member_image'] = $request->file('member_image')->store('member-images', 'public');
        } else {
            unset($validated['member_image']);
        }

        $member = Member::create($validated);

        // Record position history for officers
        if ($position !== 'member') {
            PositionHistory::updateOrCreate(
                ['position' => $position, 'term_year' => now()->year],
                ['member_id' => $member->id]
            );
        }

        $this->logActivity('created', $member, "Created member {$member->full_name} ({$member->member_id})");

        return redirect()->route('members.index')
            ->with('success', 'Member created successfully.');
    }

    public function show(Member $member): Response
    {
        $member->load(['payments' => function ($query) {
            $query->with('paymentType', 'recorder')->latest('payment_date');
        }]);

        $totalPaid = (float) $member->payments->where('status', 'paid')->sum('amount');

        // Position history for this member
        $positionHistory = PositionHistory::where('member_id', $member->id)
            ->orderBy('term_year', 'desc')
            ->get()
            ->map(fn ($h) => [
                'position' => PositionHistory::POSITION_LABELS[$h->position] ?? $h->position,
                'term_year' => $h->term_year,
            ]);

        // Outstanding dues calculation
        $outstandingDues = $this->calculateOutstandingDues($member);

        return Inertia::render('members/Show', [
            'member'          => $member,
            'totalPaid'       => $totalPaid,
            'positionHistory' => $positionHistory,
            'outstandingDues' => $outstandingDues,
        ]);
    }

    /**
     * Calculate all outstanding (unpaid) dues for a member.
     */
    private function calculateOutstandingDues(Member $member): array
    {
        $paymentTypes = PaymentType::where('is_active', true)->get();
        $outstandingDues = [];

        // Payments already made (paid status) grouped by type
        $paidPayments = $member->payments->where('status', 'paid');

        foreach ($paymentTypes as $type) {
            if ($type->billing_cycle === 'monthly') {
                // Generate months from join date to current month
                $startDate = $member->joined_at->copy()->startOfMonth();
                $endDate   = now()->startOfMonth();
                $current   = $startDate->copy();

                while ($current->lte($endDate)) {
                    $billingPeriod = $current->format('Y-m');

                    $isPaid = $paidPayments
                        ->where('payment_type_id', $type->id)
                        ->where('billing_period', $billingPeriod)
                        ->isNotEmpty();

                    if (!$isPaid) {
                        $outstandingDues[] = [
                            'payment_type_id'   => $type->id,
                            'payment_type_name' => $type->name,
                            'billing_cycle'     => $type->billing_cycle,
                            'amount'            => (float) $type->amount,
                            'billing_period'       => $billingPeriod,
                            'billing_period_label' => $current->format('F Y'),
                        ];
                    }

                    $current->addMonth();
                }
            } elseif ($type->billing_cycle === 'yearly') {
                // Generate years from join year to current year
                $startYear = (int) $member->joined_at->format('Y');
                $endYear   = (int) now()->format('Y');

                for ($year = $startYear; $year <= $endYear; $year++) {
                    $billingPeriod = (string) $year;

                    $isPaid = $paidPayments
                        ->where('payment_type_id', $type->id)
                        ->where('billing_period', $billingPeriod)
                        ->isNotEmpty();

                    if (!$isPaid) {
                        $outstandingDues[] = [
                            'payment_type_id'   => $type->id,
                            'payment_type_name' => $type->name,
                            'billing_cycle'     => $type->billing_cycle,
                            'amount'            => (float) $type->amount,
                            'billing_period'       => $billingPeriod,
                            'billing_period_label' => $billingPeriod,
                        ];
                    }
                }
            } elseif ($type->billing_cycle === 'one_time') {
                // One-time: unpaid if no paid record exists at all
                $isPaid = $paidPayments
                    ->where('payment_type_id', $type->id)
                    ->isNotEmpty();

                if (!$isPaid) {
                    $outstandingDues[] = [
                        'payment_type_id'   => $type->id,
                        'payment_type_name' => $type->name,
                        'billing_cycle'     => $type->billing_cycle,
                        'amount'            => (float) $type->amount,
                        'billing_period'       => null,
                        'billing_period_label' => 'One-time',
                    ];
                }
            }
        }

        return $outstandingDues;
    }

    public function edit(Member $member): Response
    {
        // Positions taken by OTHER members (exclude this member's position)
        $occupiedPositions = Member::where('position', '!=', 'member')
            ->where('id', '!=', $member->id)
            ->pluck('position')
            ->toArray();

        return Inertia::render('members/Edit', [
            'member'            => $member,
            'occupiedPositions' => $occupiedPositions,
        ]);
    }

    public function update(Request $request, Member $member): RedirectResponse
    {
        $validated = $request->validate([
            'first_name'      => 'required|string|max:255',
            'middle_name'     => 'nullable|string|max:255',
            'last_name'       => 'required|string|max:255',
            'suffix'          => 'nullable|string|max:20',
            'email'           => 'required|email|max:255',
            'phone'           => 'required|string|max:20',
            'address'         => 'required|string|max:1000',
            'birthdate'       => 'nullable|date|before:today',
            'gender'          => 'nullable|in:male,female',
            'civil_status'    => 'nullable|in:single,married,widowed,separated,divorced',
            'membership_type' => 'required|in:regular',
            'position'        => 'required|in:member,president,vice_president,secretary,treasurer,collector,coordinator',
            'status'          => 'required|in:active,inactive,suspended',
            'joined_at'       => 'required|date',
            'notes'           => 'nullable|string|max:2000',
            'member_image'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'remove_member_image' => 'nullable|boolean',
        ]);

        // Check officer position uniqueness (exclude self)
        $position = $validated['position'];
        if ($position !== 'member') {
            $existing = Member::where('position', $position)->where('id', '!=', $member->id)->first();
            if ($existing) {
                return back()->withErrors(['position' => 'This position is already held by ' . $existing->full_name . '.'])->withInput();
            }
        }

        // Capture old values before update
        $oldValues = $member->only(array_keys(collect($validated)->except(['member_image', 'remove_member_image'])->all()));

        // Handle image upload / removal
        if ($request->hasFile('member_image')) {
            if ($member->member_image) {
                Storage::disk('public')->delete($member->member_image);
            }
            $validated['member_image'] = $request->file('member_image')->store('member-images', 'public');
        } elseif ($request->boolean('remove_member_image')) {
            if ($member->member_image) {
                Storage::disk('public')->delete($member->member_image);
            }
            $validated['member_image'] = null;
        } else {
            unset($validated['member_image']);
        }
        unset($validated['remove_member_image']);

        $member->update($validated);

        // Record position history for officers
        if ($position !== 'member') {
            PositionHistory::updateOrCreate(
                ['position' => $position, 'term_year' => now()->year],
                ['member_id' => $member->id]
            );
        }

        // Build change log
        $diff = $this->buildChanges($oldValues, $validated, [
            'first_name' => 'first name', 'middle_name' => 'middle name', 'last_name' => 'last name',
            'membership_type' => 'type', 'joined_at' => 'joined date', 'civil_status' => 'civil status',
        ]);
        $desc = "Updated member {$member->full_name} ({$member->member_id})";
        if ($diff['description']) {
            $desc .= ' — ' . $diff['description'];
        }
        $this->logActivity('updated', $member, $desc, $diff['changes'] ?: null);

        return redirect()->route('members.show', $member)
            ->with('success', 'Member updated successfully.');
    }

    public function destroy(Member $member): RedirectResponse
    {
        $this->logActivity('deleted', $member, "Deleted member {$member->full_name} ({$member->member_id})");

        // Delete member image
        if ($member->member_image) {
            Storage::disk('public')->delete($member->member_image);
        }

        $member->delete();

        return redirect()->route('members.index')
            ->with('success', 'Member deleted successfully.');
    }
}
