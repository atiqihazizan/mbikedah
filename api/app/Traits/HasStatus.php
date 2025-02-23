<?php

namespace App\Traits;

trait HasStatus
{
  public static function getStatusList()
  {
    // return [
    //   1 => 'Draft',
    //   2 => 'Returned',
    //   3 => 'Checked',
    //   4 => 'Verified',
    //   5 => 'Approved',
    //   6 => 'Process Payment',
    //   7 => 'Paid',
    //   8 => 'Rejected',
    //   9 => 'Cancelled'
    // ];
    return [
      1 => 'Draft',
      2 => 'HOD Approval',
      3 => 'Finance Review',
      4 => 'Finance Verification',
      5 => 'Finance Approval',
      6 => 'Process Payment',
      7 => 'Paid',
      8 => 'Rejected',
      9 => 'Cancelled',
      10 => 'Returned'
    ];
  }

  public function getStatusNameAttribute()
  {
    return static::getStatusList()[$this->status_id] ?? 'Unknown';
  }

  public function getIsActiveAttribute()
  {
    return !in_array($this->status_id, [7, 8, 9]); // Paid, Rejected, Cancelled
  }

  public function canTransitionTo(int $newStatus): bool
  {
    // $allowedTransitions = [
    //     1 => [2, 3],           // Draft -> Returned, Checked
    //     2 => [3],              // Returned -> Checked
    //     3 => [2, 4],           // Checked -> Returned, Verified
    //     4 => [2, 5],           // Verified -> Returned, Approved
    //     5 => [2, 6],           // Approved -> Returned, Process Payment
    //     6 => [2, 7],           // Process Payment -> Returned, Paid
    //     7 => [],               // Paid (Terminal state)
    //     8 => [],               // Rejected (Terminal state)
    //     9 => []                // Cancelled (Terminal state)
    // ];
    $allowedTransitions = [
      1 => [2, 9],           // Draft -> Approval HOD
      2 => [3, 8, 9, 10],        // Approval HOD -> Checking Finance, Rejected
      3 => [4, 9],           // Checking Finance -> Approval Finance
      4 => [5, 8, 9, 10],        // Verify Finance -> Verified, Rejected
      5 => [6, 8, 9],        // Approval Finance -> Approved, Rejected
      6 => [7, 9],           // Approved -> Paid
      7 => [],               // Paid -> (no further transitions)
      8 => [],               // Rejected -> (no further transitions)
      9 => [],               // Cancelled -> (no further transitions)
      10 => [1]                // Returned -> (no further transitions)
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
