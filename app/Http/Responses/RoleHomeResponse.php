<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sends people to their own workspace after logging in or registering:
 * admins to the admin panel, pros to their dashboard.
 */
class RoleHomeResponse implements LoginResponse, RegisterResponse, TwoFactorLoginResponse
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  Request  $request
     */
    public function toResponse($request): Response
    {
        if ($request->wantsJson()) {
            return new JsonResponse(['two_factor' => false]);
        }

        $user = $request->user();

        if ($user?->isAdmin()) {
            return redirect()->intended(route('admin.applications'));
        }

        if ($user?->isCapturer()) {
            $request->session()->forget('url.intended');

            return redirect()->route('captures.index');
        }

        $intended = $request->session()->pull('url.intended');

        if ($intended && ! str_starts_with(parse_url($intended, PHP_URL_PATH) ?? '', '/admin')) {
            return redirect()->to($intended);
        }

        return redirect()->route($user?->isCustomer() ? 'account.index' : 'dashboard');
    }
}
