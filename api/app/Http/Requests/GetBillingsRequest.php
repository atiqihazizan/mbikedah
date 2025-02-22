<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetBillingsRequest extends FormRequest
{
	public function rules()
	{
		return [
			'archived' => 'boolean|nullable'
		];
	}
}
