<?php

namespace Database\Factories;

use App\Models\Commune;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state: a guest who has not registered.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'organization' => null,
            'email' => fake()->unique()->safeEmail(),
            'phone' => '82'.fake()->numerify('#######'),
            'is_on_whatsapp' => fake()->boolean(70),
            'commune_id' => fn () => Commune::query()->inRandomOrder()->value('id') ?? Commune::factory(),
            'city_id' => fn (array $attributes) => Commune::query()->whereKey($attributes['commune_id'])->value('city_id'),
            'address' => fake()->optional()->streetAddress(),
            'preferred_language' => fake()->randomElement(['fr', 'en']),
            'preferred_contact_channel' => fake()->randomElement(Customer::CONTACT_CHANNELS),
        ];
    }

    /**
     * A customer with a registered account.
     */
    public function withAccount(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => User::factory()->customer()->state([
                'name' => $attributes['full_name'],
                'email' => $attributes['email'],
            ]),
        ]);
    }
}
