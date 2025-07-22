<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BudgetRequest extends FormRequest
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
	 */
	public function rules(): array
	{
		$budgetId = $this->route('id');  // For update operations

		$rules = [
			// Basic Information
			'name' => ['required', 'string', 'max:255'],
			'code' => [
				'required',
				'string',
				'max:50',
				// 'regex:/^[A-Z0-9]+$/',  // Only uppercase letters and numbers
				Rule::unique('budgets')->ignore($budgetId)
			],
			'department_id' => ['nullable', 'exists:departments,id'],
			// 'yearly' => ['required', 'integer', 'min:2020', 'max:2050'],
			'yearly' => ['nullable', 'integer'],
			'type' => ['required', 'integer', 'in:0,1,2'],  // 0=Operasi, 1=Debit, 2=Kredit
			// Monthly Budget Allocations (bdg1-bdg12)
			'bdg1' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
			'bdg2' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
			'bdg3' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
			'bdg4' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
			'bdg5' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
			'bdg6' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
			'bdg7' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
			'bdg8' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
			'bdg9' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
			'bdg10' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
			'bdg11' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
			'bdg12' => ['nullable', 'numeric', 'min:0', 'max:999999999.99'],
		];

		return $rules;
	}

	/**
	 * Get custom validation messages.
	 */
	public function messages(): array
	{
		return [
			// Basic Information Messages
			'name.required' => 'Nama budget wajib diisi.',
			'name.string' => 'Nama budget mesti berupa teks.',
			'name.max' => 'Nama budget tidak boleh melebihi 255 aksara.',
			'code.required' => 'Kod budget wajib diisi.',
			'code.string' => 'Kod budget mesti berupa teks.',
			'code.max' => 'Kod budget tidak boleh melebihi 50 aksara.',
			// 'code.regex' => 'Kod budget hanya boleh mengandungi huruf besar dan nombor.',
			'code.unique' => 'Kod budget ini telah digunakan.',
			'department_id.exists' => 'Jabatan yang dipilih tidak wujud.',
			// 'yearly.required' => 'Tahun budget wajib diisi.',
			// 'yearly.integer' => 'Tahun budget mesti berupa nombor.',
			// 'yearly.min' => 'Tahun budget minimum adalah 2020.',
			// 'yearly.max' => 'Tahun budget maksimum adalah 2050.',
			'type.required' => 'Jenis budget wajib dipilih.',
			'type.integer' => 'Jenis budget mesti berupa nombor.',
			'type.in' => 'Jenis budget yang dipilih tidak sah.',
			// Monthly Budget Messages
			'bdg1.numeric' => 'Budget Januari mesti berupa nombor.',
			'bdg1.min' => 'Budget Januari tidak boleh kurang dari 0.',
			'bdg1.max' => 'Budget Januari terlalu besar.',
			'bdg2.numeric' => 'Budget Februari mesti berupa nombor.',
			'bdg2.min' => 'Budget Februari tidak boleh kurang dari 0.',
			'bdg2.max' => 'Budget Februari terlalu besar.',
			'bdg3.numeric' => 'Budget Mac mesti berupa nombor.',
			'bdg3.min' => 'Budget Mac tidak boleh kurang dari 0.',
			'bdg3.max' => 'Budget Mac terlalu besar.',
			'bdg4.numeric' => 'Budget April mesti berupa nombor.',
			'bdg4.min' => 'Budget April tidak boleh kurang dari 0.',
			'bdg4.max' => 'Budget April terlalu besar.',
			'bdg5.numeric' => 'Budget Mei mesti berupa nombor.',
			'bdg5.min' => 'Budget Mei tidak boleh kurang dari 0.',
			'bdg5.max' => 'Budget Mei terlalu besar.',
			'bdg6.numeric' => 'Budget Jun mesti berupa nombor.',
			'bdg6.min' => 'Budget Jun tidak boleh kurang dari 0.',
			'bdg6.max' => 'Budget Jun terlalu besar.',
			'bdg7.numeric' => 'Budget Julai mesti berupa nombor.',
			'bdg7.min' => 'Budget Julai tidak boleh kurang dari 0.',
			'bdg7.max' => 'Budget Julai terlalu besar.',
			'bdg8.numeric' => 'Budget Ogos mesti berupa nombor.',
			'bdg8.min' => 'Budget Ogos tidak boleh kurang dari 0.',
			'bdg8.max' => 'Budget Ogos terlalu besar.',
			'bdg9.numeric' => 'Budget September mesti berupa nombor.',
			'bdg9.min' => 'Budget September tidak boleh kurang dari 0.',
			'bdg9.max' => 'Budget September terlalu besar.',
			'bdg10.numeric' => 'Budget Oktober mesti berupa nombor.',
			'bdg10.min' => 'Budget Oktober tidak boleh kurang dari 0.',
			'bdg10.max' => 'Budget Oktober terlalu besar.',
			'bdg11.numeric' => 'Budget November mesti berupa nombor.',
			'bdg11.min' => 'Budget November tidak boleh kurang dari 0.',
			'bdg11.max' => 'Budget November terlalu besar.',
			'bdg12.numeric' => 'Budget Disember mesti berupa nombor.',
			'bdg12.min' => 'Budget Disember tidak boleh kurang dari 0.',
			'bdg12.max' => 'Budget Disember terlalu besar.',
		];
	}

	/**
	 * Get custom attribute names for validation errors.
	 */
	public function attributes(): array
	{
		return [
			'name' => 'nama budget',
			'code' => 'kod budget',
			'department_id' => 'jabatan',
			'yearly' => 'tahun',
			'type' => 'jenis budget',
			'bdg1' => 'budget Januari',
			'bdg2' => 'budget Februari',
			'bdg3' => 'budget Mac',
			'bdg4' => 'budget April',
			'bdg5' => 'budget Mei',
			'bdg6' => 'budget Jun',
			'bdg7' => 'budget Julai',
			'bdg8' => 'budget Ogos',
			'bdg9' => 'budget September',
			'bdg10' => 'budget Oktober',
			'bdg11' => 'budget November',
			'bdg12' => 'budget Disember',
		];
	}

	/**
	 * Configure the validator instance.
	 */
	public function withValidator($validator)
	{
		$validator->after(function ($validator) {
			// Custom validation: Ensure at least one monthly budget is greater than 0
			$hasMonthlyBudget = false;
			for ($i = 1; $i <= 12; $i++) {
				if (($this->input("bdg{$i}") ?? 0) > 0) {
					$hasMonthlyBudget = true;
					break;
				}
			}

			if (!$hasMonthlyBudget) {
				$validator->errors()->add('budget', 'Sekurang-kurangnya satu bulan mesti mempunyai budget yang lebih besar dari RM 0.00.');
			}

			// Custom validation: Check for reasonable budget total
			$totalBudget = 0;
			for ($i = 1; $i <= 12; $i++) {
				$totalBudget += (float) ($this->input("bdg{$i}") ?? 0);
			}

			if ($totalBudget > 999999999.99) {
				$validator->errors()->add('budget', 'Jumlah budget tahunan terlalu besar.');
			}

			// Custom validation: Ensure code is uppercase (auto-transform)
			if ($this->filled('code')) {
				$this->merge(['code' => strtoupper($this->input('code'))]);
			}
		});
	}

	/**
	 * Prepare the data for validation.
	 */
	protected function prepareForValidation()
	{
		// Auto-uppercase the code
		if ($this->filled('code')) {
			$this->merge([
				'code' => strtoupper($this->code),
			]);
		}

		// Convert empty strings to null for nullable fields
		$nullableFields = [
			'department_id', 'bdg1', 'bdg2', 'bdg3', 'bdg4', 'bdg5', 'bdg6',
			'bdg7', 'bdg8', 'bdg9', 'bdg10', 'bdg11', 'bdg12'
		];

		$data = [];
		foreach ($nullableFields as $field) {
			if ($this->has($field) && $this->input($field) === '') {
				$data[$field] = null;
			}
		}

		if (!empty($data)) {
			$this->merge($data);
		}
	}

	/**
	 * Get the validated data with computed fields.
	 */
	public function getValidatedDataWithComputedFields(): array
	{
		$validated = $this->validated();

		// Set default values for monthly budgets if not provided
		for ($i = 1; $i <= 12; $i++) {
			if (!isset($validated["bdg{$i}"])) {
				$validated["bdg{$i}"] = 0;
			}
		}

		// Calculate total budget
		$totalBudget = 0;
		for ($i = 1; $i <= 12; $i++) {
			$totalBudget += (float) ($validated["bdg{$i}"] ?? 0);
		}
		$validated['bdgtotal'] = $totalBudget;

		return $validated;
	}
}
