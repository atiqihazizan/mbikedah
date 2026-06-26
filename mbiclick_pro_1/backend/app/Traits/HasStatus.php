<?php

namespace App\Traits;

use App\Constants\BillingStatus;

trait HasStatus
{
  public function getStatusNameAttribute()
  {
    return BillingStatus::getStatusName($this->status_id) ?? 'Unknown';
  }

  public function getIsActiveAttribute()
  {
    return !BillingStatus::isFinal($this->status_id);
  }

  public function canTransitionTo(int $newStatus): bool
  {
    $allowedTransitions = [
      BillingStatus::PREPARED => [BillingStatus::DRAFT, BillingStatus::CANCELLED],
      BillingStatus::DRAFT => [BillingStatus::HOD_APPROVAL, BillingStatus::FINANCE_REVIEW, BillingStatus::CANCELLED],
      BillingStatus::HOD_APPROVAL => [BillingStatus::FINANCE_REVIEW, BillingStatus::REJECTED, BillingStatus::RETURNED],
      BillingStatus::FINANCE_REVIEW => [BillingStatus::FINANCE_VERIFY, BillingStatus::REJECTED, BillingStatus::RETURNED],
      BillingStatus::FINANCE_VERIFY => [BillingStatus::FINANCE_APPROVAL, BillingStatus::REJECTED, BillingStatus::RETURNED],
      BillingStatus::FINANCE_APPROVAL => [BillingStatus::PROCESSING_PAYMENT, BillingStatus::REJECTED, BillingStatus::CANCELLED],
      BillingStatus::PROCESSING_PAYMENT => [BillingStatus::COMPLETED, BillingStatus::CANCELLED],
      BillingStatus::REJECTED => [],
      BillingStatus::CANCELLED => [],
      BillingStatus::RETURNED => [BillingStatus::DRAFT, BillingStatus::HOD_APPROVAL, BillingStatus::CANCELLED],
      BillingStatus::COMPLETED => []
    ];

    return in_array($newStatus, $allowedTransitions[$this->status_id] ?? []);
  }

  public function updateStatus(int $newStatus, ?int $updatedBy = null, ?string $remarks = null, ?array $transactions = null): bool
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
        'remarks' => $remarks,
        'status_name' => BillingStatus::getNameStatus($newStatus)
      ]);
    }

    return true;
  }

  public function getCurrentStatusAttribute()
  {
    $canTransition = count($this->getPossibleTransitions()) > 0;
    return BillingStatus::getCurrentStatusWithContext($this->status_id, $canTransition);
  }

  public function getPossibleTransitions()
  {
    $allStatuses = [
      BillingStatus::PREPARED,
      BillingStatus::DRAFT,
      BillingStatus::HOD_APPROVAL,
      BillingStatus::FINANCE_REVIEW,
      BillingStatus::FINANCE_VERIFY,
      BillingStatus::FINANCE_APPROVAL,
      BillingStatus::PROCESSING_PAYMENT,
      BillingStatus::COMPLETED,
      BillingStatus::REJECTED,
      BillingStatus::RETURNED,
      BillingStatus::CANCELLED
    ];

    return array_filter($allStatuses, fn($status) => $this->canTransitionTo($status));
  }

  /**
   * Get current status information with context
   */
  public function getStatusInfoAttribute()
  {
    $canTransition = count($this->getPossibleTransitions()) > 0;
    
    return [
      'id' => $this->status_id,
      'name' => BillingStatus::getNameStatus($this->status_id),
      'display_status' => BillingStatus::getCurrentStatusWithContext($this->status_id, $canTransition),
      'next_action' => BillingStatus::getNextActions($this->status_id),
      'color' => BillingStatus::getStatusColor($this->status_id),
      'is_final' => BillingStatus::isFinal($this->status_id),
      'is_editable' => BillingStatus::isEditable($this->status_id),
      'can_transition' => $canTransition,
      'possible_transitions' => $this->getPossibleTransitions()
    ];
  }
}