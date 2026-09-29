<?php

namespace App\Http\Requests\Pro;

use App\Concerns\ListingValidationRules;
use App\Concerns\VehicleValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * A pro setting up their fleet listing with its first vehicles.
 */
class StoreFleetRequest extends FormRequest
{
    use ListingValidationRules, VehicleValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...$this->vehicleProviderListingRules(),
            'vehicles' => ['required', 'array', 'min:1', 'max:50'],
            ...$this->vehicleRules('vehicles.*.'),
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
            ...$this->vehicleProviderListingMessages(),
            'vehicles.required' => __('Add at least one vehicle.'),
            ...$this->vehicleMessages('vehicles.*.'),
        ];
    }
}
