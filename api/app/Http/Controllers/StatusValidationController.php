<?php

namespace App\Http\Controllers;

use App\Constants\BillingStatus;
use App\Constants\UserAbilities;
use App\Http\Resources\BillingResource;
use App\Http\Resources\BillingDetailResource;
use App\Models\Billing;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Exception;

class StatusValidationController extends Controller
{
  use AuthorizesRequests;

  /**
   * Display status validation page
   * GET /status-validation
   */
  public function index()
  {
    return response()->json([
      'success' => true,
      'message' => 'Status Validation Page loaded successfully',
      'data' => [
        'page_title' => 'Billing Status Validation & Processing',
        'user' => Auth::user(),
        'status_reference' => BillingStatus::getAllStatuses(),
        'user_abilities' => UserAbilities::getAbilitiesName()
      ]
    ]);
  }

  /**
   * Validate billing status for processing
   * POST /status-validation/validate
   */
  public function validateBillingStatus(Request $request)
  {
    try {
      $billingId = $request->input('billing_id');
      $requestedStatus = $request->input('status');
      $action = $request->input('action', 'view');

      // Validate required fields
      if (!$billingId) return response()->json(['success' => false,'message' => 'Billing not found'], 422);

      // Find billing
      $billing = Billing::find($billingId);
      if (!$billing) return response()->json(['success' => false,'message' => 'Billing not found'], 422);

      // Check if user can access this billing
      $this->authorize('view', $billing);

      // Validate action and status based on action type
      if ($action === 'process' && !$requestedStatus) return response()->json(['success' => false,'message' => 'A required parameter is missing'], 422);

      // Get current status
      $currentStatus = $billing->status_id;

      // Define allowed actions per status
      $allowedActions = [
        BillingStatus::DRAFT => ['view', 'process', 'cancel'],
        BillingStatus::HOD_APPROVAL => ['view', 'process', 'reject', 'return'],
        BillingStatus::FINANCE_REVIEW => ['view', 'process', 'reject', 'return'],
        BillingStatus::FINANCE_VERIFY => ['view', 'process', 'reject', 'return'],
        BillingStatus::FINANCE_APPROVAL => ['view', 'process', 'reject', 'return'],
        BillingStatus::PROCESSING_PAYMENT => ['view', 'process'],
        BillingStatus::COMPLETED => ['view'],
        BillingStatus::REJECTED => ['view'],
        BillingStatus::RETURNED => ['view', 'process'],
        BillingStatus::CANCELLED => ['view']
      ];

      // Process methods mapping
      $processMethods = [
        BillingStatus::DRAFT => 'submitForApproval',
        BillingStatus::HOD_APPROVAL => 'hodApprove',
        BillingStatus::FINANCE_REVIEW => 'financeReview',
        BillingStatus::FINANCE_VERIFY => 'financeVerify',
        BillingStatus::FINANCE_APPROVAL => 'financeApprove',
        BillingStatus::PROCESSING_PAYMENT => 'processPayment',
      ];

      // Check if current status is valid
      if (!array_key_exists($currentStatus, $allowedActions)) return response()->json(['success' => false,'message' => 'Invalid operation'], 400);

      $currentAllowedActions = $allowedActions[$currentStatus];

      // For view action, return data without validation
      if ($action === 'view') {
        $detailedBillingData = $this->getDetailedBillingData($billing);
        
        return response()->json(['success' => true,'data' => $detailedBillingData,'is_active' => $billing->is_active,'validation_mode' => 'view_only']);
      }

      // Validate if action is allowed for current status
      if (!in_array($action, $currentAllowedActions)) return response()->json(['success' => false, 'message' => 'Proses ini tidak sah'], 400);

      // For process action, strict validation
      if ($action === 'process') {
        // Strict validation: requested status MUST equal current status
        if ($requestedStatus !== $currentStatus) return response()->json([
            'success' => false,
            'message' => $requestedStatus > $currentStatus 
              ? 'Maaf, permohonan ini telah diproses'
              : 'Maaf, proses `' . BillingStatus::getStatusName($currentStatus) . '` belum selesai'
          ], 400);

        // Manual authorization check using custom methods
        if (!$this->canProcessStatus($billing, $requestedStatus)) return response()->json(['success' => false, 'message' => 'Anda perlu mendapat kebenaran'], 403);
      }

      // For other actions (reject, return, cancel)
      if (in_array($action, ['reject', 'return', 'cancel'])) {
        if (!$this->canRejectBilling($billing)) return response()->json(['success' => false, 'message' => 'Anda perlu mendapat kebenaran'], 403);
      }

      // Determine next status after process
      $nextStatusAfterProcess = null;
      if ($action === 'process') {
        $allStatuses = array_keys(BillingStatus::getAllStatuses());
        foreach ($allStatuses as $statusId) {
          if ($billing->canTransitionTo($statusId)) {
            $nextStatusAfterProcess = $statusId;
            break;
          }
        }
      }

      // Return success response
      $detailedBillingData = $this->getDetailedBillingData($billing);
      
      return response()->json([
        'success' => true,
        'message' => 'Status validation berjaya',
        'data' => $detailedBillingData,
        'current_status' => $currentStatus,
        'current_status_name' => BillingStatus::getStatusName($currentStatus),
        // 'requested_status' => $requestedStatus,
        // 'requested_status_name' => $requestedStatus ? BillingStatus::getStatusName($requestedStatus) : null,
        // 'next_status_after_process' => $nextStatusAfterProcess,
        // 'next_status_after_process_name' => $nextStatusAfterProcess ? BillingStatus::getStatusName($nextStatusAfterProcess) : null,
        'action' => $action,
        'allowed_actions' => $currentAllowedActions,
        // 'process_method' => $processMethods[$currentStatus] ?? null,
        'is_active' => $billing->is_active,
        // 'validation_mode' => 'full_validation'
      ]);
    } catch (Exception $e) {
      return response()->json(['success' => false,'message' => 'Error 202: ' . $e->getMessage()], 500);
    }
  }

