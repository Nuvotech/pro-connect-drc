<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Commune;
use App\Models\Professional;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Professional>
 */
class ProfessionalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'business_name' => fake()->optional()->company(),
            'phone' => '81'.fake()->numerify('#######'),
            'is_on_whatsapp' => fake()->boolean(),
            'email' => fake()->unique()->safeEmail(),
            'commune_id' => fn () => Commune::query()->inRandomOrder()->value('id') ?? Commune::factory(),
            'city_id' => fn (array $attributes) => Commune::query()->whereKey($attributes['commune_id'])->value('city_id'),
            'address' => fake()->optional()->streetAddress(),
            'experience_years' => fake()->numberBetween(1, 25),
            'registry_number' => null,
            'tax_id' => null,
            'bio' => fake()->optional()->sentence(12),
            'preferred_language' => fake()->randomElement(['fr', 'en']),
        ];
    }

    /**
     * Give every professional at least one trade unless a test chose some.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Professional $professional): void {
            if ($professional->categories()->exists()) {
                return;
            }

            $category = Category::query()->inGroup(Category::GROUP_TRADE)->inRandomOrder()->first()
                ?? Category::factory()->create();

            $professional->categories()->attach($category);
        });
    }

    /**
     * List the professional under the categories with these slugs.
     *
     * @param  list<string>  $slugs
     */
    public function withCategories(array $slugs): static
    {
        return $this->afterCreating(fn (Professional $professional) => $professional->syncCategories($slugs));
    }

    /**
     * Place the professional in a commune, by name.
     */
    public function locatedIn(string $city, string $commune): static
    {
        return $this->state(function () use ($city, $commune) {
            $resolved = Commune::resolve($city, $commune);

            return ['city_id' => $resolved->city_id, 'commune_id' => $resolved->id];
        });
    }

    /**
     * Indicate that the professional has been verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'verified_at' => now(),
            'review_status' => 'approved',
        ]);
    }
}
