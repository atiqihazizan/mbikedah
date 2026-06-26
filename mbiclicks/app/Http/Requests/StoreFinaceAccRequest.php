<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreFinaceAccRequest extends FormRequest
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
//        'email' => 'required|email|unique:users,email,'.$this->user->id,
        return [
            'code'=>['required','min:8',Rule::unique('finance_accs')],
            'name'=>'required|min:3',
            'type'=>'required',
            'btyp'=>'boolean',
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
            'type'=>'Jenis Akaun'
        ];
    }
    public function failedValidation ( Validator $validator )
    {
        $this->validator = $validator;
//        $errors = $validator->errors();
//        $response = response()->json([ 'error' => $errors->messages(), ], 422);
//        throw new HttpResponseException($response);
    }
    public function prepareForValidation ()
    {
        $this->merge([
            'btyp' => $this->boolean('btyp'),
        ]);
    }
}
