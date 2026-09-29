<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::title(fake()->unique()->words(2, true));

        return [
            'group' => Category::GROUP_TRADE,
            'slug' => Str::slug($name),
            'name' => $name,
            'name_fr' => $name,
            'icon' => 'handyman',
            'summary' => fake()->sentence(),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }

    /**
     * A business-service category.
     */
    public function business(): static
    {
        return $this->state(['group' => Category::GROUP_BUSINESS]);
    }

    /**
     * A vehicle-type category.
     */
    public function vehicle(): static
    {
        return $this->state(['group' => Category::GROUP_VEHICLE]);
    }
}
