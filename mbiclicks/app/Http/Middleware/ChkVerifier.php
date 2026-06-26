<?php

namespace App\Http\Middleware;

use App\Models\VerificationLog;
use Closure;
use Illuminate\Http\Request;

class ChkVerifier
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();
        $ptt = $request->route('petition');
        $stpnow = $ptt->stepnow;
        // $route = $ptt->rulestep;
        $arstep = $user->ustep;
        if(!in_array($stpnow,$arstep)) return redirect('/activity');
        return $next($request);
    }
}
