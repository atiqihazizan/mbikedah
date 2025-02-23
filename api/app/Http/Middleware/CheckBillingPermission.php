<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBillingPermission
{
    public function handle(Request $request, Closure $next, string $action): Response
    {
        $user = $request->user();
        
        if (!$user || !$user->hasPermission($action)) {
            return response()->json([
                'message' => 'You do not have permission to perform this action.',
                'allowed_actions' => $user ? $user->getAllowedActions() : []
            ], 403);
        }

        return $next($request);
    }
}
