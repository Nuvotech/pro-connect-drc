<?php

use App\Models\Professional;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleProvider;
use Inertia\Testing\AssertableInertia as Assert;

test('an approved pro without a listing is asked to set one up', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('overviews', [])
            ->where('setup', ['services' => true, 'vehicles' => true])
            ->where('auth.pro.listings', ['professional' => null, 'vehicleProvider' => null]));
});

test('a service professional sees their listing status and checklist', function () {
    $pro = User::factory()->create();
    Professional::factory()->for($pro)->withCategories(['plumbers', 'hvac'])->create([
        'business_name' => 'Dupont Plomberie',
        'photo_path' => null,
    ]);

    $this->actingAs($pro)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('overviews.0.type', 'professional')
            ->where('overviews.0.name', 'Dupont Plomberie')
            ->where('overviews.0.isVerified', false)
            ->where('overviews.0.checklist.1', ['key' => 'photo', 'label' => 'Profile photo added', 'isDone' => false])
            ->where('overviews.0.stats.0', ['label' => 'Services', 'value' => '2'])
            ->where('auth.pro.listings.vehicleProvider', null));
});

test('a vehicle provider sees their fleet summary', function () {
    $pro = User::factory()->create();
    $provider = VehicleProvider::factory()->verified()->for($pro)->create();
    Vehicle::factory()->for($provider, 'provider')->create(['quantity' => 4, 'daily_rate' => 90]);
    Vehicle::factory()->for($provider, 'provider')->create(['quantity' => 2, 'daily_rate' => 250]);

    $this->actingAs($pro)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('overviews.0.type', 'vehicle_provider')
            ->where('overviews.0.isVerified', true)
            ->where('overviews.0.stats', [
                ['label' => 'Vehicles', 'value' => '6'],
                ['label' => 'Models', 'value' => '2'],
                ['label' => 'From / day', 'value' => '$90'],
            ])
            ->where('overviews.0.checklist.1', ['key' => 'vehicle_photos', 'label' => 'All 6 photos for every vehicle', 'isDone' => false])
            ->where('auth.pro.listings.professional', null));
});
