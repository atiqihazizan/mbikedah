<?php

namespace App\Http\Controllers;

use App\Constants\BillingStatus;
use App\Http\Requests\BillingRejectionRequest;
use App\Http\Requests\BillingReturnRequest;
use App\Http\Requests\FinanceApprovalRequest;
use App\Http\Resources\BillingResource;
use App\Models\Bank;
use App\Models\Billing;
use App\Models\Budget;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Exception;

class BillingActivitiesController extends Controller
{
  use AuthorizesRequests;

  public function hodApprove(Request $request, Billing $billing)
  {
    try {
      $this->authorize('process', [$billing, BillingStatus::HOD_APPROVAL]);
      DB::beginTransaction();
      $remarks = $request->remarks ?? '';  // Diluluskan oleh HOD

      // Tetapkan tarikh kelulusan HOD
      $billing->approved_hod = Auth::id();
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
      return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
    }
  }

  public function financeReview(Billing $billing, Request $request)
  {
    try {
      $this->authorize('process', [$billing, BillingStatus::FINANCE_REVIEW]);
      DB::beginTransaction();

      // Validasi payment_method
      $paymentMethods = ['cek', 'online', 'tunai'];
      if (!in_array(strtolower($request->payment_method), $paymentMethods)) {
        throw new \Exception('Kaedah bayaran tidak sah');
      }

      $details = $request->details ?? [];
      $transactions = $request->transactions ?? [];
      $remarks = $request->remarks ?? '';  // Disemak oleh kewangan
      $total_accept = $request->total_accept ?? 0;
      $payment_method = strtolower($request->payment_method ?? '');

      if (empty($details)) {
        throw new \Exception('Tiada butiran bajet yang dipilih');
      }
      if (empty($transactions)) {
        throw new \Exception('Tiada transaksi yang dimasukkan');
      }

      // Tetapkan tarikh semakan kewangan
      $billing->review_by = Auth::id();
      $billing->reviewed_at = now();
      $billing->payment_method = "$payment_method";
      $billing->total_amount = $total_accept;
      $billing->save();

      $billing->updateStatus(BillingStatus::FINANCE_VERIFY, Auth::id(), $remarks);

      // 1. Update kod bajet
      // Set semua accept ke 0 terlebih dahulu
      $billing->details()->update(['accept' => 0]);

      foreach ($details as $detail) {
        $budget = Budget::find($detail['budget_id']);
        if (!$budget) {
          throw new \Exception("Bajet tidak ditemui untuk ID: {$detail['budget_id']}");
        }
        $billing->details()->where('id', $detail['id'])->update([
          'budget_id' => $budget->id,
          'budget_code' => $budget->code,
          'accept' => 1,
          'reviewed_by' => Auth::id(),
        ]);
      }

      // 8. Validate total amount
      // $totalExpenses = $billing->details->sum('total');
      $totalTransactions = array_sum(array_column($transactions, 'amount'));

      if ($total_accept !== $totalTransactions) {
        throw new \Exception('Jumlah pembayaran tidak sama dengan jumlah permohonan');
      }

      // 2. add transaksi
      $billing->transactions()->delete();
      foreach ($transactions as $transaction) {
        $bank = Bank::find($transaction['bank_id']);
        if (!$bank) {
          throw new \Exception("Bank tidak ditemui untuk ID: {$transaction['bank_id']}");
        }

        $billing->transactions()->create([
          'bank_id' => $bank->id,
          'budget_id' => null,
          'transaction_type' => 'credit',
          'date' => now(),
          'amount' => $transaction['amount'],
        ]);
      }

      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Permohonan berjaya disemak',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => 'Ralat sistem ' . $e->getMessage()], 500);
    }
  }

  public function financeVerify(Billing $billing, Request $request)
  {
    try {
      $this->authorize('process', [$billing, BillingStatus::FINANCE_VERIFY]);
      DB::beginTransaction();
      $remarks = $request->remarks ?? '';  // Disahkan oleh Kewangan
      $billing->verified_by = Auth::id();
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
      return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
    }
  }

