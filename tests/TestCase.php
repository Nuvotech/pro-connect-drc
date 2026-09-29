<?php

namespace Tests;

use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    /**
     * Seed the cities, communes and categories before each test.
     */
    protected bool $seed = true;

    /**
     * @var class-string
     */
    protected string $seeder = ReferenceDataSeeder::class;

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
