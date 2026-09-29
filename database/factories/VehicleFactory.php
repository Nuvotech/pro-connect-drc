<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Vehicle;
use App\Models\VehicleProvider;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vehicle>
 */
class VehicleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'vehicle_provider_id' => VehicleProvider::factory(),
            'category_id' => fn () => Category::query()->where('slug', 'pick-ups-4x4s')->value('id')
                ?? Category::factory()->vehicle(),
            'make' => 'Toyota',
            'model' => 'Hilux Double Cab',
            'year' => fake()->numberBetween(2012, 2024),
            'registration_number' => strtoupper(fake()->bothify('####??##')),
            'transmission' => fake()->randomElement(Vehicle::TRANSMISSIONS),
            'fuel_type' => 'diesel',
            'seats' => 5,
            'payload_tonnes' => null,
            'driver_option' => fake()->randomElement(Vehicle::DRIVER_OPTIONS),
            'daily_rate' => fake()->numberBetween(60, 300),
            'currency' => 'USD',
            'deposit' => null,
            'minimum_rental_days' => 1,
            'quantity' => 1,
            'insurance_expires_on' => null,
            'notes' => null,
        ];
    }
}
