<?php

namespace Database\Factories;

use App\Models\Professional;
use App\Models\Quote;
use App\Models\QuoteRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Quote>
 */
class QuoteFactory extends Factory
{
    /**
     * Define the model's default state: a pro who has been invited to quote.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quote_request_id' => QuoteRequest::factory(),
            'professional_id' => Professional::factory(),
            'status' => Quote::STATUS_INVITED,
            'currency' => 'USD',
        ];
    }

    /**
     * The pro sent a price.
     */
    public function quoted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Quote::STATUS_QUOTED,
            'amount' => fake()->numberBetween(40, 2500),
            'message' => fake()->sentence(14),
            'estimated_duration' => fake()->randomElement(['Half a day', '1 day', '2–3 days', '1 week']),
            'responded_at' => now(),
        ]);
    }

    /**
     * The customer accepted the pro's price.
     */
    public function accepted(): static
    {
        return $this->quoted()->state(['status' => Quote::STATUS_ACCEPTED]);
    }

    /**
     * The pro finished the job.
     */
    public function completed(): static
    {
        return $this->quoted()->state(['status' => Quote::STATUS_COMPLETED, 'completed_at' => now()]);
    }
}
