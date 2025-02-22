<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Config;

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
			'dept_id' => $request->dept_id,
			'role_id' => $request->role_id ?? Config::get('constants.roles.user'), // Gunakan role default jika tidak ada
		]);

    $user->load('department');
		$token = $user->createToken('auth_token')->plainTextToken;

		return response()->json([
			'status' => 'success',
			'token' => $token,
			'user' => [
				...$user->only(['id', 'name', 'email', 'username', 'dept_id']),
				'department' => $user->department ? $user->department->name : null,
			],
		], 201);
	}


	// Login
	public function login(Request $request)
	{
		$request->validate([
			'username' => 'required|string',
			'password' => 'required|string'
		]);

		$user = User::where('username', $request->username)->first();

		if (!$user || !Hash::check($request->password, $user->password)) {
			return response()->json(['error' => 'Invalid credentials'], 401);
		}

		$token = $user->createToken('auth_token')->plainTextToken;
    $user->load('department');

		return response()->json([
			'status' => 'success',
			'token' => $token,
			'user' => [
				...$user->only(['id', 'name', 'email', 'username', 'dept_id','role_id']),
				'department' => $user->department ? $user->department->name : null,
				'role' => $user->role,
			]
		]);
	}

	// Logout
	public function logout(Request $request)
	{
		$request->user()->tokens()->delete();
		return response()->json([
			'status' => 'success',
			'message' => 'Logged out successfully'
		]);
	}

	// Get user profile
	public function getMe(Request $request)
	{
    $user = $request->user();
		return response()->json([
			'status' => 'success',
			'user' => [
				...$user->only(['id', 'name', 'email', 'username', 'dept_id', 'role_id']),
				'department' => $user->department ? $user->department->name : null,
				'role' => $user->role,
			]
		]);
	}
}
