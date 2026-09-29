<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Commune;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Commune>
 */
class CommuneFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'city_id' => City::factory(),
            'name' => fake()->unique()->streetName(),
        ];
    }
}
