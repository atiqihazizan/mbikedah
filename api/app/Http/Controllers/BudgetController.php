<?php

namespace App\Http\Controllers;

use App\Http\Requests\BudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Http\Resources\BudgetCollection;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class BudgetController extends Controller
{
	// Cache constants
	private const CACHE_KEY_BUDGETS = 'budgets_list';
	private const CACHE_KEY_HIERARCHICAL = 'budgets_hierarchical';
	private const CACHE_KEY_SUMMARY = 'budgets_summary';
	private const CACHE_TTL = 30;  // minutes

	/**
	 * Get all budgets with improved caching
	 */
	public function index(Request $request)
	{
		try {
			// Get pagination and search parameters
			$perPage = $request->get('pagination_no', 10);
			$searchCode = $request->get('code', '');
			
			// Build query with search filter
			$query = Budget::with(['department', 'budgetHistory'])
				->orderBy('type', 'asc')
				->orderBy('code', 'asc')
				->orderBy('level', 'asc')
				->orderBy('sort_order', 'asc');
			
			// Apply search filter if code parameter is provided
			if (!empty($searchCode)) {
				$query->where('code', 'LIKE', '%' . $searchCode . '%');
			}

			return response()->json([
				'success' => true,
				'data' => $query->get()
			]);
			
		} catch (\Exception $e) {
			Log::error('Error retrieving budgets: ' . $e->getMessage());
			
			return response()->json([
				'success' => false,
				'message' => 'Failed to retrieve budgets',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Store new budget
	 */
	public function store(BudgetRequest $request)
	{
		try {
			DB::beginTransaction();

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

			// Update parent's child_count if this budget has a parent
			if ($budget->parent_id) {
				$parent = Budget::find($budget->parent_id);
				if ($parent) {
					$parent->child_count = $parent->children()->count();
					$parent->save();
				}
			}

			DB::commit();

			// Update parent budget cumulative totals automatically
			$this->updateParentBudgetCumulative($budget->id);

			// Clear all budget-related cache
			$this->clearAllBudgetCache();

			Log::info('Budget created successfully', [
				'budget_id' => $budget->id,
				'code' => $budget->code,
				'name' => $budget->name
			]);

			return response()->json([
				'message' => 'Budget berjaya disimpan',
				'data' => $budget->load(['department', 'parent', 'children'])
			], 201);
		} catch (\Exception $e) {
			DB::rollBack();
			Log::error('Error creating budget: ' . $e->getMessage(), [
				'request_data' => $request->all(),
				'trace' => $e->getTraceAsString()
			]);
			return response()->json([
				'message' => 'Ralat menyimpan budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Show specific budget
	 */
	public function show($id)
	{
		try {
			$budget = Budget::with(['department', 'parent', 'children'])
				->findOrFail($id);

			return response()->json([
				'success' => true,
				'message' => 'Budget retrieved successfully',
				'data' => new BudgetResource($budget),
				'breadcrumb' => $this->getBreadcrumb($budget)
			]);
		} catch (\Exception $e) {
			Log::error('Error getting budget: ' . $e->getMessage(), ['budget_id' => $id]);
			return response()->json([
				'success' => false,
				'message' => 'Budget tidak dijumpai',
				'error' => $e->getMessage()
			], 404);
		}
	}

	/**
	 * Update nama dan level
	 */
	public function updateNameAndLevel(Request $request, $id)
	{
		try {
			DB::beginTransaction();

			$request->validate([
				'name' => 'sometimes|string|max:255',
				'code' => 'sometimes|string|max:255|unique:budgets,code,' . $id,
				'level' => 'sometimes|integer|min:0|max:10',
				'is_group' => 'sometimes|boolean',
				'group_type' => 'sometimes|string|nullable|in:main,sub,detail',
				'sort_order' => 'sometimes|integer|min:1',
				'parent_id' => 'sometimes|nullable|exists:budgets,id',
				'department_id' => 'sometimes|nullable|exists:departments,id',
				'type' => 'sometimes|integer|in:0,1,2'
			]);

			$budget = Budget::findOrFail($id);

			// Validate parent relationship
			if ($request->has('parent_id') && $request->parent_id) {
				$this->validateParentRelationship($budget, $request->parent_id, $request->level ?? $budget->level);
			}

			$budget->update($request->only([
				'name', 'code', 'level', 'is_group', 'group_type',
				'sort_order', 'parent_id', 'department_id', 'type'
			]));

			// Update child_count on parent budgets if parent_id changed
			if ($request->has('parent_id')) {
				// Update old parent's child_count (if budget had a previous parent)
				if ($budget->getOriginal('parent_id')) {
					$oldParent = Budget::find($budget->getOriginal('parent_id'));
					if ($oldParent) {
						$oldParent->child_count = $oldParent->children()->count();
						$oldParent->save();
					}
				}

				// Update new parent's child_count (if new parent exists)
				if ($request->parent_id) {
					$newParent = Budget::find($request->parent_id);
					if ($newParent) {
						$newParent->child_count = $newParent->children()->count();
						$newParent->save();
					}
				}
			}

			DB::commit();

			// Update parent budget cumulative totals automatically
			$this->updateParentBudgetCumulative($id);

			// Clear all budget-related cache
			$this->clearAllBudgetCache();

			Log::info('Budget name/level updated', [
				'budget_id' => $budget->id,
				'changes' => $request->only(['name', 'code', 'level', 'parent_id'])
			]);

			return response()->json([
				'message' => 'Nama dan level berjaya dikemaskini',
				'data' => $budget->load(['department', 'parent', 'children'])
			]);
		} catch (\Exception $e) {
			DB::rollBack();
			Log::error('Error updating budget name/level: ' . $e->getMessage(), [
				'budget_id' => $id,
				'request_data' => $request->all()
			]);
			return response()->json([
				'message' => 'Ralat mengemaskini nama dan level',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Update budget allocation (bdg1-bdg12)
	 */
	public function updateBudgetAllocation(Request $request, $id)
	{
		try {
			DB::beginTransaction();

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
				'bdgtotal' => 'sometimes|numeric|min:0', // Accept bdgtotal from frontend
				'acttotal' => 'sometimes|numeric|min:0', // Accept acttotal from frontend
				'year' => 'sometimes|integer|min:2000|max:2100', // Add year validation
			]);

			// Determine which table to use based on year parameter
			$currentYear = (int) date('Y');
			$requestYear = $request->has('year') ? (int) $request->input('year') : $currentYear;
			
			// Validate that we're not trying to update future years
			if ($requestYear > $currentYear) {
				return response()->json([
					'message' => 'Tidak boleh mengemaskini budget untuk tahun hadapan',
					'error' => 'Cannot update budget for future years'
				], 400);
			}
			
			// Semak jika table budgets_[tahun] wujud atau tidak
			// Jika tahun sekarang dan ke atas, pilih table budgets
			if ($requestYear < $currentYear) {
				$tableName = 'budgets_' . $requestYear;
				
				// Check if the archive table exists
				if (!Schema::hasTable($tableName)) {
					return response()->json([
						'message' => 'Table ' . $tableName . ' tidak wujud',
						'error' => 'Archive table not found'
					], 404);
				}
				
				// Get budget from archive table
				$budget = DB::table($tableName)->where('id', $id)->first();
				if (!$budget) {
					return response()->json([
						'message' => 'Budget tidak dijumpai dalam table ' . $tableName,
						'error' => 'Budget not found in archive table'
					], 404);
				}
				
				// Convert to object for easier manipulation
				$budget = (object) $budget;
				$oldTotal = $budget->bdgtotal ?? 0;
			} else {
				// Gunakan table budgets untuk tahun sekarang dan ke atas
				$budget = Budget::findOrFail($id);
				$oldTotal = $budget->bdgtotal;
			}

			// Update budget fields
			$budgetFields = ['bdg1', 'bdg2', 'bdg3', 'bdg4', 'bdg5', 'bdg6', 'bdg7', 'bdg8', 'bdg9', 'bdg10', 'bdg11', 'bdg12'];
			foreach ($budgetFields as $field) {
				if ($request->has($field)) {
					$budget->$field = $request->$field;
				}
			}

			// Use bdgtotal from frontend instead of recalculating
			if ($request->has('bdgtotal')) {
				$budget->bdgtotal = $request->bdgtotal;
			} else {
				// Fallback: calculate if not provided
				if (method_exists($budget, 'calculateBudgetTotal')) {
					$budget->bdgtotal = $budget->calculateBudgetTotal();
				} else {
					// For archive tables, calculate manually
					$budget->bdgtotal = array_sum([
						$budget->bdg1 ?? 0, $budget->bdg2 ?? 0, $budget->bdg3 ?? 0,
						$budget->bdg4 ?? 0, $budget->bdg5 ?? 0, $budget->bdg6 ?? 0,
						$budget->bdg7 ?? 0, $budget->bdg8 ?? 0, $budget->bdg9 ?? 0,
						$budget->bdg10 ?? 0, $budget->bdg11 ?? 0, $budget->bdg12 ?? 0
					]);
				}
			}

			// Update acttotal from frontend if provided
			if ($request->has('acttotal')) {
				$budget->acttotal = $request->acttotal;
			}

			// Update budget_months based on which months have budget allocation
			$budgetMonths = [];
			foreach ($budgetFields as $field) {
				$monthNumber = (int) substr($field, 3); // Extract month number from bdg1, bdg2, etc.
				if ($budget->$field > 0) {
					$budgetMonths[] = $monthNumber;
				}
			}
			$budget->budget_months = $budgetMonths;
			
			// Calculate budget_month_count (number of months with budget allocation)
			$budget->budget_month_count = count($budgetMonths);
			
			// Determine budget_type based on allocation pattern
			if ($budget->budget_month_count === 0) {
				$budget->budget_type = 'yearly'; // No monthly allocation (default to monthly)
			} elseif ($budget->budget_month_count === 12) {
				$budget->budget_type = 'monthly'; // All 12 months
			} elseif ($budget->budget_month_count === 1) {
				$budget->budget_type = 'yearly'; // Single month
			} else {
				// For 2-11 months, determine if it's quarterly or monthly
				if (in_array($budget->budget_month_count, [3, 6, 9])) {
					$budget->budget_type = 'quarterly'; // Quarterly distribution
				} else {
					$budget->budget_type = 'monthly'; // Other partial distributions
				}
			}
			
			// Update balance based on new bdgtotal
			$budget->balance = $budget->bdgtotal - $budget->acttotal;
			
			// Save budget based on which table we're using
			if (isset($tableName) && $tableName !== 'budgets') {
				// Update archive table
				Log::info('Updating budget allocation in archive table', [
					'table' => $tableName,
					'budget_id' => $id,
					'year' => $requestYear
				]);
				
				DB::table($tableName)->where('id', $id)->update([
					'bdg1' => $budget->bdg1,
					'bdg2' => $budget->bdg2,
					'bdg3' => $budget->bdg3,
					'bdg4' => $budget->bdg4,
					'bdg5' => $budget->bdg5,
					'bdg6' => $budget->bdg6,
					'bdg7' => $budget->bdg7,
					'bdg8' => $budget->bdg8,
					'bdg9' => $budget->bdg9,
					'bdg10' => $budget->bdg10,
					'bdg11' => $budget->bdg11,
					'bdg12' => $budget->bdg12,
					'bdgtotal' => $budget->bdgtotal,
					'acttotal' => $budget->acttotal,
					'budget_months' => json_encode($budget->budget_months),
					'budget_month_count' => $budget->budget_month_count,
					'budget_type' => $budget->budget_type,
					'balance' => $budget->balance,
					'updated_at' => now()
				]);
			} else {
				// Save to main budgets table
				Log::info('Updating budget allocation in main table', [
					'table' => 'budgets',
					'budget_id' => $id,
					'year' => $requestYear
				]);
				$budget->save();
			}

			DB::commit();

			// Update parent budget cumulative totals automatically
			$this->updateParentBudgetCumulative($id);

			// Clear cache
			$this->clearAllBudgetCache();

			// Prepare response data
			$responseData = [
				'message' => 'Budget allocation berjaya dikemaskini',
				'table_used' => isset($tableName) ? $tableName : 'budgets',
				'summary' => [
					'bdgtotal' => $budget->bdgtotal,
					'acttotal' => $budget->acttotal ?? 0,
					'balance' => $budget->bdgtotal - $oldTotal,
					'budget_months' => $budgetMonths,
					'budget_month_count' => $budget->budget_month_count,
					'budget_type' => $budget->budget_type
				]
			];
			
			// Add detailed data if using main table (can load relationships)
			if (!isset($tableName) || $tableName === 'budgets') {
				$responseData['data'] = $budget->load(['department', 'parent', 'children']);
			} else {
				// For archive tables, just return the basic budget data
				$responseData['data'] = $budget;
			}
			
			return response()->json($responseData);
		} catch (\Exception $e) {
			DB::rollBack();
			Log::error('Error updating budget allocation: ' . $e->getMessage(), [
				'budget_id' => $id,
				'request_data' => $request->all()
			]);
			return response()->json([
				'message' => 'Ralat mengemaskini budget allocation',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Update actual spending (act1-act12)
	 */
	public function updateActualSpending(Request $request, $id)
	{
		try {
			DB::beginTransaction();

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
			$oldActual = $budget->acttotal;

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

			DB::commit();

			// Update parent budget cumulative totals automatically
			$this->updateParentBudgetCumulative($id);

			// Clear cache
			$this->clearAllBudgetCache();

			Log::info('Actual spending updated', [
				'budget_id' => $budget->id,
				'old_actual' => $oldActual,
				'new_actual' => $budget->acttotal
			]);

			return response()->json([
				'message' => 'Actual spending berjaya dikemaskini',
				'data' => $budget->load(['department', 'parent', 'children']),
				'summary' => [
					'bdgtotal' => $budget->bdgtotal,
					'acttotal' => $budget->acttotal,
					'balance' => $budget->balance,
					'change' => $budget->acttotal - $oldActual,
					'utilization_pct' => $budget->bdgtotal > 0 ? round(($budget->acttotal / $budget->bdgtotal) * 100, 2) : 0
				]
			]);
		} catch (\Exception $e) {
			DB::rollBack();
			Log::error('Error updating actual spending: ' . $e->getMessage(), [
				'budget_id' => $id,
				'request_data' => $request->all()
			]);
			return response()->json([
				'message' => 'Ralat mengemaskini actual spending',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Update budget structure fields (child_count, is_group, sort_order)
	 */
	public function updateBudgetStructure(Request $request, $id)
	{
		try {
			DB::beginTransaction();

			$request->validate([
				'child_count' => 'sometimes|integer|min:0',
				'is_group' => 'sometimes|boolean',
				'sort_order' => 'sometimes|integer|min:1',
				'year' => 'sometimes|integer|min:2000|max:2100'
			]);

			$budget = Budget::findOrFail($id);

			// Update the fields
			$updateData = [];
			
			if ($request->has('child_count')) {
				$updateData['child_count'] = $request->child_count;
			}
			
			if ($request->has('is_group')) {
				$updateData['is_group'] = $request->is_group;
			}
			
			if ($request->has('sort_order')) {
				$updateData['sort_order'] = $request->sort_order;
			}

			// Only update if there are changes
			if (!empty($updateData)) {
				$budget->update($updateData);
			}

			DB::commit();

			// Update parent budget cumulative totals automatically
			$this->updateParentBudgetCumulative($id);

			// Clear all budget-related cache
			$this->clearAllBudgetCache();

			Log::info('Budget structure updated', [
				'budget_id' => $budget->id,
				'changes' => $updateData
			]);

			return response()->json([
				'success' => true,
				'message' => 'Struktur budget berjaya dikemaskini',
				'data' => $budget->load(['department', 'parent', 'children'])
			]);
		} catch (\Exception $e) {
			DB::rollBack();
			Log::error('Error updating budget structure: ' . $e->getMessage(), [
				'budget_id' => $id,
				'request_data' => $request->all()
			]);
			return response()->json([
				'success' => false,
				'message' => 'Ralat mengemaskini struktur budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Combined update method
	 */
	public function update(BudgetRequest $request, $id)
	{
		try {
			DB::beginTransaction();

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

			DB::commit();

			// Update parent budget cumulative totals automatically
			$this->updateParentBudgetCumulative($id);

			// Clear cache
			$this->clearAllBudgetCache();

			Log::info('Budget updated (combined)', ['budget_id' => $budget->id]);

			return response()->json([
				'message' => 'Budget berjaya dikemaskini',
				'data' => $budget->load(['department', 'parent', 'children'])
			]);
		} catch (\Exception $e) {
			DB::rollBack();
			Log::error('Error updating budget (combined): ' . $e->getMessage(), [
				'budget_id' => $id,
				'request_data' => $request->all()
			]);
			return response()->json([
				'message' => 'Ralat mengemaskini budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Delete budget
	 */
	public function destroy($id)
	{
		try {
			DB::beginTransaction();

			$budget = Budget::findOrFail($id);

			// Check if budget has children
			if ($budget->children()->count() > 0) {
				return response()->json([
					'message' => 'Budget tidak boleh dipadam kerana mempunyai sub-budget',
					'children_count' => $budget->children()->count()
				], 400);
			}

			// Check if budget is being used in transactions
			$totalSpending = $budget->getTotalSpending();
			if ($totalSpending > 0) {
				return response()->json([
					'message' => 'Budget tidak boleh dipadam kerana masih mempunyai transaksi',
					'spending' => $totalSpending
				], 400);
			}

			$budgetName = $budget->name;
			$budgetCode = $budget->code;

			$budget->delete();

			DB::commit();

			// Update parent budget cumulative totals after deletion
			if ($budget->parent_id) {
				$this->updateParentBudgetCumulative($budget->parent_id);
			}

			// Clear cache
			$this->clearAllBudgetCache();

			Log::info('Budget deleted', [
				'budget_id' => $id,
				'code' => $budgetCode,
				'name' => $budgetName
			]);

			return response()->json([
				'message' => 'Budget berjaya dipadam'
			]);
		} catch (\Exception $e) {
			if (DB::transactionLevel() > 0) {
				DB::rollBack();
			}
			Log::error('Error deleting budget: ' . $e->getMessage(), ['budget_id' => $id]);
			return response()->json([
				'message' => 'Ralat memadam budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Get budgets by year
	 */
	public function getByYear($year)
	{
		try {
			// Validate year parameter
			if (!is_numeric($year) || $year < 2000 || $year > 2100) {
				return response()->json([
					'success' => false,
					'message' => 'Tahun tidak sah. Tahun mestilah antara 2000-2100',
					'error' => 'Invalid year parameter'
				], 400);
			}

			$year = (int) $year;
			$budgets = [];
			$currentYear = (int) date('Y');
			$archiveTable = 'budgets_' . $year;

			// Handle different year scenarios
			if ($year > $currentYear) {
				// Future year - return empty with message
				return response()->json([
					'success' => true,
					'data' => [],
					'year' => $year,
					'message' => 'Tahun hadapan - tiada data budget tersedia'
				]);
			} else if ($year === $currentYear) {
				// Current year - get from main budgets table
				$budgets = Budget::with(['department', 'parent', 'children'])
					// ->where('yearly', $year)
					->orderBy('type', 'asc')
					->orderBy('code', 'asc')
					->orderBy('level', 'asc')
					->orderBy('sort_order', 'asc')
					->get();
			} else if ($year > 2023 && $year < $currentYear) {
				// Archive year - check if archive table exists
				if (Schema::hasTable($archiveTable)) {
					$budgets = DB::table($archiveTable)
						->where('yearly', $year)
						->orderBy('type', 'asc')
						->orderBy('code', 'asc')
						->orderBy('level', 'asc')
						->orderBy('sort_order', 'asc')
						->get();
				} else {
					// Archive table doesn't exist for this year
					return response()->json([
						'success' => true,
						'data' => [],
						'year' => $year,
						'message' => 'Tiada data arkib tersedia untuk tahun ini'
					]);
				}
			} else {
				// Year before 2023 - return empty with message
				return response()->json([
					'success' => true,
					'data' => [],
					'year' => $year,
					'message' => 'Tiada data budget tersedia untuk tahun sebelum 2023'
				]);
			}
			
			return response()->json([
				'success' => true,
				'data' => $budgets,
				'year' => $year,
				'count' => count($budgets)
			]);
		} catch (\Exception $e) {
			Log::error('Error getting budget by year: ' . $e->getMessage(), [
				'year' => $year,
				'file' => __FILE__,
				'line' => __LINE__
			]);
			
			return response()->json([
				'success' => false,
				'message' => 'Ralat mendapatkan budget tahun',
				'error' => $e->getMessage()
			], 500);
		}
	}


	/**
	 * Get budgets by department ID
	 */
	public function getByDepartment($departmentId)
	{
		try {
			// Validate department ID
			if (!is_numeric($departmentId) || $departmentId < 1) {
				return response()->json([
					'success' => false,
					'message' => 'ID Jabatan tidak sah',
					'error' => 'Invalid department ID parameter'
				], 400);
			}

			$departmentId = (int) $departmentId;

					// Get budgets for the specified department (only select specific fields)
		// Filter: type = 1 (Revenue) or 2 (Expenditure), child_count = 0, and bdgtotal > 0
		$budgets = Budget::select(['id', 'code', 'name', 'bdgtotal'])
			// ->where('department_id', $departmentId)
			->whereIn('type', [1, 2])  // type = 1 (Revenue) or 2 (Expenditure)
			->where('child_count', 0)  // no children (leaf nodes)
			// ->where('bdgtotal', '>', 0)  // budget total must be greater than 0
			->orderBy('type', 'asc')
			->orderBy('code', 'asc')
			->orderBy('level', 'asc')
			->orderBy('sort_order', 'asc')
			->get();

			// Check if department exists and has budgets
			if ($budgets->isEmpty()) {
				return response()->json([
					'success' => true,
					'data' => [],
					'department_id' => $departmentId,
					'message' => 'Tiada budget ditemui untuk jabatan ini',
					'count' => 0
				]);
			}

			return response()->json([
				'success' => true,
				'data' => $budgets,
				'department_id' => $departmentId,
				'count' => $budgets->count()
			]);

		} catch (\Exception $e) {
			Log::error('Error getting budget by department: ' . $e->getMessage(), [
				'department_id' => $departmentId,
				'file' => __FILE__,
				'line' => __LINE__
			]);
			
			return response()->json([
				'success' => false,
				'message' => 'Ralat mendapatkan budget jabatan',
				'error' => $e->getMessage()
			], 500);
		}
	}
	public function getForApplicant($departmentId)
	{
		try {
			// Validate department ID
			if (!is_numeric($departmentId) || $departmentId < 1) {
				return response()->json([
					'success' => false,
					'message' => 'ID Jabatan tidak sah',
					'error' => 'Invalid department ID parameter'
				], 400);
			}

			$departmentId = (int) $departmentId;

					// Get budgets for the specified department (only select specific fields)
		// Filter: type = 1 (Revenue) or 2 (Expenditure), child_count = 0, and bdgtotal > 0
		$budgets = Budget::select(['id', 'code', 'name', 'bdgtotal'])
			// ->where('department_id', $departmentId)
			->whereIn('type', [2])  // type = 1 (Revenue) or 2 (Expenditure)
			->where('child_count', 0)  // no children (leaf nodes)
			// ->where('bdgtotal', '>', 0)  // budget total must be greater than 0
			->orderBy('type', 'asc')
			->orderBy('code', 'asc')
			->orderBy('level', 'asc')
			->orderBy('sort_order', 'asc')
			->get();

			// Check if department exists and has budgets
			if ($budgets->isEmpty()) {
				return response()->json([
					'success' => true,
					'data' => [],
					'department_id' => $departmentId,
					'message' => 'Tiada budget ditemui untuk jabatan ini',
					'count' => 0
				]);
			}

			return response()->json([
				'success' => true,
				'data' => $budgets,
				'department_id' => $departmentId,
				'count' => $budgets->count()
			]);

		} catch (\Exception $e) {
			Log::error('Error getting budget by department: ' . $e->getMessage(), [
				'department_id' => $departmentId,
				'file' => __FILE__,
				'line' => __LINE__
			]);
			
			return response()->json([
				'success' => false,
				'message' => 'Ralat mendapatkan budget jabatan',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Archive current year's budgets into a year-suffixed table
	 * and optionally create budgets for a new year (archive)
	 */
	public function archiveYear(Request $request)
	{
		$request->validate([
			'from_year' => 'required|integer|min:2000|max:2100',
			'copy_amounts' => 'sometimes|boolean',
			'force' => 'sometimes|boolean',
		]);

		$fromYear = (int) $request->input('from_year');
		$currentYear = (int) date('Y');
		
		// Validate that from_year is not current year or future years
		if ($fromYear >= $currentYear) {
			return response()->json([
				'message' => 'Tidak boleh arkib budget untuk tahun sekarang dan ke atas',
				'error' => 'Cannot archive budget for current year or future years',
				'from_year' => $fromYear,
				'current_year' => $currentYear
			], 400);
		}
		
		$force = (bool) $request->boolean('force', false);
		$archiveTable = 'budgets_' . $fromYear;

		try {
			// 1) Create archive table if not exists (MySQL specific CREATE LIKE)
			if (!Schema::hasTable($archiveTable)) {
				DB::statement("CREATE TABLE `{$archiveTable}` LIKE `budgets`");
			}

			// 2) Archive current year's data (skip if already archived and not force)
			$archivedCount = 0;
			if ($force || (DB::table($archiveTable)->count() === 0)) {
				$archivedCount = DB::table('budgets')->where('yearly', $fromYear)->count();
				// DB::statement("INSERT INTO `{$archiveTable}` SELECT * FROM `budgets` WHERE `yearly` = ?", [$fromYear]);
				DB::statement("INSERT INTO `{$archiveTable}` SELECT * FROM `budgets`");
			}

			// 3) Update existing budgets year to target year
			DB::table('budgets')->update(['yearly' => $currentYear]);
			DB::table($archiveTable)->update(['yearly' => $fromYear]);
			
			$this->clearAllBudgetCache();

			return response()->json([
				'success' => true,
				'message' => 'Arkib budget berjaya',
			]);
		} catch (\Exception $e) {
			return response()->json([
				'message' => 'Ralat proses arkib budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Get budget summary data (similar to budgetSummary.json)
	 */
	public function getBudgetSummaryData()
	{
		try {
			$currentYear = date('Y');
			$year1 = $currentYear - 1;
			// Disable 2 years back data
			// $year2 = $currentYear - 2;
			
			// Get current year data from main budgets table
			$budgetSummary = Budget::where('level', 0)
				->orderBy('type', 'asc')
				->get();

			// Initialize data structure
			$data = [
				'revenueData' => $budgetSummary->where('type', 1)->map(fn($item) => $this->formatBudgetItemWithYears($item, $currentYear, $year1))->values(),
				'expenditureData' => $budgetSummary->where('type', 2)->map(fn($item) => $this->formatBudgetItemWithYears($item, $currentYear, $year1))->values(),
				'operationData' => $budgetSummary->where('type', 0)->map(fn($item) => $this->formatBudgetItemWithYears($item, $currentYear, $year1))->values()
			];

			// Get data from previous year if table exists (only 1 year back)
			$data = $this->mergeYearData($data, $year1);

			// Ensure all items have the value array with 2 years (current + 1 year back)
			$data = $this->ensureValueArrayStructure($data);

			// Calculate summary totals for frontend
			$data = $this->calculateSummaryTotals($data);

			return response()->json([
				'success' => true,
				'data' => $data,
				'message' => 'Budget summary data retrieved successfully',
			]);

		} catch (\Exception $e) {
			Log::error('Error getting budget summary data: ' . $e->getMessage());
			return response()->json([
				'success' => false,
				'message' => 'Ralat mendapatkan data ringkasan budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Merge data from previous years into the main data structure
	 */
	private function mergeYearData($data, $year1)
	{
		// Check and get data from year1 (current-1)
		if (Schema::hasTable('budgets_' . $year1)) {
			$budgetSummaryYear1 = DB::table('budgets_' . $year1)
				->where('level', 0)
				->orderBy('type', 'asc')
				->get();

			$data = $this->updateDataWithYearValues($data, $budgetSummaryYear1, $year1);
		}

		return $data;
	}

	/**
	 * Update data structure with values from specific year
	 */
	private function updateDataWithYearValues($data, $yearData, $year)
	{
		$yearIndex = $this->getYearIndex($year);
		$currentYear = date('Y');
		
		// Convert collections to arrays for modification
		$revenueArray = $data['revenueData']->toArray();
		$expenditureArray = $data['expenditureData']->toArray();
		$operationArray = $data['operationData']->toArray();
		
		// Update revenue data
		foreach ($revenueArray as $key => $revenueItem) {
			$yearItem = $yearData->where('code', $revenueItem['code'])->first();
			if ($yearItem) {
				$revenueArray[$key]['bdgttotalvalue'][$yearIndex] = $yearItem->bdgtotal;
				$revenueArray[$key]['acttotalvalue'][$yearIndex] = $yearItem->acttotal;
				// Update dynamic fields for frontend compatibility
				if ($year == $currentYear - 1) { // Previous year
					$revenueArray[$key]["actual{$year}"] = $yearItem->acttotal;
					$revenueArray[$key]["budget{$year}"] = $yearItem->bdgtotal;
				}
			} else {
				$revenueArray[$key]['bdgttotalvalue'][$yearIndex] = '0.00';
				$revenueArray[$key]['acttotalvalue'][$yearIndex] = '0.00';
				// Set dynamic fields to 0 for frontend compatibility
				if ($year == $currentYear - 1) { // Previous year
					$revenueArray[$key]["actual{$year}"] = '0.00';
					$revenueArray[$key]["budget{$year}"] = '0.00';
				}
			}
		}

		// Update expenditure data
		foreach ($expenditureArray as $key => $expenditureItem) {
			$yearItem = $yearData->where('code', $expenditureItem['code'])->first();
			if ($yearItem) {
				$expenditureArray[$key]['bdgttotalvalue'][$yearIndex] = $yearItem->bdgtotal;
				$expenditureArray[$key]['acttotalvalue'][$yearIndex] = $yearItem->acttotal;
				// Update dynamic fields for frontend compatibility
				if ($year == $currentYear - 1) { // Previous year
					$expenditureArray[$key]["actual{$year}"] = $yearItem->acttotal;
					$expenditureArray[$key]["budget{$year}"] = $yearItem->bdgtotal;
				}
			} else {
				$expenditureArray[$key]['bdgttotalvalue'][$yearIndex] = '0.00';
				$expenditureArray[$key]['acttotalvalue'][$yearIndex] = '0.00';
				// Set dynamic fields to 0 for frontend compatibility
				if ($year == $currentYear - 1) { // Previous year
					$expenditureArray[$key]["actual{$year}"] = '0.00';
					$expenditureArray[$key]["budget{$year}"] = '0.00';
				}
			}
		}

		// Update operation data
		foreach ($operationArray as $key => $operationItem) {
			$yearItem = $yearData->where('code', $operationItem['code'])->first();
			if ($yearItem) {
				$operationArray[$key]['bdgttotalvalue'][$yearIndex] = $yearItem->bdgtotal;
				$operationArray[$key]['acttotalvalue'][$yearIndex] = $yearItem->acttotal;
				// Update dynamic fields for frontend compatibility
				if ($year == $currentYear - 1) { // Previous year
					$operationArray[$key]["actual{$year}"] = $yearItem->acttotal;
					$operationArray[$key]["budget{$year}"] = $yearItem->bdgtotal;
				}
			} else {
				$operationArray[$key]['bdgttotalvalue'][$yearIndex] = '0.00';
				$operationArray[$key]['acttotalvalue'][$yearIndex] = '0.00';
				// Set dynamic fields to 0 for frontend compatibility
				if ($year == $currentYear - 1) { // Previous year
					$operationArray[$key]["actual{$year}"] = '0.00';
					$operationArray[$key]["budget{$year}"] = '0.00';
				}
			}
		}

		// Update the data structure with modified arrays
		$data['revenueData'] = collect($revenueArray);
		$data['expenditureData'] = collect($expenditureArray);
		$data['operationData'] = collect($operationArray);

		return $data;
	}

	/**
	 * Get year index for value array (0 = current year, 1 = year-1, 2 = year-2)
	 */
	private function getYearIndex($year)
	{
		$currentYear = date('Y');
		if ($year == $currentYear) return 0;
		if ($year == $currentYear - 1) return 1;
		if ($year == $currentYear - 2) return 2;
		return 0;
	}

	/**
	 * Ensure all items have the bdgttotalvalue and acttotalvalue arrays with 2 years (current + 1 year back)
	 */
	private function ensureValueArrayStructure($data)
	{
		$currentYear = date('Y');
		$year1 = $currentYear - 1;
		
		// Ensure revenue data has bdgttotalvalue and acttotalvalue arrays
		foreach ($data['revenueData'] as &$item) {
			if (!isset($item['bdgttotalvalue'])) {
				$item['bdgttotalvalue'] = ['0.00', '0.00'];
			}
			if (!isset($item['acttotalvalue'])) {
				$item['acttotalvalue'] = ['0.00', '0.00'];
			}
			// Ensure all 2 years are present
			for ($i = 0; $i < 2; $i++) {
				if (!isset($item['bdgttotalvalue'][$i])) {
					$item['bdgttotalvalue'][$i] = '0.00';
				}
				if (!isset($item['acttotalvalue'][$i])) {
					$item['acttotalvalue'][$i] = '0.00';
				}
			}
			// Ensure dynamic fields are present
			if (!isset($item["actual{$year1}"])) {
				$item["actual{$year1}"] = $item['acttotalvalue'][1] ?? '0.00';
			}
			if (!isset($item["budget{$year1}"])) {
				$item["budget{$year1}"] = $item['bdgttotalvalue'][1] ?? '0.00';
			}
			if (!isset($item["budget{$currentYear}"])) {
				$item["budget{$currentYear}"] = $item['bdgttotalvalue'][0] ?? '0.00';
			}
		}

		// Ensure expenditure data has bdgttotalvalue and acttotalvalue arrays
		foreach ($data['expenditureData'] as &$item) {
			if (!isset($item['bdgttotalvalue'])) {
				$item['bdgttotalvalue'] = ['0.00', '0.00'];
			}
			if (!isset($item['acttotalvalue'])) {
				$item['acttotalvalue'] = ['0.00', '0.00'];
			}
			// Ensure all 2 years are present
			for ($i = 0; $i < 2; $i++) {
				if (!isset($item['bdgttotalvalue'][$i])) {
					$item['bdgttotalvalue'][$i] = '0.00';
				}
				if (!isset($item['acttotalvalue'][$i])) {
					$item['acttotalvalue'][$i] = '0.00';
				}
			}
			// Ensure dynamic fields are present
			if (!isset($item["actual{$year1}"])) {
				$item["actual{$year1}"] = $item['acttotalvalue'][1] ?? '0.00';
			}
			if (!isset($item["budget{$year1}"])) {
				$item["budget{$year1}"] = $item['bdgttotalvalue'][1] ?? '0.00';
			}
			if (!isset($item["budget{$currentYear}"])) {
				$item["budget{$currentYear}"] = $item['bdgttotalvalue'][0] ?? '0.00';
			}
		}

		// Ensure operation data has bdgttotalvalue and acttotalvalue arrays
		foreach ($data['operationData'] as &$item) {
			if (!isset($item['bdgttotalvalue'])) {
				$item['bdgttotalvalue'] = ['0.00', '0.00'];
			}
			if (!isset($item['acttotalvalue'])) {
				$item['acttotalvalue'] = ['0.00', '0.00'];
			}
			// Ensure all 2 years are present
			for ($i = 0; $i < 2; $i++) {
				if (!isset($item['bdgttotalvalue'][$i])) {
					$item['bdgttotalvalue'][$i] = '0.00';
				}
				if (!isset($item['acttotalvalue'][$i])) {
					$item['acttotalvalue'][$i] = '0.00';
				}
			}
			// Ensure dynamic fields are present
			if (!isset($item["actual{$year1}"])) {
				$item["actual{$year1}"] = $item['acttotalvalue'][1] ?? '0.00';
			}
			if (!isset($item["budget{$year1}"])) {
				$item["budget{$year1}"] = $item['bdgttotalvalue'][1] ?? '0.00';
			}
			if (!isset($item["budget{$currentYear}"])) {
				$item["budget{$currentYear}"] = $item['bdgttotalvalue'][0] ?? '0.00';
			}
		}

		// Unset references
		unset($item);

		return $data;
	}

	/**
	 * Calculate summary totals for frontend (revenueTotal, expenditureTotal, netPosition, runningBalance)
	 */
	private function calculateSummaryTotals($data)
	{
		try {
			$currentYear = date('Y');
			$year1 = $currentYear - 1;
			
			// Validate data structure
			if (!isset($data['revenueData']) || !isset($data['expenditureData']) || !isset($data['operationData'])) {
				throw new \Exception('Invalid data structure: missing required data arrays');
			}
			
			// Debug: Log the data structure
			Log::info('Calculate Summary Totals - Data structure:', [
				'revenueData_count' => $data['revenueData']->count(),
				'expenditureData_count' => $data['expenditureData']->count(),
				'operationData_count' => $data['operationData']->count(),
				'operationData_codes' => $data['operationData']->pluck('code')->toArray()
			]);
			
			// Calculate revenue totals
			$revenueTotal = [
				"actual{$year1}" => 0,
				"budget{$year1}" => 0,
				"budget{$currentYear}" => 0
			];

			foreach ($data['revenueData'] as $item) {
				$revenueTotal["actual{$year1}"] += (float) ($item['acttotalvalue'][1] ?? 0);
				$revenueTotal["budget{$year1}"] += (float) ($item['bdgttotalvalue'][1] ?? 0);
				$revenueTotal["budget{$currentYear}"] += (float) ($item['bdgttotalvalue'][0] ?? 0);
			}

			// Calculate expenditure totals
			$expenditureTotal = [
				"actual{$year1}" => 0,
				"budget{$year1}" => 0,
				"budget{$currentYear}" => 0
			];

			foreach ($data['expenditureData'] as $item) {
				$expenditureTotal["actual{$year1}"] += (float) ($item['acttotalvalue'][1] ?? 0);
				$expenditureTotal["budget{$year1}"] += (float) ($item['bdgttotalvalue'][1] ?? 0);
				$expenditureTotal["budget{$currentYear}"] += (float) ($item['bdgttotalvalue'][0] ?? 0);
			}

			// Calculate net position (revenue - expenditure)
			$netPosition = [
				"actual{$year1}" => $revenueTotal["actual{$year1}"] - $expenditureTotal["actual{$year1}"],
				"budget{$year1}" => $revenueTotal["budget{$year1}"] - $expenditureTotal["budget{$year1}"],
				"budget{$currentYear}" => $revenueTotal["budget{$currentYear}"] - $expenditureTotal["budget{$currentYear}"]
			];

			// Get opening balance from operation data
			$openingBalance = $data['operationData']->where('code', '0001')->first();
			
			// Debug: Log what we found
			Log::info('Opening balance search result:', [
				'found' => $openingBalance ? 'yes' : 'no',
				'type' => $openingBalance ? gettype($openingBalance) : 'null',
				'data' => $openingBalance
			]);
			
			// Handle openingBalance data properly
			$openingBalanceArray = [];
			if ($openingBalance) {
				// If it's an object (collection item), convert to array
				if (is_object($openingBalance)) {
					$openingBalanceArray = $openingBalance->toArray();
				} else {
					// If it's already an array, use it directly
					$openingBalanceArray = $openingBalance;
				}
			}
			
			Log::info('Opening balance array:', $openingBalanceArray);
			
			// Calculate running balance after savings
			$runningBalance = [
				"actual{$year1}" => ($openingBalanceArray['acttotalvalue'][1] ?? 0) + $netPosition["actual{$year1}"],
				"budget{$year1}" => ($openingBalanceArray['bdgttotalvalue'][1] ?? 0) + $netPosition["budget{$year1}"],
				'bdgtotal' => ($openingBalanceArray['bdgttotalvalue'][0] ?? 0) + $netPosition["budget{$currentYear}"]
			];

			// Add summary totals to data
			$data['revenueTotal'] = $revenueTotal;
			$data['expenditureTotal'] = $expenditureTotal;
			$data['netPosition'] = $netPosition;
			$data['runningBalance'] = $runningBalance;

			return $data;
			
		} catch (\Exception $e) {
			Log::error('Error in calculateSummaryTotals: ' . $e->getMessage());
			Log::error('Stack trace: ' . $e->getTraceAsString());
			throw $e;
		}
	}

	/**
	 * Get expense breakdown data (similar to ExpenseBreakdown.json)
	 */
	public function getExpenseBreakdownData()
	{
		try {
			// Clear existing cache first to ensure fresh data
			Cache::forget('expense_breakdown_data_v2');
			
			$data = Cache::remember('expense_breakdown_data_v2', now()->addMinutes(self::CACHE_TTL), function () {
				// Get hierarchical expense data (type 2 = Kredit) - show all levels for type 2
				$expenses = Budget::where('type', 2)
					->with(['department', 'parent', 'children'])
					->orderBy('level')
					->orderBy('sort_order')
					->orderBy('code')
					->get();
				


				// Build hierarchical structure
				$categories = [];
				$rootCategories = $expenses->where('level', 0);

				foreach ($rootCategories as $root) {
					// $category = [
					// 	'title' => $root->name,
					// 	'bgColor' => $root->type == 0 ? 'bg-green-200' : 'bg-red-200',
					// 	'data' => [
					// 		'code' => $root->code,
					// 		'description' => $root->name,
					// 		'actual2024' => $root->acttotal,
					// 		'budget2024' => $root->bdgtotal,
					// 		'budget2025' => $root->bdgtotal,
					// 		'monthly' => [
					// 			'jan' => $root->act1, 'feb' => $root->act2, 'mar' => $root->act3,
					// 			'apr' => $root->act4, 'may' => $root->act5, 'jun' => $root->act6,
					// 			'jul' => $root->act7, 'aug' => $root->act8, 'sep' => $root->act9,
					// 			'oct' => $root->act10, 'nov' => $root->act11, 'dec' => $root->act12
					// 		]
					// 	],
					// 	'subCategories' => []
					// ];

					// Build complete hierarchical structure recursively for all levels
					// $category['subCategories'] = $this->buildHierarchicalStructureForExpenses($expenses, $root->id, 1);
					// $categories[] = $category;

					$category = [
						'title' => $root->name,
						'bgColor' => $root->type == 0 ? 'bg-green-200' : 'bg-red-200',
						'data' => [
							'code' => $root->code,
							'description' => $root->name,
							'actual2024' => $root->acttotal,
							'budget2024' => $root->bdgtotal,
							'budget2025' => $root->bdgtotal,
							'monthly' => [
								'jan' => $root->bdg1 ?: ($root->bdgtotal / 12),
								'feb' => $root->bdg2 ?: ($root->bdgtotal / 12),
								'mar' => $root->bdg3 ?: ($root->bdgtotal / 12),
								'apr' => $root->bdg4 ?: ($root->bdgtotal / 12),
								'may' => $root->bdg5 ?: ($root->bdgtotal / 12),
								'jun' => $root->bdg6 ?: ($root->bdgtotal / 12),
								'jul' => $root->bdg7 ?: ($root->bdgtotal / 12),
								'aug' => $root->bdg8 ?: ($root->bdgtotal / 12),
								'sep' => $root->bdg9 ?: ($root->bdgtotal / 12),
								'oct' => $root->bdg10 ?: ($root->bdgtotal / 12),
								'nov' => $root->bdg11 ?: ($root->bdgtotal / 12),
								'dec' => $root->bdg12 ?: ($root->bdgtotal / 12)
							]
						],
						'subCategories' => []
					];

					$category['subCategories'] = $this->buildHierarchicalStructure($expenses, $root->id, 1);
					$categories[] = $category;
				}

				return [
					'categorySections' => $categories,
					'config' => [
						'organization' => 'MAJLIS BANDARAYA ALOR SETAR',
						'year' => date('Y'),
						'generated_at' => now()->toDateTimeString()
					]
				];
			});

			return response()->json([
				'success' => true,
				'data' => $data,
				'source' => Cache::has('expense_breakdown_data_v2') ? 'cache' : 'database'
			]);
		} catch (\Exception $e) {
			Log::error('Error getting expense breakdown data: ' . $e->getMessage());
			return response()->json([
				'success' => false,
				'message' => 'Ralat mendapatkan data pecahan perbelanjaan',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Get revenue breakdown data (similar to revenueBreakdown.json)
	 */
	public function getRevenueBreakdownData()
	{
		try {
			// Clear existing cache first to ensure fresh data
			Cache::forget('revenue_breakdown_data');
			
			$data = Cache::remember('revenue_breakdown_data', now()->addMinutes(self::CACHE_TTL), function () {
				// Get hierarchical revenue data (type 1 = Debit/Revenue only) - show all levels for type 1
				$revenues = Budget::where('type', 1)
					->with(['department', 'parent', 'children'])
					->orderBy('level')
					->orderBy('sort_order')
					->orderBy('code')
					->get();





				// Build hierarchical structure
				$categories = [];
				$rootCategories = $revenues->where('level', 0);

				foreach ($rootCategories as $root) {
					$category = [
						'title' => $root->name,
						'bgColor' => $root->type == 0 ? 'bg-green-200' : 'bg-blue-200',
						'data' => [
							'code' => $root->code,
							'description' => $root->name,
							'actual2024' => $root->acttotal,
							'budget2024' => $root->bdgtotal,
							'budget2025' => $root->bdgtotal,
							'monthly' => [
								'jan' => $root->bdg1 ?: ($root->bdgtotal / 12),
								'feb' => $root->bdg2 ?: ($root->bdgtotal / 12),
								'mar' => $root->bdg3 ?: ($root->bdgtotal / 12),
								'apr' => $root->bdg4 ?: ($root->bdgtotal / 12),
								'may' => $root->bdg5 ?: ($root->bdgtotal / 12),
								'jun' => $root->bdg6 ?: ($root->bdgtotal / 12),
								'jul' => $root->bdg7 ?: ($root->bdgtotal / 12),
								'aug' => $root->bdg8 ?: ($root->bdgtotal / 12),
								'sep' => $root->bdg9 ?: ($root->bdgtotal / 12),
								'oct' => $root->bdg10 ?: ($root->bdgtotal / 12),
								'nov' => $root->bdg11 ?: ($root->bdgtotal / 12),
								'dec' => $root->bdg12 ?: ($root->bdgtotal / 12)
							]
						],
						'subCategories' => []
					];

					// Build complete hierarchical structure recursively for all levels
					$category['subCategories'] = $this->buildHierarchicalStructure($revenues, $root->id, 1);
					$categories[] = $category;
				}

				return [
					'categorySections' => $categories,
					'config' => [
						'organization' => '',
						'year' => date('Y'),
						'generated_at' => now()->toDateTimeString()
					]
				];
			});

			return response()->json([
				'success' => true,
				'data' => $data,
				'source' => Cache::has('revenue_breakdown_data') ? 'cache' : 'database'
			]);
		} catch (\Exception $e) {
			Log::error('Error getting revenue breakdown data: ' . $e->getMessage());
			return response()->json([
				'success' => false,
				'message' => 'Ralat mendapatkan data pecahan hasil',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Build hierarchical structure recursively for all levels (for revenue)
	 */
	private function buildHierarchicalStructure($revenues, $parentId, $currentLevel)
	{
		$children = $revenues->where('parent_id', $parentId)->where('level', $currentLevel);
		$result = [];



		foreach ($children as $child) {
			$childData = [
				'code' => $child->code,
				'description' => $child->name,
				'actual2024' => $child->acttotal,
				'budget2024' => $child->bdgtotal,
				'budget2025' => $child->bdgtotal,
				'monthly' => [
					'jan' => $child->bdg1 ?: ($child->bdgtotal / 12),
					'feb' => $child->bdg2 ?: ($child->bdgtotal / 12),
					'mar' => $child->bdg3 ?: ($child->bdgtotal / 12),
					'apr' => $child->bdg4 ?: ($child->bdgtotal / 12),
					'may' => $child->bdg5 ?: ($child->bdgtotal / 12),
					'jun' => $child->bdg6 ?: ($child->bdgtotal / 12),
					'jul' => $child->bdg7 ?: ($child->bdgtotal / 12),
					'aug' => $child->bdg8 ?: ($child->bdgtotal / 12),
					'sep' => $child->bdg9 ?: ($child->bdgtotal / 12),
					'oct' => $child->bdg10 ?: ($child->bdgtotal / 12),
					'nov' => $child->bdg11 ?: ($child->bdgtotal / 12),
					'dec' => $child->bdg12 ?: ($child->bdgtotal / 12)
				]
			];

			// Check if this child has more children at any higher level
			$hasMoreChildren = $revenues->where('parent_id', $child->id)->where('level', '>', $currentLevel)->count() > 0;

			if ($hasMoreChildren) {
				// Find the next available level
				$nextLevel = $revenues->where('parent_id', $child->id)->min('level');
				if ($nextLevel && $nextLevel > $currentLevel) {
					// Recursively build next level
					$childData['subCategories'] = $this->buildHierarchicalStructure($revenues, $child->id, $nextLevel);
				} else {
					$childData['subCategories'] = [];
				}
			} else {
				$childData['subCategories'] = [];
			}

			$result[] = $childData;
		}

		return $result;
	}

	/**
	 * Build hierarchical structure recursively for all levels (for expenses)
	 */
	private function buildHierarchicalStructureForExpenses($expenses, $parentId, $currentLevel)
	{
		$children = $expenses->where('parent_id', $parentId)->where('level', $currentLevel);
		$result = [];

		foreach ($children as $child) {
			$childData = [
				'code' => $child->code,
				'description' => $child->name,
				'actual2024' => $child->acttotal,
				'budget2024' => $child->bdgtotal,
				'budget2025' => $child->bdgtotal,
				'monthly' => [
					'jan' => $child->act1, 'feb' => $child->act2, 'mar' => $child->act3,
					'apr' => $child->act4, 'may' => $child->act5, 'jun' => $child->act6,
					'jul' => $child->act7, 'aug' => $child->act8, 'sep' => $child->act9,
					'oct' => $child->act10, 'nov' => $child->act11, 'dec' => $child->act12
				]
			];

			// Check if this child has more children at any higher level
			$hasMoreChildren = $expenses->where('parent_id', $child->id)->where('level', '>', $currentLevel)->count() > 0;

			if ($hasMoreChildren) {
				// Find the next available level
				$nextLevel = $expenses->where('parent_id', $child->id)->min('level');
				if ($nextLevel && $nextLevel > $currentLevel) {
					// Recursively build next level
					$childData['subCategories'] = $this->buildHierarchicalStructureForExpenses($expenses, $child->id, $nextLevel);
				} else {
					$childData['subCategories'] = [];
				}
			} else {
				$childData['subCategories'] = [];
			}

			$result[] = $childData;
		}

		return $result;
	}

	/**
	 * Get income expenditure statement data (similar to incomeExpenditureStatement.json)
	 */
	public function getIncomeExpenditureStatementData()
	{
		try {
			$data = Cache::remember('income_expenditure_statement_data', now()->addMinutes(self::CACHE_TTL), function () {
				// Get revenue data (type 1) - only level 0 and 1
				$revenues = Budget::where('type', 1)
					->whereIn('level', [0, 1])
					->where('is_group', false)
					->with(['department', 'parent', 'children'])
					->orderBy('sort_order')
					->get();

				// Get expenditure data (type 2) - only level 0 and 1
				$expenditures = Budget::where('type', 2)
					->whereIn('level', [0, 1])
					->where('is_group', false)
					->with(['department', 'parent', 'children'])
					->orderBy('sort_order')
					->get();

				// Initialize monthly arrays
				$months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
				$revenueMonthlyTotals = array_fill_keys($months, 0);
				$expenditureMonthlyTotals = array_fill_keys($months, 0);

				// Build hierarchical revenue structure with monthly data
				$revenueHierarchy = [];
				$revenueRoots = $revenues->where('level', 0);
				
				foreach ($revenueRoots as $root) {
					$rootMonthly = $this->extractMonthlyData($root, 'bdg');
					
					$rootItem = [
						'id' => $root->id,
						'code' => $root->code,
						'description' => $root->name,
						'monthly' => 0, //$rootMonthly,
						'department' => $root->department?->name ?? 'N/A',
						'level' => $root->level,
						'children' => []
					];

					// Add to monthly totals
					foreach ($rootMonthly as $month => $amount) {
						$revenueMonthlyTotals[$month] += $amount;
					}

					// Get children (level 1)
					$children = $revenues->where('parent_id', $root->id);
					foreach ($children as $child) {
						$childMonthly = $this->extractMonthlyData($child, 'bdg');
						
						$rootItem['children'][] = [
							'id' => $child->id,
							'code' => $child->code,
							'description' => $child->name,
							'monthly' => $childMonthly,
							'department' => $child->department?->name ?? 'N/A',
							'level' => $child->level,
							'parent_id' => $child->parent_id
						];

						// Add to monthly totals
						// foreach ($childMonthly as $month => $amount) {
						// 	$revenueMonthlyTotals[$month] += $amount;
						// }
					}

					$revenueHierarchy[] = $rootItem;
				}

				// Build hierarchical expenditure structure with monthly data
				$expenditureHierarchy = [];
				$expenditureRoots = $expenditures->where('level', 0);
				
				foreach ($expenditureRoots as $root) {
					$rootMonthly = $this->extractMonthlyData($root, 'bdg');
					
					$rootItem = [
						'id' => $root->id,
						'code' => $root->code,
						'description' => $root->name,
						'monthly' => 0, //$rootMonthly,
						'department' => $root->department?->name ?? 'N/A',
						'level' => $root->level,
						'children' => []
					];

					// Add to monthly totals
					foreach ($rootMonthly as $month => $amount) {
						$expenditureMonthlyTotals[$month] += $amount;
					}

					// Get children (level 1)
					$children = $expenditures->where('parent_id', $root->id);
					foreach ($children as $child) {
						$childMonthly = $this->extractMonthlyData($child, 'bdg');
						
						$rootItem['children'][] = [
							'id' => $child->id,
							'code' => $child->code,
							'description' => $child->name,
							'monthly' => $childMonthly,
							'department' => $child->department?->name ?? 'N/A',
							'level' => $child->level,
							'parent_id' => $child->parent_id
						];

						// Add to monthly totals
						// foreach ($childMonthly as $month => $amount) {
						// 	$expenditureMonthlyTotals[$month] += $amount;
						// }
					}

					$expenditureHierarchy[] = $rootItem;
				}

				// Calculate net position monthly
				$netPositionMonthly = [];
				$netPositionTotal = 0;
				foreach ($months as $month) {
					$netPositionMonthly[$month] = $revenueMonthlyTotals[$month] - $expenditureMonthlyTotals[$month];
					$netPositionTotal += $netPositionMonthly[$month];
				}

				// Get financial position data from configuration or database
				$financialPosition = $this->getFinancialPositionData();

				$statementData = [
					'income' => [
						'total' => $revenues->sum('bdgtotal') ?? 0,
						'actual' => $revenues->sum('acttotal') ?? 0,
						'monthly' => $revenueMonthlyTotals,
						'items' => $revenueHierarchy
					],
					'expenditure' => [
						'total' => $expenditures->sum('bdgtotal') ?? 0,
						'actual' => $expenditures->sum('acttotal') ?? 0,
						'monthly' => $expenditureMonthlyTotals,
						'items' => $expenditureHierarchy
					],
					'summary' => [
						'netIncome' => ($revenues->sum('bdgtotal') ?? 0) - ($expenditures->sum('bdgtotal') ?? 0),
						'netActual' => ($revenues->sum('acttotal') ?? 0) - ($expenditures->sum('acttotal') ?? 0),
						'netPosition' => [
							'monthly' => $netPositionMonthly,
							'total' => $netPositionTotal
						],
						'openingBalance' => $financialPosition['openingBalance'],
						'fixedDepositAmounts' => [
							'monthly' => $financialPosition['fixedDeposit'],
							'total' => array_sum(array_filter($financialPosition['fixedDeposit'], function($val) { 
								return $val !== null && is_numeric($val); 
							}))
						],
						'specialSavings' => [
							'monthly' => $financialPosition['specialSavings'],
							'total' => array_sum(array_filter($financialPosition['specialSavings'], function($val) { 
								return $val !== null && is_numeric($val); 
							}))
						],
						'runningBalance' => [
							'monthly' => $financialPosition['runningBalance'],
							'total' => array_sum(array_filter($financialPosition['runningBalance'], function($val) { 
								return $val !== null && is_numeric($val); 
							}))
						],
						'year' => date('Y'),
						'generated_at' => now()->toDateTimeString()
					]
				];

				return $statementData;
			});

			// Log what we're sending
			Log::info('Sending income expenditure statement response:', [
				'success' => true,
				'data' => $data,
				'source' => Cache::has('income_expenditure_statement_data') ? 'cache' : 'database'
			]);

			// Return response in the exact structure the frontend expects
			return response()->json([
				'success' => true,
				'data' => $data,
				'source' => Cache::has('income_expenditure_statement_data') ? 'cache' : 'database'
			]);
			
		} catch (\Exception $e) {
			Log::error('Error getting income expenditure statement data: ' . $e->getMessage(), [
				'file' => $e->getFile(),
				'line' => $e->getLine(),
				'trace' => $e->getTraceAsString()
			]);
			
			return response()->json([
				'success' => false,
				'message' => 'Ralat mendapatkan data penyata pendapatan dan perbelanjaan',
				'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
			], 500);
		}
	}

	/**
	 * Extract monthly data from budget model
	 */
	private function extractMonthlyData($budget, $prefix = 'bdg')
	{
		$months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
		$monthlyData = [];
		
		foreach ($months as $index => $month) {
			$fieldName = $prefix . ($index + 1);
			$monthlyData[$month] = $budget->$fieldName ?? 0;
		}
		
		return $monthlyData;
	}

	/**
	 * Get financial position data (opening balance, fixed deposits, etc.)
	 * This can be moved to a configuration file or database table in the future
	 */
	private function getFinancialPositionData()
	{
		// These values should ideally come from a configuration file or database
		// For now, keeping them as constants but they can be made configurable
		return [
			'openingBalance' => [
				'JAN' => 1021929.88, 'FEB' => null, 'MAR' => 1491501.51, 'APR' => 4911934.77,
				'MAY' => 11799896.84, 'JUN' => 11791605.20, 'JUL' => 5716533.21, 'AUG' => 7287479.81,
				'SEP' => 6722625.10, 'OCT' => 5974083.45, 'NOV' => 4927259.44, 'DEC' => 4512603.08
			],
			'fixedDeposit' => [
				'JAN' => 1000000.00, 'FEB' => null, 'MAR' => 500000.00, 'APR' => null,
				'MAY' => null, 'JUN' => 500000.00, 'JUL' => null, 'AUG' => null,
				'SEP' => null, 'OCT' => null, 'NOV' => null, 'DEC' => null
			],
			'specialSavings' => [
				'JAN' => 1063096.14, 'FEB' => 86192.60, 'MAR' => 174776.61, 'APR' => 281477.10,
				'MAY' => 50449.86, 'JUN' => 47485.98, 'JUL' => 155814.59, 'AUG' => 26479.02,
				'SEP' => 79668.01, 'OCT' => 32986.53, 'NOV' => 62206.53, 'DEC' => 6358.48
			],
			'runningBalance' => [
				'JAN' => 3115635.71, 'FEB' => 1491501.51, 'MAR' => 4911934.77, 'APR' => 11799896.84,
				'MAY' => 11791605.20, 'JUN' => 5716533.21, 'JUL' => 7287479.81, 'AUG' => 6722625.10,
				'SEP' => 5974083.45, 'OCT' => 4927259.44, 'NOV' => 4512603.08, 'DEC' => 2912592.81
			]
		];
	}

	// ==================== PRIVATE HELPER METHODS ====================

	/**
	 * Clear all budget-related cache
	 */
	private function clearAllBudgetCache()
	{
		Cache::forget(self::CACHE_KEY_BUDGETS);
		Cache::forget(self::CACHE_KEY_HIERARCHICAL);
		Cache::forget(self::CACHE_KEY_SUMMARY);

		Log::info('Budget cache cleared', [
			'keys' => [self::CACHE_KEY_BUDGETS, self::CACHE_KEY_HIERARCHICAL, self::CACHE_KEY_SUMMARY]
		]);
	}

	/**
	 * Build hierarchical tree structure
	 */
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

	/**
	 * Get breadcrumb path for a budget
	 */
	private function getBreadcrumb($budget)
	{
		$breadcrumb = [];
		$current = $budget;

		while ($current) {
			array_unshift($breadcrumb, [
				'id' => $current->id,
				'code' => $current->code,
				'name' => $current->name,
				'level' => $current->level
			]);
			$current = $current->parent;
		}

		return $breadcrumb;
	}

	/**
	 * Validate parent-child relationship
	 */
	private function validateParentRelationship($budget, $parentId, $level)
	{
		if ($parentId == $budget->id) {
			throw new \Exception('Budget tidak boleh menjadi parent kepada dirinya sendiri');
		}

		$parent = Budget::find($parentId);
		if (!$parent) {
			throw new \Exception('Parent budget tidak dijumpai');
		}

		if ($parent->level >= $level) {
			throw new \Exception('Parent mesti mempunyai level yang lebih rendah');
		}

		// Check for circular reference
		$ancestors = collect();
		$current = $parent;
		while ($current && $current->parent_id) {
			if ($current->parent_id == $budget->id) {
				throw new \Exception('Circular reference detected: budget ini adalah ancestor kepada parent yang dipilih');
			}
			$ancestors->push($current->parent_id);
			$current = $current->parent;
		}
	}

	/**
	 * Check if data contains budget fields
	 */
	private function hasBudgetFields($data)
	{
		$budgetFields = ['bdg1', 'bdg2', 'bdg3', 'bdg4', 'bdg5', 'bdg6', 'bdg7', 'bdg8', 'bdg9', 'bdg10', 'bdg11', 'bdg12'];
		return collect($budgetFields)->some(fn($field) => array_key_exists($field, $data));
	}

	/**
	 * Check if data contains actual fields
	 */
	private function hasActualFields($data)
	{
		$actualFields = ['act1', 'act2', 'act3', 'act4', 'act5', 'act6', 'act7', 'act8', 'act9', 'act10', 'act11', 'act12'];
		return collect($actualFields)->some(fn($field) => array_key_exists($field, $data));
	}

	/**
	 * Calculate budget total from monthly data
	 */
	private function calculateBudgetTotal($data)
	{
		$total = 0;
		for ($i = 1; $i <= 12; $i++) {
			$field = 'bdg' . $i;
			$total += (float) ($data[$field] ?? 0);
		}
		return $total;
	}

	/**
	 * Calculate actual total from monthly data
	 */
	private function calculateActualTotal($data)
	{
		$total = 0;
		for ($i = 1; $i <= 12; $i++) {
			$field = 'act' . $i;
			$total += (float) ($data[$field] ?? 0);
		}
		return $total;
	}

	/**
	 * Format budget item for response
	 */
	private function formatBudgetItem($item)
	{
			return [
				'id' => $item->id,
				'code' => $item->code,
				'name' => $item->name,
				'type' => $item->type,
				'level' => $item->level,
				'bdgtotal' => $item->bdgtotal,
				'acttotal' => $item->acttotal,
				'balance' => $item->balance,
			];
	}

	/**
	 * Format budget item for response with year values
	 */
	private function formatBudgetItemWithYears($item, $currentYear, $year1)
	{
		return [
			'id' => $item->id,
			'code' => $item->code,
			'name' => $item->name,
			'type' => $item->type,
			'level' => $item->level,
			'bdgtotal' => $item->bdgtotal,
			'acttotal' => $item->acttotal,
			'balance' => $item->balance,
			'bdgttotalvalue' => [
				$item->bdgtotal, // Current year - index 0
				'0.00'           // Year-1 - index 1 - will be updated later
			],
			'acttotalvalue' => [
				$item->acttotal, // Current year - index 0
				'0.00'           // Year-1 - index 1 - will be updated later
			],
			// Dynamic fields for frontend compatibility
			"actual{$year1}" => '0.00',    // Will be updated later (e.g., actual2024)
			"budget{$year1}" => '0.00',    // Will be updated later (e.g., budget2024)
			"budget{$currentYear}" => $item->bdgtotal  // Current year (e.g., budget2025)
		];
	}

	/**
	 * Update parent budget cumulative totals from children
	 * This method automatically sums all children budgets and updates parent
	 */
	private function updateParentBudgetCumulative($childBudgetId)
	{
		try {
			$childBudget = Budget::find($childBudgetId);
			
			if (!$childBudget || !$childBudget->parent_id) {
				return; // No parent to update
			}
			
			$parent = Budget::find($childBudget->parent_id);
			if (!$parent) {
				return; // Parent not found
			}
			
			// Get all children of this parent
			$children = Budget::where('parent_id', $parent->id)->get();
			
			if ($children->isEmpty()) {
				return; // No children found
			}
			
			// Calculate cumulative totals from all children for each month
			$cumulativeBudget = [
				'bdg1' => 0, 'bdg2' => 0, 'bdg3' => 0, 'bdg4' => 0,
				'bdg5' => 0, 'bdg6' => 0, 'bdg7' => 0, 'bdg8' => 0,
				'bdg9' => 0, 'bdg10' => 0, 'bdg11' => 0, 'bdg12' => 0
			];
			
			$cumulativeActual = [
				'act1' => 0, 'act2' => 0, 'act3' => 0, 'act4' => 0,
				'act5' => 0, 'act6' => 0, 'act7' => 0, 'act8' => 0,
				'act9' => 0, 'act10' => 0, 'act11' => 0, 'act12' => 0
			];
			
			// Sum all children budgets and actuals
			foreach ($children as $child) {
				for ($i = 1; $i <= 12; $i++) {
					$bdgField = 'bdg' . $i;
					$actField = 'act' . $i;
					
					$cumulativeBudget[$bdgField] += (float) ($child->$bdgField ?? 0);
					$cumulativeActual[$actField] += (float) ($child->$actField ?? 0);
				}
			}
			
			// Update parent budget fields
			foreach ($cumulativeBudget as $field => $value) {
				$parent->$field = $value;
			}
			
			// Update parent actual fields
			foreach ($cumulativeActual as $field => $value) {
				$parent->$field = $value;
			}
			
			// Calculate totals - ensure bdgtotal = bdg1 + bdg2 + ... + bdg12
			$parent->bdgtotal = array_sum($cumulativeBudget);
			$parent->acttotal = array_sum($cumulativeActual);
			$parent->balance = $parent->bdgtotal - $parent->acttotal;
			
			// Verify bdgtotal matches sum of monthly budgets
			$calculatedTotal = 0;
			for ($i = 1; $i <= 12; $i++) {
				$field = 'bdg' . $i;
				$calculatedTotal += (float) ($parent->$field ?? 0);
			}
			
			// Ensure consistency
			if (abs($parent->bdgtotal - $calculatedTotal) > 0.01) {
				$parent->bdgtotal = $calculatedTotal;
				$parent->balance = $parent->bdgtotal - $parent->acttotal;
			}
			
			// Update budget_months and budget_type based on children
			$budgetMonths = [];
			foreach ($cumulativeBudget as $field => $value) {
				$monthNumber = (int) substr($field, 3);
				if ($value > 0) {
					$budgetMonths[] = $monthNumber;
				}
			}
			$parent->budget_months = $budgetMonths;
			$parent->budget_month_count = count($budgetMonths);
			
			// Determine budget_type
			if ($parent->budget_month_count === 0) {
				$parent->budget_type = 'yearly';
			} elseif ($parent->budget_month_count === 12) {
				$parent->budget_type = 'monthly';
			} elseif ($parent->budget_month_count === 1) {
				$parent->budget_type = 'yearly';
			} elseif (in_array($parent->budget_month_count, [3, 6, 9])) {
				$parent->budget_type = 'quarterly';
			} else {
				$parent->budget_type = 'monthly';
			}
			
			$parent->save();
			
			Log::info('Parent budget cumulative updated', [
				'parent_id' => $parent->id,
				'parent_code' => $parent->code,
				'children_count' => $children->count(),
				'new_bdgtotal' => $parent->bdgtotal,
				'new_acttotal' => $parent->acttotal
			]);
			
			// Recursively update grandparent if exists
			if ($parent->parent_id) {
				$this->updateParentBudgetCumulative($parent->id);
			}
			
		} catch (\Exception $e) {
			Log::error('Error updating parent budget cumulative: ' . $e->getMessage(), [
				'child_budget_id' => $childBudgetId,
				'parent_id' => $childBudget?->parent_id ?? 'unknown'
			]);
		}
	}

	/**
	 * Update all parent budgets cumulative totals manually (for maintenance)
	 * This method can be called to recalculate all parent budgets
	 */
	public function updateAllParentBudgetsCumulative()
	{
		try {
			DB::beginTransaction();
			
			// Get all budgets that have children
			$parentBudgets = Budget::where('child_count', '>', 0)->get();
			$updatedCount = 0;
			
			foreach ($parentBudgets as $parent) {
				// Get all children of this parent
				$children = Budget::where('parent_id', $parent->id)->get();
				
				if ($children->isEmpty()) {
					continue;
				}
				
				// Calculate cumulative totals from all children for each month
				$cumulativeBudget = [
					'bdg1' => 0, 'bdg2' => 0, 'bdg3' => 0, 'bdg4' => 0,
					'bdg5' => 0, 'bdg6' => 0, 'bdg7' => 0, 'bdg8' => 0,
					'bdg9' => 0, 'bdg10' => 0, 'bdg11' => 0, 'bdg12' => 0
				];
				
				$cumulativeActual = [
					'act1' => 0, 'act2' => 0, 'act3' => 0, 'act4' => 0,
					'act5' => 0, 'act6' => 0, 'act7' => 0, 'act8' => 0,
					'act9' => 0, 'act10' => 0, 'act11' => 0, 'act12' => 0
				];
				
				// Sum all children budgets and actuals
				foreach ($children as $child) {
					for ($i = 1; $i <= 12; $i++) {
						$bdgField = 'bdg' . $i;
						$actField = 'act' . $i;
						
						$cumulativeBudget[$bdgField] += (float) ($child->$bdgField ?? 0);
						$cumulativeActual[$actField] += (float) ($child->$actField ?? 0);
					}
				}
				
				// Update parent budget fields
				foreach ($cumulativeBudget as $field => $value) {
					$parent->$field = $value;
				}
				
				// Update parent actual fields
				foreach ($cumulativeActual as $field => $value) {
					$parent->$field = $value;
				}
				
				// Calculate totals - ensure bdgtotal = bdg1 + bdg2 + ... + bdg12
				$parent->bdgtotal = array_sum($cumulativeBudget);
				$parent->acttotal = array_sum($cumulativeActual);
				$parent->balance = $parent->bdgtotal - $parent->acttotal;
				
				// Update budget_months and budget_type based on children
				$budgetMonths = [];
				foreach ($cumulativeBudget as $field => $value) {
					$monthNumber = (int) substr($field, 3);
					if ($value > 0) {
						$budgetMonths[] = $monthNumber;
					}
				}
				$parent->budget_months = $budgetMonths;
				$parent->budget_month_count = count($budgetMonths);
				
				// Determine budget_type
				if ($parent->budget_month_count === 0) {
					$parent->budget_type = 'yearly';
				} elseif ($parent->budget_month_count === 12) {
					$parent->budget_type = 'monthly';
				} elseif ($parent->budget_month_count === 1) {
					$parent->budget_type = 'yearly';
				} elseif (in_array($parent->budget_month_count, [3, 6, 9])) {
					$parent->budget_type = 'quarterly';
				} else {
					$parent->budget_type = 'monthly';
				}
				
				$parent->save();
				$updatedCount++;
			}
			
			DB::commit();
			
			// Clear cache
			$this->clearAllBudgetCache();
			
			Log::info('All parent budgets cumulative updated', [
				'updated_count' => $updatedCount,
				'total_parents' => $parentBudgets->count()
			]);
			
			return response()->json([
				'success' => true,
				'message' => 'Semua parent budget berjaya dikemaskini secara cumulative',
				'updated_count' => $updatedCount,
				'total_parents' => $parentBudgets->count()
			]);
			
		} catch (\Exception $e) {
			DB::rollBack();
			Log::error('Error updating all parent budgets cumulative: ' . $e->getMessage());
			
			return response()->json([
				'success' => false,
				'message' => 'Ralat mengemaskini parent budgets',
				'error' => $e->getMessage()
			], 500);
		}
	}

}
