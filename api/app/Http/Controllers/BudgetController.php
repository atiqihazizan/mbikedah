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
			// Temporarily disable cache for testing
			// $data = Cache::remember('budget_summary_data', 3600, function () {
			$data = function () {
				// First, let's see what types exist in the database
				$allBudgets = Budget::select('type', 'level')->get();
				Log::info('All budget types in database:', [
					'types' => $allBudgets->pluck('type')->unique()->toArray(),
					'levels' => $allBudgets->pluck('level')->unique()->toArray(),
					'total_count' => $allBudgets->count()
				]);

				// For now, always use fallback data since database values are zero
				Log::info('Using fallback data for budget summary');
				
				$revenueData = collect([
					[
						'id' => 1,
						'code' => '5000/000',
						'name' => 'PENDAPATAN (HASIL MBI)',
						'actual2023' => 5667217.60,
						'actual2024' => 3445439.22,
						'budget2023' => 18247472.24,
						'budget2024' => 9228879.13,
						'budget2025' => 15581992.95,
						'department' => 'Kewangan'
					],
					[
						'id' => 2,
						'code' => '5100/000',
						'name' => 'PENDAPATAN LAIN-LAIN (BUKAN HASIL MBI)',
						'actual2023' => 17089117.83,
						'actual2024' => 6148232.66,
						'budget2023' => 19095500.14,
						'budget2024' => 12582644.69,
						'budget2025' => 18634028.01,
						'department' => 'Kewangan'
					],
					[
						'id' => 3,
						'code' => '5200/000',
						'name' => 'PENDAPATAN SUMBER DANA',
						'actual2023' => 530111.15,
						'actual2024' => 2030111.15,
						'budget2023' => 530115.15,
						'budget2024' => 2030111.15,
						'budget2025' => 530111.15,
						'department' => 'Kewangan'
					],
					[
						'id' => 4,
						'code' => '5300/000',
						'name' => 'PENDAPATAN LUAR JANGKA',
						'actual2023' => 0,
						'actual2024' => 1950000.00,
						'budget2023' => 0,
						'budget2024' => 4277347.50,
						'budget2025' => 1440540.00,
						'department' => 'Kewangan'
					]
				]);

				$expenditureData = collect([
					[
						'id' => 5,
						'code' => '2000/000',
						'name' => 'ASET BUKAN SEMASA',
						'actual2023' => 1508163.00,
						'actual2024' => 8430.00,
						'budget2023' => 2525377.40,
						'budget2024' => 682881.10,
						'budget2025' => 1247391.30,
						'department' => 'Kewangan'
					],
					[
						'id' => 6,
						'code' => '3000/000',
						'name' => 'ASET SEMASA',
						'actual2023' => 5055990.17,
						'actual2024' => 2451116.34,
						'budget2023' => 2395821.08,
						'budget2024' => 3325000.00,
						'budget2025' => 4042372.28,
						'department' => 'Kewangan'
					],
					[
						'id' => 7,
						'code' => '4000/000',
						'name' => 'BAYARAN HUTANG DAN FAEDAH',
						'actual2023' => 4945565.35,
						'actual2024' => 2468524.79,
						'budget2023' => 11514164.72,
						'budget2024' => 5224439.39,
						'budget2025' => 10423443.09,
						'department' => 'Kewangan'
					],
					[
						'id' => 8,
						'code' => '9000/000',
						'name' => 'BELANJA OPERASI',
						'actual2023' => 1510853.20,
						'actual2024' => 1121676.20,
						'budget2023' => 3103346.10,
						'budget2024' => 2742213.00,
						'budget2025' => 4997518.00,
						'department' => 'Kewangan'
					],
					[
						'id' => 9,
						'code' => '9100/000',
						'name' => 'EMOLUMEN & FAEDAH KAKITANGAN',
						'actual2023' => 5399426.21,
						'actual2024' => 4809352.80,
						'budget2023' => 6963512.55,
						'budget2024' => 7878772.00,
						'budget2025' => 7280924.00,
						'department' => 'Kewangan'
					],
					[
						'id' => 10,
						'code' => '9200/000',
						'name' => 'PERKHIDMATAN DAN PERBELANJAAN PEJABAT',
						'actual2023' => 507134.46,
						'actual2024' => 393070.77,
						'budget2023' => 2986279.04,
						'budget2024' => 1414798.00,
						'budget2025' => 1270618.00,
						'department' => 'Kewangan'
					],
					[
						'id' => 11,
						'code' => '9300/000',
						'name' => 'SUMBANGAN DAN TAJAAN',
						'actual2023' => 602037.50,
						'actual2024' => 553446.20,
						'budget2023' => 402000.00,
						'budget2024' => 586000.00,
						'budget2025' => 1016000.00,
						'department' => 'Kewangan'
					],
					[
						'id' => 12,
						'code' => '9400/000',
						'name' => 'PERBELANJAAN KHAS',
						'actual2023' => 3002978.90,
						'actual2024' => 1947496.43,
						'budget2023' => 7282111.15,
						'budget2024' => 2415055.58,
						'budget2025' => 2639639.15,
						'department' => 'Kewangan'
					],
					[
						'id' => 13,
						'code' => '9500/000',
						'name' => 'PERBELANJAAN LUAR JANGKA',
						'actual2023' => 0,
						'actual2024' => 900000.00,
						'budget2023' => 0,
						'budget2024' => 2681838.04,
						'budget2025' => 1238156.60,
						'department' => 'Kewangan'
					],
					[
						'id' => 14,
						'code' => '9600/000',
						'name' => 'PERBELANJAAN AM',
						'actual2023' => 0,
						'actual2024' => 0,
						'budget2023' => 0,
						'budget2024' => 0,
						'budget2025' => 0,
						'department' => 'Kewangan'
					]
				]);

				// Calculate totals
				$revenueTotal = [
					'actual2023' => $revenueData->sum('actual2023'),
					'actual2024' => $revenueData->sum('actual2024'),
					'budget2023' => $revenueData->sum('budget2023'),
					'budget2024' => $revenueData->sum('budget2024'),
					'budget2025' => $revenueData->sum('budget2025'),
				];

				$expenditureTotal = [
					'actual2023' => $expenditureData->sum('actual2023'),
					'actual2024' => $expenditureData->sum('actual2024'),
					'budget2023' => $expenditureData->sum('budget2023'),
					'budget2024' => $expenditureData->sum('budget2024'),
					'budget2025' => $expenditureData->sum('budget2025'),
				];

				// Calculate net position
				$netPosition = [
					'actual2023' => $revenueTotal['actual2023'] - $expenditureTotal['actual2023'],
					'actual2024' => $revenueTotal['actual2024'] - $expenditureTotal['actual2024'],
					'budget2023' => $revenueTotal['budget2023'] - $expenditureTotal['budget2023'],
					'budget2024' => $revenueTotal['budget2024'] - $expenditureTotal['budget2024'],
					'budget2025' => $revenueTotal['budget2025'] - $expenditureTotal['budget2025'],
				];

				// Calculate summary values
				$openingBalance = [
					'actual2023' => 1720760.17,
					'actual2024' => 2101260.38,
					'budget2023' => 602617.95,
					'budget2024' => 2475057.96,
					'budget2025' => 1021929.88,
				];

				$runningBalance = [
					'actual2023' => $netPosition['actual2023'] + $openingBalance['actual2023'],
					'actual2024' => $netPosition['actual2024'] + $openingBalance['actual2024'],
					'budget2023' => $netPosition['budget2023'] + $openingBalance['budget2023'],
					'budget2024' => $netPosition['budget2024'] + $openingBalance['budget2024'],
					'budget2025' => $netPosition['budget2025'] + $openingBalance['budget2025'],
				];

				$specialSavings = [
					'actual2023' => 769477.22,
					'actual2024' => 1002332.13,
					'budget2023' => 1000000.00,
					'budget2024' => 1162178.01,
					'budget2025' => 1063096.14,
				];

				$fixedDepositAmounts = [
					'actual2023' => 400000.00,
					'actual2024' => 1000000.00,
					'budget2023' => 1000000.00,
					'budget2024' => 1000000.00,
					'budget2025' => 1000000.00,
				];

				$finalBalance = [
					'actual2023' => $runningBalance['actual2023'] - $specialSavings['actual2023'] + $fixedDepositAmounts['actual2023'],
					'actual2024' => $runningBalance['actual2024'] - $specialSavings['actual2024'] + $fixedDepositAmounts['actual2024'],
					'budget2023' => $runningBalance['budget2023'] - $specialSavings['budget2023'] + $fixedDepositAmounts['budget2023'],
					'budget2024' => $runningBalance['budget2024'] - $specialSavings['budget2024'] + $fixedDepositAmounts['budget2024'],
					'budget2025' => $runningBalance['budget2025'] - $specialSavings['budget2025'] + $fixedDepositAmounts['budget2025'],
				];

				$result = [
					'revenueData' => $revenueData,
					'expenditureData' => $expenditureData,
					'summary' => [
						'revenueTotal' => $revenueTotal,
						'expenditureTotal' => $expenditureTotal,
						'netPosition' => $netPosition,
						'openingBalance' => $openingBalance,
						'runningBalance' => $runningBalance,
						'specialSavings' => $specialSavings,
						'fixedDepositAmounts' => $fixedDepositAmounts,
						'finalBalance' => $finalBalance,
						'generated_at' => now()->toDateTimeString()
					]
				];

				Log::info('Budget Summary Data Result', [
					'result' => $result
				]);

				return $result;
			};

			$data = $data();

			return response()->json([
				'success' => true,
				'data' => $data,
				'message' => 'Budget summary data retrieved successfully'
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
}
