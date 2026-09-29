<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProIsApproved
{
    /**
     * Only let approved pros set up and manage listings. Everyone else is
     * sent to the dashboard, which shows where their application stands.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isApprovedPro()) {
            return to_route('dashboard');
        }

        return $next($request);
    }
}
