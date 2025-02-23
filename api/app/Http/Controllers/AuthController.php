<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Config;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
	// Register
	public function register(Request $request)
	{
		$request->validate([
			'name' => 'required|string|max:255',
			'username' => 'required|string|max:255|unique:users',
			'email' => 'required|email|unique:users',
			'password' => 'required|min:6',
			'dept_id' => 'nullable|exists:departments,id',
			'role_id' => 'required|integer|in:' . implode(',', array_values(Config::get('constants.roles')))
		]);

		$user = User::create([
			'name' => $request->name,
			'username' => $request->username,
			'email' => $request->email,
			'password' => Hash::make($request->password),
			'department_id' => $request->dept_id,
			'role_id' => $request->role_id ?? Config::get('constants.roles.user'), // Gunakan role default jika tidak ada
		]);

    $user->load('department');
		$token = $user->createToken('auth_token')->plainTextToken;

		return response()->json([
			'status' => 'success',
			'token' => $token,
			'user' => [
				...$user->only(['id', 'name', 'email', 'username', 'department_id', 'role_id']),
				'department' => $user->department ? $user->department->name : null,
			],
		], 201);
	}

    /**
     * Handle user login
     */
	public function login(Request $request)
	{
		$request->validate([
			'username' => 'required|string',
			'password' => 'required|string'
		]);

		$user = User::where('username', $request->username)->first();

		if (!$user || !Hash::check($request->password, $user->password)) {
			throw ValidationException::withMessages([
                'username' => ['The provided credentials are incorrect.'],
            ]);
		}

		$token = $user->createToken('auth-token')->plainTextToken;

		return response()->json([
			'success' => true,
			'token' => $token,
			'user' => [
				'id' => $user->id,
				'name' => $user->name,
				'username' => $user->username,
				'email' => $user->email,
				'role_id' => $user->role_id,
				'department_id' => $user->department_id,
				'department' => $user->department ? $user->department->name : null,
				'role' => $user->role_name
			]
		]);
	}

	// Logout
	public function logout(Request $request)
	{
		$request->user()->currentAccessToken()->delete();
		return response()->json([
			'success' => true,
			'message' => 'Successfully logged out'
		]);
	}

	// Get user profile
	public function getMe(Request $request)
	{
    $user = $request->user()->load('department');
		return response()->json([
			'success' => true,
			'user' => [
				'id' => $user->id,
				'name' => $user->name,
				'username' => $user->username,
				'department_id' => $user->department_id,
				'department' => $user->department ? $user->department->name : null,
				'role_id' => $user->role_id,
				'role' => $user->role_name
			]
		]);
	}
}
