<?php

namespace App\Http\Requests\Pro;

use App\Concerns\VehicleValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * A pro adding a vehicle, with all 6 photos, to their fleet.
 */
class StoreVehicleRequest extends FormRequest
{
    use VehicleValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->vehicleRules();
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->vehicleMessages();
    }
}
