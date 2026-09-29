<?php

namespace Database\Factories;

use App\Models\QuoteRequest;
use App\Models\QuoteRequestPhoto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuoteRequestPhoto>
 */
class QuoteRequestPhotoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quote_request_id' => QuoteRequest::factory(),
            'path' => 'quote-requests/'.fake()->uuid().'.jpg',
            'position' => 0,
        ];
    }
}
