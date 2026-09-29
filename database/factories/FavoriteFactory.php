<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Favorite;
use App\Models\Professional;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Favorite>
 */
class FavoriteFactory extends Factory
{
    /**
     * Define the model's default state: a saved professional.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'favoritable_type' => 'professional',
            'favoritable_id' => Professional::factory(),
        ];
    }
}
