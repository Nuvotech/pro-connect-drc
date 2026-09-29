<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\City;
use App\Models\Customer;
use App\Models\ServiceRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServiceRequest>
 */
class ServiceRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory()->state(['organization' => fake()->company()]),
            'category_id' => fn () => Category::query()->inGroup(Category::GROUP_BUSINESS)->inRandomOrder()->value('id')
                ?? Category::factory()->business(),
            'description' => fake()->paragraph(3),
            'timeline' => fake()->randomElement(ServiceRequest::TIMELINES),
            'city_id' => fn () => City::query()->inRandomOrder()->value('id'),
            'status' => ServiceRequest::STATUS_NEW,
        ];
    }
}
