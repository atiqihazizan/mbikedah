<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Billing;
use App\Constants\BillingStatus;

class UpdateBillingStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize()
    {
        $billing = Billing::findOrFail($this->route('id'));
        
        // Jika status = 2 (HOD_APPROVAL), guna policy sendToHod
        if (in_array($this->input('status_id'), [BillingStatus::HOD_APPROVAL, BillingStatus::RETURNED])) {
            return $this->user()->can('sendToHod', $billing);
        }
        
        // Untuk status lain, guna policy process
        return $this->user()->can('process', $billing);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        return [
            'status_id' => 'required|integer|min:1|max:8',
            'remarks' => 'nullable|string|max:255'
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'status_id.required' => 'Sila pilih status',
            'status_id.integer' => 'Status tidak sah',
            'status_id.min' => 'Status tidak sah',
            'status_id.max' => 'Status tidak sah'
        ];
    }
}
