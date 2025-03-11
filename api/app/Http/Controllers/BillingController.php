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
use App\Http\Requests\BillingRequest;
use App\Http\Requests\UpdateBillingStatusRequest;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\BillingsExport;
use App\Constants\BillingStatus;
use App\Constants\UserAbilities;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Auth\Access\AuthorizationException;

class BillingController extends Controller
{
  use AuthorizesRequests;

  /**
   * Get billings that need approval
   */
  public function getPendingApprovals(Request $request)
  {
    try {
      $user = $request->user();
      $userAbilities = is_string($user->abilities) ? json_decode($user->abilities, true) : $user->abilities;
      
      if (empty($userAbilities)) {
        return response()->json([
          'success' => false,
          'message' => 'Anda tidak mempunyai kebenaran untuk melihat senarai permohonan'
        ], 403);
      }

      $query = Billing::query()
        ->with(['details', 'recipient', 'department', 'creator'])
        ->orderBy('created_at', 'desc');

      // Filter berdasarkan abilities
      if (in_array(UserAbilities::HOD, $userAbilities)) {
        // HOD boleh lihat permohonan jabatan sendiri yang perlu kelulusan HOD
        $query->where(function($q) use ($user) {
          $q->where('department_id', $user->department_id)
            ->where('status_id', BillingStatus::HOD_APPROVAL);
        });
      }
      
      if (in_array(UserAbilities::FINANCE_APPROVER, $userAbilities)) {
        // Finance boleh lihat semua permohonan yang perlu kelulusan finance
        $query->orWhere('status_id', BillingStatus::FINANCE_APPROVAL);
      }

      if (in_array(UserAbilities::FINANCE_VERIFIER, $userAbilities)) {
        // Penyemak boleh lihat permohonan yang perlu disemak
        $query->orWhere('status_id', BillingStatus::FINANCE_REVIEW);
      }

      if (in_array(UserAbilities::PAYMENT_MAKER, $userAbilities)) {
        // Pembayar boleh lihat permohonan yang perlu dibayar
        $query->orWhere('status_id', BillingStatus::PROCESSING_PAYMENT);
      }

      $billings = $query->get();

      return response()->json([
        'success' => true,
        'message' => 'Senarai permohonan yang perlu disahkan',
        'data' => BillingTableResource::collection($billings)
      ]);

    } catch (Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Ralat semasa mendapatkan senarai permohonan',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get billings that need Finance approval
   */
  public function getFinanceApprovals(Request $request)
  {
    try {
      $billings = Billing::where('status_id', BillingStatus::FINANCE_APPROVAL)
        ->with(['details', 'recipient', 'department'])
        ->orderBy('created_at', 'desc')
        ->get();

      return response()->json([
        'success' => true,
        'message' => 'Senarai billing yang perlu disahkan oleh Finance',
        'data' => BillingTableResource::collection($billings)
      ]);

    } catch (Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Ralat semasa mendapatkan senarai billing',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Update billing status
   */
  public function updateBillingStatus(Request $request, $id)
  {
    try {
      $billing = Billing::findOrFail($id);
      $user = $request->user();

      $validator = Validator::make($request->all(), [
        'status_id' => 'required|integer',
        'remarks' => 'nullable|string'
      ]);

      if ($validator->fails()) {
        return response()->json([
          'success' => false,
          'message' => 'Validation error',
          'errors' => $validator->errors()
        ], 422);
      }

      $newStatus = $request->status_id;
      $remarks = $request->remarks ?? '';

      // Validate status transition
      if (!$this->isValidStatusTransition($billing->status_id, $newStatus, $user)) {
        return response()->json([
          'success' => false,
          'message' => 'Perubahan status tidak dibenarkan'
        ], 403);
      }

      DB::beginTransaction();

      $billing->updateStatus($newStatus, $user->id, $remarks);

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Status billing berjaya dikemaskini',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);

    } catch (ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Billing tidak dijumpai'
      ], 404);

    } catch (Exception $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => 'Ralat semasa mengemaskini status billing',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Validate status transition based on user abilities and current status
   */
  private function isValidStatusTransition($currentStatus, $newStatus, $user)
  {
    $userAbilities = is_string($user->abilities) ? json_decode($user->abilities, true) : $user->abilities;

    // HOD boleh lulus/tolak bila status HOD_APPROVAL
    if (in_array(UserAbilities::HOD, $userAbilities)) {
      if ($currentStatus === BillingStatus::HOD_APPROVAL) {
        return in_array($newStatus, [
          BillingStatus::FINANCE_REVIEW,   // Lulus ke semakan
          BillingStatus::REJECTED,        // Tolak
          BillingStatus::RETURNED         // Pulang untuk pembetulan
        ]);
      }
    }

    // Penyemak boleh semak bila status FINANCE_REVIEW
    if (in_array(UserAbilities::FINANCE_VERIFIER, $userAbilities)) {
      if ($currentStatus === BillingStatus::FINANCE_REVIEW) {
        return in_array($newStatus, [
          BillingStatus::FINANCE_APPROVAL, // Lulus ke pengesahan
          BillingStatus::RETURNED,        // Pulang untuk pembetulan
          BillingStatus::REJECTED         // Tolak
        ]);
      }
    }

    // Pengesah boleh sahkan bila status FINANCE_APPROVAL
    if (in_array(UserAbilities::FINANCE_APPROVER, $userAbilities)) {
      if ($currentStatus === BillingStatus::FINANCE_APPROVAL) {
        return in_array($newStatus, [
          BillingStatus::PROCESSING_PAYMENT, // Lulus ke pembayaran
          BillingStatus::FINANCE_REVIEW,    // Pulang ke semakan
          BillingStatus::REJECTED           // Tolak
        ]);
      }
    }

    // Pembayar boleh proses bila status PROCESSING_PAYMENT
    if (in_array(UserAbilities::PAYMENT_MAKER, $userAbilities)) {
      if ($currentStatus === BillingStatus::PROCESSING_PAYMENT) {
        return in_array($newStatus, [
          BillingStatus::COMPLETED,        // Selesai dibayar
          BillingStatus::FINANCE_APPROVAL, // Pulang ke pengesahan
          BillingStatus::REJECTED          // Tolak
        ]);
      }
    }

    return false;
  }

  /**
   * Dapatkan peranan pengguna berdasarkan abilities
   */
  private function getUserRoles($user)
  {
    $roles = [];
    $userAbilities = is_string($user->abilities) ? json_decode($user->abilities, true) : $user->abilities;

    $roleMap = [
      UserAbilities::HOD => 'HOD',
      UserAbilities::FINANCE_VERIFIER => 'PENYEMAK',
      UserAbilities::FINANCE_APPROVER => 'PENGESAH',
      UserAbilities::PAYMENT_MAKER => 'PEMBAYAR',
      UserAbilities::APPLICANT => 'PEMOHON'
    ];

    foreach ($userAbilities as $ability) {
      if (isset($roleMap[$ability])) {
        $roles[] = $roleMap[$ability];
      }
    }

    return $roles;
  }

  /**
   * Semak sama ada pengguna boleh mengesahkan permohonan
   */
  private function canApprove($billing, $user)
  {
    $userAbilities = is_string($user->abilities) ? json_decode($user->abilities, true) : $user->abilities;
    
    // HOD boleh lulus bila status HOD_APPROVAL
    if (in_array(UserAbilities::HOD, $userAbilities)) {
      return $billing->status_id === BillingStatus::HOD_APPROVAL;
    }

    // Penyemak boleh lulus ke pengesahan bila status FINANCE_REVIEW 
    if (in_array(UserAbilities::FINANCE_VERIFIER, $userAbilities)) {
      return $billing->status_id === BillingStatus::FINANCE_REVIEW;
    }

    // Pengesah boleh lulus ke pembayaran bila status FINANCE_APPROVAL
    if (in_array(UserAbilities::FINANCE_APPROVER, $userAbilities)) {
      return $billing->status_id === BillingStatus::FINANCE_APPROVAL;
    }

    // Pembayar boleh lulus ke selesai bila status PROCESSING_PAYMENT
    if (in_array(UserAbilities::PAYMENT_MAKER, $userAbilities)) {
      return $billing->status_id === BillingStatus::PROCESSING_PAYMENT;
    }

    return false;
  }

  /**
   * Semak sama ada pengguna boleh menolak permohonan
   */
  private function canReject($billing, $user)
  {
    $userAbilities = is_string($user->abilities) ? json_decode($user->abilities, true) : $user->abilities;
    
    // Semua peringkat boleh tolak permohonan
    if (in_array(UserAbilities::HOD, $userAbilities) && 
        $billing->status_id === BillingStatus::HOD_APPROVAL) {
      return true;
    }

    if (in_array(UserAbilities::FINANCE_VERIFIER, $userAbilities) && 
        $billing->status_id === BillingStatus::FINANCE_REVIEW) {
      return true;
    }

    if (in_array(UserAbilities::FINANCE_APPROVER, $userAbilities) && 
        $billing->status_id === BillingStatus::FINANCE_APPROVAL) {
      return true;
    }

    if (in_array(UserAbilities::PAYMENT_MAKER, $userAbilities) && 
        $billing->status_id === BillingStatus::PROCESSING_PAYMENT) {
      return true;
    }

    return false;
  }

  /**
   * Semak sama ada pengguna boleh memulangkan permohonan
   */
  private function canReturn($billing, $user)
  {
    $userAbilities = is_string($user->abilities) ? json_decode($user->abilities, true) : $user->abilities;

    // HOD boleh pulangkan ke pemohon
    if (in_array(UserAbilities::HOD, $userAbilities) && 
        $billing->status_id === BillingStatus::HOD_APPROVAL) {
      return true;
    }

    // Penyemak boleh pulangkan ke pemohon
    if (in_array(UserAbilities::FINANCE_VERIFIER, $userAbilities) && 
        $billing->status_id === BillingStatus::FINANCE_REVIEW) {
      return true;
    }

    // Pengesah boleh pulangkan ke penyemak
    if (in_array(UserAbilities::FINANCE_APPROVER, $userAbilities) && 
        $billing->status_id === BillingStatus::FINANCE_APPROVAL) {
      return true;
    }

    // Pembayar boleh pulangkan ke pengesah
    if (in_array(UserAbilities::PAYMENT_MAKER, $userAbilities) && 
        $billing->status_id === BillingStatus::PROCESSING_PAYMENT) {
      return true;
    }

    return false;
  }

  /**
   * Dapatkan status seterusnya berdasarkan peranan
   */
  private function getNextStatus($currentStatus, $user)
  {
    $userRole = is_string($user->abilities) ? json_decode($user->abilities, true) : $user->abilities;

    if (in_array(UserAbilities::HOD, $userRole) && $currentStatus === BillingStatus::HOD_APPROVAL) {
      return BillingStatus::FINANCE_REVIEW;
    }
    if (in_array(UserAbilities::FINANCE_APPROVER, $userRole) && $currentStatus === BillingStatus::FINANCE_APPROVAL) {
      return BillingStatus::PROCESSING_PAYMENT;
    }
    return $currentStatus;
  }

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
  public function update(BillingRequest $request, string $id)
  {
    try {
      $billing = Billing::findOrFail($id);
      $this->authorize('update', $billing);

      $validatedData = $request->validated();

      DB::beginTransaction();

      // Update billing
      $billing->update([
        'description' => $validatedData['description'],
        'no_project' => $validatedData['no_project'],
        'recipient_id' => $validatedData['recipient_id'],
        'total_amount' => $validatedData['total_amount'],
        'payment_method' => $validatedData['payment_method'],
        'department_id' => $validatedData['department_id'],
        // running_no tidak boleh dikemaskini
        'issued_at' => $validatedData['issued_at'],
        'payment_due' => $validatedData['payment_due'],
        'status_id' => $validatedData['status_id']
      ]);

      // Delete existing details
      $billing->details()->delete();

      // Create new details
      foreach ($validatedData['details'] as $detail) {
        $billing->details()->create([
          'description' => $detail['description'],
          'budget_code' => $detail['budget_code'],
          'budget_id' => $detail['budget_id'],
          'price' => $detail['price'],
          'quantity' => $detail['quantity'],
          'unit' => $detail['unit'] ?? null,
          'reference' => $detail['reference'] ?? null
        ]);
      }

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Billing berjaya dikemaskini',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);

    } catch (ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Billing tidak dijumpai'
      ], 404);

    } catch (AuthorizationException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Anda tidak mempunyai kebenaran untuk mengemaskini billing ini'
      ], 403);

    } catch (Exception $e) {
      DB::rollBack();
      
      return response()->json([
        'success' => false,
        'message' => 'Ralat semasa mengemaskini billing',
        'error' => $e->getMessage()
      ], 500);
    }
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
  public function createBilling(BillingRequest $request)
  {
    try {
      $this->authorize('create', Billing::class);

      $validatedData = $request->validated();

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
        // running_no akan auto-generate oleh model
        'created_by' => $request->user()->id,
        'issued_at' => $validatedData['issued_at'],
        'payment_due' => $validatedData['payment_due'],
        'status_id' => $validatedData['status_id'],
        'is_archived' => false
      ]);

      // Create billing details
      foreach ($validatedData['details'] as $detail) {
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
  public function updateStatus($id, UpdateBillingStatusRequest $request)
  {
    try {
      // Validasi input
      $validator = Validator::make($request->all(), [
        'status_id' => 'required|integer|min:1|max:10',
        'remarks' => 'nullable|string|max:500'
      ], [
        'status_id.required' => 'Status bil diperlukan',
        'status_id.integer' => 'Status bil mestilah nombor',
        'status_id.min' => 'Status bil tidak sah',
        'status_id.max' => 'Status bil tidak sah',
        'remarks.string' => 'Catatan mestilah dalam bentuk teks',
        'remarks.max' => 'Catatan tidak boleh melebihi 500 aksara'
      ]);

      if ($validator->fails()) {
        return response()->json([
          'success' => false,
          'message' => 'Ralat pengesahan',
          'errors' => $validator->errors()
        ], 422);
      }

      $billing = Billing::findOrFail($id);
      $newStatus = $request->status_id;
      $remarks = $request->remarks;

      if (!$billing->canTransitionTo($newStatus)) {
        return response()->json([
          'success' => false,
          'message' => 'Peralihan status tidak sah'
        ], 400);
      }

      $updated = $billing->updateStatus($newStatus, Auth::id(), $remarks);

      if (!$updated) {
        return response()->json([
          'success' => false,
          'message' => 'Gagal mengemaskini status'
        ], 400);
      }

      return response()->json([
        'success' => true,
        'message' => 'Status berjaya dikemaskini',
        'data' => new BillingResource($billing->fresh())
      ]);
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => 'Ralat mengemaskini status: ' . $error->getMessage()
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
   * Get incomplete billings
   */
  public function getIncomplete(Request $request)
  {
    try {
      $user = $request->user();
      $query = Billing::query()
        ->where('created_by', $user->id)
        ->whereNotIn('status_id', [BillingStatus::PAID, BillingStatus::REJECTED, BillingStatus::CANCELLED, BillingStatus::RETURNED, BillingStatus::COMPLETED])
        ->select(
          'id',
          'issued_at',
          'no_project',
          'running_no',
          'description',
          'total_amount',
          'status_id',
          'created_at'
        );

      // Pagination
      $page = $request->input('page', 1);
      $perPage = $request->input('per_page', 10);
      $total = $query->count();
      $items = $query->orderBy('created_at', 'desc')
        ->skip(($page - 1) * $perPage)
        ->take($perPage)
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
            'created_at' => $item->created_at
          ];
        });

      return response()->json([
        'success' => true,
        'data' => [
          'items' => $items,
          'meta' => [
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($total / $perPage)
          ]
        ]
      ]);

    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => $error->getMessage()
      ], 500);
    }
  }

  /**
   * Pengesahan permohonan
   */
  public function approve(Request $request, $id)
  {
    try {
      $user = $request->user();
      $billing = Billing::findOrFail($id);
      $userAbilities = is_string($user->abilities) ? json_decode($user->abilities, true) : $user->abilities;

      // Semak kebenaran pengguna
      if (empty($userAbilities)) {
        return response()->json([
          'success' => false,
          'message' => 'Anda tidak mempunyai kebenaran untuk mengesahkan permohonan ini'
        ], 403);
      }

      // Semak status permohonan
      if (!$this->canApprove($billing, $user)) {
        return response()->json([
          'success' => false,
          'message' => 'Permohonan ini tidak boleh disahkan pada status semasa'
        ], 400);
      }

      // Untuk HOD, semak jabatan
      if (in_array(UserAbilities::HOD, $userAbilities) && 
          $billing->department_id !== $user->department_id) {
        return response()->json([
          'success' => false,
          'message' => 'Anda tidak boleh mengesahkan permohonan dari jabatan lain'
        ], 403);
      }

      $validator = Validator::make($request->all(), [
        'remarks' => 'nullable|string|max:500'
      ]);

      if ($validator->fails()) {
        return response()->json([
          'success' => false,
          'message' => 'Validation error',
          'errors' => $validator->errors()
        ], 422);
      }

      DB::beginTransaction();

      // Kemaskini status berdasarkan abilities pengguna
      $nextStatus = $this->getNextStatus($billing->status_id, $user);
      // $remarks = $request->remarks ?? 'Disahkan oleh ' . implode(', ', $this->getUserRoles($user));
      // $billing->updateStatus($nextStatus, $user->id, $remarks);
      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah disahkan',
        'test'=>$billing->status_id,
        'next'=>$nextStatus,
        'user'=>$user,
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);

    } catch (ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Permohonan tidak dijumpai'
      ], 404);

    } catch (Exception $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => 'Ralat semasa mengesahkan permohonan',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Tolak permohonan
   */
  public function reject(Request $request, $id)
  {
    try {
      $user = $request->user();
      $billing = Billing::findOrFail($id);
      $userAbilities = is_string($user->abilities) ? json_decode($user->abilities, true) : $user->abilities;

      // Semak kebenaran pengguna
      if (empty($userAbilities)) {
        return response()->json([
          'success' => false,
          'message' => 'Anda tidak mempunyai kebenaran untuk menolak permohonan ini'
        ], 403);
      }

      // Semak status permohonan
      if (!$this->canReject($billing, $user)) {
        return response()->json([
          'success' => false,
          'message' => 'Permohonan ini tidak boleh ditolak pada status semasa'
        ], 400);
      }

      // Untuk HOD, semak jabatan
      if (in_array(UserAbilities::HOD, $userAbilities) && 
          $billing->department_id !== $user->department_id) {
        return response()->json([
          'success' => false,
          'message' => 'Anda tidak boleh menolak permohonan dari jabatan lain'
        ], 403);
      }

      $validator = Validator::make($request->all(), [
        'remarks' => 'required|string|max:500'
      ]);

      if ($validator->fails()) {
        return response()->json([
          'success' => false,
          'message' => 'Sila nyatakan sebab penolakan',
          'errors' => $validator->errors()
        ], 422);
      }

      DB::beginTransaction();

      // Kemaskini status ke REJECTED
      $billing->updateStatus(BillingStatus::REJECTED, $user->id, $request->remarks);

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah ditolak',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);

    } catch (ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Permohonan tidak dijumpai'
      ], 404);

    } catch (Exception $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => 'Ralat semasa menolak permohonan',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Pulangkan permohonan
   */
  public function returnBilling(Request $request, $id)
  {
    try {
      $user = $request->user();
      $billing = Billing::findOrFail($id);
      $userAbilities = is_string($user->abilities) ? json_decode($user->abilities, true) : $user->abilities;

      // Semak kebenaran pengguna
      if (empty($userAbilities)) {
        return response()->json([
          'success' => false,
          'message' => 'Anda tidak mempunyai kebenaran untuk memulangkan permohonan ini'
        ], 403);
      }

      // Semak status permohonan
      if (!$this->canReturn($billing, $user)) {
        return response()->json([
          'success' => false,
          'message' => 'Permohonan ini tidak boleh dipulangkan pada status semasa'
        ], 400);
      }

      // Untuk HOD, semak jabatan
      if (in_array(UserAbilities::HOD, $userAbilities) && 
          $billing->department_id !== $user->department_id) {
        return response()->json([
          'success' => false,
          'message' => 'Anda tidak boleh memulangkan permohonan dari jabatan lain'
        ], 403);
      }

      $validator = Validator::make($request->all(), [
        'remarks' => 'required|string|max:500'
      ]);

      if ($validator->fails()) {
        return response()->json([
          'success' => false,
          'message' => 'Sila nyatakan sebab pemulangan',
          'errors' => $validator->errors()
        ], 422);
      }

      DB::beginTransaction();

      // Kemaskini status ke RETURNED
      $billing->updateStatus(BillingStatus::RETURNED, $user->id, $request->remarks);

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah dipulangkan untuk penambahbaikan',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);

    } catch (ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Permohonan tidak dijumpai'
      ], 404);

    } catch (Exception $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => 'Ralat semasa memulangkan permohonan',
        'error' => $e->getMessage()
      ], 500);
    }
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
   * HOD Approval for billing
   */
  public function hodApprove(Request $request, $id)
  {
    try {
      $user = $request->user();
      $billing = Billing::findOrFail($id);

      // Pastikan pengguna adalah HOD
      if (!$user->hasAbility(UserAbilities::HOD)) {
        return response()->json([
          'success' => false,
          'message' => 'Anda tidak mempunyai kebenaran untuk mengesahkan permohonan ini'
        ], 403);
      }

      // Pastikan billing adalah dalam status HOD_APPROVAL
      if ($billing->status_id !== BillingStatus::HOD_APPROVAL) {
        return response()->json([
          'success' => false,
          'message' => 'Permohonan ini tidak boleh disahkan kerana bukan dalam status HOD Approval'
        ], 400);
      }

      // Pastikan HOD adalah dari jabatan yang sama
      if ($billing->department_id !== $user->department_id) {
        return response()->json([
          'success' => false,
          'message' => 'Anda tidak boleh mengesahkan permohonan dari jabatan lain'
        ], 403);
      }

      $validator = Validator::make($request->all(), [
        'remarks' => 'nullable|string|max:500'
      ]);

      if ($validator->fails()) {
        return response()->json([
          'success' => false,
          'message' => 'Validation error',
          'errors' => $validator->errors()
        ], 422);
      }

      DB::beginTransaction();

      // Kemaskini status ke FINANCE_REVIEW
      $remarks = $request->remarks ?? 'Disahkan oleh HOD';
      $billing->updateStatus(BillingStatus::FINANCE_REVIEW, $user->id, $remarks);

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah disahkan dan dihantar ke Finance',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);

    } catch (ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Permohonan tidak dijumpai'
      ], 404);

    } catch (Exception $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => 'Ralat semasa mengesahkan permohonan',
        'error' => $e->getMessage()
      ], 500);
    }
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

  /**
   * Get billing history
   */
  public function getHistory(Billing $billing)
  {
    try {
      $history = DB::table('billing_status_history as bsh')
        ->join('users as u', 'bsh.user_id', '=', 'u.id')
        ->where('bsh.billing_id', $billing->id)
        ->select(
          'bsh.id',
          'bsh.status',
          'bsh.remarks',
          'bsh.created_at',
          'u.name as user_name'
        )
        ->orderBy('bsh.created_at', 'desc')
        ->get()
        ->map(function ($item) {
          return [
            'id' => $item->id,
            'status' => $item->status,
            'status_name' => $this->getStatusName($item->status),
            'remarks' => $item->remarks,
            'created_at' => $item->created_at,
            'user_name' => $item->user_name
          ];
        });

      return response()->json([
        'success' => true,
        'message' => 'Sejarah permohonan berjaya diperolehi',
        'data' => $history
      ]);

    } catch (Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Ralat mendapatkan sejarah permohonan',
        'error' => $e->getMessage()
      ], 500);
    }
  }
}
