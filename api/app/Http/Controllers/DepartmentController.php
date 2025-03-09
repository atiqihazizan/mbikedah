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
}
