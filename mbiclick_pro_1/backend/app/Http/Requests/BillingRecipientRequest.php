<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class BillingRecipientRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'short' => 'nullable|string|max:50',
            'attn' => 'nullable|string|max:255',
            'hp' => 'nullable|string|max:20',
            'tel' => 'nullable|string|max:20',
            'fax' => 'nullable|string|max:20',
            'addr' => 'nullable|string'
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama penerima diperlukan',
            'name.string' => 'Nama penerima mestilah dalam bentuk teks',
            'name.max' => 'Nama penerima tidak boleh melebihi 255 aksara',
            'short.string' => 'Nama ringkas mestilah dalam bentuk teks',
            'short.max' => 'Nama ringkas tidak boleh melebihi 50 aksara',
            'attn.string' => 'Perhatian kepada mestilah dalam bentuk teks',
            'attn.max' => 'Perhatian kepada tidak boleh melebihi 255 aksara',
            'hp.string' => 'Nombor telefon bimbit mestilah dalam bentuk teks',
            'hp.max' => 'Nombor telefon bimbit tidak boleh melebihi 20 aksara',
            'tel.string' => 'Nombor telefon mestilah dalam bentuk teks',
            'tel.max' => 'Nombor telefon tidak boleh melebihi 20 aksara',
            'fax.string' => 'Nombor faks mestilah dalam bentuk teks',
            'fax.max' => 'Nombor faks tidak boleh melebihi 20 aksara',
            'addr.string' => 'Alamat mestilah dalam bentuk teks'
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
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422)
        );
    }
}
