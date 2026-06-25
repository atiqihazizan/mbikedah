<?php

namespace App\Constants;

class BillingStatus
{
  // Add missing PREPARED constant for status 0
  const PREPARED = 0;
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

  public static function getStatusName($statusId)
  {
    return match ($statusId) {
      self::PREPARED => 'Dalam Penyediaan',
      self::DRAFT => 'Draf',
      self::HOD_APPROVAL => 'Menunggu Kelulusan',
      self::FINANCE_REVIEW => 'Semakan Kewangan',
      self::FINANCE_VERIFY => 'Pengesahan Kewangan',
      self::FINANCE_APPROVAL => 'Kelulusan Kewangan',
      self::PROCESSING_PAYMENT => 'Diproses',
      self::COMPLETED => 'Permohonan Dibayar',
      self::REJECTED => 'Ditolak',
      self::RETURNED => 'Dikembalikan',
      self::CANCELLED => 'Dibatalkan',
      default => 'Status Tidak Diketahui'
    };
  }

  public static function getNameStatus($statusId)
  {
    return match ($statusId) {
      self::PREPARED => 'Disediakan',
      self::DRAFT => 'Mula Mohon',
      self::HOD_APPROVAL => 'Kelulusan HOD',
      self::FINANCE_REVIEW => 'Semakan Kewangan',
      self::FINANCE_VERIFY => 'Pengesahan Kewangan',
      self::FINANCE_APPROVAL => 'Kelulusan Kewangan',
      self::PROCESSING_PAYMENT => 'Proses Pembayaran',
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
      self::PREPARED => self::getStatusName(self::PREPARED),
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

  public static function getTransitionStatus($oldStatus, $newStatus)
  {
    $transition = $oldStatus . '_' . $newStatus;

    return match ($transition) {
      // Normal flow transitions
      '0_1' => 'Mula Mohon',
      '1_2' => 'Hantar ke Ketua Jabatan',
      '2_3' => 'Ketua Jabatan Lulus',
      '3_4' => 'Kewangan Disemak',
      '4_5' => 'Kewangan Disahkan',
      '5_6' => 'Kelulusan Kewangan',
      '6_7' => 'Permohonan Selesai',

      // Rejection scenarios
      '1_8' => 'Ditolak oleh Ketua Jabatan',
      '2_8' => 'Ditolak oleh Ketua Jabatan',
      '3_8' => 'Ditolak oleh Kewangan',
      '4_8' => 'Ditolak dalam Pengesahan',
      '5_8' => 'Ditolak dalam Kelulusan',

      // Return scenarios
      '2_9' => 'Dikembalikan untuk Pembetulan',
      '3_9' => 'Dikembalikan oleh Kewangan',
      '4_9' => 'Dikembalikan untuk Semakan',
      '5_9' => 'Dikembalikan untuk Kelulusan',

      // Cancel scenarios
      '0_10' => 'Dibatalkan',
      '1_10' => 'Dibatalkan',
      '2_10' => 'Dibatalkan',
      '3_10' => 'Dibatalkan',
      '4_10' => 'Dibatalkan',
      '5_10' => 'Dibatalkan',

      default => self::getNameStatus($newStatus)
    };
  }

  public static function getCurrentStatusWithContext($statusId, $canTransition = true)
  {
    // Final states - show definitive status
    if (in_array($statusId, [self::COMPLETED, self::REJECTED, self::CANCELLED])) {
      return match ($statusId) {
        self::COMPLETED => 'Permohonan Selesai',
        self::REJECTED => 'Permohonan Ditolak',
        self::CANCELLED => 'Permohonan Dibatalkan',
        default => self::getNameStatus($statusId)
      };
    }

    // Active states - show waiting status based on transition capability
    if (!$canTransition) {
      return self::getNameStatus($statusId);
    }

    return match ($statusId) {
      self::PREPARED => 'Dalam Penyediaan',
      self::DRAFT => 'Tunggu Hantar ke Ketua Jabatan',
      self::HOD_APPROVAL => 'Tunggu Kelulusan Ketua Jabatan',
      self::FINANCE_REVIEW => 'Tunggu Semakan Kewangan',
      self::FINANCE_VERIFY => 'Tunggu Pengesahan Kewangan',
      self::FINANCE_APPROVAL => 'Tunggu Kelulusan Kewangan',
      self::PROCESSING_PAYMENT => 'Tunggu Proses Pembayaran',
      self::RETURNED => 'Perlu Tindakan Pembetulan',
      default => self::getNameStatus($statusId)
    };
  }

  /**
   * Get next possible actions based on current status
   */
  public static function getNextActions($statusId)
  {
    return match ($statusId) {
      self::PREPARED => 'Lengkapkan maklumat dan hantar permohonan',
      self::DRAFT => 'Menunggu tindakan Ketua Jabatan',
      self::HOD_APPROVAL => 'Menunggu tindakan Bahagian Kewangan',
      self::FINANCE_REVIEW => 'Menunggu pengesahan Bahagian Kewangan',
      self::FINANCE_VERIFY => 'Menunggu kelulusan Bahagian Kewangan',
      self::FINANCE_APPROVAL => 'Menunggu proses pembayaran',
      self::PROCESSING_PAYMENT => 'Menunggu pembayaran selesai',
      self::RETURNED => 'Buat pembetulan dan hantar semula',
      self::COMPLETED => 'Permohonan telah selesai',
      self::REJECTED => 'Permohonan telah ditolak',
      self::CANCELLED => 'Permohonan telah dibatalkan',
      default => 'Tiada tindakan diperlukan'
    };
  }

  /**
   * Check if status is editable
   */
  public static function isEditable($statusId)
  {
    return in_array($statusId, [self::PREPARED, self::DRAFT, self::RETURNED]);
  }

  /**
   * Check if status is final (cannot transition further)
   */
  public static function isFinal($statusId)
  {
    return in_array($statusId, [self::COMPLETED, self::REJECTED, self::CANCELLED]);
  }

  /**
   * Get status color for frontend display
   */
  public static function getStatusColor($statusId)
  {
    return match ($statusId) {
      self::PREPARED => 'gray',
      self::DRAFT => 'blue',
      self::HOD_APPROVAL => 'yellow',
      self::FINANCE_REVIEW => 'orange',
      self::FINANCE_VERIFY => 'purple',
      self::FINANCE_APPROVAL => 'indigo',
      self::PROCESSING_PAYMENT => 'teal',
      self::COMPLETED => 'green',
      self::REJECTED => 'red',
      self::RETURNED => 'amber',
      self::CANCELLED => 'gray',
      default => 'gray'
    };
  }
}