  /**
   * Get detailed status information for a billing
   * GET /status-validation/billing/{billing}/info
   */
  public function getBillingStatusInfo(Billing $billing)
  {
    try {
      $currentStatus = $billing->status_id;

      // Get possible next statuses
      $allStatuses = BillingStatus::getAllStatuses();
      $possibleNextStatuses = [];

      foreach (array_keys($allStatuses) as $statusId) {
        if ($billing->canTransitionTo($statusId)) {
          $possibleNextStatuses[] = ['status_id' => $statusId,'status_name' => BillingStatus::getStatusName($statusId)];
        }
      }

      // Status processors mapping
      $statusProcessors = [
        BillingStatus::DRAFT => [UserAbilities::APPLICANT, UserAbilities::ADMIN],
        BillingStatus::HOD_APPROVAL => [UserAbilities::HOD, UserAbilities::ADMIN],
        BillingStatus::FINANCE_REVIEW => [UserAbilities::FINANCE_CHECKER, UserAbilities::ADMIN],
        BillingStatus::FINANCE_VERIFY => [UserAbilities::FINANCE_VERIFIER, UserAbilities::ADMIN],
        BillingStatus::FINANCE_APPROVAL => [UserAbilities::FINANCE_APPROVER, UserAbilities::ADMIN],
        BillingStatus::PROCESSING_PAYMENT => [UserAbilities::PAYMENT_MAKER, UserAbilities::ADMIN],
      ];

      return response()->json([
        'success' => true,
        'data' => [
          'current_status' => $currentStatus,
          'current_status_name' => BillingStatus::getStatusName($currentStatus),
          'possible_next_statuses' => $possibleNextStatuses,
          'is_final_status' => in_array($currentStatus, [BillingStatus::COMPLETED,BillingStatus::REJECTED,BillingStatus::CANCELLED]),
          'can_be_edited' => in_array($currentStatus, [BillingStatus::DRAFT,BillingStatus::RETURNED]),
          'is_active' => $billing->is_active,
          'required_abilities' => $statusProcessors[$currentStatus] ?? [],
          'billing_data' => $this->getDetailedBillingData($billing)
        ]
      ]);
    } catch (Exception $e) {
      return response()->json(['success' => false,'message' => 'Error 203: ' . $e->getMessage()], 500);
    }
  }

