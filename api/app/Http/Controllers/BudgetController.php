<?php

namespace App\Http\Controllers;

use App\Http\Requests\BudgetRequest;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BudgetController extends Controller
{
	public function index()
	{
		try {
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

	public function store(BudgetRequest $request)
	{
		try {
			$validated = $request->validated();

			// Calculate bdgtotal if budget fields provided
			if ($this->hasBudgetFields($validated)) {
				$validated['bdgtotal'] = $this->calculateBudgetTotal($validated);
			}

			// Calculate acttotal if actual fields provided
			if ($this->hasActualFields($validated)) {
				$validated['acttotal'] = $this->calculateActualTotal($validated);
			}

			// Calculate balance
			$validated['balance'] = ($validated['bdgtotal'] ?? 0) - ($validated['acttotal'] ?? 0);

			$budget = Budget::create($validated);
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

	// 1. Update nama dan level
	public function updateNameAndLevel(Request $request, $id)
	{
		try {
			$request->validate([
				'name' => 'sometimes|string|max:255',
				'code' => 'sometimes|string|max:255',
				'level' => 'sometimes|integer|min:0',
				'is_group' => 'sometimes|boolean',
				'group_type' => 'sometimes|string|nullable',
				'sort_order' => 'sometimes|integer',
				'parent_id' => 'sometimes|nullable|exists:budgets,id'
			]);

			$budget = Budget::findOrFail($id);
			$budget->update($request->only(['name', 'code', 'level', 'is_group', 'group_type', 'sort_order', 'parent_id']));

			Cache::forget('senarai_budget');

			return response()->json([
				'message' => 'Nama dan level berjaya dikemaskini',
				'data' => $budget->load('department')
			]);
		} catch (\Exception $e) {
			Log::error('Ralat update nama/level: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mengemaskini nama dan level',
				'error' => $e->getMessage()
			], 500);
		}
	}

	// 2. Update budget allocation (bdg1-bdg12)
	public function updateBudgetAllocation(Request $request, $id)
	{
		try {
			$request->validate([
				'bdg1' => 'sometimes|numeric|min:0',
				'bdg2' => 'sometimes|numeric|min:0',
				'bdg3' => 'sometimes|numeric|min:0',
				'bdg4' => 'sometimes|numeric|min:0',
				'bdg5' => 'sometimes|numeric|min:0',
				'bdg6' => 'sometimes|numeric|min:0',
				'bdg7' => 'sometimes|numeric|min:0',
				'bdg8' => 'sometimes|numeric|min:0',
				'bdg9' => 'sometimes|numeric|min:0',
				'bdg10' => 'sometimes|numeric|min:0',
				'bdg11' => 'sometimes|numeric|min:0',
				'bdg12' => 'sometimes|numeric|min:0',
			]);

			$budget = Budget::findOrFail($id);

			// Update budget fields
			$budgetFields = ['bdg1', 'bdg2', 'bdg3', 'bdg4', 'bdg5', 'bdg6', 'bdg7', 'bdg8', 'bdg9', 'bdg10', 'bdg11', 'bdg12'];
			foreach ($budgetFields as $field) {
				if ($request->has($field)) {
					$budget->$field = $request->$field;
				}
			}

			// Calculate and update bdgtotal
			$budget->bdgtotal = $budget->calculateBudgetTotal();
			$budget->balance = $budget->calculateBalance();
			$budget->save();

			Cache::forget('senarai_budget');

			return response()->json([
				'message' => 'Budget allocation berjaya dikemaskini',
				'data' => $budget->load('department'),
				'bdgtotal' => $budget->bdgtotal,
				'balance' => $budget->balance
			]);
		} catch (\Exception $e) {
			Log::error('Ralat update budget allocation: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mengemaskini budget allocation',
				'error' => $e->getMessage()
			], 500);
		}
	}

	// 3. Update actual spending (act1-act12) - untuk transaksi
	public function updateActualSpending(Request $request, $id)
	{
		try {
			$request->validate([
				'act1' => 'sometimes|numeric|min:0',
				'act2' => 'sometimes|numeric|min:0',
				'act3' => 'sometimes|numeric|min:0',
				'act4' => 'sometimes|numeric|min:0',
				'act5' => 'sometimes|numeric|min:0',
				'act6' => 'sometimes|numeric|min:0',
				'act7' => 'sometimes|numeric|min:0',
				'act8' => 'sometimes|numeric|min:0',
				'act9' => 'sometimes|numeric|min:0',
				'act10' => 'sometimes|numeric|min:0',
				'act11' => 'sometimes|numeric|min:0',
				'act12' => 'sometimes|numeric|min:0',
			]);

			$budget = Budget::findOrFail($id);

			// Update actual fields
			$actualFields = ['act1', 'act2', 'act3', 'act4', 'act5', 'act6', 'act7', 'act8', 'act9', 'act10', 'act11', 'act12'];
			foreach ($actualFields as $field) {
				if ($request->has($field)) {
					$budget->$field = $request->$field;
				}
			}

			// Calculate and update acttotal and balance
			$budget->acttotal = $budget->calculateActualTotal();
			$budget->balance = $budget->calculateBalance();
			$budget->save();

			Cache::forget('senarai_budget');

			return response()->json([
				'message' => 'Actual spending berjaya dikemaskini',
				'data' => $budget->load('department'),
				'acttotal' => $budget->acttotal,
				'balance' => $budget->balance
			]);
		} catch (\Exception $e) {
			Log::error('Ralat update actual spending: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mengemaskini actual spending',
				'error' => $e->getMessage()
			], 500);
		}
	}

	// Original update method (kombinasi semua)
	public function update(BudgetRequest $request, $id)
	{
		try {
			$budget = Budget::findOrFail($id);
			$validated = $request->validated();

			// Update all fields first
			$budget->fill($validated);

			// Recalculate totals if budget or actual fields changed
			if ($this->hasBudgetFields($validated)) {
				$budget->bdgtotal = $budget->calculateBudgetTotal();
			}

			if ($this->hasActualFields($validated)) {
				$budget->acttotal = $budget->calculateActualTotal();
			}

			// Always recalculate balance
			$budget->balance = $budget->calculateBalance();
			$budget->save();

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

	// Helper methods
	private function hasBudgetFields($data)
	{
		$budgetFields = ['bdg1', 'bdg2', 'bdg3', 'bdg4', 'bdg5', 'bdg6', 'bdg7', 'bdg8', 'bdg9', 'bdg10', 'bdg11', 'bdg12'];
		return collect($budgetFields)->some(fn($field) => array_key_exists($field, $data));
	}

	private function hasActualFields($data)
	{
		$actualFields = ['act1', 'act2', 'act3', 'act4', 'act5', 'act6', 'act7', 'act8', 'act9', 'act10', 'act11', 'act12'];
		return collect($actualFields)->some(fn($field) => array_key_exists($field, $data));
	}

	private function calculateBudgetTotal($data)
	{
		$total = 0;
		for ($i = 1; $i <= 12; $i++) {
			$field = 'bdg' . $i;
			$total += (float) ($data[$field] ?? 0);
		}
		return $total;
	}

	private function calculateActualTotal($data)
	{
		$total = 0;
		for ($i = 1; $i <= 12; $i++) {
			$field = 'act' . $i;
			$total += (float) ($data[$field] ?? 0);
		}
		return $total;
	}

    // Existing methods remain the same...
	public function show($id) { /* same as before */ }
	public function destroy($id) { /* same as before */ }
	public function getSummary() { /* same as before */ }
	public function getByDepartment($departmentId) { /* same as before */ }
	public function getByYear($year) { /* same as before */ }

	// BudgetController.php - tambah method ini
	public function getHierarchical()
	{
		try {
			// Get all budgets with hierarchy
			$budgets = Budget::with(['parent', 'children'])
				->orderBy('level')
				->orderBy('sort_order')
				->orderBy('code')
				->get();

			// Build tree structure
			$tree = $this->buildTree($budgets);

			return response()->json([
				'data' => $tree,
				'flat' => $budgets  // For form dropdowns
			]);
		} catch (\Exception $e) {
			return response()->json([
				'message' => 'Ralat mendapatkan hierarki budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	private function buildTree($budgets, $parentId = null)
	{
		$tree = [];

		foreach ($budgets as $budget) {
			if ($budget->parent_id == $parentId) {
				$budget->children_tree = $this->buildTree($budgets, $budget->id);
				$tree[] = $budget;
			}
		}

		return $tree;
	}
}
