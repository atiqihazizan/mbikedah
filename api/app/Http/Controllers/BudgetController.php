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
					->where('yearly', $year)
					->orderBy('type')
					->orderBy('level')
					->orderBy('sort_order')
					->orderBy('code')
					->get();
			} else if ($year >= 2023 && $year < $currentYear) {
				// Archive year - check if archive table exists
				if (Schema::hasTable($archiveTable)) {
					$budgets = DB::table($archiveTable)
						->where('yearly', $year)
						->orderBy('type')
						->orderBy('level')
						->orderBy('sort_order')
						->orderBy('code')
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
			$year2 = $currentYear - 2;
			
			// Get current year data from main budgets table
			$budgetSummary = Budget::where('level', 0)
				->orderBy('type', 'asc')
				->get();

			// Initialize data structure
			$data = [
				'revenueData' => $budgetSummary->where('type', 1)->map(fn($item) => $this->formatBudgetItemWithYears($item, $currentYear, $year1, $year2))->values(),
				'expenditureData' => $budgetSummary->where('type', 2)->map(fn($item) => $this->formatBudgetItemWithYears($item, $currentYear, $year1, $year2))->values(),
				'operationData' => $budgetSummary->where('type', 0)->map(fn($item) => $this->formatBudgetItemWithYears($item, $currentYear, $year1, $year2))->values()
			];

			// Get data from previous years if tables exist
			$data = $this->mergeYearData($data, $year1, $year2);

			// Ensure all items have the value array with 3 years
			$data = $this->ensureValueArrayStructure($data);

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
	private function mergeYearData($data, $year1, $year2)
	{
		// Check and get data from year1 (current-1)
		if (Schema::hasTable('budgets_' . $year1)) {
			$budgetSummaryYear1 = DB::table('budgets_' . $year1)
				->where('level', 0)
				->orderBy('type', 'asc')
				->get();

			$data = $this->updateDataWithYearValues($data, $budgetSummaryYear1, $year1);
		}

		// Check and get data from year2 (current-2)
		if (Schema::hasTable('budgets_' . $year2)) {
			$budgetSummaryYear2 = DB::table('budgets_' . $year2)
				->where('level', 0)
				->orderBy('type', 'asc')
				->get();

			$data = $this->updateDataWithYearValues($data, $budgetSummaryYear2, $year2);
		}

		return $data;
	}

	/**
	 * Update data structure with values from specific year
	 */
	private function updateDataWithYearValues($data, $yearData, $year)
	{
		$yearIndex = $this->getYearIndex($year);
		
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
			} else {
				$revenueArray[$key]['bdgttotalvalue'][$yearIndex] = '0.00';
				$revenueArray[$key]['acttotalvalue'][$yearIndex] = '0.00';
			}
		}

		// Update expenditure data
		foreach ($expenditureArray as $key => $expenditureItem) {
			$yearItem = $yearData->where('code', $expenditureItem['code'])->first();
			if ($yearItem) {
				$expenditureArray[$key]['bdgttotalvalue'][$yearIndex] = $yearItem->bdgtotal;
				$expenditureArray[$key]['acttotalvalue'][$yearIndex] = $yearItem->acttotal;
			} else {
				$expenditureArray[$key]['bdgttotalvalue'][$yearIndex] = '0.00';
				$expenditureArray[$key]['acttotalvalue'][$yearIndex] = '0.00';
			}
		}

		// Update operation data
		foreach ($operationArray as $key => $operationItem) {
			$yearItem = $yearData->where('code', $operationItem['code'])->first();
			if ($yearItem) {
				$operationArray[$key]['bdgttotalvalue'][$yearIndex] = $yearItem->bdgtotal;
				$operationArray[$key]['acttotalvalue'][$yearIndex] = $yearItem->acttotal;
			} else {
				$operationArray[$key]['bdgttotalvalue'][$yearIndex] = '0.00';
				$operationArray[$key]['acttotalvalue'][$yearIndex] = '0.00';
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
	 * Ensure all items have the bdgttotalvalue and acttotalvalue arrays with 3 years
	 */
	private function ensureValueArrayStructure($data)
	{
		// Ensure revenue data has bdgttotalvalue and acttotalvalue arrays
		foreach ($data['revenueData'] as &$item) {
			if (!isset($item['bdgttotalvalue'])) {
				$item['bdgttotalvalue'] = ['0.00', '0.00', '0.00'];
			}
			if (!isset($item['acttotalvalue'])) {
				$item['acttotalvalue'] = ['0.00', '0.00', '0.00'];
			}
			// Ensure all 3 years are present
			for ($i = 0; $i < 3; $i++) {
				if (!isset($item['bdgttotalvalue'][$i])) {
					$item['bdgttotalvalue'][$i] = '0.00';
				}
				if (!isset($item['acttotalvalue'][$i])) {
					$item['acttotalvalue'][$i] = '0.00';
				}
			}
		}

		// Ensure expenditure data has bdgttotalvalue and acttotalvalue arrays
		foreach ($data['expenditureData'] as &$item) {
			if (!isset($item['bdgttotalvalue'])) {
				$item['bdgttotalvalue'] = ['0.00', '0.00', '0.00'];
			}
			if (!isset($item['acttotalvalue'])) {
				$item['acttotalvalue'] = ['0.00', '0.00', '0.00'];
			}
			// Ensure all 3 years are present
			for ($i = 0; $i < 3; $i++) {
				if (!isset($item['bdgttotalvalue'][$i])) {
					$item['bdgttotalvalue'][$i] = '0.00';
				}
				if (!isset($item['acttotalvalue'][$i])) {
					$item['acttotalvalue'][$i] = '0.00';
				}
			}
		}

		// Ensure operation data has bdgttotalvalue and acttotalvalue arrays
		foreach ($data['operationData'] as &$item) {
			if (!isset($item['bdgttotalvalue'])) {
				$item['bdgttotalvalue'] = ['0.00', '0.00', '0.00'];
			}
			if (!isset($item['acttotalvalue'])) {
				$item['acttotalvalue'] = ['0.00', '0.00', '0.00'];
			}
			// Ensure all 3 years are present
			for ($i = 0; $i < 3; $i++) {
				if (!isset($item['bdgttotalvalue'][$i])) {
					$item['bdgttotalvalue'][$i] = '0.00';
				}
				if (!isset($item['acttotalvalue'][$i])) {
					$item['acttotalvalue'][$i] = '0.00';
				}
			}
		}

		// Unset references
		unset($item);

		return $data;
	}
	/**
	 * Get expense breakdown data (similar to ExpenseBreakdown.json)
	 */
	public function getExpenseBreakdownData()
	{
		try {
			$data = Cache::remember('expense_breakdown_data', now()->addMinutes(self::CACHE_TTL), function () {
				// Get hierarchical expense data (type 2 = Kredit) - only level 0, 1, 2
				$expenses = Budget::where('type', 2)
					->whereIn('level', [0, 1, 2, 3, 4])
					->with(['department', 'parent', 'children'])
					->orderBy('level')
					->orderBy('sort_order')
					->orderBy('code')
					->get();

				// Build hierarchical structure
				$categories = [];
				$rootCategories = $expenses->where('level', 0);

				foreach ($rootCategories as $root) {
					$category = [
						'title' => $root->name,
						'bgColor' => 'bg-red-200',
						'data' => [
							'code' => $root->code,
							'description' => $root->name,
							'actual2024' => $root->acttotal,
							'budget2024' => $root->bdgtotal,
							'budget2025' => $root->bdgtotal,
							'monthly' => [
								'jan' => $root->act1, 'feb' => $root->act2, 'mar' => $root->act3,
								'apr' => $root->act4, 'may' => $root->act5, 'jun' => $root->act6,
								'jul' => $root->act7, 'aug' => $root->act8, 'sep' => $root->act9,
								'oct' => $root->act10, 'nov' => $root->act11, 'dec' => $root->act12
							]
						],
						'subCategories' => []
					];

					// Get subcategories (level 1)
					$subCategories = $expenses->where('parent_id', $root->id)->where('level', 1);
					foreach ($subCategories as $sub) {
						$subCategory = [
							'code' => $sub->code,
							'description' => $sub->name,
							'actual2024' => $sub->acttotal,
							'budget2024' => $sub->bdgtotal,
							'budget2025' => $sub->bdgtotal,
							'monthly' => [
								'jan' => $sub->act1, 'feb' => $sub->act2, 'mar' => $sub->act3,
								'apr' => $sub->act4, 'may' => $sub->act5, 'jun' => $sub->act6,
								'jul' => $sub->act7, 'aug' => $sub->act8, 'sep' => $sub->act9,
								'oct' => $sub->act10, 'nov' => $sub->act11, 'dec' => $sub->act12
							],
							'details' => []
						];

						// Get details (level 2)
						$details = $expenses->where('parent_id', $sub->id)->where('level', 2);
						foreach ($details as $detail) {
							$subCategory['details'][] = [
								'code' => $detail->code,
								'description' => $detail->name,
								'actual2024' => $detail->acttotal,
								'budget2024' => $detail->bdgtotal,
								'budget2025' => $detail->bdgtotal,
								'monthly' => [
									'jan' => $detail->act1, 'feb' => $detail->act2, 'mar' => $detail->act3,
									'apr' => $detail->act4, 'may' => $detail->act5, 'jun' => $detail->act6,
									'jul' => $detail->act7, 'aug' => $detail->act8, 'sep' => $detail->act9,
									'oct' => $detail->act10, 'nov' => $detail->act11, 'dec' => $detail->act12
								]
							];
						}

						$category['subCategories'][] = $subCategory;
					}

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
				'source' => Cache::has('expense_breakdown_data') ? 'cache' : 'database'
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
			$data = Cache::remember('revenue_breakdown_data', now()->addMinutes(self::CACHE_TTL), function () {
				// Get hierarchical revenue data (type 0 = Operasi, type 1 = Debit) - only level 0, 1, 2
				$revenues = Budget::whereIn('type', [0, 1])
					->whereIn('level', [0, 1, 2, 3, 4])
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
								'jan' => $root->act1, 'feb' => $root->act2, 'mar' => $root->act3,
								'apr' => $root->act4, 'may' => $root->act5, 'jun' => $root->act6,
								'jul' => $root->act7, 'aug' => $root->act8, 'sep' => $root->act9,
								'oct' => $root->act10, 'nov' => $root->act11, 'dec' => $root->act12
							]
						],
						'subCategories' => []
					];

					// Get subcategories (level 1)
					$subCategories = $revenues->where('parent_id', $root->id)->where('level', 1);
					foreach ($subCategories as $sub) {
						$subCategory = [
							'code' => $sub->code,
							'description' => $sub->name,
							'actual2024' => $sub->acttotal,
							'budget2024' => $sub->bdgtotal,
							'budget2025' => $sub->bdgtotal,
							'monthly' => [
								'jan' => $sub->act1, 'feb' => $sub->act2, 'mar' => $sub->act3,
								'apr' => $sub->act4, 'may' => $sub->act5, 'jun' => $sub->act6,
								'jul' => $sub->act7, 'aug' => $sub->act8, 'sep' => $sub->act9,
								'oct' => $sub->act10, 'nov' => $sub->act11, 'dec' => $sub->act12
							],
							'details' => []
						];

						// Get details (level 2)
						$details = $revenues->where('parent_id', $sub->id)->where('level', 2);
						foreach ($details as $detail) {
							$subCategory['details'][] = [
								'code' => $detail->code,
								'description' => $detail->name,
								'actual2024' => $detail->acttotal,
								'budget2024' => $detail->bdgtotal,
								'budget2025' => $detail->bdgtotal,
								'monthly' => [
									'jan' => $detail->act1, 'feb' => $detail->act2, 'mar' => $detail->act3,
									'apr' => $detail->act4, 'may' => $detail->act5, 'jun' => $detail->act6,
									'jul' => $detail->act7, 'aug' => $detail->act8, 'sep' => $detail->act9,
									'oct' => $detail->act10, 'nov' => $detail->act11, 'dec' => $detail->act12
								]
							];
						}

						$category['subCategories'][] = $subCategory;
					}

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
	 * Get income expenditure statement data (similar to incomeExpenditureStatement.json)
	 */
	public function getIncomeExpenditureStatementData()
	{
		try {
			$data = Cache::remember('income_expenditure_statement_data', now()->addMinutes(self::CACHE_TTL), function () {
				// Get revenue data (type 0, 1) - only level 0 and 1
				$revenues = Budget::whereIn('type', [0, 1])
					->whereIn('level', [0, 1])
					->where('is_group', false)
					->with(['department', 'parent', 'children'])
					->get();

				// Get expenditure data (type 2) - only level 0 and 1
				$expenditures = Budget::where('type', 2)
					->whereIn('level', [0, 1])
					->where('is_group', false)
					->with(['department', 'parent', 'children'])
					->get();

				// Build hierarchical revenue structure with monthly data
				$revenueHierarchy = [];
				$revenueRoots = $revenues->where('level', 0);
				$revenueMonthlyTotals = [
					'JAN' => 0, 'FEB' => 0, 'MAR' => 0, 'APR' => 0, 'MAY' => 0, 'JUN' => 0,
					'JUL' => 0, 'AUG' => 0, 'SEP' => 0, 'OCT' => 0, 'NOV' => 0, 'DEC' => 0
				];
				
				foreach ($revenueRoots as $root) {
					$rootMonthly = [
						'JAN' => $root->bdg1 ?? 0, 'FEB' => $root->bdg2 ?? 0, 'MAR' => $root->bdg3 ?? 0,
						'APR' => $root->bdg4 ?? 0, 'MAY' => $root->bdg5 ?? 0, 'JUN' => $root->bdg6 ?? 0,
						'JUL' => $root->bdg7 ?? 0, 'AUG' => $root->bdg8 ?? 0, 'SEP' => $root->bdg9 ?? 0,
						'OCT' => $root->bdg10 ?? 0, 'NOV' => $root->bdg11 ?? 0, 'DEC' => $root->bdg12 ?? 0
					];

					$rootItem = [
						'id' => $root->id,
						'code' => $root->code,
						'description' => $root->name,
						'monthly' => $rootMonthly,
						'department' => $root->department?->name,
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
						$childMonthly = [
							'JAN' => $child->bdg1 ?? 0, 'FEB' => $child->bdg2 ?? 0, 'MAR' => $child->bdg3 ?? 0,
							'APR' => $child->bdg4 ?? 0, 'MAY' => $child->bdg5 ?? 0, 'JUN' => $child->bdg6 ?? 0,
							'JUL' => $child->bdg7 ?? 0, 'AUG' => $child->bdg8 ?? 0, 'SEP' => $child->bdg9 ?? 0,
							'OCT' => $child->bdg10 ?? 0, 'NOV' => $child->bdg11 ?? 0, 'DEC' => $child->bdg12 ?? 0
						];

						$rootItem['children'][] = [
							'id' => $child->id,
							'code' => $child->code,
							'description' => $child->name,
							'monthly' => $childMonthly,
							'department' => $child->department?->name,
							'level' => $child->level,
							'parent_id' => $child->parent_id
						];

						// Add to monthly totals
						foreach ($childMonthly as $month => $amount) {
							$revenueMonthlyTotals[$month] += $amount;
						}
					}

					$revenueHierarchy[] = $rootItem;
				}

				// Build hierarchical expenditure structure with monthly data
				$expenditureHierarchy = [];
				$expenditureRoots = $expenditures->where('level', 0);
				$expenditureMonthlyTotals = [
					'JAN' => 0, 'FEB' => 0, 'MAR' => 0, 'APR' => 0, 'MAY' => 0, 'JUN' => 0,
					'JUL' => 0, 'AUG' => 0, 'SEP' => 0, 'OCT' => 0, 'NOV' => 0, 'DEC' => 0
				];
				
				foreach ($expenditureRoots as $root) {
					$rootMonthly = [
						'JAN' => $root->bdg1 ?? 0, 'FEB' => $root->bdg2 ?? 0, 'MAR' => $root->bdg3 ?? 0,
						'APR' => $root->bdg4 ?? 0, 'MAY' => $root->bdg5 ?? 0, 'JUN' => $root->bdg6 ?? 0,
						'JUL' => $root->bdg7 ?? 0, 'AUG' => $root->bdg8 ?? 0, 'SEP' => $root->bdg9 ?? 0,
						'OCT' => $root->bdg10 ?? 0, 'NOV' => $root->bdg11 ?? 0, 'DEC' => $root->bdg12 ?? 0
					];

					$rootItem = [
						'id' => $root->id,
						'code' => $root->code,
						'description' => $root->name,
						'monthly' => $rootMonthly,
						'department' => $root->department?->name,
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
						$childMonthly = [
							'JAN' => $child->bdg1 ?? 0, 'FEB' => $child->bdg2 ?? 0, 'MAR' => $child->bdg3 ?? 0,
							'APR' => $child->bdg4 ?? 0, 'MAY' => $child->bdg5 ?? 0, 'JUN' => $child->bdg6 ?? 0,
							'JUL' => $child->bdg7 ?? 0, 'AUG' => $child->bdg8 ?? 0, 'SEP' => $child->bdg9 ?? 0,
							'OCT' => $child->bdg10 ?? 0, 'NOV' => $child->bdg11 ?? 0, 'DEC' => $child->bdg12 ?? 0
						];

						$rootItem['children'][] = [
							'id' => $child->id,
							'code' => $child->code,
							'description' => $child->name,
							'monthly' => $childMonthly,
							'department' => $child->department?->name,
							'level' => $child->level,
							'parent_id' => $child->parent_id
						];

						// Add to monthly totals
						foreach ($childMonthly as $month => $amount) {
							$expenditureMonthlyTotals[$month] += $amount;
						}
					}

					$expenditureHierarchy[] = $rootItem;
				}

				// Calculate net position monthly
				$netPositionMonthly = [];
				$netPositionTotal = 0;
				foreach (['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'] as $month) {
					$netPositionMonthly[$month] = $revenueMonthlyTotals[$month] - $expenditureMonthlyTotals[$month];
					$netPositionTotal += $netPositionMonthly[$month];
				}

				// Calculate monthly values for footer
				$openingBalanceMonthly = [
					'JAN' => 1021929.88, 'FEB' => null, 'MAR' => 1491501.51, 'APR' => 4911934.77,
					'MAY' => 11799896.84, 'JUN' => 11791605.20, 'JUL' => 5716533.21, 'AUG' => 7287479.81,
					'SEP' => 6722625.10, 'OCT' => 5974083.45, 'NOV' => 4927259.44, 'DEC' => 4512603.08
				];

				$fixedDepositMonthly = [
					'JAN' => 1000000.00, 'FEB' => null, 'MAR' => 500000.00, 'APR' => null,
					'MAY' => null, 'JUN' => 500000.00, 'JUL' => null, 'AUG' => null,
					'SEP' => null, 'OCT' => null, 'NOV' => null, 'DEC' => null
				];

				$specialSavingsMonthly = [
					'JAN' => 1063096.14, 'FEB' => 86192.60, 'MAR' => 174776.61, 'APR' => 281477.10,
					'MAY' => 50449.86, 'JUN' => 47485.98, 'JUL' => 155814.59, 'AUG' => 26479.02,
					'SEP' => 79668.01, 'OCT' => 32986.53, 'NOV' => 62206.53, 'DEC' => 6358.48
				];

				$runningBalanceMonthly = [
					'JAN' => 3115635.71, 'FEB' => 1491501.51, 'MAR' => 4911934.77, 'APR' => 11799896.84,
					'MAY' => 11791605.20, 'JUN' => 5716533.21, 'JUL' => 7287479.81, 'AUG' => 6722625.10,
					'SEP' => 5974083.45, 'OCT' => 4927259.44, 'NOV' => 4512603.08, 'DEC' => 2912592.81
				];

				$statementData = [
					'income' => [
						'total' => $revenues->sum('bdgtotal'),
						'actual' => $revenues->sum('acttotal'),
						'monthly' => $revenueMonthlyTotals,
						'items' => $revenueHierarchy
					],
					'expenditure' => [
						'total' => $expenditures->sum('bdgtotal'),
						'actual' => $expenditures->sum('acttotal'),
						'monthly' => $expenditureMonthlyTotals,
						'items' => $expenditureHierarchy
					],
					'summary' => [
						'netIncome' => $revenues->sum('bdgtotal') - $expenditures->sum('bdgtotal'),
						'netActual' => $revenues->sum('acttotal') - $expenditures->sum('acttotal'),
						'netPosition' => [
							'monthly' => $netPositionMonthly,
							'total' => $netPositionTotal
						],
						'openingBalance' => $openingBalanceMonthly,
						'fixedDepositAmounts' => [
							'monthly' => $fixedDepositMonthly,
							'total' => array_sum(array_filter($fixedDepositMonthly, function($val) { return $val !== null; }))
						],
						'specialSavings' => [
							'monthly' => $specialSavingsMonthly,
							'total' => array_sum($specialSavingsMonthly)
						],
						'runningBalance' => [
							'monthly' => $runningBalanceMonthly,
							'total' => array_sum($runningBalanceMonthly)
						],
						'year' => date('Y'),
						'generated_at' => now()->toDateTimeString()
					]
				];

				return $statementData;
			});

			return response()->json([
				'success' => true,
				'data' => $data,
				'source' => Cache::has('income_expenditure_statement_data') ? 'cache' : 'database'
			]);
		} catch (\Exception $e) {
			Log::error('Error getting income expenditure statement data: ' . $e->getMessage());
			return response()->json([
				'success' => false,
				'message' => 'Ralat mendapatkan data penyata pendapatan dan perbelanjaan',
				'error' => $e->getMessage()
			], 500);
		}
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
	private function formatBudgetItemWithYears($item, $currentYear, $year1, $year2)
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
				$item->bdgtotal, // Current year (2025) - index 0
				'0.00',          // Year-1 (2024) - index 1 - will be updated later
				'0.00'           // Year-2 (2023) - index 2 - will be updated later
			],
			'acttotalvalue' => [
				$item->acttotal, // Current year (2025) - index 0
				'0.00',          // Year-1 (2024) - index 1 - will be updated later
				'0.00'           // Year-2 (2023) - index 2 - will be updated later
			]
		];
	}

}
