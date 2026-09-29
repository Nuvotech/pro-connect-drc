<?php

namespace Database\Factories;

use App\Models\ExchangeRate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExchangeRate>
 */
class ExchangeRateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'base' => 'USD',
            'quote' => 'CDF',
            'rate' => fake()->randomFloat(2, 2500, 3000),
            'source' => ExchangeRate::SOURCE_API,
            'effective_at' => now(),
        ];
    }

    /**
     * A rate an admin set by hand.
     */
    public function manual(): static
    {
        return $this->state(fn (array $attributes) => [
            'source' => ExchangeRate::SOURCE_MANUAL,
        ]);
    }
}
