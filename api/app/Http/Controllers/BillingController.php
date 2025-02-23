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

      // Create billing
      $billing = Billing::create([
        'description' => $validatedData['description'],
        'no_project' => $validatedData['no_project'],
        'recipient_id' => $validatedData['recipient_id'],
        'total_amount' => $validatedData['total_amount'],
        'payment_method' => $validatedData['payment_method'] ?? 'online',
        'department_id' => $validatedData['department_id'],
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
   * Get billing statistics by status
   */
  public function getStats()
  {
    try {
      $stats = Billing::where('department_id', request()->user()->department_id)
        ->selectRaw('status_id, COUNT(*) as count, SUM(total_amount) as total')
        ->groupBy('status_id')
        ->get();

      return response()->json([
        'success' => true,
        'data' => $stats
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
        'details' => function($query) {
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
        'history' => function($query) {
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
   * Get billing dashboard statistics
   */
  public function getDashboardStats(Request $request)
  {
    try {
      $department_id = $request->user()->department_id;

      // Get total amount for current month
      $currentMonth = now()->startOfMonth();
      $lastMonth = now()->subMonth()->startOfMonth();

      $currentMonthTotal = Billing::where('department_id', $department_id)
        ->where('created_at', '>=', $currentMonth)
        ->sum('total_amount');

      $lastMonthTotal = Billing::where('department_id', $department_id)
        ->whereBetween('created_at', [$lastMonth, $currentMonth])
        ->sum('total_amount');

      // Calculate growth
      $growth = $lastMonthTotal > 0
        ? (($currentMonthTotal - $lastMonthTotal) / $lastMonthTotal) * 100
        : 100;

      // Get counts by status
      $statusCounts = Billing::where('department_id', $department_id)
        ->selectRaw('status_id, COUNT(*) as count, SUM(total_amount) as total')
        ->groupBy('status_id')
        ->get()
        ->mapWithKeys(function ($item) {
          return [$item->status_id => [
            'count' => $item->count,
            'total' => $item->total
          ]];
        });

      return response()->json([
        'success' => true,
        'data' => [
          'current_month' => [
            'total' => $currentMonthTotal,
            'growth' => round($growth, 2)
          ],
          'status_summary' => $statusCounts,
          'pending_count' => $statusCounts[BillingStatus::DRAFT]['count'] ?? 0,
          'approved_count' => $statusCounts[BillingStatus::FINANCE_APPROVAL]['count'] ?? 0,
          'rejected_count' => $statusCounts[BillingStatus::REJECTED]['count'] ?? 0
        ]
      ]);
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => 'Error fetching dashboard statistics',
        'error' => $error->getMessage()
      ], 500);
    }
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

  /**
   * HOD Approval for billing
   */
  public function hodApprove(Billing $billing)
  {
    $this->authorize('update', $billing);
    $billing->updateStatus(BillingStatus::HOD_APPROVAL, Auth::id(), 'Approved by HOD');
    return response()->json(['message' => 'Billing approved by HOD']);
  }

  /**
   * Finance Review for billing
   */
  public function financeReview(Billing $billing)
  {
    $this->authorize('update', $billing);
    $billing->updateStatus(BillingStatus::FINANCE_REVIEW, Auth::id(), 'Under finance review');
    return response()->json(['message' => 'Billing sent for finance review']);
  }

  /**
   * Finance Verification for billing
   */
  public function financeVerify(Billing $billing)
  {
    $this->authorize('update', $billing);
    $billing->updateStatus(BillingStatus::FINANCE_VERIFY, Auth::id(), 'Verified by finance');
    return response()->json(['message' => 'Billing verified by finance']);
  }

  /**
   * Finance Approval for billing
   */
  public function financeApprove(Billing $billing)
  {
    $this->authorize('update', $billing);
    $billing->updateStatus(BillingStatus::FINANCE_APPROVAL, Auth::id(), 'Approved by finance');
    return response()->json(['message' => 'Billing approved by finance']);
  }

  /**
   * Process Payment for billing
   */
  public function processPayment(Billing $billing)
  {
    $this->authorize('update', $billing);
    $billing->updateStatus(BillingStatus::PROCESSING_PAYMENT, Auth::id(), 'Payment is being processed');
    return response()->json(['message' => 'Payment is being processed']);
  }

  /**
   * Mark billing as paid
   */
  public function paid(Billing $billing)
  {
    $this->authorize('update', $billing);
    $billing->updateStatus(BillingStatus::PAID, Auth::id(), 'Payment completed');
    return response()->json(['message' => 'Billing marked as paid']);
  }

  /**
   * Mark billing as complete
   */
  public function complete(Billing $billing)
  {
    $this->authorize('update', $billing);
    $billing->updateStatus(BillingStatus::COMPLETED, Auth::id(), 'Billing completed');
    return response()->json(['message' => 'Billing marked as completed']);
  }

  /**
   * Reject billing
   */
  public function reject(Billing $billing, Request $request)
  {
    $this->authorize('update', $billing);
    $billing->updateStatus(BillingStatus::REJECTED, Auth::id(), $request->input('remarks', 'Billing rejected'));
    return response()->json(['message' => 'Billing rejected']);
  }

  /**
   * Return billing to draft
   */
  public function return(Billing $billing, Request $request)
  {
    $this->authorize('update', $billing);
    $billing->updateStatus(BillingStatus::RETURNED, Auth::id(), $request->input('remarks', 'Billing returned for revision'));
    return response()->json(['message' => 'Billing returned for revision']);
  }

  /**
   * Cancel billing
   */
  public function cancel(Billing $billing, Request $request)
  {
    $this->authorize('update', $billing);
    $billing->updateStatus(BillingStatus::CANCELLED, Auth::id(), $request->input('remarks', 'Billing cancelled'));
    
    return response()->json(['message' => 'Billing cancelled']);
  }
}
