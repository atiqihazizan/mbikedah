<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Config;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index()
    {
        $users = User::with('department')->get();
        
        return response()->json([
            'success' => true,
            'data' => $users->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'ability_id' => $user->ability_id,
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
            'ability_id' => 'required|integer|in:' . implode(',', array_values(Config::get('constants.abilities')))
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'department_id' => $request->department_id,
            'ability_id' => $request->ability_id
        ]);

        $user->load('department');

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'ability_id' => $user->ability_id,
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

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'ability_id' => $user->ability_id,
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
            'ability_id' => 'required|integer|in:' . implode(',', array_values(Config::get('constants.abilities'))),
            'password' => 'nullable|min:6'
        ]);

        $updateData = [
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'department_id' => $request->department_id,
            'ability_id' => $request->ability_id
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);
        $user->load('department');

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'ability_id' => $user->ability_id,
                'department_id' => $user->department_id,
                'department' => $user->department ? $user->department->name : null
            ]
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
            'message' => 'User deleted successfully'
        ]);
    }
}
