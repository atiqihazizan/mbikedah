<?php

namespace App\Traits;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

trait BillingPermission
{
  /**
   * Handle an incoming request.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  \Closure  $next
   * @return mixed
   */
  public function handle(Request $request, Closure $next)
  {
    // Get the action from the request path and method
    $action = $this->getActionFromRequest($request);

    // Check if user has permission for this action
    if (!$this->hasPermission($request->user(), $action)) {
      return response()->json([
        'message' => 'Unauthorized action'
      ], 403);
    }

    return $next($request);
  }

  /**
   * Extract action from request path and method
   */
  private function getActionFromRequest(Request $request): string
  {
    $method = strtolower($request->method());
    $path = $request->path();

    // Extract action from path segments
    $segments = explode('/', $path);
    $lastSegment = end($segments);

    // Map HTTP methods to actions
    $actionMap = [
      'get' => [
        'billings' => 'view',
        'stats' => 'view',
        'activities' => 'view',
        'pending' => 'view'
      ],
      'post' => [
        'billings' => 'create',
        'approve' => 'approve',
        'reject' => 'reject',
        'return' => 'return',
        'check' => 'check',
        'verify' => 'verify',
        'paid' => 'paid',
        'cancel' => 'cancel'
      ],
      'put' => [
        'status' => 'update_status',
        'archive' => 'archive'
      ],
      'delete' => [
        'billings' => 'delete'
      ]
    ];

    // Get action from map or use default
    return $actionMap[$method][$lastSegment] ?? 'view';
  }

  /**
   * Check if user has permission for the given action
   */
  protected function hasPermission(User $user, string $action): bool
  {
    // Define permissions based on role_id
    $permissions = [
      1 => [ // Admin
        'view', 'create', 'update', 'delete',
        'approve', 'reject', 'return', 'check',
        'verify', 'paid', 'cancel'
      ],
      2 => [ // Supervisor
        'view', 'create', 'update',
        'approve', 'reject', 'return'
      ],
      3 => [ // Manager
        'view', 'create', 'update',
        'check', 'verify'
      ],
      4 => [ // Staff
        'view', 'create'
      ]
    ];

    // Get allowed actions for user's role
    $allowedActions = $permissions[$user->role_id] ?? [];

    // Check if action is allowed
    return in_array($action, $allowedActions);
  }
}
