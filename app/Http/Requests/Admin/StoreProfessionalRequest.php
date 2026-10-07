<?php

namespace App\Http\Requests\Admin;

use App\Concerns\ListingValidationRules;
use App\Concerns\ProAccountEmailRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProfessionalRequest extends FormRequest
{
    use ListingValidationRules, ProAccountEmailRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = $this->professionalListingRules();
        $rules['email'][] = $this->availableForProAccountRule('professional');

        return [
            ...$rules,
            'is_verified' => ['boolean'],
        ];
    }

    /**
     * Get the "after" validation callables for the request.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [$this->companyVerificationCheck()];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->professionalListingMessages();
    }
}
