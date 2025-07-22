<?php

namespace App\Http\Controllers;

use App\Http\Requests\BudgetRequest;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BudgetController extends Controller
{
	/**
	 * Senarai semua budget
	 */
	public function index()
	{
		try {
			// Cuba dapatkan data dari Redis cache
			$budgets = Cache::remember('senarai_budget', now()->addMinutes(30), function () {
				return Budget::with('department')->get();
			});

			return response()->json([
				'data' => $budgets,
				'source' => Cache::has('senarai_budget') ? 'cache' : 'database'
			]);
		} catch (\Exception $e) {
			Log::error('Ralat mendapatkan senarai budget: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mendapatkan senarai budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Simpan budget baru
	 */
	public function store(BudgetRequest $request)
	{
		try {
			$validated = $request->getValidatedDataWithComputedFields();

			// Set initial balance equals total budget
			$validated['balance'] = $validated['bdgtotal'];

			$budget = Budget::create($validated);

			// Clear cache
			Cache::forget('senarai_budget');

			return response()->json([
				'message' => 'Budget berjaya disimpan',
				'data' => $budget->load('department')
			], 201);
		} catch (\Exception $e) {
			Log::error('Ralat menyimpan budget: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat menyimpan budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Dapatkan budget tertentu
	 */
	public function show($id)
	{
		try {
			$budget = Budget::with('department')->findOrFail($id);
			return response()->json(['data' => $budget]);
		} catch (\Exception $e) {
			Log::error('Ralat mendapatkan budget: ' . $e->getMessage());
			return response()->json([
				'message' => 'Budget tidak dijumpai',
				'error' => $e->getMessage()
			], 404);
		}
	}

	/**
	 * Kemaskini budget
	 */
	public function update(BudgetRequest $request, $id)
	{
		try {
			$budget = Budget::findOrFail($id);
			$validated = $request->getValidatedDataWithComputedFields();

			// Update balance (keep current spending, recalculate balance)
			$currentSpending = $budget->getTotalSpending();
			// $validated['balance'] = $validated['bdgtotal'] - $currentSpending;

			$budget->update($validated);

			// Clear cache
			Cache::forget('senarai_budget');

			return response()->json([
				'message' => 'Budget berjaya dikemaskini',
				'data' => $budget->load('department')
			]);
		} catch (\Exception $e) {
			Log::error('Ralat mengemaskini budget: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mengemaskini budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Padam budget
	 */
	public function destroy($id)
	{
		try {
			$budget = Budget::findOrFail($id);

			// Check if budget is being used in transactions
			$totalSpending = $budget->getTotalSpending();
			if ($totalSpending > 0) {
				return response()->json([
					'message' => 'Budget tidak boleh dipadam kerana masih mempunyai transaksi',
					'spending' => $totalSpending
				], 400);
			}

			$budget->delete();

			// Clear cache
			Cache::forget('senarai_budget');

			return response()->json(['message' => 'Budget berjaya dipadam']);
		} catch (\Exception $e) {
			Log::error('Ralat memadam budget: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat memadam budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Dapatkan ringkasan budget untuk dashboard
	 */
	public function getSummary()
	{
		try {
			$totalBudgets = Budget::count();
			$totalAllocated = Budget::sum('bdgtotal');
			$totalBalance = Budget::sum('balance');
			$totalSpent = $totalAllocated - $totalBalance;

			return response()->json([
				'data' => [
					'total_budgets' => $totalBudgets,
					'total_allocated' => $totalAllocated,
					'total_spent' => $totalSpent,
					'total_balance' => $totalBalance,
					'utilization_percentage' => $totalAllocated > 0 ? ($totalSpent / $totalAllocated) * 100 : 0
				]
			]);
		} catch (\Exception $e) {
			Log::error('Ralat mendapatkan ringkasan budget: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mendapatkan ringkasan budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Dapatkan budget berdasarkan jabatan
	 */
	public function getByDepartment($departmentId)
	{
		try {
			$budgets = Budget::where('department_id', $departmentId)
				->with('department')
				->get();

			return response()->json(['data' => $budgets]);
		} catch (\Exception $e) {
			Log::error('Ralat mendapatkan budget jabatan: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mendapatkan budget jabatan',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Dapatkan budget berdasarkan tahun
	 */
	public function getByYear($year)
	{
		try {
			$budgets = Budget::where('yearly', $year)
				->with('department')
				->get();

			return response()->json(['data' => $budgets]);
		} catch (\Exception $e) {
			Log::error('Ralat mendapatkan budget tahun: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mendapatkan budget tahun',
				'error' => $e->getMessage()
			], 500);
		}
	}
}
