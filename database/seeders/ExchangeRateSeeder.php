<?php

namespace Database\Seeders;

use App\Models\ExchangeRate;
use Illuminate\Database\Seeder;

/**
 * A starting USD to CDF rate, so prices convert before the first daily
 * fetch. Safe to run more than once.
 */
class ExchangeRateSeeder extends Seeder
{
    /**
     * Seed the starting rate.
     */
    public function run(): void
    {
        if (ExchangeRate::query()->exists()) {
            return;
        }

        ExchangeRate::create([
            'rate' => 2300,
            'source' => ExchangeRate::SOURCE_API,
            'effective_at' => now(),
        ]);
    }
}