  /**
   * Get complete workflow information
   * GET /status-validation/workflow
   */
  public function getWorkflowInfo()
  {
    try {
      $allStatuses = BillingStatus::getAllStatuses();
      $workflow = [];

      foreach ($allStatuses as $statusId => $statusName) {
        // Create temporary billing to check transitions
        $tempBilling = new Billing();
        $tempBilling->status_id = $statusId;

        $possibleTransitions = [];
        foreach (array_keys($allStatuses) as $nextStatusId) {
          if ($tempBilling->canTransitionTo($nextStatusId)) {
            $possibleTransitions[] = ['status_id' => $nextStatusId,'status_name' => BillingStatus::getStatusName($nextStatusId)];
          }
        }

        $workflow[] = [
          'status_id' => $statusId,
          'status_name' => $statusName,
          'possible_transitions' => $possibleTransitions,
          'is_final' => in_array($statusId, [
            BillingStatus::COMPLETED,
            BillingStatus::REJECTED,
            BillingStatus::CANCELLED
          ])
        ];
      }

      return response()->json([
        'success' => true,
        'data' => [
          'workflow' => $workflow,
          'user_abilities' => UserAbilities::getAbilitiesName(),
          'total_statuses' => count($allStatuses)
        ]
      ]);
    } catch (Exception $e) {
      return response()->json(['success' => false,'message' => 'Error 204: ' . $e->getMessage()], 500);
    }
  }

  /**
   * Batch validate multiple billings
   * POST /status-validation/batch-validate
   */
  public function batchValidate(Request $request)
  {
    try {
      $billingIds = $request->input('billing_ids', []);
      $action = $request->input('action', 'view');

      if (empty($billingIds)) return response()->json(['success' => false,'message' => 'Error 205: Sila masukkan sekurang-kurangnya satu Billing'], 422);

      $results = [];
      $billings = Billing::whereIn('id', $billingIds)->get();

      foreach ($billings as $billing) {
        $currentStatus = $billing->status_id;

        $allowedActions = [
          BillingStatus::DRAFT => ['view', 'process', 'cancel'],
          BillingStatus::HOD_APPROVAL => ['view', 'process', 'reject', 'return'],
          BillingStatus::FINANCE_REVIEW => ['view', 'process', 'reject', 'return'],
          BillingStatus::FINANCE_VERIFY => ['view', 'process', 'reject', 'return'],
          BillingStatus::FINANCE_APPROVAL => ['view', 'process', 'reject', 'return'],
          BillingStatus::PROCESSING_PAYMENT => ['view', 'process'],
          BillingStatus::COMPLETED => ['view'],
          BillingStatus::REJECTED => ['view'],
          BillingStatus::RETURNED => ['view', 'process'],
          BillingStatus::CANCELLED => ['view']
        ];

        $results[] = [
          'billing_id' => $billing->id,
          'current_status' => $currentStatus,
          'current_status_name' => BillingStatus::getStatusName($currentStatus),
          'allowed_actions' => $allowedActions[$currentStatus] ?? [],
          'can_perform_action' => in_array($action, $allowedActions[$currentStatus] ?? []),
          'is_active' => $billing->is_active
        ];
      }

      return response()->json([
        'success' => true,
        'message' => 'Batch validation selesai',
        'data' => [
          'results' => $results,
          'total_checked' => count($results),
          'action_checked' => $action
        ]
      ]);
    } catch (Exception $e) {
      return response()->json(['success' => false,'message' => 'Error 206: ' . $e->getMessage()], 500);
    }
  }

