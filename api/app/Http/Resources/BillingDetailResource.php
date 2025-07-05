<?php

namespace App\Http\Resources;

use App\Constants\BillingStatus;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

class BillingDetailResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'running_no' => $this->running_no,
      'description' => $this->description,
      'no_project' => $this->no_project,
      'total_amount' => $this->total_amount,
      'payment_method' => $this->payment_method,
      'status_id' => $this->status_id,
      'status_name' => $this->status_name,
      'department_id' => $this->department_id,
      'recipient_id' => $this->recipient_id,
      'department' => $this->department ? $this->department->name : null,
      'recipient' => $this->recipient ? $this->recipient->name : null,
      'creator' => [
        'id' => $this->created_by,
        'name' => $this->creator ? $this->creator->name : null,
        'abilities' => $this->creator ? $this->creator->abilities : null,
        'position' => $this->creator ? $this->creator->position?->name : null
      ],
      'created_at' => $this->created_at,
      'issued_at' => $this->issued_at,
      'payment_due' => $this->payment_due,
      'is_archived' => $this->is_archived,
      'print_count' => $this->print_count,
      'last_printed_at' => $this->last_printed_at,
      'last_printed_by_name' => $this->lastPrintedBy ? $this->lastPrintedBy->name : null,
      'hod_approved_at' => $this->hod_approved_at,
      'reviewed_at' => $this->reviewed_at,
      'verified_at' => $this->verified_at,
      'verified_by' => $this->verified_by,
      'approved_at' => $this->approved_at,
      'paid_at' => $this->paid_at,
      'ceo_approved' => $this->ceo_approved,

      // Enhanced current status information
      'current_status' => [
        'id' => $this->status_id,
        'stage' => BillingStatus::getNameStatus($this->status_id),
        'status' => BillingStatus::getCurrentStatusWithContext($this->status_id, count($this->getPossibleTransitions()) > 0),
        'next_action' => BillingStatus::getNextActions($this->status_id),
        'color' => BillingStatus::getStatusColor($this->status_id),
        'is_final' => BillingStatus::isFinal($this->status_id),
        'is_editable' => BillingStatus::isEditable($this->status_id),
        'can_transition' => count($this->getPossibleTransitions()) > 0,
        'possible_actions' => $this->getPossibleTransitions()
      ],

      'details' => $this->details->map(function ($detail) {
        return [
          'id' => $detail->id,
          'description' => $detail->description,
          'budget_code' => $detail->budget_code,
          'budget_id' => $detail->budget_id,
          'price' => $detail->price,
          'quantity' => $detail->quantity,
          'reference' => $detail->reference,
          'total' => $detail->total,
          'accept' => $detail->accept,
          'approve' => $detail->approve,
          'reviewed_by' => $detail->reviewed_by,
          'budget_bal' => $detail->budget ? $detail->budget->bdgtotal : 0,
          'budget_name' => $detail->budget ? $detail->budget->name : null,
        ];
      }),

      // Enhanced history with better formatting
      'history' => $this->history->map(function ($history) {
        $transitionStatus = BillingStatus::getTransitionStatus($history->old_status, $history->new_status);
        $isFinal = BillingStatus::isFinal($history->new_status);
        
        return [
          'id' => $history->id,
          'tarikh' => $history->created_at->format('d M, H:i'),
          'stage_sekarang' => BillingStatus::getNameStatus($history->new_status),
          'status' => $transitionStatus,
          'catatan' => $history->remarks ?: '-',
          'oleh' => $history->creator ? $history->creator->name : 'System',
          'jawatan' => $history->creator ? $history->creator->position?->name : null,
          'old_stage' => BillingStatus::getNameStatus($history->old_status),
          'is_final' => $isFinal,
          'status_color' => BillingStatus::getStatusColor($history->new_status),
          'created_at_full' => $history->created_at->format('Y-m-d H:i:s'),
          // Additional context for frontend
          'transition_type' => $this->getTransitionType($history->old_status, $history->new_status)
        ];
      }),

      'transactions' => $this->transactions->map(function ($transaction) {
        return [
          'id' => $transaction->id,
          'bank_id' => $transaction->bank_id,
          'amount' => $transaction->amount,
          'bank_name' => $transaction->bank ? $transaction->bank->bank_name : null,
          'balance' => $transaction->bank ? $transaction->bank->amount : null,
          'created_at' => $transaction->created_at,
          'paid_date' => $transaction->paid_date,
          'paid_ref' => $transaction->paid_ref,
        ];
      }),

      // Summary information for quick reference
      'summary' => [
        'total_history_entries' => $this->history->count(),
        'days_since_created' => $this->created_at->diffInDays(now()),
        'last_action_date' => $this->history->max('created_at'),
        'last_action_by' => $this->history->last()?->creator?->name,
        'workflow_progress' => $this->getWorkflowProgress()
      ]
    ];
  }

  /**
   * Determine the type of transition (approval, rejection, return, cancel)
   */
  private function getTransitionType($oldStatus, $newStatus)
  {
    if ($newStatus == BillingStatus::REJECTED) {
      return 'rejection';
    } elseif ($newStatus == BillingStatus::RETURNED) {
      return 'return';
    } elseif ($newStatus == BillingStatus::CANCELLED) {
      return 'cancellation';
    } elseif ($newStatus > $oldStatus && !in_array($newStatus, [BillingStatus::REJECTED, BillingStatus::RETURNED, BillingStatus::CANCELLED])) {
      return 'approval';
    } else {
      return 'neutral';
    }
  }

  /**
   * Calculate workflow progress percentage
   */
  private function getWorkflowProgress()
  {
    $totalSteps = 7; // PREPARED -> DRAFT -> HOD -> FINANCE_REVIEW -> FINANCE_VERIFY -> FINANCE_APPROVAL -> PROCESSING -> COMPLETED
    $currentStep = match($this->status_id) {
      BillingStatus::PREPARED => 0,
      BillingStatus::DRAFT => 1,
      BillingStatus::HOD_APPROVAL => 2,
      BillingStatus::FINANCE_REVIEW => 3,
      BillingStatus::FINANCE_VERIFY => 4,
      BillingStatus::FINANCE_APPROVAL => 5,
      BillingStatus::PROCESSING_PAYMENT => 6,
      BillingStatus::COMPLETED => 7,
      BillingStatus::REJECTED, BillingStatus::CANCELLED => -1, // Special case
      BillingStatus::RETURNED => max(0, $this->getLastNormalStep()), // Return to previous step
      default => 0
    };

    if ($currentStep === -1) {
      return ['percentage' => 100, 'status' => 'terminated'];
    }

    $percentage = round(($currentStep / $totalSteps) * 100);
    return ['percentage' => $percentage, 'status' => 'active'];
  }

  /**
   * Get the last normal step before return/rejection
   */
  private function getLastNormalStep()
  {
    $normalStatuses = [
      BillingStatus::PREPARED, BillingStatus::DRAFT, BillingStatus::HOD_APPROVAL,
      BillingStatus::FINANCE_REVIEW, BillingStatus::FINANCE_VERIFY, 
      BillingStatus::FINANCE_APPROVAL, BillingStatus::PROCESSING_PAYMENT
    ];

    $lastNormalHistory = $this->history
      ->whereIn('new_status', $normalStatuses)
      ->sortByDesc('created_at')
      ->first();

    if (!$lastNormalHistory) return 1;

    return match($lastNormalHistory->new_status) {
      BillingStatus::PREPARED => 0,
      BillingStatus::DRAFT => 1,
      BillingStatus::HOD_APPROVAL => 2,
      BillingStatus::FINANCE_REVIEW => 3,
      BillingStatus::FINANCE_VERIFY => 4,
      BillingStatus::FINANCE_APPROVAL => 5,
      BillingStatus::PROCESSING_PAYMENT => 6,
      default => 1
    };
  }
}