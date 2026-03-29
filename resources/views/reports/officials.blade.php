<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 11px; color: #333; margin: 0; padding: 20px; }
        h2 { color: #166534; font-size: 14px; margin: 20px 0 8px 0; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        table.data { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table.data th { background-color: #166534; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        table.data td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
        table.data tr:nth-child(even) { background-color: #f9fafb; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .summary-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 12px; margin-bottom: 16px; }
        .summary-box table td { padding: 3px 10px; font-size: 11px; border: none; }
        .summary-box .label { color: #555; font-weight: normal; }
        .summary-box .value { color: #166534; font-weight: bold; text-align: right; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .badge-officer { background: #166534; color: #fff; }
        .badge-member { background: #e5e7eb; color: #6b7280; }
        .badge-active { background: #dcfce7; color: #166534; }
        .badge-inactive { background: #e5e7eb; color: #6b7280; }
        .badge-suspended { background: #fecaca; color: #991b1b; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #999; padding: 10px 20px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    @include('reports.partials.header', ['title' => $title])

    <div class="summary-box">
        <table width="100%">
            <tr>
                <td class="label">Total Members:</td>
                <td class="value">{{ $totalMembers }}</td>
                <td class="label">Officers:</td>
                <td class="value">{{ $officerCount }}</td>
                <td class="label">Regular Members:</td>
                <td class="value">{{ $regularCount }}</td>
            </tr>
        </table>
    </div>

    @if($officers->isNotEmpty())
    <h2>Club Officers</h2>
    <table class="data">
        <thead>
            <tr>
                <th style="width: 30px;">#</th>
                <th>Position</th>
                <th>Member ID</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($officers as $i => $member)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td><span class="badge badge-officer">{{ $positionLabels[$member->position] ?? ucfirst($member->position) }}</span></td>
                <td>{{ $member->member_id }}</td>
                <td><strong>{{ $member->full_name }}</strong></td>
                <td>{{ $member->phone ?? '—' }}</td>
                <td>{{ $member->email ?? '—' }}</td>
                <td class="text-center"><span class="badge badge-{{ $member->status }}">{{ ucfirst($member->status) }}</span></td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <h2>Members</h2>
    <table class="data">
        <thead>
            <tr>
                <th style="width: 30px;">#</th>
                <th>Member ID</th>
                <th>Full Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th class="text-center">Status</th>
                <th>Joined</th>
            </tr>
        </thead>
        <tbody>
            @forelse($regularMembers as $i => $member)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td>{{ $member->member_id }}</td>
                <td>{{ $member->full_name }}</td>
                <td>{{ $member->phone ?? '—' }}</td>
                <td>{{ $member->email ?? '—' }}</td>
                <td class="text-center"><span class="badge badge-{{ $member->status }}">{{ ucfirst($member->status) }}</span></td>
                <td>{{ $member->joined_at ? $member->joined_at->format('M d, Y') : '—' }}</td>
            </tr>
            @empty
            <tr><td colspan="7" class="text-center" style="padding: 20px; color: #999;">No regular members found.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Gitagum Pickleball Club &mdash; Officials & Members Directory &mdash; Generated {{ now()->format('F d, Y') }}
    </div>
</body>
</html>