  /**
   * Test authorization untuk debugging (Optional)
   * GET /status-validation/test-auth/{billing}
   * Note: This endpoint bypasses normal authorization for debugging purposes
   */
  public function testAuthorization(Billing $billing)
  {
    $user = Auth::user();
    
    if (!$user) return response()->json(['success' => false,'message' => 'Error 207: User not authenticated'], 401);
        
    // Get allowed actions for current status
    $allowedActions = [
      BillingStatus::DRAFT => ['view', 'process', 'cancel'],
      BillingStatus::HOD_APPROVAL => ['view', 'process', 'reject', 'return'],
      BillingStatus::FINANCE_REVIEW => ['view', 'process', 'reject', 'return'],
      BillingStatus::FINANCE_VERIFY => ['view', 'process', 'reject', 'return'],
      BillingStatus::FINANCE_APPROVAL => ['view', 'process', 'reject', 'return'],
      BillingStatus::PROCESSING_PAYMENT => ['view', 'process'],
      BillingStatus::COMPLETED => ['view'],
      BillingStatus::REJECTED => ['view'],
      BillingStatus::RETURNED => ['view', 'process'],
      BillingStatus::CANCELLED => ['view']
    ];
    
    // Determine access reason
    $accessReason = 'No access';
    if ($user->abilities == UserAbilities::ADMIN) {
      $accessReason = 'Admin - can access all billings';
    } elseif ($user->abilities == UserAbilities::APPLICANT) {
      if ($billing->created_by == $user->id) {
        $accessReason = 'Applicant - own billing (created_by match)';
      } else {
        $accessReason = 'Applicant - cannot access (not the creator)';
      }
    } elseif ($user->abilities == UserAbilities::HOD) {
      if ($billing->created_by == $user->id) {
        $accessReason = 'HOD - own billing';
      } elseif (isset($user->department_id) && $billing->department_id == $user->department_id) {
        $accessReason = 'HOD - department billing';
      } else {
        $accessReason = 'HOD - cannot access (different department)';
      }
    } elseif (in_array($user->abilities, [
      UserAbilities::FINANCE_CHECKER,
      UserAbilities::FINANCE_VERIFIER,
      UserAbilities::FINANCE_APPROVER,
      UserAbilities::PAYMENT_MAKER
    ])) {
      $accessReason = 'Finance role - can access all billings from any department';
    }

    // Test process status for all relevant statuses
    $processStatusTests = [];
    $allStatuses = BillingStatus::getAllStatuses();
    
    foreach ($allStatuses as $statusId => $statusName) {
      $canProcess = $this->canProcessStatus($billing, $statusId);
      $processStatusTests[] = [
        'status_id' => $statusId,
        'status_name' => $statusName,
        'can_process' => $canProcess,
        'is_current_status' => $statusId === $billing->status_id,
        'reason' => $canProcess ? 'Allowed' : 'Not authorized for this status'
      ];
    }

    // Role-specific processing capabilities
    $roleProcessingCapabilities = [];
    switch ($user->abilities) {
      case UserAbilities::ADMIN:
        $roleProcessingCapabilities = ['All statuses'];
        break;
      case UserAbilities::APPLICANT:
        $roleProcessingCapabilities = ['DRAFT (own billings only)'];
        break;
      case UserAbilities::HOD:
        $roleProcessingCapabilities = ['HOD_APPROVAL (own + department billings)'];
        break;
      case UserAbilities::FINANCE_CHECKER:
        $roleProcessingCapabilities = ['FINANCE_REVIEW (all billings)'];
        break;
      case UserAbilities::FINANCE_VERIFIER:
        $roleProcessingCapabilities = ['FINANCE_VERIFY (all billings)'];
        break;
      case UserAbilities::FINANCE_APPROVER:
        $roleProcessingCapabilities = ['FINANCE_APPROVAL (all billings)'];
        break;
      case UserAbilities::PAYMENT_MAKER:
        $roleProcessingCapabilities = ['PROCESSING_PAYMENT (all billings)'];
        break;
      default:
        $roleProcessingCapabilities = ['None'];
    }
    
    return response()->json([
      'success' => true,
      'data' => [
        'user_info' => [
          'id' => $user->id,
          'name' => $user->name ?? 'N/A',
          'abilities' => $user->abilities,
          'abilities_name' => UserAbilities::getAbilitiesName()[$user->abilities] ?? 'Unknown',
          'department_id' => $user->department_id ?? null
        ],
        'billing_info' => [
          'id' => $billing->id,
          'running_no' => $billing->running_no ?? 'N/A',
          'status_id' => $billing->status_id,
          'status_name' => BillingStatus::getStatusName($billing->status_id),
          'created_by' => $billing->created_by,
          'department_id' => $billing->department_id ?? null,
          'is_active' => $billing->is_active
        ],
        'access_analysis' => [
          'can_access_billing' => $this->canAccessBilling($billing),
          'access_reason' => $accessReason,
          'is_owner' => $billing->created_by == $user->id,
          'same_department' => isset($user->department_id) && $billing->department_id == $user->department_id,
          'different_department' => isset($user->department_id) && $billing->department_id != $user->department_id
        ],
        'process_permissions' => [
          'can_process_current_status' => $this->canProcessStatus($billing, $billing->status_id),
          'role_processing_capabilities' => $roleProcessingCapabilities,
          'all_status_process_tests' => $processStatusTests
        ],
        'other_permissions' => [
          'can_reject_billing' => $this->canRejectBilling($billing)
        ],
        'role_capabilities' => [
          'is_admin' => $user->abilities == UserAbilities::ADMIN,
          'is_applicant' => $user->abilities == UserAbilities::APPLICANT,
          'is_hod' => $user->abilities == UserAbilities::HOD,
          'is_finance_role' => in_array($user->abilities, [
            UserAbilities::FINANCE_CHECKER,
            UserAbilities::FINANCE_VERIFIER,
            UserAbilities::FINANCE_APPROVER,
            UserAbilities::PAYMENT_MAKER
          ])
        ],
        'workflow_info' => [
          'allowed_actions_for_status' => $allowedActions[$billing->status_id] ?? [],
          'current_status_name' => BillingStatus::getStatusName($billing->status_id)
        ]
      ]
    ]);
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  /**
   * Check if user owns or can access the billing
   * 
   * Access Scenarios:
   * - Admin: All billings
   * - Applicant: Own billings only
   * - HOD: Own billings + Department billings only
   * - Finance: All billings (regardless of department)
   */
  private function canAccessBilling(Billing $billing): bool
  {
    $user = Auth::user();
    if (!$user) return false;

    // Convert to int for safe comparison
    $userAbilities = (int) $user->abilities;
    $userId = (int) $user->id;
    $billingCreatedBy = (int) $billing->created_by;
    $userDeptId = isset($user->department_id) ? (int) $user->department_id : null;
    $billingDeptId = isset($billing->department_id) ? (int) $billing->department_id : null;

    // Admin can access everything
    if ($userAbilities === UserAbilities::ADMIN) return true;

    // Applicant can only access billings they created
    if ($userAbilities === UserAbilities::APPLICANT) return $billingCreatedBy === $userId;

    // HOD can access billings from their department + own billings
    if ($userAbilities === UserAbilities::HOD) {
      // Check if user is the creator (own billing)
      if ($billingCreatedBy === $userId) return true;
      
      // Check if billing is from their department
      if ($userDeptId !== null && $billingDeptId !== null && $billingDeptId === $userDeptId) return true;
      
      // HOD cannot access billings from other departments (unless they created it)
      return false;
    }

    // Finance roles can access ALL billings from ANY department
    $financeRoles = [
      UserAbilities::FINANCE_CHECKER,
      UserAbilities::FINANCE_VERIFIER,
      UserAbilities::FINANCE_APPROVER,
      UserAbilities::PAYMENT_MAKER
    ];

    if (in_array($userAbilities, $financeRoles, true)) return true; // Access all billings regardless of department

    // Default: no access
    return false;
  }

  /**
   * Check if current user can process specific status
   * Note: This checks if user can process billing WHEN it's AT the specified status
   */
  private function canProcessStatus(Billing $billing, int $statusId): bool
  {
    $user = Auth::user();
    if (!$user) return false;

    // Convert to int for safe comparison
    $userAbilities = (int) $user->abilities;
    $userId = (int) $user->id;
    $billingCreatedBy = (int) $billing->created_by;
    $userDeptId = isset($user->department_id) ? (int) $user->department_id : null;
    $billingDeptId = isset($billing->department_id) ? (int) $billing->department_id : null;

    // Admin can process everything
    if ($userAbilities === UserAbilities::ADMIN) return true;

    // First check if user can access this billing
    if (!$this->canAccessBilling($billing)) return false;

    // Define which roles can process which status
    $statusProcessors = [
      BillingStatus::DRAFT => [UserAbilities::APPLICANT],
      BillingStatus::HOD_APPROVAL => [UserAbilities::HOD],
      BillingStatus::FINANCE_REVIEW => [UserAbilities::FINANCE_CHECKER],
      BillingStatus::FINANCE_VERIFY => [UserAbilities::FINANCE_VERIFIER],
      BillingStatus::FINANCE_APPROVAL => [UserAbilities::FINANCE_APPROVER],
      BillingStatus::PROCESSING_PAYMENT => [UserAbilities::PAYMENT_MAKER],
    ];

    // Check if status can be processed by anyone
    // Statuses like COMPLETED, REJECTED, CANCELLED cannot be processed
    if (!isset($statusProcessors[$statusId])) return false;

    $allowedRoles = $statusProcessors[$statusId];
    
    // Check if user has required role for this status
    if (!in_array($userAbilities, $allowedRoles, true)) return false;

    // Role-specific additional checks
    switch ($userAbilities) {
      case UserAbilities::APPLICANT:
        // Applicant can only process their own DRAFT billings
        if ($statusId === BillingStatus::DRAFT) return $billingCreatedBy === $userId;
        return false;

      case UserAbilities::HOD:
        // HOD can process HOD_APPROVAL stage for:
        // 1. Their own billings (regardless of department)
        // 2. Billings from their department
        if ($statusId === BillingStatus::HOD_APPROVAL) {
          // Own billing
          if ($billingCreatedBy === $userId) return true;
          // Department billing
          if ($userDeptId !== null && $billingDeptId !== null && $billingDeptId === $userDeptId) return true;
        }
        return false;

      case UserAbilities::FINANCE_CHECKER:
        // Finance Checker can process FINANCE_REVIEW for ALL billings
        return $statusId === BillingStatus::FINANCE_REVIEW;

      case UserAbilities::FINANCE_VERIFIER:
        // Finance Verifier can process FINANCE_VERIFY for ALL billings
        return $statusId === BillingStatus::FINANCE_VERIFY;

      case UserAbilities::FINANCE_APPROVER:
        // Finance Approver can process FINANCE_APPROVAL for ALL billings
        return $statusId === BillingStatus::FINANCE_APPROVAL;

      case UserAbilities::PAYMENT_MAKER:
        // Payment Maker can process PROCESSING_PAYMENT for ALL billings
        return $statusId === BillingStatus::PROCESSING_PAYMENT;

      default:
        return false;
    }
  }

  /**
   * Check if current user can reject/return/cancel billing
   */
  private function canRejectBilling(Billing $billing): bool
  {
    $user = Auth::user();
    if (!$user) return false;

    // Convert to int for safe comparison
    $userAbilities = (int) $user->abilities;
    $userId = (int) $user->id;
    $billingCreatedBy = (int) $billing->created_by;
    $userDeptId = isset($user->department_id) ? (int) $user->department_id : null;
    $billingDeptId = isset($billing->department_id) ? (int) $billing->department_id : null;
    $currentStatus = (int) $billing->status_id;

    // Admin can reject anything
    if ($userAbilities === UserAbilities::ADMIN) return true;

    // First check if user can access this billing
    if (!$this->canAccessBilling($billing)) return false;

    // Role-specific rejection rules
    switch ($userAbilities) {
      case UserAbilities::APPLICANT:
        // Applicant can only cancel their own DRAFT billings
        return $billingCreatedBy === $userId && $currentStatus === BillingStatus::DRAFT;

      case UserAbilities::HOD:
        // HOD can reject/return billings at HOD_APPROVAL stage that they can access
        if ($currentStatus === BillingStatus::HOD_APPROVAL) {
          // Own billing
          if ($billingCreatedBy === $userId) return true;
          // Department billing
          if ($userDeptId !== null && $billingDeptId !== null && $billingDeptId === $userDeptId) return true;
        }
        return false;

      case UserAbilities::FINANCE_CHECKER:
        // Finance Checker can reject/return at FINANCE_REVIEW stage
        return $currentStatus === BillingStatus::FINANCE_REVIEW;

      case UserAbilities::FINANCE_VERIFIER:
        // Finance Verifier can reject/return at FINANCE_VERIFY stage
        return $currentStatus === BillingStatus::FINANCE_VERIFY;

      case UserAbilities::FINANCE_APPROVER:
        // Finance Approver can reject/return at FINANCE_APPROVAL stage
        return $currentStatus === BillingStatus::FINANCE_APPROVAL;

      case UserAbilities::PAYMENT_MAKER:
        // Payment Maker can reject/return at PROCESSING_PAYMENT stage
        return $currentStatus === BillingStatus::PROCESSING_PAYMENT;

      default:
        return false;
    }
  }

  /**
   * Get detailed billing data like getBillingById in BillingController
   */
  private function getDetailedBillingData(Billing $billing)
  {
    try {
      // Re-fetch billing with all necessary relationships and specific columns
      $detailedBilling = Billing::select([
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
          ->where('old_status', '>', 1);
          // ->orderBy('new_status', 'desc')
          // ->orderBy('created_at', 'desc');
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
      ->find($billing->id);

      if (!$detailedBilling) {
        return null;
      }

      // Return as BillingDetailResource like in BillingController
      $resource = new BillingDetailResource($detailedBilling);
      
      // Get the data array from resource without the HTTP response wrapper
      return $resource->toArray(request());
      
    } catch (Exception $e) {
      // Fallback to simple resource if detailed fetch fails
      return new BillingResource($billing->fresh(['details', 'recipient', 'department']));
    }
  }
}