<div style="width: 170px; margin-left: -25px; font-family: 'Courier New', Courier, monospace; font-size: 10px; border: 1px dashed #888; padding: 4px 2px 2px 2px; background: #fff;">
    <div style="text-align: center; margin-bottom: 10px; margin-top: 10px;">
        <img src="{{ public_path('image/gpc.png') }}" alt="GPC Logo" width="22" height="22" style="margin-bottom: 1px;" />
        <div style="font-weight: bold; font-size: 10px; color: #166534; margin-bottom: 0;">Gitagum Pickleball Club</div>
        <div style="font-size: 8px; color: #555; margin-bottom: 1px;">PAYMENT RECEIPT</div>
    </div>
    <hr style="margin: 3px 0; border: none; border-top: 1px dashed #888;">
    <table style="width: 100%; margin-bottom: 4px;">
        <tr>
            <td><b>PR No.</b></td>
            <td style="text-align:right;">{{ $payment->payment_receipt_number }}</td>
        </tr> 
        <tr>
            <td><b>Date</b></td>
            <td style="text-align:right;">{{ $payment->payment_date->format('M d, Y') }}</td>
        </tr>
        <tr>
            <td><b>Member</b></td>
            <td style="text-align:right; white-space:nowrap;">{{ \Illuminate\Support\Str::limit($payment->member->full_name, 14) }}</td>
        </tr>
        <tr>
            <td><b>ID</b></td>
            <td style="text-align:right;">{{ $payment->member->member_id }}</td>
        </tr>
        <tr>
            <td><b>Type</b></td>
            <td style="text-align:right; white-space:nowrap;">{{ \Illuminate\Support\Str::limit($payment->paymentType->name, 12) }}</td>
        </tr>
        <tr>
            <td><b>Amount</b></td>
            <td style="text-align:right;">₱{{ number_format($payment->amount, 2) }}</td>
        </tr>
        <tr>
            <td><b>Method</b></td>
            <td style="text-align:right;">{{ ucfirst($payment->payment_method) }}</td>
        </tr>
        @if($payment->billing_period)
        <tr>
            <td><b>Period</b></td>
            <td style="text-align:right;">{{ $payment->billing_period }}</td>
        </tr>
        @endif
        <tr>
            <td><b>Status</b></td>
            <td style="text-align:right;">{{ ucfirst($payment->status) }}</td>
        </tr>
    </table>
    <br><br>
    <div style="margin-top: 7px; text-align: center; font-size: 9px; color: #555;">
        <em>Recorded by: {{ \Illuminate\Support\Str::limit($payment->recorder->name ?? 'N/A', 18) }}</em>
    </div>
    <div style="text-align: center; font-size: 8px; color: #aaa; margin-top: 2px;">Thank you for your payment!</div>
</div>
