<?php

namespace App\Http\Requests\Pro;

use App\Concerns\ListingValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * A pro editing their fleet listing's business details.
 */
class UpdateFleetRequest extends FormRequest
{
    use ListingValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->vehicleProviderListingRules($this->user()->vehicleProvider?->id);
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->vehicleProviderListingMessages();
    }
}
