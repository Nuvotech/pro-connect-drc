<?php

namespace App\Http\Requests\Auth;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Concerns\ReferenceDataRules;
use App\Models\Category;
use App\Models\ProApplication;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * The short "Become a pro" application: who the person is and what they
 * want to offer. The full listing is built in the dashboard once approved.
 */
class ProRegistrationRequest extends FormRequest
{
    use PasswordValidationRules, ProfileValidationRules, ReferenceDataRules;

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'custom_services' => collect($this->input('custom_services', []))
                ->map(fn (mixed $service) => is_string($service) ? trim($service) : $service)
                ->filter(fn (mixed $service) => filled($service))
                ->values()
                ->all(),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => $this->nameRules(),
            'business_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^[0-9 ]{9,20}$/'],
            'is_on_whatsapp' => ['boolean'],
            'email' => $this->emailRules(),
            ...$this->locationRules(),
            'categories' => ['required_without:custom_services', 'array'],
            'categories.*' => ['string', 'distinct', $this->categoryExists(array_keys(Category::GROUP_LABELS))],
            'custom_services' => ['required_without:categories', 'array', 'max:'.ProApplication::MAX_CUSTOM_SERVICES],
            'custom_services.*' => ['string', 'max:60', 'distinct:ignore_case'],
            'description' => ['nullable', 'string', 'max:1000'],
            'password' => $this->passwordRules(),
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            ...$this->referenceDataMessages(),
            'full_name.required' => __('Please enter your full name.'),
            'phone.regex' => __('Enter a phone number of at least 9 digits.'),
            'email.unique' => __('An account with this email already exists. Log in instead.'),
            'categories.required_without' => __('Choose at least one service, or add your own.'),
            'custom_services.required_without' => __('Choose at least one service, or add your own.'),
            'custom_services.max' => __('You can add up to :count services of your own.', ['count' => ProApplication::MAX_CUSTOM_SERVICES]),
            'custom_services.*.max' => __('Keep each service under 60 characters.'),
            'custom_services.*.distinct' => __('You added this service twice.'),
        ];
    }
}
