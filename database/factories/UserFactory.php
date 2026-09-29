<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state: a pro who is already approved to
     * use the dashboard.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
            'pro_approved_at' => now(),
        ];
    }

    /**
     * Indicate that the user administers the platform.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_ADMIN,
            'pro_approved_at' => null,
        ]);
    }

    /**
     * Indicate that the pro has been approved to use the dashboard.
     */
    public function approvedPro(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_PRO,
            'pro_approved_at' => now(),
        ]);
    }

    /**
     * Indicate that the pro applied but has not been approved yet.
     */
    public function unapprovedPro(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_PRO,
            'pro_approved_at' => null,
        ]);
    }

    /**
     * Indicate that the user is a customer.
     */
    public function customer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => User::ROLE_CUSTOMER,
            'pro_approved_at' => null,
        ]);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at' => now(),
        ]);
    }
}
