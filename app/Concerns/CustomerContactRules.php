<?php

namespace App\Concerns;

use App\Models\Customer;
use Illuminate\Validation\Rule;

/**
 * Contact details a customer gives on the public request forms.
 */
trait CustomerContactRules
{
    /**
     * @return array<string, array<mixed>>
     */
    protected function customerContactRules(bool $emailRequired = true): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^[0-9 ]{9,20}$/'],
            'email' => [$emailRequired ? 'required' : 'nullable', 'email', 'max:255'],
            'contact_channel' => ['nullable', Rule::in(Customer::CONTACT_CHANNELS)],
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function customerContactMessages(): array
    {
        return [
            'full_name.required' => __('Please enter your full name.'),
            'phone.required' => __('Please enter your phone number.'),
            'phone.regex' => __('Enter a phone number of at least 9 digits.'),
            'email.required' => __('Please enter your email address.'),
            'email.email' => __('Please enter a valid email address.'),
        ];
    }
}
