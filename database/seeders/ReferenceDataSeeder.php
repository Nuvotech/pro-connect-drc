<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * The lookup data every environment needs: cities, communes and
 * categories. Tests seed it too.
 */
class ReferenceDataSeeder extends Seeder
{
    /**
     * Seed the reference tables.
     */
    public function run(): void
    {
        $this->call([
            CitySeeder::class,
            CategorySeeder::class,
            ExchangeRateSeeder::class,
        ]);
    }
}
