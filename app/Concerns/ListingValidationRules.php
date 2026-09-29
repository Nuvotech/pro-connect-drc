<?php

namespace App\Concerns;

use App\Models\Professional;
use App\Models\VehicleProvider;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ListingValidationRules
{
    use ReferenceDataRules;

    /**
     * Rules for a professional's listing details. Pass the listing's id
     * when updating it, so its own email is not treated as taken.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function professionalListingRules(?int $ignoreId = null): array
    {
        return [
            ...$this->professionalCategoryRules(),
            'full_name' => ['required', 'string', 'max:255'],
            'business_name' => ['nullable', 'string', 'max:255'],
            ...$this->contactRules(Rule::unique(Professional::class)->ignore($ignoreId)),
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:60'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'identity_document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }

    /**
     * Friendly messages for the professional listing rules.
     *
     * @return array<string, string>
     */
    protected function professionalListingMessages(): array
    {
        return [
            ...$this->referenceDataMessages(),
            'phone.regex' => __('Enter a phone number of at least 9 digits.'),
            'email.unique' => __('A professional with this email is already registered.'),
        ];
    }

    /**
     * Rules for a vehicle provider's business details.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function vehicleProviderListingRules(?int $ignoreId = null): array
    {
        return [
            'contact_name' => ['required', 'string', 'max:255'],
            'business_name' => ['nullable', 'string', 'max:255'],
            ...$this->contactRules(Rule::unique(VehicleProvider::class)->ignore($ignoreId)),
            'identity_document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }

    /**
     * Friendly messages for the vehicle provider rules.
     *
     * @return array<string, string>
     */
    protected function vehicleProviderListingMessages(): array
    {
        return [
            ...$this->referenceDataMessages(),
            'phone.regex' => __('Enter a phone number of at least 9 digits.'),
            'email.unique' => __('A vehicle provider with this email is already registered.'),
        ];
    }

    /**
     * Contact, location and registration fields shared by both listings.
     *
     * @return array<string, array<mixed>>
     */
    private function contactRules(mixed $uniqueEmailRule): array
    {
        return [
            'phone' => ['required', 'string', 'regex:/^[0-9 ]{9,20}$/'],
            'is_on_whatsapp' => ['boolean'],
            'email' => ['nullable', 'email', 'max:255', $uniqueEmailRule],
            ...$this->locationRules(),
            'address' => ['nullable', 'string', 'max:255'],
            'registry_number' => ['nullable', 'string', 'max:50'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'preferred_language' => ['required', Rule::in(['fr', 'en'])],
        ];
    }
}