  public function financeApprove(Billing $billing, FinanceApprovalRequest $request)
  {
    try {
      $this->authorize('process', [$billing, BillingStatus::FINANCE_APPROVAL]);

      DB::beginTransaction();
      $remarks = $request->remarks ?? '';  // Diluluskan oleh kewangan

      // Tetapkan tarikh kelulusan kewangan
      $billing->approved_at = $request->approved_date;
      $billing->approved_by = $request->approved_by;
      $billing->save();

      $billing->updateStatus(BillingStatus::PROCESSING_PAYMENT, $request->approved_by, $remarks);
      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Permohonan berjaya diluluskan',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
    }
  }

  public function processPayment(Request $request, Billing $billing)
  {
    try {
      $this->authorize('process', [$billing, BillingStatus::PROCESSING_PAYMENT]);
      DB::beginTransaction();
      $remarks = $request->remarks ?? '';  // Pembayaran diluluskan
      $transactions = $request->transactions ?? [];

      $billing->details()->update(['approve' => 1]);

      // Get all existing transaction IDs
      $existingTransactionIds = $billing->transactions()->pluck('id')->toArray();
      $newTransactionIds = array_column($transactions, 'id');

      // Delete transactions that are not in the request
      $billing->transactions()->whereIn('id', array_diff($existingTransactionIds, $newTransactionIds))->delete();

      // Handle transactions
      foreach ($transactions as $transaction) {
        // Cari transaksi yang wujud berdasarkan ID
        $existingTransaction = $billing->transactions()->where('id', $transaction['id'])->first();

        if ($existingTransaction) {
          // Update transaksi yang wujud
          $existingTransaction->update([
            'paid_date' => $transaction['paid_date'],
            'paid_ref' => $transaction['paid_ref'],
            'amount' => $transaction['amount'],
            'bank_id' => $transaction['bank_id'],
          ]);
        } else {
          // Create transaksi baru
          $billing->transactions()->create([
            'bank_id' => $transaction['bank_id'],
            'billing_id' => $billing->id,
            'date' => $billing->issued_at,
            'budget_id' => null,
            'transaction_type' => $transaction['transaction_type'] ?? 'credit',
            'paid_date' => $transaction['paid_date'],
            'paid_ref' => $transaction['paid_ref'],
            'amount' => $transaction['amount'],
          ]);
        }
      }

      // Tetapkan tarikh pembayaran
      $billing->paid_at = now();
      $billing->paid_by = Auth::id();
      $billing->save();

      // Update budget actuals (gabungan dari updateBudgetActuals method)
      $approvedDetails = $billing->details()->where('approve', true)->get();
      $budgetData = [];
      $month = $billing->paid_at ? $billing->paid_at->format('n') : now()->month;

      foreach ($approvedDetails as $detail) {
        if (!$detail->budget_id)
          continue;

        $budgetData[$detail->budget_id] = ($budgetData[$detail->budget_id] ?? 0) + $detail->total;
      }

      // Update setiap budget
      foreach ($budgetData as $budgetId => $amount) {
        $budget = Budget::find($budgetId);
        if (!$budget)
          continue;

        // Dapatkan current actual untuk bulan tersebut
        $monthField = 'act' . $month;
        $currentActual = $budget->$monthField;

        // Update actual untuk bulan tersebut
        $budget->$monthField = $currentActual + $amount;

        // Kira semula acttotal
        $actTotal = 0;
        for ($i = 1; $i <= 12; $i++) {
          $actField = 'act' . $i;
          $actTotal += $budget->$actField;
        }

        // Update acttotal dan balance
        $budget->acttotal = $actTotal;
        $budget->balance = $budget->bdgtotal - $actTotal;

        $budget->save();
      }

      $billing->updateStatus(BillingStatus::COMPLETED, Auth::id(), $remarks);
      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Pembayaran diluluskan',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
    }
  }

