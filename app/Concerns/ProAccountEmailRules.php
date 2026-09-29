<?php

namespace App\Concerns;

use App\Models\User;
use Closure;

trait ProAccountEmailRules
{
    /**
     * An email given for a new listing must be free to link to a pro
     * account: not an admin's or a customer's, and not a pro who already
     * has this kind of listing.
     *
     * @param  'professional'|'vehicle_provider'  $listingType
     * @return Closure(string, mixed, Closure(string): void): void
     */
    protected function availableForProAccountRule(string $listingType): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) use ($listingType): void {
            $user = User::where('email', $value)->first();

            if (! $user) {
                return;
            }

            if ($user->isAdmin()) {
                $fail(__('This email belongs to an admin account.'));

                return;
            }

            if ($user->isCustomer()) {
                $fail(__('This email belongs to a customer account.'));

                return;
            }

            if ($listingType === 'professional' ? $user->hasProfessionalListing() : $user->hasFleet()) {
                $fail(__('This email is already linked to another listing.'));
            }
        };
    }
}
