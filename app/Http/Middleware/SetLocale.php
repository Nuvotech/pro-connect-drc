<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Picks French or English for the request: a `?lang=` link, then the
 * visitor's choice this session, then their account's language, then the
 * app default (French).
 */
class SetLocale
{
    /**
     * The languages the app is translated into.
     */
    public const SUPPORTED = ['fr', 'en'];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = collect([
            $request->query('lang'),
            $request->session()->get('locale'),
            $request->user()?->locale,
            config('app.locale'),
        ])->first(fn (mixed $candidate) => is_string($candidate) && in_array($candidate, self::SUPPORTED, true));

        if ($request->query('lang') === $locale) {
            $request->session()->put('locale', $locale);
        }

        App::setLocale($locale);
        Carbon::setLocale($locale);

        return $next($request);
    }
}
