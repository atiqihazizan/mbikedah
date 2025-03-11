<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BillingTableResource extends JsonResource
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
            'department' => $this->department ? $this->department->name : null,
            'recipient' => $this->recipient ? $this->recipient->name : null,
            'created_by' => $this->creator ? $this->creator->name : null,
            'created_at' => $this->created_at,
            'issued_at' => $this->issued_at,
            'is_archived' => $this->is_archived,
        ];
    }
}
