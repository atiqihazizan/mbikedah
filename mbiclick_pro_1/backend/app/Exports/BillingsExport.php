<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class BillingsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $billings;

    public function __construct($billings)
    {
        $this->billings = $billings;
    }

    public function collection()
    {
        return $this->billings;
    }

    public function headings(): array
    {
        return [
            'Running No',
            'Project No',
            'Description',
            'Total Amount',
            'Payment Method',
            'Status',
            'Department',
            'Recipient',
            'Created By',
            'Issued Date',
            'Payment Due',
        ];
    }

    public function map($billing): array
    {
        return [
            $billing->running_no,
            $billing->no_project,
            $billing->description,
            $billing->total_amount,
            $billing->payment_method,
            $this->getStatusName($billing->status_id),
            $billing->department->name ?? '-',
            $billing->recipient->name ?? '-',
            $billing->creator->name ?? '-',
            $billing->issued_at,
            $billing->payment_due,
        ];
    }

    private function getStatusName($status_id)
    {
        $statuses = [
            1 => 'Draft',
            2 => 'Pending Review',
            3 => 'Reviewed',
            4 => 'Pending Approval',
            5 => 'Approved',
            6 => 'Process Payment',
            7 => 'Paid',
            8 => 'Rejected'
        ];

        return $statuses[$status_id] ?? 'Unknown';
    }
}
