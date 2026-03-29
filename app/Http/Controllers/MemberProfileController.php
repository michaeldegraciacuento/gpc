<?php

namespace App\Http\Controllers;

use App\Models\Member;
use Inertia\Inertia;
use Inertia\Response;

class MemberProfileController extends Controller
{
    public function show(string $memberId): Response
    {
        $member = Member::where('member_id', $memberId)->firstOrFail();

        return Inertia::render('member-profile/Show', [
            'member' => [
                'member_id'        => $member->member_id,
                'full_name'        => $member->full_name,
                'first_name'       => $member->first_name,
                'last_name'        => $member->last_name,
                'position'         => $member->position,
                'membership_type'  => $member->membership_type,
                'status'           => $member->status,
                'email'            => $member->email,
                'phone'            => $member->phone,
                'address'          => $member->address,
                'joined_at'        => $member->joined_at?->format('F j, Y'),
                'member_image_url' => $member->member_image_url,
            ],
        ]);
    }
}
