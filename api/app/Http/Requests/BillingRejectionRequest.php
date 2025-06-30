<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Constants\BillingStatus;

class BillingRejectionRequest extends FormRequest
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
		$billing = $this->route('billing');

		// Finance statuses require user selection
		$financeStatuses = [
			BillingStatus::FINANCE_REVIEW,
			BillingStatus::FINANCE_VERIFY,
			BillingStatus::FINANCE_APPROVAL,
		];

		$rules = ['remarks' => 'required|string|max:500'];

		if (in_array($billing->status_id, $financeStatuses)) {
			$rules['user_id'] = 'required|integer|exists:users,id';
		}

		return $rules;
	}

	public function messages(): array
	{
		return [
			'remarks.required' => 'Sila nyatakan sebab penolakan',
			'remarks.string' => 'Sebab penolakan mestilah dalam bentuk teks',
			'remarks.max' => 'Sebab penolakan tidak boleh melebihi 500 aksara',
			'user_id.required' => 'Sila pilih pegawai',
			'user_id.integer' => 'Pegawai mestilah dalam bentuk nombor',
			'user_id.exists' => 'Pegawai yang dipilih tidak wujud dalam sistem'
		];
	}
}
