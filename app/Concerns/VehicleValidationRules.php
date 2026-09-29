<?php

namespace App\Concerns;

use App\Models\Category;
use App\Models\Vehicle;
use App\Models\VehiclePhoto;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait VehicleValidationRules
{
    /**
     * Rules for one vehicle's fields. Pass `vehicles.*.` to validate a
     * fleet, or an empty prefix for a single-vehicle form.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function vehicleRules(string $prefix = '', bool $photosRequired = true): array
    {
        $photoRule = $photosRequired ? 'required' : 'nullable';

        return [
            "{$prefix}category" => ['required', Rule::exists(Category::class, 'slug')->where('group', Category::GROUP_VEHICLE)->where('is_active', true)],
            "{$prefix}make" => ['required', 'string', 'max:100'],
            "{$prefix}model" => ['required', 'string', 'max:100'],
            "{$prefix}year" => ['required', 'integer', 'min:1980', 'max:'.(now()->year + 1)],
            "{$prefix}registration_number" => ['required', 'string', 'max:20'],
            "{$prefix}transmission" => ['required', Rule::in(Vehicle::TRANSMISSIONS)],
            "{$prefix}fuel_type" => ['required', Rule::in(Vehicle::FUEL_TYPES)],
            "{$prefix}seats" => ['nullable', 'integer', 'min:1', 'max:80'],
            "{$prefix}payload_tonnes" => ['nullable', 'numeric', 'min:0', 'max:200'],
            "{$prefix}driver_option" => ['required', Rule::in(Vehicle::DRIVER_OPTIONS)],
            "{$prefix}daily_rate" => ['required', 'numeric', 'min:1', 'max:9999999'],
            "{$prefix}currency" => ['required', Rule::in(Vehicle::CURRENCIES)],
            "{$prefix}deposit" => ['nullable', 'numeric', 'min:0', 'max:9999999'],
            "{$prefix}minimum_rental_days" => ['nullable', 'integer', 'min:1', 'max:365'],
            "{$prefix}quantity" => ['nullable', 'integer', 'min:1', 'max:500'],
            "{$prefix}insurance_expires_on" => ['nullable', 'date'],
            "{$prefix}notes" => ['nullable', 'string', 'max:1000'],
            "{$prefix}photos" => [$photoRule, 'array:'.implode(',', array_keys(VehiclePhoto::ANGLES))],
            ...collect(VehiclePhoto::ANGLES)
                ->mapWithKeys(fn (string $label, string $angle) => [
                    "{$prefix}photos.{$angle}" => [$photoRule, 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
                ])
                ->all(),
        ];
    }

    /**
     * Friendly messages for the vehicle rules.
     *
     * @return array<string, string>
     */
    protected function vehicleMessages(string $prefix = ''): array
    {
        return [
            "{$prefix}category.required" => 'Choose a vehicle type.',
            "{$prefix}category.exists" => 'Choose a vehicle type from the list.',
            "{$prefix}make.required" => 'Enter the make.',
            "{$prefix}model.required" => 'Enter the model.',
            "{$prefix}year.required" => 'Enter the year.',
            "{$prefix}year.min" => 'Enter a year from 1980 onwards.',
            "{$prefix}year.max" => 'Enter a valid year.',
            "{$prefix}registration_number.required" => 'Enter the number plate.',
            "{$prefix}transmission.required" => 'Choose a transmission.',
            "{$prefix}fuel_type.required" => 'Choose a fuel type.',
            "{$prefix}driver_option.required" => 'Choose how it can be hired.',
            "{$prefix}daily_rate.required" => 'Enter the daily rate.',
            "{$prefix}daily_rate.min" => 'The daily rate must be at least 1.',
            "{$prefix}photos.required" => 'Add the 6 required photos.',
            "{$prefix}photos.array" => 'Only the 6 required photos can be uploaded.',
            ...collect(VehiclePhoto::ANGLES)
                ->mapWithKeys(fn (string $label, string $angle) => [
                    "{$prefix}photos.{$angle}.required" => "Add a photo of the {$label}.",
                    "{$prefix}photos.{$angle}.image" => "The {$label} photo must be an image.",
                    "{$prefix}photos.{$angle}.max" => "The {$label} photo must be 5 MB or smaller.",
                ])
                ->all(),
        ];
    }
}
