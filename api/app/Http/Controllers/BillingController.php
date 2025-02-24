<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Billing;
use App\Models\BillingHistory;
use App\Models\BillingDetail;
use App\Models\Budget;
use App\Models\Department;
use App\Models\User;
use App\Http\Resources\BillingResource;
use App\Http\Resources\BillingTableResource;
use App\Http\Resources\BillingDetailResource;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Requests\UpdateBillingStatusRequest;
use App\Exports\BillingsExport;
use App\Constants\BillingStatus;
use App\Constants\UserAbilities;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Cache;

class BillingController extends Controller
{
  use AuthorizesRequests;

  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    //
  }

  /**
   * Display the specified resource.
   */
  public function show($id)
  {
    try {
      $billing = Billing::findOrFail($id);
      $details = BillingDetail::where('billing_id', $id)->get();
      return response()->json(['billing' => $billing, 'details' => $details], 200);
    } catch (Exception $error) {
      return response()->json(['message' => 'Billing not found'], 404);
    }
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, string $id)
  {
    //
  }

  /**
   * Remove the specified resource from storage.
   */
  public function destroy(string $id)
  {
    //
  }

  /**
   * Create a new billing.
   * 
   * @param \Illuminate\Http\Request $request The request object
   */
  public function createBilling(Request $request)
  {
    try {
      $this->authorize('create', Billing::class);

      $validatedData = $request->validate([
        'description' => 'required|string',
        'no_project' => 'required|string',
        'recipient_id' => 'required|integer',
        'total_amount' => 'required|numeric',
        'payment_method' => 'nullable|string',
        'department_id' => 'required|integer',
        'running_no' => 'nullable|string',
        'issued_at' => 'required|date',
        'payment_due' => 'required|date',
        'detail' => 'required|array',
        'detail.*.description' => 'required|string',
        'detail.*.budget_code' => 'required|string',
        'detail.*.budget_id' => 'required|integer',
        'detail.*.price' => 'required|numeric',
        'detail.*.quantity' => 'required|integer',
        'detail.*.reference' => 'nullable|string'
      ]);

      DB::beginTransaction();

      if (!$request->user()->hasAbility([UserAbilities::ADMIN, UserAbilities::APPLICANT])) {
        return response()->json(['message' => 'You do not have permission to create billing'], 403);
      }

      $departmentId = $request->user()->department_id;
      if ($request->user()->hasAbility(UserAbilities::ADMIN)) {
        $departmentId = $validatedData['department_id'];
      }

      // Create billing
      $billing = Billing::create([
        'description' => $validatedData['description'],
        'no_project' => $validatedData['no_project'],
        'recipient_id' => $validatedData['recipient_id'],
        'total_amount' => $validatedData['total_amount'],
        'payment_method' => $validatedData['payment_method'] ?? 'online',
        'department_id' => $departmentId,
        'running_no' => $validatedData['running_no'] ?? uniqid('BILL-'),
        'created_by' => $request->user()->id,
        'issued_at' => $validatedData['issued_at'],
        'payment_due' => $validatedData['payment_due'],
        'is_archived' => false
      ]);

      // Create billing details
      foreach ($validatedData['detail'] as $detail) {
        BillingDetail::create([
          'billing_id' => $billing->id,
          'description' => $detail['description'],
          'budget_code' => $detail['budget_code'],
          'budget_id' => $detail['budget_id'],
          'price' => $detail['price'],
          'quantity' => $detail['quantity'],
          'reference' => $detail['reference'] ?? null
        ]);
      }

      // Set initial status and create history record
      $billing->updateStatus(BillingStatus::DRAFT, $request->user()->id, 'Billing created');

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Billing created successfully',
        'data' => $billing
      ], 201);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => 'Failed to create billing: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get billings with filters and pagination
   */
  public function getBillings(Request $request)
  {
    try {
      // Generate cache key based on request parameters
      $cacheKey = 'billings.list.' . md5(json_encode($request->all()));

      // Get from cache if no filters
      if (!$request->hasAny(['archived', 'department_id', 'status_id', 'start_date', 'end_date', 'search'])) {
        $cached = Cache::get($cacheKey);
        if ($cached) {
          return response()->json($cached)->header('Cache-Control', 'public, max-age=300');
        }
      }

      // Validate and set limits for pagination
      $perPage = min($request->query('per_page', 10), 100);
      $page = max($request->query('page', 1), 1);

      // Select specific columns only
      $query = Billing::select([
        'id',
        'running_no',
        'description',
        'no_project',
        'total_amount',
        'payment_method',
        'status_id',
        'department_id',
        'recipient_id',
        'created_by',
        'created_at',
        'is_archived'
      ])
        ->with([
          'department:id,name',
          'creator:id,name',
          'recipient:id,name'
        ]);

      // Filter archived
      $archived = $request->query('archived', false);
      if ($archived) {
        $query->whereIn('status_id', [
          BillingStatus::PAID,
          BillingStatus::REJECTED,
          BillingStatus::CANCELLED
        ]);
      } else {
        $query->whereNotIn('status_id', [
          BillingStatus::PAID,
          BillingStatus::REJECTED,
          BillingStatus::CANCELLED
        ]);
      }

      // Filter by department
      if ($request->has('department_id')) {
        $query->where('department_id', $request->query('department_id'));
      }

      // Filter by status
      if ($request->has('status_id')) {
        $query->where('status_id', $request->query('status_id'));
      }

      // Filter by date range
      if ($request->has(['start_date', 'end_date'])) {
        $query->whereBetween('created_at', [
          $request->query('start_date'),
          $request->query('end_date')
        ]);
      }

      // Search with index
      if ($request->has('search')) {
        $search = $request->query('search');
        $query->where(function ($q) use ($search) {
          $q->where('description', 'like', "%{$search}%")
            ->orWhere('no_project', 'like', "%{$search}%")
            ->orWhere('running_no', 'like', "%{$search}%");
        });
      }

      // Add index hints
      $query->from('billings')->useIndex('billings_created_at_index');

      $billings = $query->orderBy('created_at', 'desc')
        ->paginate($perPage);

      $response = BillingTableResource::collection($billings);

      // Cache the response if no filters
      if (!$request->hasAny(['archived', 'department_id', 'status_id', 'start_date', 'end_date', 'search'])) {
        Cache::put($cacheKey, $response->response()->getData(), now()->addMinutes(5));
      }

      return $response->response()
        ->header('Cache-Control', 'public, max-age=300');
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => 'Error fetching billings',
        'error' => $error->getMessage()
      ], 500);
    }
  }

  /**
   * Export billings to Excel/PDF
   */
  public function exportBillings(Request $request)
  {
    try {
      $format = $request->query('format', 'pdf');

      // Validate format
      if (!in_array($format, ['pdf', 'excel'])) {
        return response()->json([
          'success' => false,
          'message' => 'Invalid export format. Supported formats: pdf, excel'
        ], 400);
      }

      $billings = Billing::with(['department', 'creator', 'recipient', 'details'])
        ->where('department_id', $request->user()->department_id)
        ->get();

      if ($billings->isEmpty()) {
        return response()->json([
          'success' => false,
          'message' => 'No billings found to export'
        ], 404);
      }

      if ($format === 'excel') {
        return Excel::download(new BillingsExport($billings), 'billings.xlsx');
      } else {
        $pdf = Pdf::loadView('exports.billings', ['billings' => $billings]);
        return $pdf->download('billings.pdf');
      }
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => 'Error exporting billings',
        'error' => $error->getMessage()
      ], 500);
    }
  }

  /**
   * Get comprehensive billing statistics for dashboard
   */
  public function getStats()
  {
    try {
      $user = request()->user();
      $query = Billing::query();

      // Filter by department if user is not admin/finance
      if (!$user->hasAbility([config('constants.abilities.admin'), config('constants.abilities.finance')])) {
        $query->where('department_id', $user->department_id);
      }

      // Get overall statistics
      $overallStats = $query->selectRaw('
        COUNT(*) as total_billings,
        SUM(total_amount) as total_amount,
        COUNT(CASE WHEN status_id IN (?, ?, ?) THEN 1 END) as pending_count,
        SUM(CASE WHEN status_id IN (?, ?, ?) THEN total_amount END) as pending_amount,
        COUNT(CASE WHEN status_id = ? THEN 1 END) as completed_count,
        SUM(CASE WHEN status_id = ? THEN total_amount END) as completed_amount
      ', [
        BillingStatus::HOD_APPROVAL,
        BillingStatus::FINANCE_REVIEW,
        BillingStatus::FINANCE_VERIFY,
        BillingStatus::HOD_APPROVAL,
        BillingStatus::FINANCE_REVIEW,
        BillingStatus::FINANCE_VERIFY,
        BillingStatus::COMPLETED,
        BillingStatus::COMPLETED
      ])->first();

      // Get statistics by status
      $statusStats = $query->selectRaw('
        status_id,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      ')
        ->groupBy('status_id')
        ->get()
        ->map(function ($stat) {
          return [
            'status_id' => $stat->status_id,
            'status_name' => BillingStatus::getStatusName($stat->status_id),
            'count' => $stat->count,
            'total_amount' => $stat->total_amount
          ];
        });

      // Get monthly trend (last 6 months)
      $monthlyTrend = $query->selectRaw('
        DATE_FORMAT(created_at, "%Y-%m") as month,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      ')
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();

      // Get department statistics if user is admin/finance
      $departmentStats = [];
      if ($user->hasAbility([config('constants.abilities.admin'), config('constants.abilities.finance')])) {
        $departmentStats = $query->selectRaw('
          departments.name as department_name,
          COUNT(*) as count,
          SUM(total_amount) as total_amount
        ')
          ->join('departments', 'billings.department_id', '=', 'departments.id')
          ->groupBy('departments.id', 'departments.name')
          ->get();
      }

      return response()->json([
        'success' => true,
        'data' => [
          'overall' => $overallStats,
          'by_status' => $statusStats,
          'monthly_trend' => $monthlyTrend,
          'by_department' => $departmentStats
        ]
      ]);
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => 'Error fetching statistics',
        'error' => $error->getMessage()
      ], 500);
    }
  }

  /**
   * Get single billing by ID.
   */
  public function getBillingById($id)
  {
    try {
      // Try to get from cache
      $cacheKey = 'billing.' . $id;
      $cached = Cache::get($cacheKey);
      if ($cached) {
        return response()->json($cached)
          ->header('Cache-Control', 'public, max-age=300');
      }

      // Select specific columns
      $billing = Billing::select([
        'id',
        'running_no',
        'description',
        'no_project',
        'total_amount',
        'payment_method',
        'status_id',
        'department_id',
        'recipient_id',
        'created_by',
        'created_at',
        'issued_at',
        'payment_due',
        'is_archived'
      ])
        ->with([
          'department:id,name',
          'creator:id,name',
          'recipient:id,name',
          'details' => function ($query) {
            $query->select([
              'id',
              'billing_id',
              'description',
              'budget_code',
              'budget_id',
              'price',
              'quantity',
              'reference',
              'total'
            ]);
          },
          'details.budget:id,name,code',
          'history' => function ($query) {
            $query->select([
              'id',
              'billing_id',
              'old_status',
              'new_status',
              'remarks',
              'created_by',
              'created_at'
            ])->orderBy('created_at', 'desc');
          },
          'history.creator:id,name'
        ])
        ->findOrFail($id);

      $response = new BillingDetailResource($billing);

      // Cache the response
      Cache::put($cacheKey, $response->response()->getData(), now()->addMinutes(5));

      return $response->response()
        ->header('Cache-Control', 'public, max-age=300');
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => 'Error fetching billing',
        'error' => $error->getMessage()
      ], 500);
    }
  }

  /**
   * Update the status of a billing.
   */
  public function updateBilling(Request $request, $id)
  {
    $billing = Billing::findOrFail($id);
    $billing->update($request->all());
    return response()->json($billing);
  }

  /**
   * Approve a billing.
   */
  public function approveBilling($id)
  {
    $billing = Billing::findOrFail($id);

    if (!$billing->canTransitionTo(BillingStatus::FINANCE_APPROVAL)) {
      return response()->json(['message' => 'Invalid approval transition'], 400);
    }

    $billing->status = BillingStatus::FINANCE_APPROVAL;
    $billing->save();

    return response()->json($billing);
  }

  /**
   * Reject a billing.
   */
  public function rejectBilling($id)
  {
    $billing = Billing::findOrFail($id);

    if (!$billing->canTransitionTo(BillingStatus::REJECTED)) {
      return response()->json(['message' => 'Invalid rejection transition'], 400);
    }

    $billing->status = BillingStatus::REJECTED;
    $billing->save();

    return response()->json($billing);
  }
  /**
   * Get the status of a billing.
   */
  public function getBillingStatus($id)
  {
    $billing = Billing::findOrFail($id);
    return response()->json(['status' => $billing->status]);
  }

  /**
   * Update status billing.
   */
  public function updateStatus($id, Request $request)
  {
    try {
      $billing = Billing::findOrFail($id);
      $newStatus = $request->status_id;
      $remarks = $request->remarks;

      if (!$billing->canTransitionTo($newStatus)) {
        return response()->json([
          'success' => false,
          'message' => 'Invalid status transition'
        ], 400);
      }

      $updated = $billing->updateStatus($newStatus, Auth::id(), $remarks);

      if (!$updated) {
        return response()->json([
          'success' => false,
          'message' => 'Failed to update status'
        ], 400);
      }

      return response()->json([
        'success' => true,
        'message' => 'Status updated successfully',
        'data' => new BillingResource($billing->fresh())
      ]);
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => 'Error updating status: ' . $error->getMessage()
      ], 500);
    }
  }

  /**
   * Toggle archive billing.
   */
  public function toggleArchive($id)
  {
    try {
      $billing = Billing::findOrFail($id);
      $billing->toggleArchive();

      return response()->json([
        'success' => true,
        'message' => 'Billing archive status toggled successfully'
      ]);
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => $error->getMessage()
      ], 500);
    }
  }

  /**
   * Get recent activities with pagination and filtering
   */
  public function getRecentActivities(Request $request)
  {
    try {
      $query = Billing::with(['creator', 'department'])
        ->select('billings.*')
        ->join('billing_histories', 'billings.id', '=', 'billing_histories.billing_id')
        ->where('billings.department_id', $request->user()->department_id)
        ->orderBy('billing_histories.created_at', 'DESC');

      // Filter by date range
      if ($request->has('start_date') && $request->has('end_date')) {
        $query->whereBetween('billing_histories.created_at', [
          $request->start_date,
          $request->end_date
        ]);
      }

      // Filter by status
      if ($request->has('status_id')) {
        $query->where('billings.status_id', $request->query('status_id'));
      }

      $activities = $query->paginate($request->query('per_page', 10));

      // Transform data efficiently
      $activities->getCollection()->transform(function ($billing) {
        return [
          'id' => $billing->id,
          'description' => $billing->description,
          'amount' => $billing->total_amount,
          'status' => $billing->status_id,
          'department' => $billing->department->name,
          'created_by' => $billing->creator->name,
          'created_at' => $billing->created_at
        ];
      });

      return response()->json([
        'success' => true,
        'data' => $activities
      ]);
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => 'Error fetching activities',
        'error' => $error->getMessage()
      ], 500);
    }
  }

  /**
   * Get pending items with detailed information
   */
  public function getPendingItems(Request $request)
  {
    try {
      $query = Billing::with(['creator', 'department', 'recipient'])
        ->whereIn('status_id', [
          BillingStatus::DRAFT,
          BillingStatus::RETURNED,
          BillingStatus::HOD_APPROVAL,
          BillingStatus::FINANCE_REVIEW,
          BillingStatus::FINANCE_VERIFY,
          BillingStatus::FINANCE_APPROVAL
        ]) // Pending, Review, Approval
        ->where('department_id', $request->user()->department_id);

      // Filter by status if specified
      if ($request->has('status_id')) {
        $query->where('status_id', $request->status_id);
      }

      $items = $query->get()->groupBy('status_id');

      $summary = [];
      foreach ($items as $status => $billings) {
        $summary[] = [
          'status_id' => $status,
          'status_name' => $this->getStatusName($status),
          'count' => $billings->count(),
          'total_amount' => $billings->sum('total_amount'),
          'items' => $billings->map(function ($billing) {
            return [
              'id' => $billing->id,
              'running_no' => $billing->running_no,
              'description' => $billing->description,
              'amount' => $billing->total_amount,
              'created_by' => $billing->creator->name,
              'recipient' => $billing->recipient->name,
              'department' => $billing->department->name,
              'created_at' => $billing->created_at
            ];
          })
        ];
      }

      return response()->json([
        'success' => true,
        'data' => $summary
      ]);
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => 'Error fetching pending items',
        'error' => $error->getMessage()
      ], 500);
    }
  }

  /**
   * Get dashboard and table data
   */
  public function getDashboardData(Billing $billing)
  {
    try {
      $user = request()->user();

      // Jika user adalah admin atau applicant, dapatkan stats untuk user biasa
      if ($user->hasAbility([UserAbilities::ADMIN, UserAbilities::APPLICANT])) {
        $stats = $this->getUserDashboardStats();
        $tables = $this->getUserDashboardTables();
        
        if (!$stats['success'] || !$tables['success']) {
          throw new Exception($stats['message'] ?? $tables['message'] ?? 'Failed to get dashboard data');
        }

        return response()->json([
          'success' => true,
          'data' => [
            'stats' => $stats['data'],
            'tables' => $tables['data']
          ]
        ]);
      } 
      // Selain applicant (admin, hod, finance dll), dapatkan stats untuk officer
      else {
        $stats = $this->getOfficerDashboardStats();
        $tables = $this->getOfficerDashboardTables();
        
        if (!$stats['success'] || !$tables['success']) {
          throw new Exception($stats['message'] ?? $tables['message'] ?? 'Failed to get dashboard data');
        }

        return response()->json([
          'success' => true,
          'data' => [
            'stats' => $stats['data'],
            'tables' => $tables['data']
          ]
        ]);
      }
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => $error->getMessage()
      ], 500);
    }
  }

  /**
   * Get dashboard statistics for normal users
   */
  public function getUserDashboardStats()
  {
    try {
      $user = request()->user();

      // Get counts by status using raw query to avoid model appends
      $statusCounts = DB::table('billings')
        ->where('created_by', $user->id)
        ->selectRaw('
          COUNT(CASE WHEN status_id = ? THEN 1 END) as draft_count,
          COUNT(CASE WHEN status_id IN (?, ?, ?, ?, ?) THEN 1 END) as pending_count,
          COUNT(CASE WHEN status_id = ? THEN 1 END) as approved_count,
          COUNT(CASE WHEN status_id = ? THEN 1 END) as rejected_count
        ', [
          BillingStatus::DRAFT,
          BillingStatus::HOD_APPROVAL,
          BillingStatus::FINANCE_REVIEW,
          BillingStatus::FINANCE_VERIFY,
          BillingStatus::FINANCE_APPROVAL,
          BillingStatus::PROCESSING_PAYMENT,
          BillingStatus::PAID,
          BillingStatus::REJECTED
        ])->first();

      // Get time-based statistics
      $now = now();
      $startOfWeek = $now->copy()->startOfWeek()->format('Y-m-d H:i:s');
      $endOfWeek = $now->copy()->endOfWeek()->format('Y-m-d H:i:s');
      $startOfMonth = $now->copy()->startOfMonth()->format('Y-m-d H:i:s');
      $endOfMonth = $now->copy()->endOfMonth()->format('Y-m-d H:i:s');
      $startOfYear = $now->copy()->startOfYear()->format('Y-m-d H:i:s');
      $endOfYear = $now->copy()->endOfYear()->format('Y-m-d H:i:s');

      $timeStats = DB::table('billings')
        ->where('created_by', $user->id)
        ->selectRaw("
          COUNT(CASE WHEN created_at BETWEEN '{$startOfWeek}' AND '{$endOfWeek}' THEN 1 END) as weekly,
          COUNT(CASE WHEN created_at BETWEEN '{$startOfMonth}' AND '{$endOfMonth}' THEN 1 END) as monthly,
          COUNT(CASE WHEN created_at BETWEEN '{$startOfYear}' AND '{$endOfYear}' THEN 1 END) as yearly
        ")
        ->first();

      return [
        'success' => true,
        'data' => [
          'status_counts' => [
            'draft_count' => $statusCounts->draft_count ?? 0,
            'pending_count' => $statusCounts->pending_count ?? 0,
            'approved_count' => $statusCounts->approved_count ?? 0,
            'rejected_count' => $statusCounts->rejected_count ?? 0
          ],
          'time_stats' => [
            'weekly' => $timeStats->weekly ?? 0,
            'monthly' => $timeStats->monthly ?? 0,
            'yearly' => $timeStats->yearly ?? 0
          ]
        ]
      ];
    } catch (Exception $error) {
      return ['success' => false, 'message' => $error->getMessage()];
    }
  }

  /**
   * Get dashboard tables data for normal users
   */
  public function getUserDashboardTables()
  {
    try {
      $user = request()->user();
      // $query = Billing::with(['department', 'creator'])
      $query = Billing::where('created_by', $user->id)
        ->select('id', 'issued_at', 'no_project', 'running_no', 'description', 'total_amount', 'status_id', 'created_at');

      // Draft and pending items
      $activeItems = $query->clone()
        ->whereIn('status_id', [
          BillingStatus::DRAFT,
          BillingStatus::HOD_APPROVAL,
          BillingStatus::FINANCE_REVIEW,
          BillingStatus::FINANCE_VERIFY,
          BillingStatus::FINANCE_APPROVAL,
          BillingStatus::PROCESSING_PAYMENT,
          BillingStatus::RETURNED
        ])
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get()
        ->map(function ($item) {
          return [
            'id' => $item->id,
            'issued_at' => $item->issued_at,
            'no_project' => $item->no_project,
            'running_no' => $item->running_no,
            'description' => $item->description,
            'total_amount' => $item->total_amount,
            'status' => BillingStatus::getStatusName($item->status_id),
            'created_at' => $item->created_at,
            // 'department' => $item->department->name,
            // 'applicant' => $item->creator->name
          ];
        });

      // Completed items
      $completedItems = $query->clone()
        ->whereIn('status_id', [
          BillingStatus::PAID,
          BillingStatus::REJECTED,
          BillingStatus::CANCELLED
        ])
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get()
        ->map(function ($item) {
          return [
            'id' => $item->id,
            'issued_at' => $item->issued_at,
            'no_project' => $item->no_project,
            'running_no' => $item->running_no,
            'description' => $item->description,
            'total_amount' => $item->total_amount,
            'status' => BillingStatus::getStatusName($item->status_id),
            'created_at' => $item->created_at,
            // 'department' => $item->department->name,
            // 'applicant' => $item->creator->name
          ];
        });

      return [
        'success' => true,
        'data' => [
          'active_items' => $activeItems,
          'completed_items' => $completedItems
        ]
      ];
    } catch (Exception $error) {
      return  ['success' => false, 'message' => $error->getMessage()];
    }
  }

  /**
   * Get dashboard statistics for officers (HOD, Finance, etc)
   */
  public function getOfficerDashboardStats()
  {
    try {
      $user = request()->user();
      $query = Billing::query();
      $finance = [
        UserAbilities::FINANCE_CHECKER,
        UserAbilities::FINANCE_VERIFIER,
        UserAbilities::FINANCE_APPROVER,
        UserAbilities::FINANCE_PAYMENT
      ];

      // Filter based on ability
      if ($user->hasAbility(UserAbilities::HOD)) {
        $query->where('department_id', $user->department_id)
          ->where('status_id', BillingStatus::HOD_APPROVAL);
      } elseif ($user->hasAbility($finance)) {
        $query->whereIn('status_id', [
          BillingStatus::FINANCE_REVIEW,
          BillingStatus::FINANCE_VERIFY,
          BillingStatus::FINANCE_APPROVAL,
          BillingStatus::PROCESSING_PAYMENT,
          BillingStatus::PAID
        ]);
      }

      // Get counts
      $stats = $query->selectRaw('
        COUNT(CASE WHEN status_id IN (?, ?, ?, ?, ?) THEN 1 END) as pending_count,
        COUNT(CASE WHEN status_id = ? THEN 1 END) as approved_count,
        COUNT(CASE WHEN status_id = ? THEN 1 END) as rejected_count,
        COUNT(CASE WHEN status_id = ? THEN 1 END) as returned_count
      ', [
        BillingStatus::HOD_APPROVAL,
        BillingStatus::FINANCE_REVIEW,
        BillingStatus::FINANCE_VERIFY,
        BillingStatus::FINANCE_APPROVAL,
        BillingStatus::PROCESSING_PAYMENT,
        BillingStatus::COMPLETED,
        BillingStatus::REJECTED,
        BillingStatus::RETURNED
      ])->first();

      return [
        'success' => true,
        'data' => $stats
      ];
    } catch (Exception $error) {
      return ['success' => false, 'message' => $error->getMessage()];
    }
  }

  /**
   * Get dashboard tables data for officers
   */
  public function getOfficerDashboardTables()
  {
    try {
      $user = request()->user();
      $query = Billing::with(['department', 'user'])
        ->select('id', 'reference_no', 'total_amount', 'status_id', 'created_at', 'department_id', 'created_by');

      $finance = [
        UserAbilities::FINANCE_CHECKER,
        UserAbilities::FINANCE_VERIFIER,
        UserAbilities::FINANCE_APPROVER,
        UserAbilities::FINANCE_PAYMENT
      ];

      // Filter based on ability
      if ($user->hasAbility(UserAbilities::HOD)) {
        $query->where('department_id', $user->department_id)
          ->where('status_id', BillingStatus::HOD_APPROVAL);
      } elseif ($user->hasAbility($finance)) {
        $query->whereIn('status_id', [
          BillingStatus::FINANCE_REVIEW,
          BillingStatus::FINANCE_VERIFY,
          BillingStatus::FINANCE_APPROVAL,
          BillingStatus::PROCESSING_PAYMENT,
          BillingStatus::PAID
        ]);
      }

      $items = $query->latest()
        ->get()
        ->map(function ($item) {
          return [
            'id' => $item->id,
            'reference_no' => $item->reference_no,
            'total_amount' => $item->total_amount,
            'status' => BillingStatus::getStatusName($item->status_id),
            'created_at' => $item->created_at,
            'department' => $item->department->name,
            'applicant' => $item->user->name
          ];
        });

      return response()->json([
        'success' => true,
        'data' => $items
      ]);
    } catch (Exception $error) {
      return ['success' => false, 'message' => $error->getMessage()];
    }
  }

  /**
   * HOD Approval for billing
   */
  public function hodApprove(Billing $billing)
  {
    $this->authorize('process', $billing);
    $billing->updateStatus(BillingStatus::HOD_APPROVAL, Auth::id(), 'Approved by HOD');
    return response()->json(['message' => 'Billing approved by HOD']);
  }

  /**
   * Finance Review for billing
   */
  public function financeReview(Billing $billing)
  {
    $this->authorize('process', $billing);
    $billing->updateStatus(BillingStatus::FINANCE_REVIEW, Auth::id(), 'Under finance review');
    return response()->json(['message' => 'Billing sent for finance review']);
  }

  /**
   * Finance Verification for billing
   */
  public function financeVerify(Billing $billing)
  {
    $this->authorize('process', $billing);
    $billing->updateStatus(BillingStatus::FINANCE_VERIFY, Auth::id(), 'Verified by finance');
    return response()->json(['message' => 'Billing verified by finance']);
  }

  /**
   * Finance Approval for billing
   */
  public function financeApprove(Billing $billing)
  {
    $this->authorize('process', $billing);
    $billing->updateStatus(BillingStatus::FINANCE_APPROVAL, Auth::id(), 'Approved by finance');
    return response()->json(['message' => 'Billing approved by finance']);
  }

  /**
   * Process Payment for billing
   */
  public function processPayment(Billing $billing)
  {
    $this->authorize('process', $billing);
    $billing->updateStatus(BillingStatus::PROCESSING_PAYMENT, Auth::id(), 'Payment is being processed');
    return response()->json(['message' => 'Payment is being processed']);
  }

  /**
   * Mark billing as paid
   */
  public function paid(Billing $billing)
  {
    $this->authorize('process', $billing);
    $billing->updateStatus(BillingStatus::PAID, Auth::id(), 'Payment completed');
    return response()->json(['message' => 'Billing marked as paid']);
  }

  /**
   * Mark billing as complete
   */
  public function complete(Billing $billing)
  {
    $this->authorize('process', $billing);
    $billing->updateStatus(BillingStatus::COMPLETED, Auth::id(), 'Billing completed');
    return response()->json(['message' => 'Billing marked as completed']);
  }

  /**
   * Reject billing
   */
  public function reject(Billing $billing, Request $request)
  {
    $this->authorize('process', $billing);
    $billing->updateStatus(BillingStatus::REJECTED, Auth::id(), $request->input('remarks', 'Billing rejected'));
    return response()->json(['message' => 'Billing rejected']);
  }

  /**
   * Return billing to draft
   */
  public function return(Billing $billing, Request $request)
  {
    $this->authorize('process', $billing);
    $billing->updateStatus(BillingStatus::RETURNED, Auth::id(), $request->input('remarks', 'Billing returned for revision'));
    return response()->json(['message' => 'Billing returned for revision']);
  }

  /**
   * Cancel billing
   */
  public function cancel(Billing $billing, Request $request)
  {
    $this->authorize('process', $billing);
    $billing->updateStatus(BillingStatus::CANCELLED, Auth::id(), $request->input('remarks', 'Billing cancelled'));

    return response()->json(['message' => 'Billing cancelled']);
  }

  /**
   * Helper function to get status name
   */
  private function getStatusName($status_id)
  {
    $statuses = [
      BillingStatus::DRAFT => 'Dalam Proses',
      BillingStatus::HOD_APPROVAL => 'HOD Approval',
      BillingStatus::FINANCE_REVIEW => 'Finance Review',
      BillingStatus::FINANCE_VERIFY => 'Finance Verify',
      BillingStatus::FINANCE_APPROVAL => 'Finance Approval',
      BillingStatus::PROCESSING_PAYMENT => 'Proses Pembayaran',
      BillingStatus::PAID => 'Dibayar',
      BillingStatus::REJECTED => 'Ditolak',
      BillingStatus::CANCELLED => 'Dibatalkan',
      BillingStatus::RETURNED => 'Dikembalikan',
      BillingStatus::COMPLETED => 'Selesai'
    ];

    return $statuses[$status_id] ?? 'Unknown Status';
  }
}
