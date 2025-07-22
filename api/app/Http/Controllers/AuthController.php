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
      'email' => 'required|string|email|unique:users',
      'password' => 'required|string|min:8',
      'dept_id' => 'nullable|exists:departments,id',
      'ability_id' => 'required|integer|in:' . implode(',', array_values(Config::get('constants.abilities')))
    ]);

    $user = User::create([
      'name' => $request->name,
      'username' => $request->username,
      'email' => $request->email,
      'password' => Hash::make($request->password),
      'department_id' => $request->dept_id,
      'ability_id' => $request->ability_id ?? Config::get('constants.abilities.user'), // Use default ability if not provided
    ]);

    $user->load('department');
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
      'status' => 'success',
      'token' => $token,
      'user' => [
        ...$user->only(['id', 'name', 'email', 'username', 'department_id', 'ability_id']),
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
        'username' => ['Nama pengguna atau kata laluan tidak sah.'],
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
        'ability_id' => $user->ability_id,
        'department_id' => $user->department_id,
        'department' => $user->department ? $user->department->name : null,
        'ability' => $user->ability_name
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

  // Dapatkan profil pengguna
  public function getMe(Request $request)
  {
    try {
      // Dapatkan user dengan department
      $user = $request->user();
      if (!$user) {
        return response()->json([
          'success' => false,
          'message' => 'Sesi anda telah tamat. Sila log masuk semula.',
          'status' => 'token_expired'
        ], 401);
      }

      // Load department dan return maklumat pengguna
      $user->load('department');
      return response()->json([
        'success' => true,
        'user' => [
          'id' => $user->id,
          'name' => $user->name,
          'username' => $user->username,
          'department_id' => $user->department_id,
          'department' => $user->department ? $user->department->name : null,
          'email' => $user->email,
          'phone' => $user->phone,
          'abilities' => $user->abilities,
          'ability' => $user->getAbilityNames(),
          'allowed_menus' => $user->getAllowedMenus(), // Menambah allowed_menus
        ]
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Ralat semasa mendapatkan maklumat pengguna',
        'status' => 'error'
      ], 401);
    }
  }
}
