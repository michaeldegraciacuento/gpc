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
        .summary-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 12px; margin-bottom: 16px; }
        .summary-box table td { padding: 3px 10px; font-size: 11px; border: none; }
        .summary-box .label { color: #555; font-weight: normal; }
        .summary-box .value { color: #166534; font-weight: bold; text-align: right; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .info-grid { margin-bottom: 16px; }
        .info-grid td { padding: 3px 10px; font-size: 11px; }
        .info-grid .label { color: #888; width: 120px; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .badge-paid { background: #dcfce7; color: #166534; }
        .badge-pending { background: #fef3c7; color: #92400e; }
        .badge-cancelled { background: #fecaca; color: #991b1b; }
        .badge-active { background: #dcfce7; color: #166534; }
        .badge-inactive { background: #e5e7eb; color: #6b7280; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #999; padding: 10px 20px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    @include('reports.partials.header', ['title' => $title])

    <table class="info-grid">
        <tr>
            <td class="label">Member ID:</td>
            <td><strong>{{ $member->member_id }}</strong></td>
            <td class="label">Status:</td>
            <td><span class="badge badge-{{ $member->status }}">{{ ucfirst($member->status) }}</span></td>
        </tr>
        <tr>
            <td class="label">Full Name:</td>
            <td><strong>{{ $member->full_name }}</strong></td>
            <td class="label">Member Since:</td>
            <td>{{ $member->joined_at ? $member->joined_at->format('M d, Y') : '—' }}</td>
        </tr>
        <tr>
            <td class="label">Phone:</td>
            <td>{{ $member->phone ?? '—' }}</td>
            <td class="label">Email:</td>
            <td>{{ $member->email ?? '—' }}</td>
        </tr>
        <tr>
            <td class="label">Address:</td>
            <td colspan="3">{{ $member->address ?? '—' }}</td>
        </tr>
    </table>

    <div class="summary-box">
        <table width="100%">
            <tr>
                <td class="label">Total Payments:</td>
                <td class="value">{{ $totalPayments }}</td>
                <td class="label">Total Paid:</td>
                <td class="value">₱{{ number_format($totalPaid, 2) }}</td>
            </tr>
            <tr>
                <td class="label">Pending:</td>
                <td class="value">{{ $pendingCount }}</td>
                <td class="label">Pending Amount:</td>
                <td class="value">₱{{ number_format($pendingAmount, 2) }}</td>
            </tr>
            <tr>
                <td class="label">Outstanding Dues:</td>
                <td class="value">{{ count($outstandingDues) }} item(s)</td>
                <td class="label">Outstanding Amount:</td>
                <td class="value" style="color: {{ $totalOutstanding > 0 ? '#991b1b' : '#166534' }};">₱{{ number_format($totalOutstanding, 2) }}</td>
            </tr>
        </table>
    </div>

    @if(count($byType) > 0)
    <h2>Summary by Payment Type</h2>
    <table class="data">
        <thead>
            <tr><th>Payment Type</th><th class="text-center">Count</th><th class="text-right">Total Paid</th></tr>
        </thead>
        <tbody>
            @foreach($byType as $row)
            <tr>
                <td>{{ $row['name'] }}</td>
                <td class="text-center">{{ $row['count'] }}</td>
                <td class="text-right">₱{{ number_format($row['total'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(count($outstandingDues) > 0)
    <h2>Outstanding Dues</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Due Type</th>
                <th>Billing Cycle</th>
                <th>Period</th>
                <th class="text-center">Status</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($outstandingDues as $due)
            <tr>
                <td>{{ $due['payment_type_name'] }}</td>
                <td>{{ $due['billing_cycle'] }}</td>
                <td>{{ $due['billing_period_label'] }}</td>
                <td class="text-center"><span class="badge badge-cancelled">Unpaid</span></td>
                <td class="text-right">₱{{ number_format($due['amount'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="font-weight: bold; border-top: 2px solid #166534;">
                <td colspan="4" class="text-right" style="padding-top: 8px;">Total Outstanding:</td>
                <td class="text-right" style="padding-top: 8px; color: #991b1b;">₱{{ number_format($totalOutstanding, 2) }}</td>
            </tr>
        </tfoot>
    </table>
    @endif

    <h2>Payment History</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Date</th>
                <th>OR #</th>
                <th>Type</th>
                <th>Period</th>
                <th>Method</th>
                <th class="text-center">Status</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @forelse($payments as $p)
            <tr>
                <td>{{ \Carbon\Carbon::parse($p->payment_date)->format('M d, Y') }}</td>
                <td>{{ $p->or_number ?? '—' }}</td>
                <td>{{ $p->paymentType->name }}</td>
                <td>{{ $p->billing_period ? (strlen($p->billing_period) === 4 ? $p->billing_period : \Carbon\Carbon::createFromFormat('Y-m', $p->billing_period)->format('M Y')) : '—' }}</td>
                <td>{{ ucfirst(str_replace('_', ' ', $p->payment_method)) }}</td>
                <td class="text-center"><span class="badge badge-{{ $p->status }}">{{ ucfirst($p->status) }}</span></td>
                <td class="text-right">₱{{ number_format($p->amount, 2) }}</td>
            </tr>
            @empty
            <tr><td colspan="7" class="text-center" style="padding: 20px; color: #999;">No payments recorded.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">Gitagum Pickleball Club &bull; Confidential Report</div>
</body>
</html>
