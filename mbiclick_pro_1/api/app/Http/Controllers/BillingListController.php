<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Log;

use App\Models\Billing;
use App\Constants\BillingStatus;
use App\Constants\UserAbilities;
use App\Http\Resources\BillingResource;
use App\Http\Resources\BillingTableResource;
use App\Http\Resources\BillingDetailResource;

class BillingListController extends Controller
{
  use AuthorizesRequests;

  public function getPendingHOD(Request $request)
  {
    try {
      $user = $request->user();
      $userAbilities = is_string($user->abilities) ? json_decode($user->abilities, true) : $user->abilities;
      if (empty($userAbilities)) return response()->json(['success' => false, 'message' => 'Anda tidak mempunyai kebenaran untuk melihat senarai permohonan'], 403);
      $billings = Billing::query()
        ->with(['details', 'recipient', 'department', 'creator'])
        ->where('department_id', $user->department_id)
        ->where('status_id', BillingStatus::HOD_APPROVAL)
        ->orderBy('created_at', 'desc')->get();
      return response()->json(['success' => true, 'message' => 'Senarai permohonan yang perlu disahkan', 'data' => BillingTableResource::collection($billings)]);
    } catch (Exception $e) {
      return response()->json(['success' => false, 'message' => 'Ralat semasa mendapatkan senarai permohonan', 'error' => $e->getMessage()], 500);
    }
  }

  public function getPendingFinance(Request $request)
  {
    try {
      $user = $request->user();
      $userAbilities = is_string($user->abilities) ? json_decode($user->abilities, true) : $user->abilities;
      if (empty($userAbilities)) return response()->json(['success' => false, 'message' => 'Anda tidak mempunyai kebenaran untuk melihat senarai permohonan'], 403);
      $billings = Billing::query()
        ->with(['details', 'recipient', 'department', 'creator'])
        ->whereIn('status_id', [BillingStatus::FINANCE_APPROVAL, BillingStatus::FINANCE_REVIEW, BillingStatus::FINANCE_VERIFY, BillingStatus::PROCESSING_PAYMENT])
        ->orderBy('created_at', 'desc')->get();
      return response()->json(['success' => true, 'message' => 'Senarai permohonan yang perlu disahkan', 'data' => BillingTableResource::collection($billings)]);
    } catch (Exception $e) {
      return response()->json(['success' => false, 'message' => 'Ralat semasa mendapatkan senarai permohonan', 'error' => $e->getMessage()], 500);
    }
  }

  public function getIncomplete(Request $request)
  {
    try {
      $user = $request->user();
      $query = Billing::query()
        ->where('created_by', $user->id)
        ->whereNotIn('status_id', [BillingStatus::COMPLETED, BillingStatus::REJECTED, BillingStatus::CANCELLED, BillingStatus::COMPLETED])
        ->select('id', 'issued_at', 'no_project', 'running_no', 'description', 'total_amount', 'status_id', 'created_at');
      $page = $request->input('page', 1);
      $perPage = $request->input('per_page', 10);
      $total = $query->count();
      $items = $query->orderBy('created_at', 'desc')
        ->skip(($page - 1) * $perPage)
        ->take($perPage)
        ->get()
        ->map(function ($item) {
          return ['id' => $item->id, 'status_id' => $item->status_id, 'issued_at' => $item->issued_at, 'no_project' => $item->no_project, 'running_no' => $item->running_no, 'description' => $item->description, 'total_amount' => $item->total_amount, 'status' => BillingStatus::getStatusName($item->status_id), 'created_at' => $item->created_at];
        });
      return response()->json(['success' => true, 'data' => ['items' => $items, 'meta' => ['total' => $total, 'page' => $page, 'per_page' => $perPage, 'total_pages' => ceil($total / $perPage)]]]);
    } catch (Exception $error) {
      return response()->json(['success' => false, 'message' => $error->getMessage()], 500);
    }
  }

  public function getArchive(Request $request) {
    try {
      $user = $request->user();
      $query = Billing::query()
        ->where('created_by', $user->id)
        ->whereIn('status_id', [BillingStatus::COMPLETED, BillingStatus::REJECTED, BillingStatus::CANCELLED, BillingStatus::COMPLETED])
        ->select('id', 'issued_at', 'no_project', 'running_no', 'description', 'total_amount', 'status_id', 'created_at');
      $page = $request->input('page', 1);
      $perPage = $request->input('per_page', 10);
      $total = $query->count();
      $items = $query->orderBy('created_at', 'desc')
        ->skip(($page - 1) * $perPage)
        ->take($perPage)
        ->get()
        ->map(function ($item) {
          return ['id' => $item->id, 'issued_at' => $item->issued_at, 'no_project' => $item->no_project, 'running_no' => $item->running_no, 'description' => $item->description, 'total_amount' => $item->total_amount, 'status' => BillingStatus::getStatusName($item->status_id), 'created_at' => $item->created_at];
        });
      return response()->json(['success' => true, 'data' => ['items' => $items, 'meta' => ['total' => $total, 'page' => $page, 'per_page' => $perPage, 'total_pages' => ceil($total / $perPage)]]]);
    } catch (Exception $error) {
      return response()->json(['success' => false, 'message' => $error->getMessage()], 500);
    }
  }

  public function getStats(){
    try {
      $user = request()->user();
      $query = Billing::query();

      if (!$user->hasAbility([UserAbilities::ADMIN, UserAbilities::FINANCE_CHECKER])) {
        $query->where('department_id', $user->department_id);
      }

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

      $monthlyTrend = $query->selectRaw('
        DATE_FORMAT(created_at, "%Y-%m") as month,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      ')
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();

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

  public function getHistory(Billing $billing) {
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
            'status_name' => BillingStatus::getStatusName($item->status),
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

};
