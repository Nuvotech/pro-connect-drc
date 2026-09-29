<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Commune;
use App\Models\ProApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProApplication>
 */
class ProApplicationFactory extends Factory
{
    /**
     * Define the model's default state: a pending application.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->unapprovedPro(),
            'full_name' => fake()->name(),
            'business_name' => fake()->optional()->company(),
            'phone' => '81'.fake()->numerify('#######'),
            'is_on_whatsapp' => fake()->boolean(),
            'commune_id' => fn () => Commune::query()->inRandomOrder()->value('id') ?? Commune::factory(),
            'city_id' => fn (array $attributes) => Commune::query()->whereKey($attributes['commune_id'])->value('city_id'),
            'description' => fake()->optional()->sentence(12),
            'status' => ProApplication::STATUS_PENDING,
        ];
    }

    /**
     * Apply for the categories with these slugs.
     *
     * @param  list<string>  $slugs
     */
    public function forCategories(array $slugs): static
    {
        return $this->afterCreating(function (ProApplication $application) use ($slugs) {
            $application->categories()->sync(Category::idsForSlugs($slugs));
        });
    }

    /**
     * Add services the applicant typed in themselves.
     *
     * @param  list<string>  $names
     */
    public function withCustomServices(array $names): static
    {
        return $this->afterCreating(function (ProApplication $application) use ($names) {
            foreach ($names as $name) {
                $application->customServices()->create(['name' => $name]);
            }
        });
    }

    /**
     * An application that has been approved, with the account unlocked.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProApplication::STATUS_APPROVED,
            'reviewed_at' => now(),
            'user_id' => User::factory()->approvedPro(),
        ]);
    }
}
