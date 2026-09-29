<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Commune;
use App\Models\Customer;
use App\Models\QuoteRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuoteRequest>
 */
class QuoteRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'category_id' => fn () => Category::query()->inGroup(Category::GROUP_TRADE)->inRandomOrder()->value('id')
                ?? Category::factory(),
            'service_type' => fake()->randomElement(QuoteRequest::SERVICE_TYPES),
            'description' => fake()->paragraph(3),
            'timing' => fake()->randomElement(QuoteRequest::TIMINGS),
            'commune_id' => fn () => Commune::query()->inRandomOrder()->value('id') ?? Commune::factory(),
            'city_id' => fn (array $attributes) => Commune::query()->whereKey($attributes['commune_id'])->value('city_id'),
            'address' => fake()->streetAddress(),
            'needs_site_visit' => fake()->boolean(),
            'contact_channel' => fake()->randomElement(Customer::CONTACT_CHANNELS),
            'status' => QuoteRequest::STATUS_OPEN,
        ];
    }
}
