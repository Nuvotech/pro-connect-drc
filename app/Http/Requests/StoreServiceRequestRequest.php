<?php

namespace App\Http\Requests;

use App\Concerns\CustomerContactRules;
use App\Concerns\ReferenceDataRules;
use App\Models\Category;
use App\Models\City;
use App\Models\ServiceRequest;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * A company asking for a business service through the public form.
 */
class StoreServiceRequestRequest extends FormRequest
{
    use CustomerContactRules, ReferenceDataRules;

    /**
     * The choice for places outside the cities we serve.
     */
    public const OTHER_PROVINCE = 'other';

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category' => ['required', 'string', $this->categoryExists(Category::GROUP_BUSINESS)],
            'description' => ['required', 'string', 'min:10', 'max:2000'],
            'timeline' => ['required', Rule::in(ServiceRequest::TIMELINES)],
            ...$this->customerContactRules(),
            'organization' => ['nullable', 'string', 'max:255'],
            'province' => ['required', 'string', Rule::in([...City::query()->pluck('name')->all(), self::OTHER_PROVINCE])],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
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
            ...$this->customerContactMessages(),
            'category.exists' => __('Please choose a business service.'),
            'description.required' => __('Please briefly describe your request.'),
            'description.min' => __('Please briefly describe your request.'),
            'attachment.mimes' => __('Attach a PDF, JPG or PNG file.'),
            'attachment.max' => __('The attachment must be 10 MB or smaller.'),
        ];
    }
}
