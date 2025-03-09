<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class BudgetController extends Controller
{
    /**
     * Senarai semua bajet
     */
    public function index()
    {
        try {
            // Cuba dapatkan data dari Redis cache
            $budgets = Cache::remember('senarai_bajet', now()->addMinutes(30), function () {
                return Budget::all();
            });

            return response()->json([
                'data' => $budgets,
                'source' => Cache::has('senarai_bajet') ? 'cache' : 'database'
            ]);

        } catch (\Exception $e) {
            Log::error('Ralat mendapatkan senarai bajet: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ralat mendapatkan senarai bajet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Simpan bajet baru
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:budgets',
                'description' => 'nullable|string',
                'amount' => 'required|numeric|min:0',
            ]);

            $budget = Budget::create($validated);
            return response()->json(['data' => $budget], 201);
        } catch (\Exception $e) {
            Log::error('Ralat menyimpan bajet: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ralat menyimpan bajet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Dapatkan bajet tertentu
     */
    public function show($id)
    {
        try {
            $budget = Budget::findOrFail($id);
            return response()->json(['data' => $budget]);
        } catch (\Exception $e) {
            Log::error('Ralat mendapatkan bajet: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ralat mendapatkan bajet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Kemaskini bajet
     */
    public function update(Request $request, $id)
    {
        try {
            $budget = Budget::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:budgets,code,' . $id,
                'description' => 'nullable|string',
                'amount' => 'required|numeric|min:0',
            ]);

            $budget->update($validated);
            return response()->json(['data' => $budget]);
        } catch (\Exception $e) {
            Log::error('Ralat mengemaskini bajet: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ralat mengemaskini bajet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Padam bajet
     */
    public function destroy($id)
    {
        try {
            $budget = Budget::findOrFail($id);
            $budget->delete();
            return response()->json(['message' => 'Bajet berjaya dipadam']);
        } catch (\Exception $e) {
            Log::error('Ralat memadam bajet: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ralat memadam bajet',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
