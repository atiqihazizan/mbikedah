<?php

// Backup the original HasStatus.php file
// Backup created on 2025-03-13

namespace App\Traits;

use App\Constants\BillingStatus;

trait HasStatus
{
  public static function getStatusList()
  {
    return [
      BillingStatus::DRAFT => 'Draft',
      BillingStatus::HOD_APPROVAL => 'HOD Approval',
      BillingStatus::FINANCE_REVIEW => 'Finance Review',
      BillingStatus::FINANCE_VERIFY => 'Finance Verification',
      BillingStatus::FINANCE_APPROVAL => 'Finance Approval',
      BillingStatus::PROCESSING_PAYMENT => 'Process Payment',
      BillingStatus::REJECTED => 'Rejected',
      BillingStatus::CANCELLED => 'Cancelled',
      BillingStatus::RETURNED => 'Returned',
      BillingStatus::COMPLETED => 'Complete',
    ];
  }

  public function getStatusNameAttribute()
  {
    return static::getStatusList()[$this->status_id] ?? 'Unknown';
  }

  public function getIsActiveAttribute()
  {
    return !in_array($this->status_id, [BillingStatus::COMPLETED, BillingStatus::REJECTED, BillingStatus::CANCELLED]); 
  }

  public function canTransitionTo(int $newStatus): bool
  {
    $allowedTransitions = [
      BillingStatus::DRAFT => [BillingStatus::HOD_APPROVAL, BillingStatus::CANCELLED], 
      BillingStatus::HOD_APPROVAL => [BillingStatus::FINANCE_REVIEW, BillingStatus::REJECTED, BillingStatus::RETURNED], 
      BillingStatus::FINANCE_REVIEW => [BillingStatus::FINANCE_VERIFY, BillingStatus::CANCELLED], 
      BillingStatus::FINANCE_VERIFY => [BillingStatus::FINANCE_APPROVAL, BillingStatus::REJECTED, BillingStatus::RETURNED], 
      BillingStatus::FINANCE_APPROVAL => [BillingStatus::PROCESSING_PAYMENT, BillingStatus::REJECTED, BillingStatus::CANCELLED], 
      BillingStatus::PROCESSING_PAYMENT => [BillingStatus::COMPLETED], 
      BillingStatus::REJECTED => [], 
      BillingStatus::CANCELLED => [], 
      BillingStatus::RETURNED => [BillingStatus::DRAFT,BillingStatus::HOD_APPROVAL,BillingStatus::CANCELLED], 
      BillingStatus::COMPLETED => [] 
    ];

    return in_array($newStatus, $allowedTransitions[$this->status_id] ?? []);
  }

  public function updateStatus(int $newStatus, ?int $updatedBy = null, ?string $remarks = null): bool
  {
    if (!$this->canTransitionTo($newStatus)) {
      return false;
    }

    $oldStatus = $this->status_id;
    $this->status_id = $newStatus;
    $this->save();

    // Create history record if the model uses it
    if (method_exists($this, 'history')) {
      $this->history()->create([
        'old_status' => $oldStatus,
        'new_status' => $newStatus,
        'created_by' => $updatedBy,
        'remarks' => $remarks
      ]);
    }

    return true;
  }
}
