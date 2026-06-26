<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class ChangePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // User yang sudah authenticate boleh change password
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'current_password' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    $this->validateCurrentPassword($attribute, $value, $fail);
                }
            ],
            'new_password' => [
                'required',
                'string',
                'min:6',
                'confirmed',
                function ($attribute, $value, $fail) {
                    $this->validatePasswordStrength($attribute, $value, $fail);
                    $this->validatePasswordNotSame($attribute, $value, $fail);
                }
            ],
            'new_password_confirmation' => [
                'required',
                'string'
            ]
        ];
    }

    /**
     * Get custom validation messages
     */
    public function messages(): array
    {
        return [
            'current_password.required' => 'Kata laluan semasa diperlukan.',
            'new_password.required' => 'Kata laluan baru diperlukan.',
            'new_password.min' => 'Kata laluan baru minimum :min aksara.',
            'new_password.confirmed' => 'Pengesahan kata laluan baru tidak sepadan.',
            'new_password_confirmation.required' => 'Pengesahan kata laluan diperlukan.'
        ];
    }

    /**
     * Validate current password
     */
    protected function validateCurrentPassword($attribute, $value, $fail)
    {
        $user = $this->getTargetUser();
        
        if (!$user) {
            $fail('Pengguna tidak dijumpai.');
            return;
        }

        // Rate limiting untuk prevent brute force
        $key = 'password-change.' . $this->ip() . '.' . $user->id;
        
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            $fail("Terlalu banyak cubaan. Cuba lagi selepas {$seconds} saat.");
            return;
        }

        // Verify current password
        if (!Hash::check($value, $user->password)) {
            RateLimiter::hit($key, 900); // 15 minutes penalty
            $fail('Kata laluan semasa tidak betul.');
        } else {
            // Clear rate limit on successful verification
            RateLimiter::clear($key);
        }
    }

    /**
     * Validate password strength
     */
    protected function validatePasswordStrength($attribute, $value, $fail)
    {
        if (!$this->isPasswordStrong($value)) {
            $fail('Kata laluan mesti mengandungi huruf dan nombor.');
        }
    }

    /**
     * Validate new password is different from current
     */
    protected function validatePasswordNotSame($attribute, $value, $fail)
    {
        $user = $this->getTargetUser();
        
        if ($user && Hash::check($value, $user->password)) {
            $fail('Kata laluan baru mestilah berbeza dari kata laluan semasa.');
        }
    }

    /**
     * Check if password meets strength requirements
     */
    protected function isPasswordStrong(string $password): bool
    {
        $checks = [
            'length' => strlen($password) >= 6,
            'hasLetter' => preg_match('/[a-zA-Z]/', $password),
            'hasNumber' => preg_match('/\d/', $password)
        ];

        $score = count(array_filter($checks));
        return $score >= 2; // Require at least 2 out of 3 criteria
    }

    /**
     * Get target user (either from route parameter or current user)
     */
    protected function getTargetUser()
    {
        // If ID provided in route, get that user (for admin changing other user's password)
        if ($this->route('id')) {
            $targetUser = \App\Models\User::find($this->route('id'));
            
            // Security check: only allow if current user can manage others
            $currentUser = Auth::user();
            if ($targetUser && $targetUser->id !== $currentUser->id && !$this->canManageUsers($currentUser)) {
                abort(403, 'Anda tidak mempunyai kebenaran untuk menukar kata laluan pengguna ini.');
            }
            
            return $targetUser;
        }
        
        // Otherwise use current authenticated user
        return Auth::user();
    }

    /**
     * Check if current user can manage other users
     */
    protected function canManageUsers($user): bool
    {
        if (!$user || !$user->abilities) {
            return false;
        }

        $abilities = is_array($user->abilities) ? $user->abilities : json_decode($user->abilities, true);
        
        // Assuming ability ID 1 is Super Admin or similar role that can manage users
        return in_array(1, $abilities ?? []);
    }

    /**
     * Get validated data with proper structure
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);
        
        // Add target user to validated data for controller use
        $validated['target_user'] = $this->getTargetUser();
        
        return $validated;
    }

    /**
     * Prepare the data for validation
     */
    protected function prepareForValidation(): void
    {
        // Trim whitespace from password fields
        if ($this->has('current_password')) {
            $this->merge([
                'current_password' => trim($this->current_password)
            ]);
        }

        if ($this->has('new_password')) {
            $this->merge([
                'new_password' => trim($this->new_password)
            ]);
        }

        if ($this->has('new_password_confirmation')) {
            $this->merge([
                'new_password_confirmation' => trim($this->new_password_confirmation)
            ]);
        }
    }

    /**
     * Handle a failed validation attempt
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        // Log failed validation attempts for security monitoring
        \Log::warning('Password change validation failed', [
            'user_id' => Auth::id(),
            'ip_address' => $this->ip(),
            'user_agent' => $this->userAgent(),
            'errors' => $validator->errors()->toArray()
        ]);

        parent::failedValidation($validator);
    }
}