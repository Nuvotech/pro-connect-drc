<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Vehicle;
use App\Models\VehicleBooking;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VehicleBooking>
 */
class VehicleBookingFactory extends Factory
{
    /**
     * Define the model's default state. The rate and provider come from the
     * vehicle, as they do for a real booking.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-2 months', '+1 month');
        $days = fake()->numberBetween(1, 10);

        return [
            'customer_id' => Customer::factory(),
            'vehicle_id' => Vehicle::factory(),
            'vehicle_provider_id' => fn (array $attributes) => Vehicle::query()->whereKey($attributes['vehicle_id'])->value('vehicle_provider_id'),
            'start_date' => $startDate,
            'end_date' => (clone $startDate)->modify('+'.($days - 1).' days'),
            'quantity' => 1,
            'with_driver' => fake()->boolean(),
            'pickup_location' => fake()->streetAddress(),
            'notes' => fake()->optional()->sentence(),
            'daily_rate' => fn (array $attributes) => Vehicle::query()->whereKey($attributes['vehicle_id'])->value('daily_rate'),
            'currency' => fn (array $attributes) => Vehicle::query()->whereKey($attributes['vehicle_id'])->value('currency'),
            'estimated_total' => fn (array $attributes) => (float) $attributes['daily_rate'] * $days * $attributes['quantity'],
            'status' => VehicleBooking::STATUS_REQUESTED,
        ];
    }

    /**
     * The fleet accepted the hire.
     */
    public function confirmed(): static
    {
        return $this->state(['status' => VehicleBooking::STATUS_CONFIRMED, 'responded_at' => now()]);
    }

    /**
     * The hire is over.
     */
    public function completed(): static
    {
        return $this->confirmed()->state(['status' => VehicleBooking::STATUS_COMPLETED]);
    }
}
