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
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Requests\UpdateBillingStatusRequest;
use App\Exports\BillingsExport;

class BillingController extends Controller
{
  // Status constants
  const STATUS_DRAFT = 1;
  const STATUS_RETURNED = 2;
  const STATUS_CHECKED = 3;
  const STATUS_VERIFIED = 4;
  const STATUS_APPROVED = 5;
  const STATUS_PROCESS_PAYMENT = 6;
  const STATUS_PAID = 7;
  const STATUS_REJECTED = 8;
  const STATUS_CANCELLED = 9;

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
   * 
   * Request body format:
   * {
   *     "description": string,     // Required: Billing description
   *     "no_project": string,      // Required: Project number
   *     "recipient_id": int,       // Required: Recipient ID
   *     "total_amount": float,     // Required: Total amount
   *     "department_id": int,      // Required: Department ID
   *     "status_id": int,          // Required: Status ID (default: 1 - Draft)
   *     "issued_at": date,         // Required: Issue date (YYYY-MM-DD)
   *     "payment_due": date,       // Required: Payment due date (YYYY-MM-DD)
   *     "payment_method": string,  // Optional: Payment method (cheque/online/cash)
   *     "running_no": string,      // Optional: Running number (auto-generated if not provided)
   *     "detail": [               // Required: Array of billing details
   *         {
   *             "description": string,  // Required: Item description
   *             "budget_code": string,  // Required: Budget code
   *             "budget_id": int,       // Required: Budget ID
   *             "price": float,         // Required: Unit price
   *             "quantity": int,        // Required: Quantity
   *             "reference": string     // Optional: Reference
   *         }
   *     ]
   * }
   * 
   * @return \Illuminate\Http\JsonResponse
   *      200: Billing created successfully
   *      400: Invalid request (validation errors)
   */
  public function createBilling(Request $request)
  {
    try {
      $validatedData = $request->validate([
        'description' => 'required|string',
        'no_project' => 'required|string',
        'recipient_id' => 'required|integer',
        'total_amount' => 'required|numeric',
        'payment_method' => 'nullable|string|in:cheque,online,cash',
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

      // Buat billing
      $billing = Billing::create([
        'description' => $validatedData['description'],
        'no_project' => $validatedData['no_project'],
        'recipient_id' => $validatedData['recipient_id'],
        'total_amount' => $validatedData['total_amount'],
        'payment_method' => $validatedData['payment_method'] ?? 'online',
        'status_id' => self::STATUS_DRAFT,
        'department_id' => $validatedData['department_id'],
        'running_no' => $validatedData['running_no'] ?? uniqid('BILL-'),
        'created_by' => $request->user()->id,
        'issued_at' => $validatedData['issued_at'],
        'payment_due' => $validatedData['payment_due'],
        'is_archived' => false
      ]);
      
      // Buat detail billing
      foreach ($validatedData['detail'] as $detail) {
        $billingDetail = BillingDetail::create([
          'billing_id' => $billing->id,
          'description' => $detail['description'],
          'budget_code' => $detail['budget_code'],
          'budget_id' => $detail['budget_id'],
          'price' => $detail['price'],
          'quantity' => $detail['quantity'],
          'reference' => $detail['reference'] ?? null
        ]);
      }

      return response()->json([
        'success' => true,
        'message' => 'Billing created successfully',
        'data' => $billing
      ], 201);
    } catch (Exception $e) {
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
      // Validate and set limits for pagination
      $perPage = min($request->query('per_page', 10), 100); // Maximum 100 items per page
      $page = max($request->query('page', 1), 1); // Minimum page 1

      $query = Billing::with([
          'department' => function($query) {
              $query->select('id', 'name');
          },
          'creator' => function($query) {
              $query->select('id', 'name');
          },
          'recipient' => function($query) {
              $query->select('id', 'name');
          },
          'details' => function($query) {
              $query->select('id', 'billing_id', 'description', 'budget_code', 'price', 'quantity', 'reference');
          }
      ])
        ->select([
          'billings.id',
          'billings.total_amount',
          'billings.running_no',
          'billings.status_id',
          'billings.issued_at',
          'billings.payment_due',
          'billings.department_id',
          'billings.created_by',
          'billings.recipient_id'
        ])
        ->whereRaw('1=1');

      // Filter active/archived based on status
      $archived = $request->query('archived', false);
      if ($archived) {
        $query->whereIn('status_id', [
          Billing::STATUS_PAID,
          Billing::STATUS_REJECTED,
          Billing::STATUS_CANCELLED
        ]);
      } else {
        $query->whereNotIn('status_id', [
          Billing::STATUS_PAID,
          Billing::STATUS_REJECTED,
          Billing::STATUS_CANCELLED
        ]);
      }

      // Department filter
      if ($request->has('department_id')) {
        $query->where('department_id', $request->query('department_id'));
      }

      // Status filter
      if ($request->has('status_id')) {
        $query->where('status_id', $request->query('status_id'));
      }

      // Search filter
      if ($request->has('search')) {
        $search = $request->query('search');
        $query->where(function ($q) use ($search) {
          $q->where('running_no', 'like', "%{$search}%")
            ->orWhereHas('recipient', function ($q) use ($search) {
              $q->where('name', 'like', "%{$search}%");
            });
        });
      }

      // Optimize sorting
      $allowedSortFields = ['issued_at', 'total_amount', 'running_no'];
      $sortField = in_array($request->query('sort_by'), $allowedSortFields)
        ? $request->query('sort_by')
        : 'issued_at';
      $sortOrder = $request->query('sort_order', 'desc');
      $query->orderBy("billings.{$sortField}", $sortOrder);

      $billings = $query->paginate($perPage);

      return response()->json([
        'success' => true,
        'data' => BillingResource::collection($billings)
      ]);
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => 'Error fetching billings',
        'error' => $error->getMessage()
      ], 500);
    }
  }

