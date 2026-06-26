<?php

namespace App\Http\Middleware;

use Closure;

class ValidateRequest
{
    public function handle($request, Closure $next)
    {
        // Logik untuk memvalidasi permintaan
        return $next($request);
    }
}
