<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class BillingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get base validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'description' => 'nullable',
            'no_project' => 'required|string|max:50',
            'recipient_id' => 'required|exists:billing_recipients,id',
            'total_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cheque,online,cash',
            'department_id' => 'required|exists:departments,id',
            'issued_at' => 'required|date',
            // 'payment_due' => 'required|date|after:issued_at',
            'status_id' => 'required|integer|min:1|max:10',
            'details' => 'required|array|min:1',
            'details.*.description' => 'required|string|max:255',
            'details.*.budget_code' => 'required|string',
            'details.*.budget_id' => 'required|exists:budgets,id',
            'details.*.price' => 'required|numeric|min:0',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit' => 'nullable',
            'details.*.reference' => 'nullable|string'
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'no_project.required' => 'Sila masukkan nombor projek',
            'no_project.max' => 'Nombor projek tidak boleh melebihi 50 aksara',
            'recipient_id.required' => 'Sila pilih penerima',
            'recipient_id.exists' => 'Penerima yang dipilih tidak sah',
            'total_amount.required' => 'Sila masukkan jumlah',
            'total_amount.min' => 'Jumlah mestilah lebih dari 0',
            'payment_method.required' => 'Sila pilih kaedah pembayaran',
            'payment_method.in' => 'Kaedah pembayaran mestilah cek, online atau tunai',
            'department_id.required' => 'Sila pilih jabatan',
            'department_id.exists' => 'Jabatan yang dipilih tidak sah',
            'issued_at.required' => 'Sila masukkan tarikh bil',
            // 'payment_due.required' => 'Sila masukkan tarikh bayaran',
            // 'payment_due.after' => 'Tarikh bayaran mestilah selepas tarikh bil',
            'status_id.required' => 'Status diperlukan',
            'details.required' => 'Sila masukkan butiran billing',
            'details.min' => 'Sila masukkan sekurang-kurangnya satu butiran',
            'details.*.description.required' => 'Sila masukkan keterangan untuk setiap item',
            'details.*.description.max' => 'Keterangan item tidak boleh melebihi 255 aksara',
            'details.*.budget_code.required' => 'Sila masukkan kod bajet untuk setiap item',
            'details.*.budget_id.required' => 'Sila pilih bajet untuk setiap item',
            'details.*.budget_id.exists' => 'Bajet yang dipilih tidak sah',
            'details.*.price.required' => 'Sila masukkan harga untuk setiap item',
            'details.*.price.min' => 'Harga mestilah lebih dari 0',
            'details.*.quantity.required' => 'Sila masukkan kuantiti untuk setiap item',
            'details.*.quantity.min' => 'Kuantiti mestilah sekurang-kurangnya 1',
            // 'details.*.unit.required' => 'Sila masukkan unit untuk setiap item'
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Ralat Pengesahan',
                'errors' => $validator->errors()
            ], 422)
        );
    }
}
