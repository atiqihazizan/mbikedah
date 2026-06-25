<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DepartmentController extends Controller
{
	public function index()
	{
		try {
			$departments = Department::all();
			return response()->json(['data' => $departments]);
		} catch (\Exception $e) {
			Log::error('Ralat mendapatkan senarai jabatan: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mendapatkan senarai jabatan',
				'error' => $e->getMessage()
			], 500);
		}
	}

	public function store(Request $request)
	{
		try {
			$validated = $request->validate([
				'name' => 'required|string|max:255',
				'code' => 'nullable|string|max:50|unique:departments',
				'description' => 'nullable|string'
			]);

			$department = Department::create($validated);

			return response()->json([
				'message' => 'Department berjaya dicipta',
				'data' => $department
			], 201);
		} catch (\Exception $e) {
			Log::error('Ralat mencipta jabatan: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mencipta jabatan',
				'error' => $e->getMessage()
			], 500);
		}
	}

	public function show($id)
	{
		try {
			$department = Department::findOrFail($id);
			return response()->json(['data' => $department]);
		} catch (\Exception $e) {
			Log::error('Ralat mendapatkan jabatan: ' . $e->getMessage());
			return response()->json([
				'message' => 'Jabatan tidak dijumpai',
				'error' => $e->getMessage()
			], 404);
		}
	}

	public function update(Request $request, $id)
	{
		try {
			$department = Department::findOrFail($id);

			$validated = $request->validate([
				'name' => 'required|string|max:255',
				'code' => 'nullable|string|max:50|unique:departments,code,' . $id,
				'description' => 'nullable|string'
			]);

			$department->update($validated);

			return response()->json([
				'message' => 'Department berjaya dikemaskini',
				'data' => $department
			]);
		} catch (\Exception $e) {
			Log::error('Ralat mengemaskini jabatan: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mengemaskini jabatan',
				'error' => $e->getMessage()
			], 500);
		}
	}

	public function destroy($id)
	{
		try {
			$department = Department::findOrFail($id);
			$department->delete();

			return response()->json([
				'message' => 'Department berjaya dipadam'
			]);
		} catch (\Exception $e) {
			Log::error('Ralat memadam jabatan: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat memadam jabatan',
				'error' => $e->getMessage()
			], 500);
		}
	}
}
