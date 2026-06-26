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
				Rule::unique('budgets')->ignore($budgetId)
			],
			'department_id' => ['nullable', 'exists:departments,id'],
			'yearly' => ['nullable', 'integer', 'min:2020', 'max:2050'],
			'type' => ['required', 'integer', 'in:0,1,2'],  // 0=Operasi, 1=Debit, 2=Kredit
			
			// Hierarchy & Grouping
			'level' => ['nullable', 'integer', 'min:0', 'max:10'],
			'parent_id' => ['nullable', 'exists:budgets,id'],
			'is_group' => ['nullable', 'boolean'],
			'group_type' => ['nullable', 'string', 'in:main,sub,detail'],
			'sort_order' => ['nullable', 'integer', 'min:1'],
			
			// Description & Notes
			'description' => ['nullable', 'string', 'max:1000'],
			'notes' => ['nullable', 'string', 'max:2000'],
			
			// Status
			'is_active' => ['nullable', 'boolean'],
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
			'code.unique' => 'Kod budget ini telah digunakan.',
			'department_id.exists' => 'Jabatan yang dipilih tidak wujud.',
			'yearly.integer' => 'Tahun budget mesti berupa nombor.',
			'yearly.min' => 'Tahun budget minimum adalah 2020.',
			'yearly.max' => 'Tahun budget maksimum adalah 2050.',
			'type.required' => 'Jenis budget wajib dipilih.',
			'type.integer' => 'Jenis budget mesti berupa nombor.',
			'type.in' => 'Jenis budget yang dipilih tidak sah.',
			
			// Hierarchy & Grouping Messages
			'level.integer' => 'Level mesti berupa nombor.',
			'level.min' => 'Level minimum adalah 0.',
			'level.max' => 'Level maksimum adalah 10.',
			'parent_id.exists' => 'Parent budget yang dipilih tidak wujud.',
			'is_group.boolean' => 'Is group mesti berupa true atau false.',
			'group_type.in' => 'Jenis kumpulan yang dipilih tidak sah.',
			'sort_order.integer' => 'Urutan mesti berupa nombor.',
			'sort_order.min' => 'Urutan minimum adalah 1.',
			
			// Description & Status Messages
			'description.max' => 'Deskripsi tidak boleh melebihi 1000 aksara.',
			'notes.max' => 'Nota tidak boleh melebihi 2000 aksara.',
			'is_active.boolean' => 'Status aktif mesti berupa true atau false.',
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
			'level' => 'level',
			'parent_id' => 'parent budget',
			'is_group' => 'kumpulan',
			'group_type' => 'jenis kumpulan',
			'sort_order' => 'urutan',
			'description' => 'deskripsi',
			'notes' => 'nota',
			'is_active' => 'status aktif',
		];
	}

	/**
	 * Configure the validator instance.
	 */
	public function withValidator($validator)
	{
		$validator->after(function ($validator) {
			// Validate parent-child relationship
			if ($this->filled('parent_id') && $this->filled('level')) {
				$this->validateParentRelationship($validator);
			}

			// Validate group type when is_group is true
			if ($this->boolean('is_group') && !$this->filled('group_type')) {
				$validator->errors()->add('group_type', 'Jenis kumpulan wajib dipilih apabila ini adalah kumpulan.');
			}

			// Ensure code is uppercase (auto-transform)
			if ($this->filled('code')) {
				$this->merge(['code' => strtoupper($this->input('code'))]);
			}

			// Set default values
			if (!$this->has('is_active')) {
				$this->merge(['is_active' => true]);
			}

			if (!$this->has('is_group')) {
				$this->merge(['is_group' => false]);
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
			'department_id', 'yearly', 'level', 'parent_id', 
			'group_type', 'sort_order', 'description', 'notes'
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

		// Set current year if yearly not provided
		if (!$this->filled('yearly')) {
			$this->merge(['yearly' => date('Y')]);
		}
	}

	/**
	 * Validate parent-child relationship
	 */
	private function validateParentRelationship($validator)
	{
		$budgetId = $this->route('id');
		$parentId = $this->input('parent_id');
		$level = $this->input('level');

		// Can't be parent to itself
		if ($parentId == $budgetId) {
			$validator->errors()->add('parent_id', 'Budget tidak boleh menjadi parent kepada dirinya sendiri.');
			return;
		}

		// Check if parent exists and validate level
		$parent = \App\Models\Budget::find($parentId);
		if ($parent && $parent->level >= $level) {
			$validator->errors()->add('level', 'Level mesti lebih tinggi daripada parent.');
		}

		// Check for circular reference (basic check)
		if ($budgetId && $parent) {
			$current = $parent;
			$maxDepth = 10; // Prevent infinite loop
			$depth = 0;
			
			while ($current && $current->parent_id && $depth < $maxDepth) {
				if ($current->parent_id == $budgetId) {
					$validator->errors()->add('parent_id', 'Circular reference: budget ini adalah ancestor kepada parent yang dipilih.');
					break;
				}
				$current = $current->parent;
				$depth++;
			}
		}
	}

	/**
	 * Get validated data with computed fields
	 */
	public function getValidatedDataWithComputedFields(): array
	{
		$validated = $this->validated();

		// Set default sort_order based on level if not provided
		if (!isset($validated['sort_order']) && isset($validated['level'])) {
			$validated['sort_order'] = ($validated['level'] * 100) + 1;
		}

		return $validated;
	}
}