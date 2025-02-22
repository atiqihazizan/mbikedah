<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Validator;

class ValidateRequest
{
    public function handle($request, Closure $next)
    {
        $validator = Validator::make($request->all(), [
            'archived' => 'boolean|nullable',
            // Tambah lebih banyak peraturan pengesahan di sini jika perlu
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        return $next($request);
    }
}
