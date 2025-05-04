<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

use App\Models\Billing;
use App\Constants\BillingStatus;
use App\Http\Resources\BillingResource;

class BillingActivitiesController extends Controller
{
  use AuthorizesRequests;

  public function hodApprove(Request $request, Billing $billing) {
    try {
      $this->authorize('process',[$billing, BillingStatus::HOD_APPROVAL]);
      DB::beginTransaction();
      $remarks = $request->remarks ?? ''; //Diluluskan oleh HOD
      
      // Tetapkan tarikh kelulusan HOD
      $billing->hod_approved_at = now();
      $billing->save();
      
      $billing->updateStatus(BillingStatus::FINANCE_REVIEW, Auth::id(), $remarks);
      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Permohonan berjaya disahkan',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], 403);
    }
  }

  public function financeReview(Billing $billing, Request $request) {
    try {
      $this->authorize('process',[$billing, BillingStatus::FINANCE_REVIEW]);
      DB::beginTransaction();
      $transactions = $request->transactions ?? [];
      $remarks = $request->remarks ?? ''; //Disemak oleh kewangan
      
      // Tetapkan tarikh semakan kewangan
      $billing->reviewed_at = now();
      $billing->save();

      $billing->updateStatus(BillingStatus::FINANCE_VERIFY, Auth::id(), $remarks, $transactions);

      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Permohonan berjaya disemak',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], 403);
    }
  }

  public function financeVerify(Billing $billing, Request $request) {
    try {
      $this->authorize('process',[$billing, BillingStatus::FINANCE_VERIFY]);
      DB::beginTransaction();
      $remarks = $request->remarks ?? ''; //Disahkan oleh Kewangan
      
      // Tetapkan tarikh pengesahan kewangan
      $billing->verified_at = now();
      $billing->save();
      
      $billing->updateStatus(BillingStatus::FINANCE_APPROVAL, Auth::id(), $remarks);
      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Permohonan berjaya disahkan',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], 403);
    }
  }

  public function financeApprove(Billing $billing, Request $request) {
    try {
      $this->authorize('process',[$billing, BillingStatus::FINANCE_APPROVAL]);
      DB::beginTransaction();
      $remarks = $request->remarks ?? ''; //Diluluskan oleh kewangan
      
      // Tetapkan tarikh kelulusan kewangan
      $approved_date = $request->approved_date ?? now();
      $billing->approved_at = $approved_date;
      $billing->save();
      
      $billing->updateStatus(BillingStatus::PROCESSING_PAYMENT, Auth::id(), $remarks);
      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Permohonan berjaya diluluskan',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], 403);
    }
  }

  public function processPayment(Request $request, Billing $billing) {
    try {
      $this->authorize('process', [$billing, BillingStatus::PROCESSING_PAYMENT]);
      DB::beginTransaction();
      $remarks = $request->remarks ?? ''; //Pembayaran diluluskan
      
      // Tetapkan tarikh pembayaran
      $payment_date = $request->payment_date ?? now();
      $billing->paid_at = $payment_date;
      $billing->save();
      
      $billing->updateStatus(BillingStatus::COMPLETED, Auth::id(), $remarks);
      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Pembayaran diluluskan',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], 403);
    }
  }

  public function completeBilling(Billing $billing) {
    try {
      $this->authorize('process', $billing,BillingStatus::COMPLETED);
      DB::beginTransaction();
      $billing->updateStatus(BillingStatus::COMPLETED, Auth::id(), ''); //Permohonan berjaya selesai
      DB::commit();
      return response()->json(['message' => 'Permohonan berjaya selesai']);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], 403);
    }
  }

  public function rejectBilling(Request $request, Billing $billing) {
    try {
      $this->authorize('reject', $billing);
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
      $billing->updateStatus(BillingStatus::REJECTED, Auth::id(), $request->remarks);
      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah ditolak',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], 403);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => 'Ralat semasa menolak permohonan',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  public function returnBilling(Request $request, Billing $billing) {
    try {
      $this->authorize('reject', $billing);
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
      $billing->updateStatus(BillingStatus::RETURNED, Auth::id(), $request->remarks);
      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah dipulangkan untuk penambahbaikan',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], 403);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => 'Ralat semasa memulangkan permohonan',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  public function cancelBilling(Request $request, Billing $billing) {
    try {
      $this->authorize('process', [$billing, BillingStatus::CANCELLED]);
      $validator = Validator::make($request->all(), [
        'remarks' => 'required|string|max:500'
      ]);
      if ($validator->fails()) {
        return response()->json([
          'success' => false,
          'message' => 'Sila nyatakan sebab pembatalan',
          'errors' => $validator->errors()
        ], 422);
      }
      DB::beginTransaction();
      $billing->updateStatus(BillingStatus::CANCELLED, Auth::id(), $request->remarks);
      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah dibatalkan',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], 403);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json([
        'success' => false,
        'message' => 'Ralat semasa membatalkan permohonan',
        'error' => $e->getMessage()
      ], 500);
    }
  }

}