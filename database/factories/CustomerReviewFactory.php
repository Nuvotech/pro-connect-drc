<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\CustomerReview;
use App\Models\Professional;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CustomerReview>
 */
class CustomerReviewFactory extends Factory
{
    /**
     * Define the model's default state: a published review of a professional.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reviewable_type' => 'professional',
            'reviewable_id' => Professional::factory(),
            'customer_id' => Customer::factory(),
            'rating' => fake()->numberBetween(3, 5),
            'comment' => fake()->paragraph(),
            'published_at' => now(),
        ];
    }

    /**
     * A review still waiting for moderation.
     */
    public function unpublished(): static
    {
        return $this->state(['published_at' => null]);
    }
}
