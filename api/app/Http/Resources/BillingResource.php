<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Constants\BillingStatus;

class BillingResource extends JsonResource
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
            'description' => $this->description,
            'total_amount' => $this->total_amount,
            'department_id' => $this->department_id,
            'department' => $this->department ? [
                'id' => $this->department->id,
                'name' => $this->department->name
            ] : null,
            'created_by' => $this->created_by,
            'creator' => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name
            ] : null,
            'status_id' => $this->status_id,
            'status_name' => BillingStatus::getStatusName($this->status_id),
            'payment_method' => $this->payment_method,
            'issued_at' => $this->issued_at,
            'payment_due' => $this->payment_due,
            'no_project' => $this->no_project,
            'running_no' => $this->running_no,
            'is_archived' => $this->is_archived,
            'recipient_id' => $this->recipient_id,
            'recipient' => $this->recipient ? [
                'id' => $this->recipient->id,
                'name' => $this->recipient->name
            ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at
        ];
    }
}
