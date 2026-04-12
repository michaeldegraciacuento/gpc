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
        .badge-in { background: #dcfce7; color: #166534; }
        .badge-out { background: #fecaca; color: #991b1b; }
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
                <td class="label">Total Transactions:</td>
                <td class="value">{{ $totalCount }}</td>
            </tr>
            <tr>
                <td class="label">Total Money In:</td>
                <td class="value" style="color: #166534;">₱{{ number_format($totalIn, 2) }}</td>
                <td class="label">Total Money Out:</td>
                <td class="value" style="color: #991b1b;">₱{{ number_format($totalOut, 2) }}</td>
            </tr>
            <tr>
                <td class="label">Net Balance:</td>
                <td class="value" style="color: {{ $netBalance >= 0 ? '#166534' : '#991b1b' }};">₱{{ number_format($netBalance, 2) }}</td>
                <td></td>
                <td></td>
            </tr>
        </table>
    </div>

    @if(count($byType) > 0)
    <h2>Summary by Type</h2>
    <table class="data">
        <thead>
            <tr><th>Type</th><th class="text-center">Count</th><th class="text-right">Total</th></tr>
        </thead>
        <tbody>
            @foreach($byType as $row)
            <tr>
                <td>{{ $row['type'] }}</td>
                <td class="text-center">{{ $row['count'] }}</td>
                <td class="text-right">₱{{ number_format($row['total'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(count($byCategory) > 0)
    <h2>Summary by Category</h2>
    <table class="data">
        <thead>
            <tr><th>Category</th><th class="text-center">Type</th><th class="text-center">Count</th><th class="text-right">Total</th></tr>
        </thead>
        <tbody>
            @foreach($byCategory as $row)
            <tr>
                <td>{{ $row['category'] }}</td>
                <td class="text-center"><span class="badge badge-{{ $row['type'] }}">{{ $row['type'] === 'in' ? 'IN' : 'OUT' }}</span></td>
                <td class="text-center">{{ $row['count'] }}</td>
                <td class="text-right">₱{{ number_format($row['total'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(count($transactions) > 0)
    <h2>Transaction Details</h2>
    <table class="data">
        <thead>
            <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Member</th>
                <th>Recorded By</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $t)
            <tr>
                <td>{{ \Carbon\Carbon::parse($t->transaction_date)->format('M d, Y') }}</td>
                <td><span class="badge badge-{{ $t->type }}">{{ $t->type === 'in' ? 'IN' : 'OUT' }}</span></td>
                <td>{{ $t->category }}</td>
                <td>{{ $t->description }}</td>
                <td>{{ $t->member ? $t->member->member_id . ' — ' . $t->member->full_name : '—' }}</td>
                <td>{{ $t->recorder ? $t->recorder->name : '—' }}</td>
                <td class="text-right" style="color: {{ $t->type === 'in' ? '#166534' : '#991b1b' }};">₱{{ number_format($t->amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="font-weight: bold; border-top: 2px solid #166534;">
                <td colspan="6" class="text-right" style="padding-top: 8px;">Net Balance:</td>
                <td class="text-right" style="padding-top: 8px; color: {{ $netBalance >= 0 ? '#166534' : '#991b1b' }};">₱{{ number_format($netBalance, 2) }}</td>
            </tr>
        </tfoot>
    </table>
    @endif

    <div class="footer">Gitagum Pickleball Club &bull; Confidential Report</div>
</body>
</html>
