<?php

namespace App\Http\Requests\Admin;

use App\Concerns\ListingValidationRules;
use App\Concerns\ProAccountEmailRules;
use App\Concerns\VehicleValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleProviderRequest extends FormRequest
{
    use ListingValidationRules, ProAccountEmailRules, VehicleValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = $this->vehicleProviderListingRules();
        $rules['email'][] = $this->availableForProAccountRule('vehicle_provider');

        return [
            ...$rules,
            'is_verified' => ['boolean'],
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
