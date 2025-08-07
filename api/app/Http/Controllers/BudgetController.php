<?php

namespace App\Http\Controllers;

use App\Http\Requests\BudgetRequest;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
	public function index()
	{
		try {
			// Check if we want fresh data (for debugging)
			$forceRefresh = request()->has('refresh') || request()->has('_t');

			if ($forceRefresh) $this->clearAllBudgetCache();

			$budgets = Cache::remember(self::CACHE_KEY_BUDGETS, now()->addMinutes(self::CACHE_TTL), function () {
				return Budget::with(['department', 'parent', 'children'])
					->orderBy('type')
					->orderBy('code')
					// ->orderBy('level')
					// ->orderBy('sort_order')
					->get();
			});

			return response()->json([
				'data' => $budgets,
				'source' => Cache::has(self::CACHE_KEY_BUDGETS) && !$forceRefresh ? 'cache' : 'database',
				'cache_info' => [
					'key' => self::CACHE_KEY_BUDGETS,
					'ttl_minutes' => self::CACHE_TTL,
					'timestamp' => now()->toDateTimeString(),
					'count' => $budgets->count()
				]
			]);
		} catch (\Exception $e) {
			Log::error('Error getting budget list: ' . $e->getMessage(), [
				'trace' => $e->getTraceAsString()
			]);
			return response()->json([
				'message' => 'Ralat mendapatkan senarai budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Get hierarchical budget structure
	 */
	public function getHierarchical()
	{
		try {
			$forceRefresh = request()->has('refresh');

			if ($forceRefresh) $this->clearAllBudgetCache();

			$data = Cache::remember(self::CACHE_KEY_HIERARCHICAL, now()->addMinutes(self::CACHE_TTL), function () {
				$budgets = Budget::with(['parent', 'children', 'department'])
					->orderBy('type')
					// ->orderBy('level')
					// ->orderBy('sort_order')
					->orderBy('code')
					->get();

				return [
					'tree' => $this->buildTree($budgets),
					'flat' => $budgets
				];
			});

			return response()->json([
				'data' => $data['tree'],
				'flat' => $data['flat'],
				'source' => Cache::has(self::CACHE_KEY_HIERARCHICAL) && !$forceRefresh ? 'cache' : 'database'
			]);
		} catch (\Exception $e) {
			Log::error('Error getting hierarchical budget: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mendapatkan hierarki budget',
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
				'data' => $budget,
				'breadcrumb' => $this->getBreadcrumb($budget)
			]);
		} catch (\Exception $e) {
			Log::error('Error getting budget: ' . $e->getMessage(), ['budget_id' => $id]);
			return response()->json([
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
			]);

			$budget = Budget::findOrFail($id);
			$oldTotal = $budget->bdgtotal;

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

			DB::commit();

			// Clear cache
			$this->clearAllBudgetCache();

			Log::info('Budget allocation updated', [
				'budget_id' => $budget->id,
				'old_total' => $oldTotal,
				'new_total' => $budget->bdgtotal
			]);

			return response()->json([
				'message' => 'Budget allocation berjaya dikemaskini',
				'data' => $budget->load(['department', 'parent', 'children']),
				'summary' => [
					'bdgtotal' => $budget->bdgtotal,
					'acttotal' => $budget->acttotal,
					'balance' => $budget->balance,
					'change' => $budget->bdgtotal - $oldTotal
				]
			]);
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
			DB::rollBack();
			Log::error('Error deleting budget: ' . $e->getMessage(), ['budget_id' => $id]);
			return response()->json([
				'message' => 'Ralat memadam budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Get budget summary for dashboard
	 */
	public function getSummary()
	{
		try {
			$summary = Cache::remember(self::CACHE_KEY_SUMMARY, now()->addMinutes(self::CACHE_TTL), function () {
				return [
					'total_budgets' => Budget::count(),
					'total_allocated' => Budget::sum('bdgtotal'),
					'total_spent' => Budget::sum('acttotal'),
					'total_balance' => Budget::sum('balance'),
					'by_type' => Budget::selectRaw('type, COUNT(*) as count, SUM(bdgtotal) as allocated, SUM(acttotal) as spent')
						->groupBy('type')
						->get(),
					'by_level' => Budget::selectRaw('level, COUNT(*) as count, SUM(bdgtotal) as allocated')
						->groupBy('level')
						->orderBy('level')
						->get(),
					'over_budget' => Budget::whereRaw('acttotal > bdgtotal')->count(),
					'timestamp' => now()->toDateTimeString()
				];
			});

			// Calculate utilization percentage
			$summary['utilization_percentage'] = $summary['total_allocated'] > 0
				? round(($summary['total_spent'] / $summary['total_allocated']) * 100, 2)
				: 0;

			return response()->json([
				'data' => $summary,
				'source' => Cache::has(self::CACHE_KEY_SUMMARY) ? 'cache' : 'database'
			]);
		} catch (\Exception $e) {
			Log::error('Error getting budget summary: ' . $e->getMessage());
			return response()->json([
				'message' => 'Ralat mendapatkan ringkasan budget',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Get budgets by department
	 */
	public function getByDepartment($departmentId)
	{
		try {
			$budgets = Budget::where('department_id', $departmentId)
				->with(['department', 'parent', 'children'])
				->orderBy('level')
				->orderBy('sort_order')
				->orderBy('code')
				->get();

			return response()->json([
				'data' => $budgets,
				'department_id' => $departmentId,
				'count' => $budgets->count()
			]);
		} catch (\Exception $e) {
			Log::error('Error getting budget by department: ' . $e->getMessage(), [
				'department_id' => $departmentId
			]);
			return response()->json([
				'message' => 'Ralat mendapatkan budget jabatan',
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
			$budgets = Budget::where('yearly', $year)
				->with(['department', 'parent', 'children'])
				->orderBy('level')
				->orderBy('sort_order')
				->orderBy('code')
				->get();

			return response()->json([
				'data' => $budgets,
				'year' => $year,
				'count' => $budgets->count()
			]);
		} catch (\Exception $e) {
			Log::error('Error getting budget by year: ' . $e->getMessage(), ['year' => $year]);
			return response()->json([
				'message' => 'Ralat mendapatkan budget tahun',
				'error' => $e->getMessage()
			], 500);
		}
	}

	/**
	 * Clear cache manually (for debugging)
	 */
	public function clearCache()
	{
		try {
			$this->clearAllBudgetCache();

			return response()->json([
				'message' => 'Cache berjaya di-clear',
				'cleared_keys' => [
					self::CACHE_KEY_BUDGETS,
					self::CACHE_KEY_HIERARCHICAL,
					self::CACHE_KEY_SUMMARY
				],
				'timestamp' => now()->toDateTimeString()
			]);
		} catch (\Exception $e) {
			return response()->json([
				'message' => 'Ralat clear cache',
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
			$data = Cache::remember('budget_summary_data', now()->addMinutes(self::CACHE_TTL), function () {
				// Get revenue data (type 0 = Operasi, type 1 = Debit)
				$revenueData = Budget::whereIn('type', [0, 1])
					->where('is_group', false)
					->with(['department', 'parent'])
					->get()
					->groupBy('type')
					->map(function ($budgets, $type) {
						return [
							'total' => $budgets->sum('bdgtotal'),
							'actual' => $budgets->sum('acttotal'),
							'balance' => $budgets->sum('balance'),
							'items' => $budgets->map(function ($budget) {
								return [
									'id' => $budget->id,
									'code' => $budget->code,
									'name' => $budget->name,
									'budget' => $budget->bdgtotal,
									'actual' => $budget->acttotal,
									'balance' => $budget->balance,
									'department' => $budget->department?->name,
									'utilization' => $budget->bdgtotal > 0 ? round(($budget->acttotal / $budget->bdgtotal) * 100, 2) : 0
								];
							})
						];
					});

				// Get expenditure data (type 2 = Kredit)
				$expenditureData = Budget::where('type', 2)
					->where('is_group', false)
					->with(['department', 'parent'])
					->get()
					->groupBy('level')
					->map(function ($budgets, $level) {
						return [
							'total' => $budgets->sum('bdgtotal'),
							'actual' => $budgets->sum('acttotal'),
							'balance' => $budgets->sum('balance'),
							'items' => $budgets->map(function ($budget) {
								return [
									'id' => $budget->id,
									'code' => $budget->code,
									'name' => $budget->name,
									'budget' => $budget->bdgtotal,
									'actual' => $budget->acttotal,
									'balance' => $budget->balance,
									'department' => $budget->department?->name,
									'utilization' => $budget->bdgtotal > 0 ? round(($budget->acttotal / $budget->bdgtotal) * 100, 2) : 0
								];
							})
						];
					});

				return [
					'revenueData' => $revenueData,
					'expenditureData' => $expenditureData,
					'summary' => [
						'totalRevenue' => $revenueData->sum('total'),
						'totalExpenditure' => $expenditureData->sum('total'),
						'netPosition' => $revenueData->sum('total') - $expenditureData->sum('total'),
						'generated_at' => now()->toDateTimeString()
					]
				];
			});

			return response()->json([
				'success' => true,
				'data' => $data,
				'source' => Cache::has('budget_summary_data') ? 'cache' : 'database'
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
	 * Get expense breakdown data (similar to ExpenseBreakdown.json)
	 */
	public function getExpenseBreakdownData()
	{
		try {
			$data = Cache::remember('expense_breakdown_data', now()->addMinutes(self::CACHE_TTL), function () {
				// Get hierarchical expense data (type 2 = Kredit)
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

					// Get subcategories
					$subCategories = $expenses->where('parent_id', $root->id);
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

						// Get details (level 2+)
						$details = $expenses->where('parent_id', $sub->id);
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
				// Get hierarchical revenue data (type 0 = Operasi, type 1 = Debit)
				$revenues = Budget::whereIn('type', [0, 1])
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

					// Get subcategories
					$subCategories = $revenues->where('parent_id', $root->id);
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

						// Get details (level 2+)
						$details = $revenues->where('parent_id', $sub->id);
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
				// Get revenue data (type 0, 1)
				$revenues = Budget::whereIn('type', [0, 1])
					->where('is_group', false)
					->with(['department'])
					->get();

				// Get expenditure data (type 2)
				$expenditures = Budget::where('type', 2)
					->where('is_group', false)
					->with(['department'])
					->get();

				$statementData = [
					'income' => [
						'total' => $revenues->sum('bdgtotal'),
						'actual' => $revenues->sum('acttotal'),
						'items' => $revenues->map(function ($item) {
							return [
								'code' => $item->code,
								'description' => $item->name,
								'budget' => $item->bdgtotal,
								'actual' => $item->acttotal,
								'difference' => $item->bdgtotal - $item->acttotal,
								'department' => $item->department?->name
							];
						})
					],
					'expenditure' => [
						'total' => $expenditures->sum('bdgtotal'),
						'actual' => $expenditures->sum('acttotal'),
						'items' => $expenditures->map(function ($item) {
							return [
								'code' => $item->code,
								'description' => $item->name,
								'budget' => $item->bdgtotal,
								'actual' => $item->acttotal,
								'difference' => $item->bdgtotal - $item->acttotal,
								'department' => $item->department?->name
							];
						})
					],
					'summary' => [
						'netIncome' => $revenues->sum('bdgtotal') - $expenditures->sum('bdgtotal'),
						'netActual' => $revenues->sum('acttotal') - $expenditures->sum('acttotal'),
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
}
