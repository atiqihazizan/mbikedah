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
use Illuminate\Support\Facades\Auth;

class BillingController extends Controller
{
  use AuthorizesRequests;

  public function index()
  {
    try {
      $billings = Billing::with(['details', 'recipient', 'department'])->get();
      return BillingResource::collection($billings);
    } catch (Exception $e) {
      return response()->json(['success' => false, 'message' => 'Error fetching billings', 'error' => $e->getMessage()], 500);
    }
  }

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
        'no_project' => $validatedData['no_project'],
        'recipient_id' => $validatedData['recipient_id'],
        'total_amount' => $validatedData['total_amount'],
        'payment_method' => $validatedData['payment_method'] ?? 'cek',
        'department_id' => $departmentId,
        'created_by' => $request->user()->id,
        'issued_at' => $validatedData['issued_at'],
        'status_id' => $validatedData['status_id'] ?? BillingStatus::DRAFT,
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
          'reference' => $detail['reference'] ?? '',
          'purpose' => $detail['purpose'] ?? '',
          'accept' => -1,
        ]);
      }

      $billing->history()->create([
        'old_status' => 0,
        'new_status' => BillingStatus::DRAFT,
        'created_by' => $request->user()->id,
        'remarks' => $request->remarks ?? '',
        'status_name' => BillingStatus::getNameStatus(BillingStatus::DRAFT)
      ]);
      
      if ($validatedData['status_id'] === BillingStatus::HOD_APPROVAL) {
        $billing->history()->create([
          'old_status' => BillingStatus::DRAFT,
          'new_status' => BillingStatus::HOD_APPROVAL,
          'created_by' => $request->user()->id,
          'remarks' => $request->remarks ?? '',
          'status_name' => BillingStatus::getNameStatus(BillingStatus::HOD_APPROVAL)
        ]);
      }

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Billing created successfully',
        'data' => $billing
      ], 201);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => 'Failed to create billing: ' . $e->getMessage()], 500);
    }
  }

  public function show($id)
  {
    try {
      $billing = Billing::with(['details', 'recipient', 'department'])->findOrFail($id);
      return new BillingResource($billing);
    } catch (Exception $error) {
      return response()->json(['message' => 'Billing not found'], 404);
    }
  }

  public function update(BillingRequest $request, Billing $billing)
  {
    try {
      $this->authorize('update', $billing);

      $validatedData = $request->validated();

      DB::beginTransaction();

      $billing->update([
        'no_project' => $validatedData['no_project'],
        'recipient_id' => $validatedData['recipient_id'],
        'total_amount' => $validatedData['total_amount'],
        'payment_method' => $validatedData['payment_method'],
        'department_id' => $validatedData['department_id'],
        'issued_at' => $validatedData['issued_at'],
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
          'reference' => $detail['reference'] ?? null,
          'purpose' => $detail['purpose'] ?? '',
          'accept' => -1,
        ]);
      }

      if ($validatedData['status_id'] === BillingStatus::HOD_APPROVAL) {
        $billing->updateStatus(BillingStatus::HOD_APPROVAL, Auth::id(), $request->remarks ?? '');
      }

      Cache::forget('billing.' . $billing->id);

      $billingData = $this->getBillingById($billing->id);

      DB::commit();

      return $billingData;

    } catch (ModelNotFoundException $e) {
      return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
    } catch (AuthorizationException $e) {
      return response()->json(['success' => false, 'message' => 'Anda tidak mempunyai kebenaran untuk mengemaskini billing ini'], 403);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => 'Ralat semasa mengemaskini billing', 'error' => $e->getMessage()]);
    }
  }

  public function destroy(Billing $billing)
  {
    try {
      DB::beginTransaction();

      $this->authorize('delete', $billing);

      $billing->details()->delete();
      $billing->delete();

      DB::commit();

      return response()->json([
        'success' => true,
        'message' => 'Billing and its details deleted successfully'
      ]);
    } catch (ModelNotFoundException $e) {
      return response()->json(['success' => false, 'message' => 'Billing not found'], 404);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => 'Error deleting billing', 'error' => $e->getMessage()], 500);
    }
  }

  public function getBillingById($id)
  {
    try {
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
        'is_archived',
        'print_count',
        'last_printed_at',
        'last_printed_by',
        'hod_approved_at',
        'reviewed_at',
        'verified_at',
        'approved_at',
        'paid_at',
        'ceo_approved'
      ])
        ->with([
          'department:id,name',
          'creator:id,name,abilities,position_id',
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
              'total',
              'accept',
              'approve',
              'reviewed_by'
            ]);
          },
          'details.budget:id,name,code,bdgtotal',
          'history' => function ($query) {
            $query->select([
              'id',
              'billing_id',
              'old_status',
              'new_status',
              'remarks',
              'created_by',
              'created_at'
            ])
            // ->where('old_status', '>',0)
            ->orderBy('new_status', 'desc')
            ->orderBy('created_at', 'desc');
          },
          'transactions' => function ($query) {
            $query->select([
              'id',
              'billing_id',
              'bank_id',
              'amount',
              'created_at'
            ])->with('bank:id,bank_name,amount');
          },
          'history.creator:id,name,position_id'
        ])
        ->findOrFail($id);

      $response = new BillingDetailResource($billing);

      return $response->response();
    } catch (Exception $error) {
      return response()->json(['success' => false, 'message' => 'Error fetching billing', 'error' => $error->getMessage()], 500);
    }
  }

  public function recordPrint(Billing $billing)
  {
    try {
      $this->authorize('view', $billing);
      
      $malaysiaTime = now('Asia/Kuala_Lumpur');
      $billing->update([
        'last_printed_at' => $malaysiaTime,
        'last_printed_by' => Auth::id(),
        'print_count' => $billing->print_count + 1
      ]);
      
      return response()->json(['success' => true, 'message' => 'Rekod percetakan berjaya dikemaskini']);
    } catch (Exception $e) {
      return response()->json(['success' => false, 'message' => 'Ralat merekodkan percetakan', 'error' => $e->getMessage()], 500);
    }
  }
}