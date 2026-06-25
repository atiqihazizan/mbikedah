<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Billings Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Billings Report</h2>
        <p>Generated on: {{ date('Y-m-d H:i:s') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Running No</th>
                <th>Project No</th>
                <th>Description</th>
                <th>Total Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Department</th>
                <th>Recipient</th>
                <th>Issue Date</th>
                <th>Due Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($billings as $billing)
            <tr>
                <td>{{ $billing->running_no }}</td>
                <td>{{ $billing->no_project }}</td>
                <td>{{ $billing->description }}</td>
                <td>{{ number_format($billing->total_amount, 2) }}</td>
                <td>{{ $billing->payment_method }}</td>
                <td>{{ $billing->status_id }}</td>
                <td>{{ $billing->department->name ?? '-' }}</td>
                <td>{{ $billing->recipient->name ?? '-' }}</td>
                <td>{{ $billing->issued_at }}</td>
                <td>{{ $billing->payment_due }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This is a computer generated document. No signature is required.</p>
    </div>
</body>
</html>
