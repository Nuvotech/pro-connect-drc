<?php

namespace App\Http\Requests;

use App\Concerns\CustomerContactRules;
use App\Concerns\ReferenceDataRules;
use App\Models\Category;
use App\Models\Professional;
use App\Models\QuoteRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * A customer asking for quotes through the public wizard.
 */
class StoreQuoteRequestRequest extends FormRequest
{
    use CustomerContactRules, ReferenceDataRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category' => ['required', 'string', $this->categoryExists(Category::PROFESSIONAL_GROUPS)],
            'professional' => ['nullable', 'string', Rule::exists(Professional::class, 'slug')->whereNotNull('verified_at')],
            'service_type' => ['required', Rule::in(QuoteRequest::SERVICE_TYPES)],
            'description' => ['required', 'string', 'min:30', 'max:500'],
            'timing' => ['required', Rule::in(QuoteRequest::TIMINGS)],
            ...$this->locationRules(),
            'address' => ['nullable', 'string', 'max:255'],
            'assessment' => ['required', Rule::in(['in_person', 'remote'])],
            ...$this->customerContactRules(emailRequired: false),
            'email' => ['nullable', 'required_if:contact_channel,email', 'email', 'max:255'],
            'photos' => ['nullable', 'array', 'max:'.QuoteRequest::MAX_PHOTOS],
            'photos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
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
            ...$this->customerContactMessages(),
            'email.required_if' => __('Enter your email address, or choose WhatsApp or a phone call.'),
            'category.required' => __('Please choose a service category.'),
            'category.exists' => __('Please choose a service category.'),
            'description.min' => __('Please describe your project in at least 30 characters.'),
            'description.max' => __('Please keep your description under 500 characters.'),
            'photos.max' => __('You can add up to :count photos.', ['count' => QuoteRequest::MAX_PHOTOS]),
            'photos.*.image' => __('Each photo must be an image.'),
            'photos.*.max' => __('Each photo must be 10 MB or smaller.'),
        ];
    }
}
