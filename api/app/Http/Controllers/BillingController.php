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
use Exception;
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

class BillingController extends Controller
{
  use AuthorizesRequests;

  /**
   * Display a listing of billings.
   */
  public function index()
  {
    try {
      $billings = Billing::with(['details', 'recipient', 'department'])->get();
      return BillingResource::collection($billings);
    } catch (Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Error fetching billings',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Store a newly created billing.
   */
  public function store(BillingRequest $request)
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

      $billing = Billing::create([
        'description' => $validatedData['description'],
        'no_project' => $validatedData['no_project'],
        'recipient_id' => $validatedData['recipient_id'],
        'total_amount' => $validatedData['total_amount'],
        'payment_method' => $validatedData['payment_method'] ?? 'online',
        'department_id' => $departmentId,
        'created_by' => $request->user()->id,
        'issued_at' => $validatedData['issued_at'],
        'payment_due' => $validatedData['payment_due'],
        'status_id' => $validatedData['status_id'],
        'is_archived' => false
      ]);

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
   * Display the specified billing.
   */
  public function show($id)
  {
    try {
      $billing = Billing::with(['details', 'recipient', 'department'])->findOrFail($id);
      return new BillingResource($billing);
    } catch (Exception $error) {
      return response()->json(['message' => 'Billing not found'], 404);
    }
  }

  /**
   * Update the specified billing.
   */
  public function update(BillingRequest $request, Billing $billing)
  {
    try {
      $this->authorize('update', $billing);

      $validatedData = $request->validated();

      DB::beginTransaction();

      $billing->update([
        'description' => $validatedData['description'],
        'no_project' => $validatedData['no_project'],
        'recipient_id' => $validatedData['recipient_id'],
        'total_amount' => $validatedData['total_amount'],
        'payment_method' => $validatedData['payment_method'],
        'department_id' => $validatedData['department_id'],
        'issued_at' => $validatedData['issued_at'],
        'payment_due' => $validatedData['payment_due'],
        'status_id' => $validatedData['status_id']
      ]);

      $billing->details()->delete();

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

      // Reset cache
      $cacheKey = 'billing.' . $billing->id;
      Cache::forget($cacheKey);

      // Get updated billing data
      $billingData = $this->getBillingById($billing->id);

      DB::commit();

      return $billingData;

      // return response()->json([
      //   'success' => true,
      //   'message' => 'Billing berjaya dikemaskini',
      //   'data' => $billingData
      // ]);
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
   * Remove the specified billing and its details.
   */
  public function destroy(Billing $billing)
  {
    try {
      DB::beginTransaction();

      $this->authorize('delete', $billing);

      // Delete related billing details first
      $billing->details()->delete();

      // Then delete the billing
      $billing->delete();

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Billing and its details deleted successfully'
      ]);
    } catch (ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Billing not found'
      ], 404);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => 'Error deleting billing',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get billing by ID (with caching).
   */

  public function getBillingById($id)
  {
    try {
      // Try to get from cache
      $cacheKey = 'billing.' . $id;
      $cached = Cache::get($cacheKey);
      if ($cached) {
        return response()->json($cached)->header('Cache-Control', 'public, max-age=300');
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

      return $response->response()->header('Cache-Control', 'public, max-age=300');
    } catch (Exception $error) {
      return response()->json([
        'success' => false,
        'message' => 'Error fetching billing',
        'error' => $error->getMessage()
      ], 500);
    }
  }
}