  public function completeBilling(Billing $billing)
  {
    try {
      $this->authorize('process', [$billing, BillingStatus::COMPLETED]);
      DB::beginTransaction();
      $billing->updateStatus(BillingStatus::COMPLETED, Auth::id(), '');  // Permohonan berjaya selesai
      DB::commit();
      return response()->json(['message' => 'Permohonan berjaya selesai']);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
    }
  }

  public function rejectBilling(BillingRejectionRequest $request, Billing $billing)
  {
    try {
      $this->authorize('reject', $billing);

      DB::beginTransaction();

      $financeStatuses = [BillingStatus::FINANCE_APPROVAL];
      $userId = in_array($billing->status_id, $financeStatuses) ? $request->user_id : Auth::id();

      $billing->updateStatus(BillingStatus::REJECTED, $userId, $request->remarks);
      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah ditolak',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => 'Penolakan tidak berjaya', 'error' => $e->getMessage()], 500);
    }
  }

  public function returnBilling(BillingReturnRequest $request, Billing $billing)
  {
    try {
      $this->authorize('reject', $billing);
      DB::beginTransaction();

      // Reset billing data
      $billing->fill([
        'approved_hod' => null,
        'hod_approved_at' => null,
        'review_by' => null,
        'reviewed_at' => null,
        'verified_by' => null,
        'verified_at' => null,
        'approved_by' => null,
        'approved_at' => null,
        'paid_by' => null,
        'paid_at' => null,
        'ceo_approved' => 0
      ])->save();

      // Reset transactions
      $billing->transactions()->delete();

      // Reset details - hanya update kolum yang wujud dalam billing_details
      $billing->details()->update([
        'approve' => 0,
        'accept' => -1
      ]);

      $billing->updateStatus(BillingStatus::RETURNED, Auth::id(), $request->remarks);

      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah dipulangkan untuk penambahbaikan',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => 'Ralat semasa memulangkan permohonan', 'error' => $e->getMessage()], 500);
    }
  }

  public function cancelBilling(Request $request, Billing $billing)
  {
    try {
      $this->authorize('process', [$billing, BillingStatus::CANCELLED]);
      $validator = Validator::make($request->all(), [
        'remarks' => 'required|string|max:500'
      ]);
      if ($validator->fails()) {
        return response()->json(['success' => false, 'message' => 'Sila nyatakan sebab pembatalan', 'errors' => $validator->errors()], 422);
      }
      DB::beginTransaction();

      // Reset billing data
      $billing->fill([
        'approved_hod' => 0, 'hod_approved_at' => null,
        'review_by' => 0, 'reviewed_at' => null,
        'verified_by' => 0, 'verified_at' => null,
        'approved_by' => 0, 'approved_at' => null,
        'paid_by' => 0, 'paid_at' => null,
        'ceo_approved' => 0
      ])->save();

      // reset transactions
      $billing->transactions()->delete();
      // reset details
      $billing->details()->update(['approve' => 0, 'accept' => -1, 'review_by' => 0]);
      $billing->approved_by = 0;
      $billing->approved_at = null;
      $billing->paid_by = 0;
      $billing->paid_at = null;
      $billing->ceo_approved = 0;
      $billing->save();
      // reset transactions
      $billing->transactions()->delete();
      // reset details
      $billing->details()->update([
        'approve' => 0,
        'accept' => -1,
        'review_by' => 0,
      ]);

      $billing->updateStatus(BillingStatus::CANCELLED, Auth::id(), $request->remarks);
      DB::commit();
      return response()->json([
        'success' => true,
        'message' => 'Permohonan telah dibatalkan',
        'data' => new BillingResource($billing->fresh(['details', 'recipient', 'department']))
      ]);
    } catch (AuthorizationException $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
    } catch (Exception $e) {
      DB::rollBack();
      return response()->json(['success' => false, 'message' => 'Ralat semasa membatalkan permohonan', 'error' => $e->getMessage()], 500);
    }
  }
}
