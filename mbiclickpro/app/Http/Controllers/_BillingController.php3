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
use Illuminate\Support\Facades\Log;
use PhpParser\Node\Stmt\TryCatch;

class BillingController extends Controller
{
  use AuthorizesRequests;

  /**
   * Get billings that need HOD approval
   */
  public function getPendingHOD(Request $request)
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

      $billings = Billing::query()
        ->with(['details', 'recipient', 'department', 'creator'])
        ->where(function($q) use ($user) {
          $q->where('department_id', $user->department_id)
            ->where('status_id', BillingStatus::HOD_APPROVAL);
        })
        ->orderBy('created_at', 'desc')
        ->get();

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
  public function getPendingFinance(Request $request)
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

      $billings = Billing::query()
        ->with(['details', 'recipient', 'department', 'creator'])
        ->whereIn('status_id', [
          BillingStatus::FINANCE_APPROVAL,
          BillingStatus::FINANCE_REVIEW,
          BillingStatus::FINANCE_VERIFY,
          BillingStatus::PROCESSING_PAYMENT,
          BillingStatus::PAID
        ])
        ->orderBy('created_at', 'desc')
        ->get();

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
   * Get billing by ID.
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
   * Get comprehensive billing statistics for dashboard
   */
  public function getStats()
  {
    try {
      $user = request()->user();
      $query = Billing::query();

      // Filter by department if user is not admin/finance
      if (!$user->hasAbility([UserAbilities::ADMIN, UserAbilities::FINANCE_CHECKER])) {
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
      if ($user->hasAbility([UserAbilities::ADMIN, UserAbilities::FINANCE_CHECKER])) {
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
   * HOD Approval for billing
   */
  public function hodApprove(Request $request, $id)
  {
    try {
      $user = $request->user();
      $billing = Billing::findOrFail($id);

      // Memeriksa kebenaran menggunakan canApprove
      if (!$this->canApprove($billing, $user)) {
        return response()->json([
          'success' => false,
          'message' => 'Anda tidak mempunyai kebenaran untuk meluluskan permohonan ini'
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
          'message' => 'Anda tidak boleh meluluskan permohonan dari jabatan lain'
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
        'message' => 'Permohonan telah disahkan dan dihantar ke Kewangan',
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
   * Finance Review for billing
   */
  public function financeReview(Request $request, $id)
  {
    try {
      $billing = Billing::findOrFail($id);
      $user = $request->user();

      // Memeriksa kebenaran menggunakan canApprove
      // if (!$this->canApprove($billing, $user)) {
      //   return response()->json([
      //     'success' => false,
      //     'message' => 'Anda tidak mempunyai kebenaran untuk semakan permohonan ini',
      //   ], 403);
      // }
      
      // Pastikan billing adalah dalam status FINANCE_REVIEW
      if ($billing->status_id !== BillingStatus::FINANCE_REVIEW) {
        return response()->json([
          'success' => false,
          'message' => 'Permohonan ini tidak boleh disahkan kerana bukan dalam status Semakan'
        ], 400);
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

      // Kemaskini status ke FINANCE_VERIFY
      $remarks = $request->remarks ?? 'Disahkan oleh Finance';
      $billing->updateStatus(BillingStatus::FINANCE_VERIFY, $user->id, $remarks);

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah disahkan dan dihantar untuk pengesahan',
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
   * Finance Verification for billing
   */
  public function financeVerify(Billing $billing)
  {
    try {
      $this->authorize('process',[$billing, BillingStatus::FINANCE_VERIFY]);
      DB::beginTransaction();
      $billing->updateStatus(BillingStatus::FINANCE_APPROVAL, Auth::id(), 'Verified by finance');
      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Billing verified by finance',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => 'Pengesahan tidak dibenarkan'
      ], 403);
    }
  }

  /**
   * Finance Approval for billing
   */
  public function financeApprove(Request $request, $id)
  {
    try {
      $billing = Billing::findOrFail($id);
      $user = $request->user();

      // Memeriksa kebenaran menggunakan canApprove
      if (!$this->canApprove($billing, $user)) {
        return response()->json([
          'success' => false,
          'message' => 'Anda tidak mempunyai kebenaran untuk mengesahkan permohonan ini'
        ], 403);
      }

      // Pastikan billing adalah dalam status FINANCE_APPROVAL
      if ($billing->status_id !== BillingStatus::FINANCE_APPROVAL) {
        return response()->json([
          'success' => false,
          'message' => 'Permohonan ini tidak boleh disahkan kerana bukan dalam status Finance Approval'
        ], 400);
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

      // Kemaskini status ke PROCESSING_PAYMENT
      $remarks = $request->remarks ?? 'Disahkan oleh Finance';
      $billing->updateStatus(BillingStatus::PROCESSING_PAYMENT, $user->id, $remarks);

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah disahkan dan dihantar ke Processing Payment',
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
   * Process Payment for billing
   */
  public function processPayment(Request $request, $id)
  {
    try {
      $billing = Billing::findOrFail($id);
      $user = $request->user();

      // Pastikan pengguna adalah Payment Maker
      if (!$user->hasAbility(UserAbilities::PAYMENT_MAKER)) {
        return response()->json([
          'success' => false,
          'message' => 'Anda tidak mempunyai kebenaran untuk mengesahkan permohonan ini'
        ], 403);
      }

      // Pastikan billing adalah dalam status PROCESSING_PAYMENT
      if ($billing->status_id !== BillingStatus::PROCESSING_PAYMENT) {
        return response()->json([
          'success' => false,
          'message' => 'Permohonan ini tidak boleh disahkan kerana bukan dalam status Processing Payment'
        ], 400);
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

      // Kemaskini status ke PAID
      $remarks = $request->remarks ?? 'Disahkan oleh Payment Maker';
      $billing->updateStatus(BillingStatus::PAID, $user->id, $remarks);

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah disahkan dan dihantar ke Paid',
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
    if (in_array(UserAbilities::FINANCE_CHECKER, $userAbilities)) {
      return $billing->status_id === BillingStatus::FINANCE_REVIEW;
    }

    // Penyemak boleh lulus ke pengesahan bila status FINANCE_REVIEW 
    if (in_array(UserAbilities::FINANCE_VERIFIER, $userAbilities)) {
      return $billing->status_id === BillingStatus::FINANCE_VERIFY;
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

}
