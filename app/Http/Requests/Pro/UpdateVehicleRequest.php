<?php

namespace App\Http\Requests\Pro;

use App\Concerns\VehicleValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * A pro editing a vehicle. Photos are optional: any uploaded replace the
 * current photo for that angle.
 */
class UpdateVehicleRequest extends FormRequest
{
    use VehicleValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('vehicle'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->vehicleRules(photosRequired: false);
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
