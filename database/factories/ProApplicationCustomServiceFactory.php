<?php

namespace Database\Factories;

use App\Models\ProApplication;
use App\Models\ProApplicationCustomService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProApplicationCustomService>
 */
class ProApplicationCustomServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'pro_application_id' => ProApplication::factory(),
            'name' => fake()->words(2, true),
        ];
    }
}
