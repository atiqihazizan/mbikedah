<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FinanceApprovalRequest extends FormRequest
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
			'approved_date' => 'required|date',
			'approved_by' => 'required|integer|exists:users,id',
			'remarks' => 'nullable|string|max:500'
		];
	}

	public function messages(): array
	{
		return [
			'approved_date.required' => 'Sila masukkan tarikh kelulusan',
			'approved_date.date' => 'Format tarikh tidak sah',
			'approved_by.required' => 'Sila pilih pengesah kewangan',
			'approved_by.exists' => 'Pengesah yang dipilih tidak wujud dalam sistem'
		];
	}
}
