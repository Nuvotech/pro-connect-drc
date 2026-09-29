<?php

namespace App\Http\Requests\Pro;

use App\Concerns\ListingValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * A pro setting up or editing their own service listing.
 */
class SaveProfessionalListingRequest extends FormRequest
{
    use ListingValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->professionalListingRules($this->user()->professional?->id);
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
