<?php

namespace App\Constants;

class BillingStatus
{
    const DRAFT = 1;
    const HOD_APPROVAL = 2;
    const FINANCE_REVIEW = 3;
    const FINANCE_VERIFY = 4;
    const FINANCE_APPROVAL = 5;
    const PROCESSING_PAYMENT = 6;
    const PAID = 7;
    const COMPLETED = 8;
    const REJECTED = 9;
    const RETURNED = 10;
    const CANCELLED = 11;

    public static function getStatusName($statusId)
    {
        return match ($statusId) {
            self::DRAFT => 'Draft',
            self::HOD_APPROVAL => 'HOD Approval',
            self::FINANCE_REVIEW => 'Finance Review',
            self::FINANCE_VERIFY => 'Finance Verification',
            self::FINANCE_APPROVAL => 'Finance Approval',
            self::PROCESSING_PAYMENT => 'Processing Payment',
            self::PAID => 'Paid',
            self::COMPLETED => 'Completed',
            self::REJECTED => 'Rejected',
            self::RETURNED => 'Returned',
            self::CANCELLED => 'Cancelled',
            default => 'Unknown Status'
        };
    }

    public static function getAllStatuses()
    {
        return [
            self::DRAFT => self::getStatusName(self::DRAFT),
            self::HOD_APPROVAL => self::getStatusName(self::HOD_APPROVAL),
            self::FINANCE_REVIEW => self::getStatusName(self::FINANCE_REVIEW),
            self::FINANCE_VERIFY => self::getStatusName(self::FINANCE_VERIFY),
            self::FINANCE_APPROVAL => self::getStatusName(self::FINANCE_APPROVAL),
            self::PROCESSING_PAYMENT => self::getStatusName(self::PROCESSING_PAYMENT),
            self::PAID => self::getStatusName(self::PAID),
            self::COMPLETED => self::getStatusName(self::COMPLETED),
            self::REJECTED => self::getStatusName(self::REJECTED),
            self::RETURNED => self::getStatusName(self::RETURNED),
            self::CANCELLED => self::getStatusName(self::CANCELLED)
        ];
    }
}
