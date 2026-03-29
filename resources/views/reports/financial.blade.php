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
        .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .badge-paid { background: #dcfce7; color: #166534; }
        .badge-pending { background: #fef3c7; color: #92400e; }
        .badge-cancelled { background: #fecaca; color: #991b1b; }
        .page-break { page-break-after: always; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #999; padding: 10px 20px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    @include('reports.partials.header', ['title' => $title])

    <div class="summary-box">
        <table width="100%">
            <tr>
                <td class="label">Report Period:</td>
                <td class="value">{{ $periodLabel }}</td>
                <td class="label">Total Collected:</td>
                <td class="value">₱{{ number_format($totalCollected, 2) }}</td>
            </tr>
            <tr>
                <td class="label">Total Payments:</td>
                <td class="value">{{ $totalPayments }}</td>
                <td class="label">Pending Amount:</td>
                <td class="value">₱{{ number_format($pendingAmount, 2) }}</td>
            </tr>
        </table>
    </div>

    @if(count($byType) > 0)
    <h2>Collections by Payment Type</h2>
    <table class="data">
        <thead>
            <tr><th>Payment Type</th><th class="text-center">Count</th><th class="text-right">Total Collected</th></tr>
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

    @if(count($byMethod) > 0)
    <h2>Collections by Payment Method</h2>
    <table class="data">
        <thead>
            <tr><th>Method</th><th class="text-center">Count</th><th class="text-right">Total</th></tr>
        </thead>
        <tbody>
            @foreach($byMethod as $row)
            <tr>
                <td>{{ $row['method'] }}</td>
                <td class="text-center">{{ $row['count'] }}</td>
                <td class="text-right">₱{{ number_format($row['total'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(count($payments) > 0)
    <h2>Payment Transactions</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Date</th>
                <th>OR #</th>
                <th>Member</th>
                <th>Type</th>
                <th>Method</th>
                <th class="text-center">Status</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($payments as $p)
            <tr>
                <td>{{ \Carbon\Carbon::parse($p->payment_date)->format('M d, Y') }}</td>
                <td>{{ $p->or_number ?? '—' }}</td>
                <td>{{ $p->member->member_id }} — {{ $p->member->full_name }}</td>
                <td>{{ $p->paymentType->name }}</td>
                <td>{{ ucfirst(str_replace('_', ' ', $p->payment_method)) }}</td>
                <td class="text-center"><span class="badge badge-{{ $p->status }}">{{ ucfirst($p->status) }}</span></td>
                <td class="text-right">₱{{ number_format($p->amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer">Gitagum Pickleball Club &bull; Confidential Report</div>
</body>
</html>
