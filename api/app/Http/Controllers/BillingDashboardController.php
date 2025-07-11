<?php

namespace App\Http\Controllers;

use App\Constants\BillingStatus;
use App\Constants\UserAbilities;
use App\Models\Billing;
use App\Http\Controllers\HelperController;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Exception;

class BillingDashboardController extends Controller
{
  use AuthorizesRequests;

  /**
   * Get dashboard data based on user role/abilities
   */
  public function getDashboardData(Request $request)
  {
    try {
      $user = $request->user();
      $dashboardData = [];
      $userRoles = [];

      // Pemohon (ability 2)
      if (in_array(2, $user->abilities)) {
        $dashboardData['applicant'] = $this->getApplicantDashboard($user->id, $user->department_id);
        $userRoles[] = 'Pemohon';
      }

      // Ketua Jabatan (ability 3)
      if (in_array(3, $user->abilities)) {
        $dashboardData['hod'] = $this->getHODDashboard($user->department_id);
        $userRoles[] = 'Ketua Jabatan';
      }

      // Kewangan (abilities 4,5,6,7)
      if (array_intersect([4, 5, 6, 7], $user->abilities)) {
        $dashboardData['finance'] = $this->getFinanceDashboard($user->abilities);
        $userRoles[] = 'Kewangan';
      }

      return response()->json([
        'success' => true,
        'data' => $dashboardData,
        'user_roles' => $userRoles,
        'user_info' => [
          'name' => $user->name,
          'department' => $user->department->name ?? 'Tidak Diketahui'
        ]
      ]);
    } catch (Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Error fetching dashboard data',
        'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
      ], 500);
    }
  }

  /**
   * Get dashboard data for HOD users
   */
  private function getHODDashboard($departmentId)
  {
    // HOD specific data - focus on approvals needed and department performance
    $pendingApprovals = Billing::where('status_id', BillingStatus::HOD_APPROVAL)
      ->where('department_id', $departmentId)
      ->count();

    $departmentBillings = Billing::where('department_id', $departmentId)->count();
    $departmentCompleted = Billing::where('department_id', $departmentId)
      ->where('status_id', BillingStatus::COMPLETED)
      ->count();

    $totalApproved = Billing::where('department_id', $departmentId)
      ->where('status_id', BillingStatus::COMPLETED)
      ->sum('total_amount');

    // Billings needing HOD approval with proper date formatting
    $needingApproval = Billing::with(['creator:id,name', 'recipient:id,name'])
      ->where('status_id', BillingStatus::HOD_APPROVAL)
      ->where('department_id', $departmentId)
      ->orderBy('created_at', 'asc')
      ->limit(10)
      ->get()
      ->map(function ($billing) {
        $days = $billing->created_at->diffInDays(now());
        return [
          'id' => $billing->id,
          'running_no' => $billing->running_no,
          'creator' => $billing->creator->name ?? 'Unknown',
          'recipient' => $billing->recipient->name ?? 'Unknown',
          'total_amount' => $billing->total_amount,
          'created_at' => $billing->created_at->format('d/m/Y'),
          'issued_at' => $billing->issued_at->format('d/m/Y'),
          'days_pending' => $days,
          'days_pending_display' => HelperController::formatDaysPending($days),
          'priority' => HelperController::getPriorityText($days),
          'priority_class' => HelperController::getPriorityColorClass($days)
        ];
      });

    // Department status breakdown
    $statusCounts = [
      'draft' => Billing::where('department_id', $departmentId)->where('status_id', BillingStatus::DRAFT)->count(),
      'pending_hod' => $pendingApprovals,
      'in_finance' => Billing::where('department_id', $departmentId)
        ->whereIn('status_id', [BillingStatus::FINANCE_REVIEW, BillingStatus::FINANCE_VERIFY, BillingStatus::PROCESSING_PAYMENT])
        ->count(),
      'completed' => $departmentCompleted,
      'rejected' => Billing::where('department_id', $departmentId)->where('status_id', BillingStatus::REJECTED)->count(),
      'returned' => Billing::where('department_id', $departmentId)->where('status_id', BillingStatus::RETURNED)->count(),
    ];

    $completionRate = $departmentBillings > 0 ? round(($departmentCompleted / $departmentBillings) * 100, 1) : 0;
    $averageApprovalTime = $this->getAverageApprovalTime($departmentId);

    return [
      'summary' => [
        'pending_approvals' => $pendingApprovals,
        'department_billings' => $departmentBillings,
        'completion_rate' => $completionRate,
        'total_approved_amount' => $totalApproved
      ],
      'needing_approval' => $needingApproval,
      'status_counts' => $statusCounts,
      'performance' => [
        'this_month' => $this->getDepartmentMonthlyStats($departmentId),
        'average_approval_time' => $averageApprovalTime,
        'average_approval_time_display' => $averageApprovalTime ? HelperController::formatDaysPending($averageApprovalTime) : 'Tidak ada data'
      ]
    ];
  }

  /**
   * Get dashboard data for Finance users
   */
  private function getFinanceDashboard($userAbilities)
  {
    // Finance dashboard - show ALL finance related tasks regardless of specific role
    $pendingReview = Billing::where('status_id', BillingStatus::FINANCE_REVIEW)->count();
    $pendingVerify = Billing::where('status_id', BillingStatus::FINANCE_VERIFY)->count();
    $pendingApproval = Billing::where('status_id', BillingStatus::FINANCE_APPROVAL)->count();
    $pendingPayment = Billing::where('status_id', BillingStatus::PROCESSING_PAYMENT)->count();

    $totalProcessing = $pendingReview + $pendingVerify + $pendingApproval + $pendingPayment;

    $monthlyPayments = Billing::where('status_id', BillingStatus::COMPLETED)
      ->whereMonth('paid_at', now()->month)
      ->whereYear('paid_at', now()->year)
      ->sum('total_amount');

    // Show ALL finance-related items since we're grouping all finance roles
    $needingAttention = Billing::with(['creator:id,name', 'department:id,name', 'recipient:id,name'])
      ->whereIn('status_id', [BillingStatus::FINANCE_REVIEW, BillingStatus::FINANCE_VERIFY, BillingStatus::FINANCE_APPROVAL, BillingStatus::PROCESSING_PAYMENT])
      ->orderByRaw('CASE 
            WHEN status_id = ' . BillingStatus::FINANCE_REVIEW . ' THEN 1
            WHEN status_id = ' . BillingStatus::FINANCE_VERIFY . ' THEN 2  
            WHEN status_id = ' . BillingStatus::FINANCE_APPROVAL . ' THEN 3
            WHEN status_id = ' . BillingStatus::PROCESSING_PAYMENT . ' THEN 4
            ELSE 5 END')
      ->orderBy('created_at', 'asc')
      ->limit(20)
      ->get()
      ->map(function ($billing) {
        $days = $billing->created_at->diffInDays(now());
        return [
          'id' => $billing->id,
          'running_no' => $billing->running_no,
          'creator' => $billing->creator->name ?? 'Unknown',
          'department' => $billing->department->name ?? 'Unknown',
          'recipient' => $billing->recipient->name ?? 'Unknown',
          'total_amount' => $billing->total_amount,
          'status' => BillingStatus::getStatusName($billing->status_id),
          'status_id' => $billing->status_id,
          'print_count' => $billing->print_count,
          'last_printed_at' => $billing->last_printed_at,
          'last_printed_by' => $billing->last_printed_by,
          'created_at' => $billing->created_at->format('d/m/Y'),
          'days_pending' => $days,
          'days_pending_display' => HelperController::formatDaysPending($days),
          'priority' => HelperController::getPriorityText($days),
          'priority_class' => HelperController::getPriorityColorClass($days)
        ];
      });

    $statusCounts = [
      'pending_review' => $pendingReview,
      'pending_verify' => $pendingVerify,
      'pending_approval' => $pendingApproval,
      'pending_payment' => $pendingPayment,
      'completed_this_month' => Billing::where('status_id', BillingStatus::COMPLETED)
        ->whereMonth('paid_at', now()->month)
        ->whereYear('paid_at', now()->year)
        ->count()
    ];

    // Determine what permissions this user has
    $permissions = [
      'can_review' => in_array(UserAbilities::FINANCE_CHECKER, $userAbilities),
      'can_verify' => in_array(UserAbilities::FINANCE_VERIFIER, $userAbilities),
      'can_approve' => in_array(UserAbilities::FINANCE_APPROVER, $userAbilities),
      'can_pay' => in_array(UserAbilities::PAYMENT_MAKER, $userAbilities)
    ];

    $averageProcessingTime = $this->getAverageProcessingTime();

    return [
      'summary' => [
        'total_processing' => $totalProcessing,
        'pending_review' => $pendingReview,
        'pending_verify' => $pendingVerify,
        'pending_approval' => $pendingApproval,
        'pending_payment' => $pendingPayment,
        'monthly_payments' => $monthlyPayments,
        'total_tasks' => $totalProcessing
      ],
      'needing_attention' => $needingAttention,
      'status_counts' => $statusCounts,
      'performance' => [
        'average_processing_time' => $averageProcessingTime,
        'average_processing_time_display' => $averageProcessingTime ? HelperController::formatDaysPending($averageProcessingTime) : 'Tidak ada data',
        'monthly_volume' => $this->getMonthlyFinanceVolume()
      ],
      'permissions' => $permissions
    ];
  }

  /**
   * Get dashboard data for Applicant users
   */
  private function getApplicantDashboard($userId, $departmentId)
  {
    // Applicant specific data - focus on own applications
    $myBillings = Billing::where('created_by', $userId)->count();
    $myDrafts = Billing::where('created_by', $userId)->where('status_id', BillingStatus::DRAFT)->count();
    $myPending = Billing::where('created_by', $userId)
      ->whereIn('status_id', [
        BillingStatus::HOD_APPROVAL,
        BillingStatus::FINANCE_REVIEW,
        BillingStatus::FINANCE_VERIFY,
        BillingStatus::FINANCE_APPROVAL,
        BillingStatus::PROCESSING_PAYMENT
      ])
      ->count();
    $myCompleted = Billing::where('created_by', $userId)->where('status_id', BillingStatus::COMPLETED)->count();
    $myReturned = Billing::where('created_by', $userId)->where('status_id', BillingStatus::RETURNED)->count();

    $totalApproved = Billing::where('created_by', $userId)
      ->where('status_id', BillingStatus::COMPLETED)
      ->sum('total_amount');

    // My recent billings
    $myRecentBillings = Billing::with(['recipient:id,name'])
      ->where('created_by', $userId)
      ->orderBy('created_at', 'desc')
      ->limit(10)
      ->get()
      ->map(function ($billing) {
        return [
          'id' => $billing->id,
          'running_no' => $billing->running_no,
          'recipient' => $billing->recipient->name ?? 'Unknown',
          'total_amount' => $billing->total_amount,
          'status' => BillingStatus::getStatusName($billing->status_id),
          'status_id' => $billing->status_id,
          'created_at' => $billing->created_at->format('d/m/Y'),
          'can_edit' => in_array($billing->status_id, [BillingStatus::DRAFT, BillingStatus::RETURNED]),
          'status_class' => HelperController::getStatusColorClass($billing->status_id)
        ];
      });

    $statusCounts = [
      'draft' => $myDrafts,
      'pending' => $myPending,
      'completed' => $myCompleted,
      'rejected' => Billing::where('created_by', $userId)->where('status_id', BillingStatus::REJECTED)->count(),
      'returned' => $myReturned,
    ];

    $completionRate = $myBillings > 0 ? round(($myCompleted / $myBillings) * 100, 1) : 0;

    return [
      'summary' => [
        'total_applications' => $myBillings,
        'pending_approvals' => $myPending,
        'drafts' => $myDrafts,
        'completion_rate' => $completionRate,
        'total_approved_amount' => $totalApproved
      ],
      'my_billings' => $myRecentBillings,
      'status_counts' => $statusCounts,
      'quick_actions' => [
        'can_create_new' => true,
        'drafts_to_complete' => $myDrafts,
        'returned_to_fix' => $myReturned
      ]
    ];
  }

  /**
   * Helper method to get department monthly stats
   */
  private function getDepartmentMonthlyStats($departmentId)
  {
    return Billing::where('department_id', $departmentId)
      ->whereMonth('created_at', now()->month)
      ->whereYear('created_at', now()->year)
      ->count();
  }

  /**
   * Helper method to get average approval time for HOD
   * Fixed to prevent extreme decimal places
   */
  private function getAverageApprovalTime($departmentId)
  {
    try {
      // Get billings that have been approved by HOD
      $approvedBillings = Billing::where('department_id', $departmentId)
        ->whereNotNull('hod_approved_at')
        ->whereIn('status_id', [
          BillingStatus::FINANCE_REVIEW, 
          BillingStatus::FINANCE_VERIFY, 
          BillingStatus::PROCESSING_PAYMENT, 
          BillingStatus::COMPLETED
        ])
        ->select('created_at', 'hod_approved_at')
        ->get();

      if ($approvedBillings->isEmpty()) {
        return null;
      }

      $totalDays = 0;
      $count = 0;

      foreach ($approvedBillings as $billing) {
        if ($billing->hod_approved_at && $billing->created_at) {
          $days = Carbon::parse($billing->created_at)->diffInDays(Carbon::parse($billing->hod_approved_at));
          $totalDays += $days;
          $count++;
        }
      }

      if ($count === 0) {
        return null;
      }

      // Return rounded to nearest whole number
      return round($totalDays / $count);

    } catch (Exception $e) {
      \Log::error('Error calculating average approval time: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Helper method to get average processing time for Finance
   * Fixed to prevent extreme decimal places
   */
  private function getAverageProcessingTime()
  {
    try {
      $completedBillings = Billing::where('status_id', BillingStatus::COMPLETED)
        ->whereNotNull('reviewed_at')
        ->whereNotNull('paid_at')
        ->select('reviewed_at', 'paid_at')
        ->get();

      if ($completedBillings->isEmpty()) {
        return null;
      }

      $totalDays = 0;
      $count = 0;

      foreach ($completedBillings as $billing) {
        if ($billing->reviewed_at && $billing->paid_at) {
          $days = $billing->reviewed_at->diffInDays($billing->paid_at);
          $totalDays += $days;
          $count++;
        }
      }

      if ($count === 0) {
        return null;
      }

      // Return rounded to nearest whole number
      return round($totalDays / $count);

    } catch (Exception $e) {
      \Log::error('Error calculating average processing time: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Helper method to get monthly finance volume
   */
  private function getMonthlyFinanceVolume()
  {
    $currentMonth = now()->month;
    $currentYear = now()->year;

    return [
      'processed' => Billing::whereIn('status_id', [
        BillingStatus::FINANCE_REVIEW,
        BillingStatus::FINANCE_VERIFY,
        BillingStatus::PROCESSING_PAYMENT,
        BillingStatus::COMPLETED
      ])
        ->whereMonth('reviewed_at', $currentMonth)
        ->whereYear('reviewed_at', $currentYear)
        ->count(),
      'completed' => Billing::where('status_id', BillingStatus::COMPLETED)
        ->whereMonth('paid_at', $currentMonth)
        ->whereYear('paid_at', $currentYear)
        ->count()
    ];
  }

  /**
   * Get monthly trends for charts
   */
  private function getMonthlyTrends()
  {
    $months = [];
    for ($i = 5; $i >= 0; $i--) {
      $date = now()->subMonths($i);
      $months[] = [
        'name' => $date->format('M'),
        'month' => $date->month,
        'year' => $date->year,
        'amount' => Billing::where('status_id', BillingStatus::COMPLETED)
          ->whereMonth('paid_at', $date->month)
          ->whereYear('paid_at', $date->year)
          ->sum('total_amount')
      ];
    }

    return $months;
  }

  /**
   * Get urgent items that need immediate attention
   */
  public function getUrgentItems(Request $request)
  {
    try {
      $user = $request->user();
      $urgentItems = [];

      // For HOD users - show urgent approvals
      if (in_array(3, $user->abilities)) {
        $urgentApprovals = Billing::where('status_id', BillingStatus::HOD_APPROVAL)
          ->where('department_id', $user->department_id)
          ->where('created_at', '<=', now()->subDays(3))
          ->count();

        if ($urgentApprovals > 0) {
          $urgentItems[] = [
            'type' => 'hod_approval',
            'count' => $urgentApprovals,
            'message' => "Ada {$urgentApprovals} permohonan yang menunggu kelulusan anda lebih dari 3 hari",
            'action_url' => '/hod'
          ];
        }
      }

      // For Finance users - show urgent finance tasks
      if (array_intersect([4, 5, 6, 7], $user->abilities)) {
        $urgentFinance = Billing::whereIn('status_id', [
          BillingStatus::FINANCE_REVIEW,
          BillingStatus::FINANCE_VERIFY,
          BillingStatus::PROCESSING_PAYMENT
        ])
          ->where('created_at', '<=', now()->subDays(5))
          ->count();

        if ($urgentFinance > 0) {
          $urgentItems[] = [
            'type' => 'finance_urgent',
            'count' => $urgentFinance,
            'message' => "Ada {$urgentFinance} item kewangan yang perlu perhatian segera",
            'action_url' => '/finance'
          ];
        }
      }

      return response()->json([
        'success' => true,
        'urgent_items' => $urgentItems
      ]);

    } catch (Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Error fetching urgent items',
        'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
      ], 500);
    }
  }
}