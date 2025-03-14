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
  const COMPLETED = 7;
  const REJECTED = 8;
  const RETURNED = 9;
  const CANCELLED = 10;
  // const PAID = 7;

  public static function getStatusName($statusId)
  {
    return match ($statusId) {
      self::DRAFT => 'Draf',
      self::HOD_APPROVAL => 'Kelulusan HOD',
      self::FINANCE_REVIEW => 'Semakan Kewangan',
      self::FINANCE_VERIFY => 'Pengesahan Kewangan',
      self::FINANCE_APPROVAL => 'Kelulusan Kewangan',
      self::PROCESSING_PAYMENT => 'Memproses Pembayaran',
      self::COMPLETED => 'Selesai',
      self::REJECTED => 'Ditolak',
      self::RETURNED => 'Dikembalikan',
      self::CANCELLED => 'Dibatalkan',
      default => 'Status Tidak Diketahui'
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
      self::COMPLETED => self::getStatusName(self::COMPLETED),
      self::REJECTED => self::getStatusName(self::REJECTED),
      self::RETURNED => self::getStatusName(self::RETURNED),
      self::CANCELLED => self::getStatusName(self::CANCELLED)
    ];
  }

  // private function getStatusName($status_id) {
  //   $statuses = [
  //     BillingStatus::DRAFT => 'Dalam Proses',
  //     BillingStatus::HOD_APPROVAL => 'HOD Approval',
  //     BillingStatus::FINANCE_REVIEW => 'Finance Review',
  //     BillingStatus::FINANCE_VERIFY => 'Finance Verify',
  //     BillingStatus::FINANCE_APPROVAL => 'Finance Approval',
  //     BillingStatus::PROCESSING_PAYMENT => 'Proses Pembayaran',
  //     BillingStatus::REJECTED => 'Ditolak',
  //     BillingStatus::CANCELLED => 'Dibatalkan',
  //     BillingStatus::RETURNED => 'Dikembalikan',
  //     BillingStatus::COMPLETED => 'Selesai'
  //   ];

  //   return $statuses[$status_id] ?? 'Unknown Status';
  // }
}
