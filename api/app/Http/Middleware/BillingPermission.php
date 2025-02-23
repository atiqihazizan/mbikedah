<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Traits\BillingPermission as BillingPermissionTrait;

class BillingPermission
{
    use BillingPermissionTrait;

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $action = $this->getActionFromRequest($request);
        
        if (!$this->hasPermission($request->user(), $action)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to perform this action.'
            ], 403);
        }

        return $next($request);
    }

    /**
     * Get the billing action from the request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string
     */
    private function getActionFromRequest(Request $request): string
    {
        $path = $request->path();
        $method = $request->method();
        
        // Extract action from path for status updates
        if (preg_match('/billings\/\d+\/(approve|reject|return|check|verify|paid|cancel)/', $path, $matches)) {
            return $matches[1];
        }
        
        // Default actions based on HTTP method
        switch ($method) {
            case 'GET':
                return 'view';
            case 'POST':
                return 'create';
            case 'PUT':
            case 'PATCH':
                return 'update';
            case 'DELETE':
                return 'delete';
            default:
                return 'view';
        }
    }
}
