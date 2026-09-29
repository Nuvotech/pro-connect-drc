<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database: reference data, then the demo
     * accounts, listings and customer activity. Model events stay on so
     * slugs, references and cached ratings are filled in.
     */
    public function run(): void
    {
        $this->call([
            ReferenceDataSeeder::class,
            AccountSeeder::class,
            ProfessionalSeeder::class,
            VehicleProviderSeeder::class,
            ProApplicationSeeder::class,
            CustomerSeeder::class,
        ]);
    }
}
