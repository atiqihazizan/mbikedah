<?php
// app/Http/Requests/UserRequest.php (Fixed - Request class only)

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;

class UserRequest extends FormRequest
{
	/**
	 * Determine if the user is authorized to make this request.
	 */
	public function authorize(): bool
	{
		$currentUser = Auth::user();
		$userId = $this->route('id') ?? $this->route('user');

		// For creating users, only admin can create
		if (!$this->isUpdate()) {
			return $currentUser && $currentUser->isAdmin();
		}

		// For updating users
		if ($this->isUpdate()) {
			// Admin can update anyone
			if ($currentUser && $currentUser->isAdmin()) {
				return true;
			}

			// Owner/User can only update themselves
			if ($currentUser && $userId && (int) $currentUser->id === (int) $userId) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get the validation rules that apply to the request.
	 */
	public function rules(): array
	{
		$userId = $this->route('id') ?? $this->route('user');
		$isUpdate = $this->isUpdate();
		$currentUser = Auth::user();
		$isAdmin = $currentUser && $currentUser->isAdmin();
		$isOwnerUpdate = $isUpdate && $currentUser && $userId && (int) $currentUser->id === (int) $userId;

		// Base rules for name, username, email, phone
		$rules = [
			'name' => 'required|string|max:255',
			'username' => $isUpdate
				? 'required|string|max:255|unique:users,username,' . $userId
				: 'required|string|max:255|unique:users',
			'email' => $isUpdate
				? 'required|email|max:255|unique:users,email,' . $userId
				: 'required|email|max:255|unique:users',
			'phone' => [
				'nullable',
				'string',
				'max:20',
				'regex:/^[\+]?[0-9\s\-\(\)]+$/',
				$isUpdate
					? 'unique:users,phone,' . $userId
					: 'unique:users,phone'
			],
		];

		// Admin-only fields
		if ($isAdmin && !$isOwnerUpdate) {
			$rules['department_id'] = 'nullable|exists:departments,id';
			$rules['abilities'] = 'required|array|min:1';
			$rules['abilities.*'] = 'required|integer|in:' . implode(',', array_keys(Config::get('constants.abilities_name')));
		}

		// Password rules
		if ($isUpdate) {
			$rules['password'] = 'nullable|string|min:6|confirmed';
		} else {
			// Only admin can create users, so password is required
			$rules['password'] = 'required|string|min:6|confirmed';
		}

		return $rules;
	}

	/**
	 * Get custom error messages for validation rules.
	 */
	public function messages(): array
	{
		return [
			'name.required' => 'Nama penuh adalah wajib',
			'name.max' => 'Nama penuh tidak boleh melebihi 255 aksara',
			'username.required' => 'Nama pengguna adalah wajib',
			'username.unique' => 'Nama pengguna telah digunakan',
			'username.max' => 'Nama pengguna tidak boleh melebihi 255 aksara',
			'email.required' => 'Alamat email adalah wajib',
			'email.email' => 'Format alamat email tidak sah',
			'email.unique' => 'Alamat email telah digunakan',
			'email.max' => 'Alamat email tidak boleh melebihi 255 aksara',
			'phone.regex' => 'Format nombor telefon tidak sah. Contoh: +60123456789 atau 012-345 6789',
			'phone.max' => 'Nombor telefon tidak boleh melebihi 20 aksara',
			'phone.unique' => 'Nombor telefon telah digunakan',
			'password.required' => 'Kata laluan adalah wajib',
			'password.min' => 'Kata laluan mestilah sekurang-kurangnya 6 aksara',
			'password.confirmed' => 'Pengesahan kata laluan tidak sepadan',
			'department_id.exists' => 'Jabatan yang dipilih tidak sah',
			'abilities.required' => 'Peranan adalah wajib',
			'abilities.min' => 'Sekurang-kurangnya satu peranan mesti dipilih',
			'abilities.*.in' => 'Peranan yang dipilih tidak sah'
		];
	}

	/**
	 * Get custom attributes for validator errors.
	 */
	public function attributes(): array
	{
		return [
			'name' => 'nama penuh',
			'username' => 'nama pengguna',
			'email' => 'alamat email',
			'phone' => 'nombor telefon',
			'password' => 'kata laluan',
			'department_id' => 'jabatan',
			'abilities' => 'peranan'
		];
	}

	/**
	 * Prepare the data for validation.
	 */
	protected function prepareForValidation()
	{
		// Normalize phone number before validation
		if ($this->phone) {
			$phone = preg_replace('/[^0-9+]/', '', $this->phone);

			// Convert Malaysian local format to international
			if (substr($phone, 0, 1) === '0' && strlen($phone) >= 10) {
				$phone = '6' . substr($phone, 1);
			}

			// Add + prefix if not present
			if (substr($phone, 0, 1) !== '+' && strlen($phone) >= 10) {
				$phone = '+' . $phone;
			}

			$this->merge(['phone' => $phone]);
		}
	}

	/**
	 * Configure the validator instance.
	 */
	public function withValidator($validator)
	{
		$validator->after(function ($validator) {
			// Check if phone is Malaysian format when provided
			if ($this->phone && !$this->isValidMalaysianPhone($this->phone)) {
				$validator->errors()->add('phone', 'Nombor telefon mestilah dalam format Malaysia yang sah');
			}
		});
	}

	/**
	 * Check if phone number is valid Malaysian format
	 */
	private function isValidMalaysianPhone($phone): bool
	{
		$cleaned = preg_replace('/[^0-9]/', '', $phone);

		// Malaysian mobile patterns
		$patterns = [
			'/^(60)?1[0-46-9][0-9]{7,8}$/',  // Mobile numbers
			'/^(60)?[2-9][0-9]{7,8}$/',  // Landline numbers
		];

		foreach ($patterns as $pattern) {
			if (preg_match($pattern, $cleaned)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Determine if this is an update operation
	 */
	public function isUpdate(): bool
	{
		$userId = $this->route('id') ?? $this->route('user');
		return $this->isMethod('PUT') || $this->isMethod('PATCH') || !is_null($userId);
	}

	/**
	 * Get the user ID for update operations
	 */
	public function getUserId()
	{
		return $this->route('id') ?? $this->route('user');
	}

	/**
	 * Check if current user is admin
	 */
	public function isAdminRequest(): bool
	{
		$currentUser = Auth::user();
		return $currentUser && $currentUser->isAdmin();
	}

	/**
	 * Check if this is owner updating their own profile
	 */
	public function isOwnerUpdate(): bool
	{
		$currentUser = Auth::user();
		$userId = $this->getUserId();
		return $this->isUpdate() && $currentUser && $userId && (int) $currentUser->id === (int) $userId && !$currentUser->isAdmin();
	}
}
