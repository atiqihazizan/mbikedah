<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BillingResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'total_amount' => $this->total_amount,
      'running_no' => $this->running_no,
      'status_id' => $this->status_id,
      'status_name' => $this->status_name,
      'is_active' => $this->is_active,
      'issued_at' => $this->issued_at,
      'payment_due' => $this->payment_due,
      'department_name' => $this->department?->name,
      'creator_name' => $this->creator?->name,
      'recipient_name' => $this->recipient?->name,
      'details' => $this->details->map(function ($detail) {
        return [
          'description' => $detail->description,
          'budget_code' => $detail->budget_code,
          'price' => $detail->price,
          'quantity' => $detail->quantity,
          'reference' => $detail->reference,
          'total' => $detail->price * $detail->quantity
        ];
      })
    ];
  }
}
