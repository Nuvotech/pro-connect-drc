<?php

namespace App\Http\Requests;

use App\Concerns\CustomerContactRules;
use App\Models\City;
use App\Models\Vehicle;
use App\Models\VehicleProvider;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * A customer asking to hire one of a fleet's vehicles.
 */
class StoreVehicleBookingRequest extends FormRequest
{
    use CustomerContactRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'vehicle_id' => ['required', 'integer', Rule::exists(Vehicle::class, 'id')->where('vehicle_provider_id', $this->provider()->id)],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'quantity' => ['required', 'integer', 'min:1', 'max:500'],
            'with_driver' => ['boolean'],
            'pickup_location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'city' => ['nullable', 'string', Rule::exists(City::class, 'name')],
            ...$this->customerContactRules(emailRequired: false),
        ];
    }

    /**
     * Check the booking against the chosen vehicle's terms.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->hasAny(['vehicle_id', 'start_date', 'end_date', 'quantity'])) {
                    return;
                }

                $vehicle = $this->vehicle();
                $days = CarbonImmutable::parse($this->input('start_date'))->diffInDays(CarbonImmutable::parse($this->input('end_date'))) + 1;

                if ((int) $this->input('quantity') > $vehicle->quantity) {
                    $validator->errors()->add('quantity', "Only {$vehicle->quantity} of this vehicle are available.");
                }

                if ($days < $vehicle->minimum_rental_days) {
                    $validator->errors()->add('end_date', "This vehicle is rented for at least {$vehicle->minimum_rental_days} days.");
                }

                $withDriver = $this->boolean('with_driver');

                if ($withDriver && $vehicle->driver_option === 'self_drive') {
                    $validator->errors()->add('with_driver', 'This vehicle is only available without a driver.');
                }

                if (! $withDriver && $vehicle->driver_option === 'with_driver') {
                    $validator->errors()->add('with_driver', 'This vehicle is only available with a driver.');
                }
            },
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
            'vehicle_id.exists' => __('Choose a vehicle from this fleet.'),
            'start_date.after_or_equal' => __('The start date cannot be in the past.'),
            'end_date.after_or_equal' => __('The return date must be on or after the start date.'),
        ];
    }

    /**
     * The fleet being booked, from the route.
     */
    public function provider(): VehicleProvider
    {
        return $this->route('vehicleProvider');
    }

    /**
     * The vehicle being booked.
     */
    public function vehicle(): Vehicle
    {
        return $this->provider()->vehicles()->findOrFail($this->integer('vehicle_id'));
    }
}
