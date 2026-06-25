<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PositionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $positions = Position::orderBy('name')->get();
            
            return response()->json([
                'success' => true,
                'data' => $positions,
                'message' => 'Positions retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve positions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:positions,name',
                'description' => 'nullable|string|max:1000',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $position = Position::create([
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->get('is_active', true)
            ]);

            return response()->json([
                'success' => true,
                'data' => $position,
                'message' => 'Position created successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create position: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $position = Position::find($id);
            
            if (!$position) {
                return response()->json([
                    'success' => false,
                    'message' => 'Position not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $position,
                'message' => 'Position retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve position: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $position = Position::find($id);
            
            if (!$position) {
                return response()->json([
                    'success' => false,
                    'message' => 'Position not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:positions,name,' . $id,
                'description' => 'nullable|string|max:1000',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $position->update([
                'name' => $request->name,
                'description' => $request->description,
                'is_active' => $request->get('is_active', true)
            ]);

            return response()->json([
                'success' => true,
                'data' => $position,
                'message' => 'Position updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update position: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $position = Position::find($id);
            
            if (!$position) {
                return response()->json([
                    'success' => false,
                    'message' => 'Position not found'
                ], 404);
            }

            // Check if position is being used by any users
            $usersCount = DB::table('users')->where('position_id', $id)->count();
            
            if ($usersCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete position. It is being used by ' . $usersCount . ' user(s).'
                ], 400);
            }

            $position->delete();

            return response()->json([
                'success' => true,
                'message' => 'Position deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete position: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle the active status of a position.
     */
    public function toggleStatus(Request $request, $id)
    {
        try {
            $position = Position::find($id);
            
            if (!$position) {
                return response()->json([
                    'success' => false,
                    'message' => 'Position not found'
                ], 404);
            }

            $newStatus = !$position->is_active;
            $position->update(['is_active' => $newStatus]);

            $action = $newStatus ? 'activated' : 'deactivated';

            return response()->json([
                'success' => true,
                'data' => $position,
                'message' => 'Position ' . $action . ' successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle position status: ' . $e->getMessage()
            ], 500);
        }
    }
}
