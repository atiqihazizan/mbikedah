<?php
// app/Http/Controllers/UserController.php (Fixed with role-based access and proper imports)

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use App\Http\Requests\UserRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Constants\UserAbilities;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
	/**
	 * Helper method to get abilities array from JSON string
	 */
	private function getAbilitiesArray($abilities)
	{
		if (is_array($abilities)) {
			return $abilities;
		}

		if (is_string($abilities)) {
			$decoded = json_decode($abilities, true);
			return is_array($decoded) ? $decoded : [];
		}

		return [];
	}

	/**
	 * Helper method to format user data for response
	 */
	private function formatUserData($user, $abilities = null)
	{
		$userAbilities = $abilities ?? $this->getAbilitiesArray($user->abilities);
		$abilities_name = UserAbilities::getAbilitiesName();

		return [
			'id' => $user->id,
			'name' => $user->name,
			'username' => $user->username,
			'email' => $user->email,
			'phone' => $user->phone,
			'formatted_phone' => $this->formatPhoneDisplay($user->phone),
			'abilities' => $userAbilities,
			'ability_names' => array_map(function ($ability_id) use ($abilities_name) {
				return $abilities_name[$ability_id] ?? 'Peranan ' . $ability_id;
			}, $userAbilities),
			'department_id' => $user->department_id,
			'department' => $user->department ? $user->department->name : null,
			'is_active' => $user->is_active
		];
	}

	/**
	 * Helper method to format phone number for display
	 */
	private function formatPhoneDisplay($phone)
	{
		if (!$phone)
			return null;

		// Remove + prefix for processing
		$cleaned = ltrim($phone, '+');

		// Malaysian phone number formatting
		if (substr($cleaned, 0, 2) === '60') {
			// Format: +60 12-345 6789
			$countryCode = substr($cleaned, 0, 2);
			$operatorCode = substr($cleaned, 2, 2);
			$firstPart = substr($cleaned, 4, 3);
			$secondPart = substr($cleaned, 7);

			return "+{$countryCode} {$operatorCode}-{$firstPart} {$secondPart}";
		}

		return $phone;
	}

	/**
	 * Helper method to get abilities config with fallback
	 */
	private function getAbilitiesConfig()
	{
		return UserAbilities::getAbilitiesName();
	}

	/**
	 * Helper method to get abilities validation list
	 */
	private function getAbilitiesValidationList()
	{
		$abilitiesConfig = UserAbilities::getAbilitiesName();
		return implode(',', array_keys($abilitiesConfig));
	}

	/**
	 * Toggle user active status
	 */
	public function toggleStatus(Request $request, $id)
	{
		try {
			$user = User::findOrFail($id);
			
			// Check if user is trying to deactivate themselves
			if ($user->id === Auth::id()) {
				return response()->json([
					'success' => false,
					'message' => 'You cannot deactivate your own account'
				], 400);
			}

			// Toggle the status
			$newStatus = !$user->is_active;
			$user->is_active = $newStatus;
			$user->save();

			$action = $newStatus ? 'activated' : 'deactivated';
			
			return response()->json([
				'success' => true,
				'message' => "User '{$user->name}' has been {$action} successfully",
				'data' => [
					'id' => $user->id,
					'is_active' => $user->is_active,
					'name' => $user->name
				]
			]);

		} catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
			return response()->json([
				'success' => false,
				'message' => 'User not found'
			], 404);
		} catch (\Exception $e) {
			Log::error('Error toggling user status: ' . $e->getMessage());
			
			return response()->json([
				'success' => false,
				'message' => 'Failed to update user status'
			], 500);
		}
	}

	/**
	 * Display a listing of users (Admin only)
	 */
	public function index()
	{
		// Only admin can view all users
		if (!Auth::user()->isAdmin()) {
			return response()->json([
				'success' => false,
				'message' => 'Tidak dibenarkan untuk mengakses senarai pengguna'
			], 403);
		}

		$users = User::with('department')->get();

		return response()->json([
			'success' => true,
			'data' => $users->map(function ($user) {
				return $this->formatUserData($user);
			})
		]);
	}

	/**
	 * Store a newly created user (Admin only)
	 */
	public function store(UserRequest $request)
	{
		$user = User::create([
			'name' => $request->name,
			'username' => $request->username,
			'email' => $request->email,
			'phone' => $request->phone,
			'password' => Hash::make($request->password),
			'department_id' => $request->department_id,
			'abilities' => $request->abilities
		]);

		$user->load('department');

		// Log user creation activity
		Log::info('User created successfully', [
			'created_user_id' => $user->id,
			'created_user_email' => $user->email,
			'created_user_name' => $user->name,
			'created_by' => Auth::id(),
			'abilities' => $request->abilities,
			'ip_address' => $request->ip(),
			'user_agent' => $request->userAgent()
		]);

		return response()->json([
			'success' => true,
			'message' => 'Pengguna berjaya dicipta',
			'data' => $this->formatUserData($user, $request->abilities)
		], 201);
	}

	/**
	 * Display the specified user
	 */
	public function show($id)
	{
		$currentUser = Auth::user();

		// Admin can view any user, others can only view themselves
		if (!$currentUser->isAdmin() && (int) $currentUser->id !== (int) $id) {
			return response()->json([
				'success' => false,
				'message' => 'Tidak dibenarkan untuk mengakses maklumat pengguna ini'
			], 403);
		}

		$user = User::with('department')->findOrFail($id);

		return response()->json([
			'success' => true,
			'data' => $this->formatUserData($user)
		]);
	}

	/**
	 * Update the specified user
	 */
	public function update(UserRequest $request, $id)
	{
		$user = User::findOrFail($id);
		$currentUser = Auth::user();
		$isAdmin = $currentUser->isAdmin();
		$isOwnerUpdate = (int) $currentUser->id === (int) $id;

		// Store original data for logging
		// $originalData = [
		// 	'name' => $user->name,
		// 	'username' => $user->username,
		// 	'email' => $user->email,
		// 	'phone' => $user->phone,
		// 	'department_id' => $user->department_id,
		// 	'abilities' => $user->abilities,
		// 	'is_active' => $user->is_active
		// ];

		// Base update data (available to both admin and owner)
		$updateData = [
			'name' => $request->name,
			'username' => $request->username,
			'email' => $request->email,
			'phone' => $request->phone,
			'department_id' => $request->department_id,
			'is_active' => $request->is_active
		];

		// Admin-only fields
		if ($isAdmin && !$isOwnerUpdate) {
			$updateData['department_id'] = $request->department_id;
			$updateData['abilities'] = $request->abilities;
			
			// Admin can update is_active status
			if ($request->has('is_active')) {
				$updateData['is_active'] = $request->boolean('is_active');
			}
		}

		// Password update (both admin and owner can update password)
		if ($request->filled('password')) {
			$updateData['password'] = Hash::make($request->password);
		}

		$user->update($updateData);
		$user->load('department');

		// Log user update activity
		return response()->json([
			'success' => true,
			'message' => 'Pengguna berjaya dikemaskini',
			'data' => $this->formatUserData($user, $isAdmin && !$isOwnerUpdate ? $request->abilities : null)
		]);
	}

	/**
	 * Update user abilities (Admin only)
	 */
	public function updateAbilities(Request $request, $id)
	{
		// Only admin can update abilities
		if (!Auth::user()->isAdmin()) {
			return response()->json([
				'success' => false,
				'message' => 'Tidak dibenarkan untuk mengemas kini peranan pengguna'
			], 403);
		}

		$user = User::findOrFail($id);

		$request->validate([
			'abilities' => 'required|array',
			'abilities.*' => 'required|integer|in:' . $this->getAbilitiesValidationList()
		]);

		$user->update([
			'abilities' => $request->abilities
		]);

		$abilities_name = $this->getAbilitiesConfig();

		// Log ability update
		Log::info('User abilities updated', [
			'updated_user_id' => $user->id,
			'updated_by' => Auth::id(),
			'new_abilities' => $request->abilities,
			'ip_address' => $request->ip()
		]);

		return response()->json([
			'success' => true,
			'message' => 'Peranan pengguna berjaya dikemaskini',
			'data' => [
				'abilities' => $request->abilities,
				'ability_names' => array_map(function ($ability_id) use ($abilities_name) {
					return $abilities_name[$ability_id] ?? 'Peranan ' . $ability_id;
				}, $request->abilities)
			]
		]);
	}

	/**
	 * Change user password
	 */
	public function changePassword(ChangePasswordRequest $request, $id = null)
	{
		// Get validated data including target user
		$validated = $request->validated();
		$user = $validated['target_user'];

		if (!$user) {
			return response()->json([
				'success' => false,
				'message' => 'Pengguna tidak dijumpai.'
			], 404);
		}

		// Update password (validation already handled in ChangePasswordRequest)
		$user->update([
			'password' => Hash::make($validated['new_password'])
		]);

		// Log password change activity
		Log::info('Password changed successfully', [
			'user_id' => $user->id,
			'user_email' => $user->email,
			'changed_by' => Auth::id(),
			'ip_address' => $request->ip(),
			'user_agent' => $request->userAgent()
		]);

		return response()->json([
			'success' => true,
			'message' => 'Kata laluan berjaya dikemaskini'
		]);
	}

	/**
	 * Get users with Finance Approver abilities (Admin only)
	 */
	public function getUsersFinanceApproval()
	{
		// Only admin can access this
		// if (!Auth::user()->isAdmin()) {
		// 	return response()->json([
		// 		'success' => false,
		// 		'message' => 'Tidak dibenarkan untuk mengakses senarai pengesah kewangan'
		// 	], 403);
		// }

		// Get users yang ada abilities Finance Approver (6)
		// $users = User::with('department')
		$users = User::whereRaw('JSON_CONTAINS(abilities, ?)', [json_encode(UserAbilities::FINANCE_APPROVER)])
			->get();

		$abilities_name = UserAbilities::getAbilitiesName();

		return response()->json([
			'success' => true,
			'message' => 'Senarai pengesah kewangan berjaya diambil',
			'data' => $users->map(function ($user) use ($abilities_name) {
				// Handle both array and JSON string format
				$abilities = $this->getAbilitiesArray($user->abilities);

				return [
					'id' => $user->id,
					'name' => $user->name,
					'username' => $user->username,
					'email' => $user->email,
					'phone' => $user->phone,
					'formatted_phone' => $this->formatPhoneDisplay($user->phone),
					'position' => $user->position->name ?? 'PENGESAH KEWANGAN',
					'abilities' => $abilities,
					'ability_names' => array_map(function ($ability_id) use ($abilities_name) {
						return $abilities_name[$ability_id] ?? 'Peranan ' . $ability_id;
					}, $abilities),
					'department_id' => $user->department_id,
					'department' => $user->department ? $user->department->name : null,
					'can_approve_finance' => in_array(UserAbilities::FINANCE_APPROVER, $abilities)  // Finance Approver check
				];
			})
		]);
	}

	/**
	 * Remove the specified user (Admin only)
	 */
	public function destroy($id)
	{
		// Only admin can delete users
		if (!Auth::user()->isAdmin()) {
			return response()->json([
				'success' => false,
				'message' => 'Tidak dibenarkan untuk memadam pengguna'
			], 403);
		}

		$user = User::findOrFail($id);

		// Prevent admin from deleting themselves
		if ((int) Auth::id() === (int) $user->id) {
			return response()->json([
				'success' => false,
				'message' => 'Tidak boleh memadam akaun sendiri'
			], 422);
		}

		// Store user data before deletion for logging
		$deletedUserData = [
			'id' => $user->id,
			'name' => $user->name,
			'username' => $user->username,
			'email' => $user->email,
			'phone' => $user->phone,
			'department_id' => $user->department_id,
			'abilities' => $user->abilities
		];

		$user->delete();

		// Log user deletion activity
		Log::warning('User deleted', [
			'deleted_user_data' => $deletedUserData,
			'deleted_by' => Auth::id(),
			'ip_address' => request()->ip(),
			'user_agent' => request()->userAgent()
		]);

		return response()->json([
			'success' => true,
			'message' => 'Pengguna berjaya dipadam'
		]);
	}
}
