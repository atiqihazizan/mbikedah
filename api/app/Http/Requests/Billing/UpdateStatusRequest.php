<?php

namespace App\Http\Requests\Billing;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Billing;

class UpdateStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize()
    {
        $billing = Billing::findOrFail($this->route('id'));
        return $this->user()->can('updateStatus', $billing);
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
