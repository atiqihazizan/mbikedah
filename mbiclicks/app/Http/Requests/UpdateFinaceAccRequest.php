<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFinaceAccRequest extends FormRequest
{
    public $validator = null;
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {

        return [
            //'username' => ['required',Rule::unique('users')->ignore($user->id)],
            'code'=>['required','min:8',Rule::unique('finance_accs')->ignore($this->finance_acc->id)],
            'name'=>'required|min:3',
        ];
    }

    public function messages ()
    {
        return [
            'required' => ':attribute diperlukan',
            'unique'=>':attribute sudah ada',
            'min'=>':attribute terlalu pendek',
            'max'=>':attribute terlalu panjang',
        ];
    }

    public function attributes()
    {
        return [
            'code'=>'Kod Akaun',
            'name'=>'Perihal',
        ];
    }
    public function failedValidation ( Validator $validator )
    {
        $this->validator = $validator;
    }
}
