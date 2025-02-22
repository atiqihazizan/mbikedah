<?php

namespace App\Http\Requests\Billing;

use Illuminate\Foundation\Http\FormRequest;

class CreateBillingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'description' => 'required|string|max:255',
            'no_project' => 'required|string|max:50',
            'recipient_id' => 'required|exists:billing_recipients,id',
            'total' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cheque,online,cash',
            'department_id' => 'required|exists:departments,id',
            'running_no' => 'nullable|string|unique:billings,running_no',
            'payment_due' => 'nullable|date|after:today',
            'detail' => 'required|array|min:1',
            'detail.*.description' => 'required|string|max:255',
            'detail.*.budget_code' => 'required|string',
            'detail.*.budget_id' => 'required|exists:budgets,id',
            'detail.*.price' => 'required|numeric|min:0',
            'detail.*.quantity' => 'required|integer|min:1',
            'detail.*.unit' => 'required|string',
            'detail.*.reference' => 'nullable|string'
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'description.required' => 'Sila masukkan keterangan billing',
            'no_project.required' => 'Sila masukkan nombor projek',
            'recipient_id.required' => 'Sila pilih penerima',
            'total.required' => 'Sila masukkan jumlah',
            'payment_method.required' => 'Sila pilih kaedah pembayaran',
            'department_id.required' => 'Sila pilih jabatan',
            'detail.required' => 'Sila masukkan butiran billing',
            'detail.*.description.required' => 'Sila masukkan keterangan untuk setiap item',
            'detail.*.budget_code.required' => 'Sila masukkan kod bajet untuk setiap item',
            'detail.*.budget_id.required' => 'Sila pilih bajet untuk setiap item',
            'detail.*.price.required' => 'Sila masukkan harga untuk setiap item',
            'detail.*.quantity.required' => 'Sila masukkan kuantiti untuk setiap item',
            'detail.*.unit.required' => 'Sila masukkan unit untuk setiap item'
        ];
    }
}
