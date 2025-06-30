<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\User;
use App\Http\Requests\ChangePasswordRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
	/**
	 * Helper method to safely get abilities array
	 */
	private function getAbilitiesArray($abilities)
	{
		return is_array($abilities) ? $abilities : (json_decode($abilities) ?? []);
	}

	/**
	 * Display a listing of users
	 */
	public function index()
	{
		$users = User::with('department')->get();
		$abilities_name = Config::get('constants.abilities_name');

		return response()->json([
			'success' => true,
			'data' => $users->map(function ($user) use ($abilities_name) {
				$abilities = $this->getAbilitiesArray($user->abilities);
				return [
					'id' => $user->id,
					'name' => $user->name,
					'username' => $user->username,
					'email' => $user->email,
					'abilities' => $abilities,
					'ability_names' => array_map(function ($ability_id) use ($abilities_name) {
						return $abilities_name[$ability_id] ?? 'Peranan ' . $ability_id;
					}, $abilities),
					'department_id' => $user->department_id,
					'department' => $user->department ? $user->department->name : null
				];
			})
		]);
	}

	/**
	 * Store a newly created user
	 */
	public function store(Request $request)
	{
		$request->validate([
			'name' => 'required|string|max:255',
			'username' => 'required|string|max:255|unique:users',
			'email' => 'required|email|unique:users',
			'password' => 'required|min:6',
			'department_id' => 'nullable|exists:departments,id',
			'abilities' => 'required|array',
			'abilities.*' => 'required|integer|in:' . implode(',', array_keys(Config::get('constants.abilities_name')))
		]);

		$user = User::create([
			'name' => $request->name,
			'username' => $request->username,
			'email' => $request->email,
			'password' => Hash::make($request->password),
			'department_id' => $request->department_id,
			'abilities' => json_encode($request->abilities)
		]);

		$user->load('department');
		$abilities_name = Config::get('constants.abilities_name');

		return response()->json([
			'success' => true,
			'message' => 'Pengguna berjaya dicipta',
			'data' => [
				'id' => $user->id,
				'name' => $user->name,
				'username' => $user->username,
				'email' => $user->email,
				'abilities' => $request->abilities,
				'ability_names' => array_map(function ($ability_id) use ($abilities_name) {
					return $abilities_name[$ability_id] ?? 'Peranan ' . $ability_id;
				}, $request->abilities),
				'department_id' => $user->department_id,
				'department' => $user->department ? $user->department->name : null
			]
		], 201);
	}

	/**
	 * Display the specified user
	 */
	public function show($id)
	{
		$user = User::with('department')->findOrFail($id);
		$abilities = $this->getAbilitiesArray($user->abilities);
		$abilities_name = Config::get('constants.abilities_name');

		return response()->json([
			'success' => true,
			'data' => [
				'id' => $user->id,
				'name' => $user->name,
				'username' => $user->username,
				'email' => $user->email,
				'abilities' => $abilities,
				'ability_names' => array_map(function ($ability_id) use ($abilities_name) {
					return $abilities_name[$ability_id] ?? 'Peranan ' . $ability_id;
				}, $abilities),
				'department_id' => $user->department_id,
				'department' => $user->department ? $user->department->name : null
			]
		]);
	}

	/**
	 * Update the specified user
	 */
	public function update(Request $request, $id)
	{
		$user = User::findOrFail($id);

		$request->validate([
			'name' => 'required|string|max:255',
			'username' => 'required|string|max:255|unique:users,username,' . $id,
			'email' => 'required|email|unique:users,email,' . $id,
			'department_id' => 'nullable|exists:departments,id',
			'abilities' => 'required|array',
			'abilities.*' => 'required|integer|in:' . implode(',', array_keys(Config::get('constants.abilities_name'))),
			'password' => 'nullable|min:6'
		]);

		$updateData = [
			'name' => $request->name,
			'username' => $request->username,
			'email' => $request->email,
			'department_id' => $request->department_id,
			'abilities' => json_encode($request->abilities)
		];

		if ($request->filled('password')) {
			$updateData['password'] = Hash::make($request->password);
		}

		$user->update($updateData);
		$user->load('department');
		$abilities_name = Config::get('constants.abilities_name');

		return response()->json([
			'success' => true,
			'message' => 'Pengguna berjaya dikemaskini',
			'data' => [
				'id' => $user->id,
				'name' => $user->name,
				'username' => $user->username,
				'email' => $user->email,
				'abilities' => $request->abilities,
				'ability_names' => array_map(function ($ability_id) use ($abilities_name) {
					return $abilities_name[$ability_id] ?? 'Peranan ' . $ability_id;
				}, $request->abilities),
				'department_id' => $user->department_id,
				'department' => $user->department ? $user->department->name : null
			]
		]);
	}

	/**
	 * Update user abilities
	 */
	public function updateAbilities(Request $request, $id)
	{
		$user = User::findOrFail($id);

		$request->validate([
			'abilities' => 'required|array',
			'abilities.*' => 'required|integer|in:' . implode(',', array_keys(Config::get('constants.abilities_name')))
		]);

		$user->update([
			'abilities' => json_encode($request->abilities)
		]);

		$abilities_name = Config::get('constants.abilities_name');

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
	 * POST /users/{id}/change-password or POST /change-password (for current user)
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
		\Log::info('Password changed successfully', [
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
	 * Get users with Finance Approver abilities
	 * GET /users/finance-approval
	 */
	public function getUsersFinanceApproval()
	{
		// Get users yang ada abilities Finance Approver (6)
		$users = User::with('department')
			->whereRaw("JSON_CONTAINS(abilities, ?)", [json_encode(6)])
			->get();

		$abilities_name = Config::get('constants.abilities_name');

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
					'position' => $user->position->name ?? 'PENGESAH KEWANGAN',
					'abilities' => $abilities,
					'ability_names' => array_map(function ($ability_id) use ($abilities_name) {
						return $abilities_name[$ability_id] ?? 'Peranan ' . $ability_id;
					}, $abilities),
					'department_id' => $user->department_id,
					'department' => $user->department ? $user->department->name : null,
					'can_approve_finance' => in_array(6, $abilities) // Finance Approver check
				];
			})
		]);
	}

	/**
	 * Remove the specified user
	 */
	public function destroy($id)
	{
		$user = User::findOrFail($id);
		$user->delete();

		return response()->json([
			'success' => true,
			'message' => 'Pengguna berjaya dipadam'
		]);
	}
}