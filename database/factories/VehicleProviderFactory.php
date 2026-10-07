<?php

namespace Database\Factories;

use App\Models\Commune;
use App\Models\VehicleProvider;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VehicleProvider>
 */
class VehicleProviderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'contact_name' => fake()->name(),
            'business_name' => fake()->company(),
            'phone' => '81'.fake()->numerify('#######'),
            'is_on_whatsapp' => fake()->boolean(),
            'email' => fake()->unique()->safeEmail(),
            'commune_id' => fn () => Commune::query()->inRandomOrder()->value('id') ?? Commune::factory(),
            'city_id' => fn (array $attributes) => Commune::query()->whereKey($attributes['commune_id'])->value('city_id'),
            'address' => fake()->optional()->streetAddress(),
            'registry_number' => null,
            'tax_id' => null,
            'preferred_language' => fake()->randomElement(['fr', 'en']),
        ];
    }

    /**
     * Place the provider in a commune, by name.
     */
    public function locatedIn(string $city, string $commune): static
    {
        return $this->state(function () use ($city, $commune) {
            $resolved = Commune::resolve($city, $commune);

            return ['city_id' => $resolved->city_id, 'commune_id' => $resolved->id];
        });
    }

    /**
     * Indicate that the provider has been verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'verified_at' => now(),
            'review_status' => 'approved',
        ]);
    }

    /**
     * Indicate that the provider is a registered company. Pass true to
     * include the registration details and document it is verified with.
     */
    public function company(bool $withRegistration = false): static
    {
        return $this->state(fn (array $attributes) => [
            'provider_type' => VehicleProvider::PROVIDER_COMPANY,
            'business_name' => fake()->company(),
            ...($withRegistration ? [
                'registry_number' => 'CD/KIN/RCCM/'.fake()->numerify('##-B-#####'),
                'tax_id' => fake()->numerify('01-##-N#####'),
                'business_registration_path' => 'vehicle-providers/documents/rccm.pdf',
            ] : []),
        ]);
    }
}
