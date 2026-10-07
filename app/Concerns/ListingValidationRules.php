<?php

namespace App\Concerns;

use App\Models\Professional;
use App\Models\VehicleProvider;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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
            ...$this->contactRules(Rule::unique(Professional::class)->ignore($ignoreId)),
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:60'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
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
            ...$this->providerTypeMessages(),
            'phone.regex' => __('Enter a phone number of at least 9 digits.'),
            'email.unique' => __('A professional with this email is already registered.'),
            'cover.image' => __('The cover must be an image.'),
            'cover.mimes' => __('The cover must be a JPG, PNG or WebP image.'),
            'cover.max' => __('The cover must be 5 MB or smaller.'),
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
            ...$this->contactRules(Rule::unique(VehicleProvider::class)->ignore($ignoreId)),
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
            ...$this->providerTypeMessages(),
            'phone.regex' => __('Enter a phone number of at least 9 digits.'),
            'email.unique' => __('A vehicle provider with this email is already registered.'),
        ];
    }

    /**
     * Stops a company being marked as verified while onboarding it before
     * its registration details and document are on file.
     */
    protected function companyVerificationCheck(): callable
    {
        return function (Validator $validator) {
            if (! $this->boolean('is_verified') || $this->input('provider_type') !== Professional::PROVIDER_COMPANY) {
                return;
            }

            if (blank($this->input('registry_number')) || blank($this->input('tax_id')) || ! $this->hasFile('business_registration')) {
                $validator->errors()->add('is_verified', __('Add the RCCM number, tax ID and business registration before verifying a company.'));
            }
        };
    }

    /**
     * Provider type, contact, location and registration fields shared by
     * both listings.
     *
     * @return array<string, array<mixed>>
     */
    private function contactRules(mixed $uniqueEmailRule): array
    {
        return [
            'provider_type' => ['sometimes', 'required', Rule::in(Professional::PROVIDER_TYPES)],
            'business_name' => ['nullable', 'required_if:provider_type,'.Professional::PROVIDER_COMPANY, 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^[0-9 ]{9,20}$/'],
            'is_on_whatsapp' => ['boolean'],
            'email' => ['nullable', 'email', 'max:255', $uniqueEmailRule],
            ...$this->locationRules(),
            'address' => ['nullable', 'string', 'max:255'],
            'registry_number' => ['nullable', 'string', 'max:50'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'preferred_language' => ['required', Rule::in(['fr', 'en'])],
            'identity_document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'business_registration' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }

    /**
     * Messages for the individual or company choice.
     *
     * @return array<string, string>
     */
    private function providerTypeMessages(): array
    {
        return [
            'provider_type.in' => __('Choose whether this is an individual or a company.'),
            'business_name.required_if' => __('Enter the company name.'),
            'business_registration.mimes' => __('Attach a PDF, JPG or PNG file.'),
            'business_registration.max' => __('The document must be 10 MB or smaller.'),
        ];
    }
}
