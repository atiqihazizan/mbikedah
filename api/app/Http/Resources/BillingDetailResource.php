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
      'department' => [
        'id' => $this->department_id,
        'name' => $this->department ? $this->department->name : null
      ],
      'recipient' => [
        'id' => $this->recipient_id,
        'name' => $this->recipient ? $this->recipient->name : null
      ],
      'creator' => [
        'id' => $this->created_by,
        'name' => $this->creator ? $this->creator->name : null
      ],
      'created_at' => $this->created_at,
      'issued_at' => $this->issued_at,
      'payment_due' => $this->payment_due,
      'is_archived' => $this->is_archived,
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
          'budget' => [
            'id' => $detail->budget_id,
            'name' => $detail->budget ? $detail->budget->name : null,
            'code' => $detail->budget ? $detail->budget->code : null
          ]
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
      })
    ];
  }
}
