<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
      'approved_at' => $this->approved_at,
      'paid_at' => $this->paid_at,
      'ceo_approved' => $this->ceo_approved,
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
          'reviewed_by' => $detail->reviewed_by
        ];
      }),
      'history' => $this->history->map(function ($history) {
        return [
          'id' => $history->id,
          'old_status' => $history->old_status,
          'new_status' => $history->new_status,
          'remarks' => $history->remarks,
          'created_by' => $history->creator ? $history->creator->name : null,
          'created_at' => $history->created_at
        ];
      }),
      'transactions' => $this->transactions->map(function ($transaction) {
        return [
          'id' => $transaction->id,
          'bank_id' => $transaction->bank_id,
          'credit' => $transaction->amount,
          'bank_name' => $transaction->bank ? $transaction->bank->bank_name : null,
          'latest_bal' => $transaction->bank ? $transaction->bank->amount : null,
          'created_at' => $transaction->created_at
        ];
      })
    ];
  }
}
