<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBillingStatusRequest extends FormRequest
{
    public function authorize()
    {
        return true; // We already have auth:sanctum middleware
    }

    public function rules()
    {
        return [
            'status_id' => 'required|integer|min:1|max:10',
            'remarks' => 'nullable|string|max:500'
        ];
    }

    public function messages()
    {
        return [
            'status_id.required' => 'Status is required',
            'status_id.integer' => 'Status must be a number',
            'status_id.min' => 'Invalid status',
            'status_id.max' => 'Invalid status',
            'remarks.string' => 'Remarks must be text',
            'remarks.max' => 'Remarks cannot exceed 500 characters'
        ];
    }
}
