<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBillingRequest extends FormRequest
{
	public function rules()
	{
		return [
			'title' => 'required|string',
			'issue_desc' => 'required|string',
			'issue_to' => 'required|string',
			'no_project' => 'required|string',
			'total' => 'required|numeric',
			'payment_type_id' => 'required|integer',
			'status' => 'integer|nullable',
			'department_id' => 'required|integer',
			'running_no' => 'string|nullable',
			'detail' => 'array|nullable',
			'detail.*.desc' => 'required|string',
			'detail.*.budget_code' => 'required|string',
			'detail.*.budget' => 'required|numeric',
			'detail.*.qty' => 'required|integer',
			'detail.*.ref' => 'string|nullable'
		];
	}
}