  /**
   * Get status mapping for efficient transformation
   */
  private function getStatusMap()
  {
    return [
      self::STATUS_DRAFT => 'Draft',
      self::STATUS_RETURNED => 'Returned',
      self::STATUS_CHECKED => 'Checked',
      self::STATUS_VERIFIED => 'Verified',
      self::STATUS_APPROVED => 'Approved',
      self::STATUS_PROCESS_PAYMENT => 'Process Payment',
      self::STATUS_PAID => 'Paid',
      self::STATUS_REJECTED => 'Rejected',
      self::STATUS_CANCELLED => 'Cancelled'
    ];
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
      $billing = Billing::findOrFail($id);
      $details = BillingDetail::where('billing_id', $billing->id)->get();

      return response()->json([
        'success' => true,
        'data' => ['billing' => $billing, 'detail' => $details]
      ]);
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => 'Billing not found',
        'error' => $error->getMessage()
      ], 404);
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

    if (!$billing->canTransitionTo(self::STATUS_APPROVED)) {
      return response()->json(['message' => 'Invalid approval transition'], 400);
    }

    $billing->status = self::STATUS_APPROVED;
    $billing->save();

    return response()->json($billing);
  }

  /**
   * Reject a billing.
   */
  public function rejectBilling($id)
  {
    $billing = Billing::findOrFail($id);

    if (!$billing->canTransitionTo(self::STATUS_REJECTED)) {
      return response()->json(['message' => 'Invalid rejection transition'], 400);
    }

    $billing->status = self::STATUS_REJECTED;
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
   * Process billing from draft to paid.
   */
  public function processBilling($id)
  {
    $billing = Billing::findOrFail($id);
    $currentStatus = $billing->status;
    $steps = config('constants.BILLING_STEPS');
    if (!isset($steps[$currentStatus])) {
      return response()->json(['message' => 'Invalid current status'], 400);
    }

    $nextSteps = $steps[$currentStatus];

    if (empty($nextSteps)) {
      return response()->json(['message' => 'No valid transition available'], 400);
    }

    // Update status ke langkah pertama dari kemungkinan status berikutnya
    $billing->status = $nextSteps[0];
    $billing->save();
    $status = config('constants.BILLING_STATUS');
    return response()->json([
      'message' => 'Billing status updated to ' . $status[$billing->status]
    ], 200);
  }

  /**
   * Reject billing request.
   */
  public function rejectBillingRequest($id)
  {
    $billing = Billing::findOrFail($id);
    $billing->status = self::STATUS_REJECTED;
    $billing->save();
    return response()->json(['message' => 'Billing request rejected successfully'], 200);
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
        ->whereIn('status_id', [self::STATUS_DRAFT, self::STATUS_RETURNED, self::STATUS_CHECKED, self::STATUS_VERIFIED]) // Pending, Review, Approval
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
          'pending_count' => $statusCounts[self::STATUS_DRAFT]['count'] ?? 0,
          'approved_count' => $statusCounts[self::STATUS_APPROVED]['count'] ?? 0,
          'rejected_count' => $statusCounts[self::STATUS_REJECTED]['count'] ?? 0
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
      self::STATUS_DRAFT => 'Dalam Proses',
      self::STATUS_RETURNED => 'Dikembalikan',
      self::STATUS_CHECKED => 'Diperiksa',
      self::STATUS_VERIFIED => 'Diverifikasi',
      self::STATUS_APPROVED => 'Disetujui',
      self::STATUS_PROCESS_PAYMENT => 'Proses Pembayaran',
      self::STATUS_PAID => 'Dibayar',
      self::STATUS_REJECTED => 'Ditolak',
      self::STATUS_CANCELLED => 'Dibatalkan'
    ];

    return $statuses[$status_id] ?? 'Unknown Status';
  }

  public function return(Billing $billing)
  {
    $billing->updateStatus(self::STATUS_RETURNED, 'Returned for amendments');
    return response()->json(['message' => 'Billing returned successfully']);
  }

  public function approveToFinance(Billing $billing)
  {
    $billing->updateStatus(self::STATUS_APPROVED, 'Approved by HOD');
    return response()->json(['message' => 'Billing approved to finance successfully']);
  }

  public function check(Billing $billing)
  {
    $billing->updateStatus(self::STATUS_CHECKED, 'Checked by finance');
    return response()->json(['message' => 'Billing checked successfully']);
  }

  public function verify(Billing $billing)
  {
    $billing->updateStatus(self::STATUS_VERIFIED, 'Verified by finance');
    return response()->json(['message' => 'Billing verified successfully']);
  }

  public function approve(Billing $billing)
  {
    $billing->updateStatus(self::STATUS_APPROVED, 'Approved by finance');
    return response()->json(['message' => 'Billing approved successfully']);
  }

  public function reject(Billing $billing, Request $request)
  {
    $billing->updateStatus(self::STATUS_REJECTED, $request->input('remarks', 'Billing rejected'));
    return response()->json(['message' => 'Billing rejected successfully']);
  }

  public function cancel(Billing $billing, Request $request)
  {
    $billing->updateStatus(self::STATUS_CANCELLED, $request->input('remarks', 'Billing cancelled'));
    return response()->json(['message' => 'Billing cancelled successfully']);
  }

  public function paid(Billing $billing)
  {
    $billing->updateStatus(self::STATUS_PAID, 'Payment completed');
    return response()->json(['message' => 'Billing marked as paid successfully']);
  }
}
