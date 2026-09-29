<?php

namespace App\Http\Requests\Capture;

use App\Concerns\VehicleValidationRules;
use App\Models\Vehicle;
use App\Models\VehicleProvider;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * A capturer adding or correcting a vehicle in a fleet they added, before
 * the fleet is approved. New vehicles need all six photos; edits only
 * replace the photos that are uploaded.
 */
class SaveCapturedVehicleRequest extends FormRequest
{
    use VehicleValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('editCapture', $this->fleet());
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->vehicleRules(photosRequired: ! $this->route('vehicle'));
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

    /**
     * The fleet the vehicle belongs to.
     */
    public function fleet(): VehicleProvider
    {
        $vehicle = $this->route('vehicle');

        return $vehicle instanceof Vehicle ? $vehicle->provider : $this->route('vehicleProvider');
    }
}
