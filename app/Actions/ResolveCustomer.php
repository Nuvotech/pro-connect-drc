<?php

namespace App\Actions;

use App\Models\City;
use App\Models\Customer;
use App\Models\User;

/**
 * Finds the customer behind a public request, or creates a guest one, and
 * refreshes their contact details with what they just entered.
 */
class ResolveCustomer
{
    /**
     * @param  array{full_name: string, phone: string, email?: string|null, organization?: string|null, contact_channel?: string|null, city?: string|null, commune?: string|null}  $details
     */
    public function __invoke(array $details, ?User $user = null): Customer
    {
        $email = filled($details['email'] ?? null) ? mb_strtolower(trim($details['email'])) : null;

        $customer = ($user && $user->isCustomer() ? $user->customer : null)
            ?? ($email ? Customer::where('email', $email)->first() : null)
            ?? (! $email ? Customer::where('phone', $details['phone'])->whereNull('email')->first() : null)
            ?? new Customer;

        $customer->fill([
            'full_name' => $details['full_name'],
            'phone' => $details['phone'],
            'email' => $email ?? $customer->email,
            'organization' => $details['organization'] ?? $customer->organization,
            'preferred_contact_channel' => $details['contact_channel'] ?? $customer->preferred_contact_channel ?? 'whatsapp',
            'preferred_language' => app()->getLocale(),
            'is_on_whatsapp' => ($details['contact_channel'] ?? null) === 'whatsapp' || $customer->is_on_whatsapp,
        ]);

        if (filled($details['city'] ?? null) && filled($details['commune'] ?? null)) {
            $customer->placeIn($details['city'], $details['commune']);
        } elseif (filled($details['city'] ?? null)) {
            $customer->city()->associate(City::where('name', $details['city'])->first());
            $customer->commune()->associate(null);
        }

        if ($user && $user->isCustomer() && ! $customer->user_id) {
            $customer->user()->associate($user);
        }

        $customer->save();

        return $customer;
    }
}
