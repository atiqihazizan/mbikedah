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
        $abilities_name = Config::get('constants.abilities_name');
        
        return response()->json([
            'success' => true,
            'data' => $users->map(function($user) use ($abilities_name) {
                $abilities = json_decode($user->abilities) ?? [];
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'abilities' => $abilities,
                    'ability_names' => array_map(function($ability_id) use ($abilities_name) {
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
                'ability_names' => array_map(function($ability_id) use ($abilities_name) {
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
        $abilities = json_decode($user->abilities) ?? [];
        $abilities_name = Config::get('constants.abilities_name');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'abilities' => $abilities,
                'ability_names' => array_map(function($ability_id) use ($abilities_name) {
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
                'ability_names' => array_map(function($ability_id) use ($abilities_name) {
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
                'ability_names' => array_map(function($ability_id) use ($abilities_name) {
                    return $abilities_name[$ability_id] ?? 'Peranan ' . $ability_id;
                }, $request->abilities)
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
            'message' => 'Pengguna berjaya dipadam'
        ]);
    }
}
