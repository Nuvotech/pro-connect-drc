<?php

use App\Models\Category;
use App\Models\Professional;
use App\Models\Vehicle;
use App\Models\VehicleProvider;
use App\Support\VisitorCity;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * One verified plumber in Kinshasa and one in Goma.
 *
 * @return array{kinshasa: Professional, goma: Professional}
 */
function plumbersInTwoTowns(): array
{
    return [
        'kinshasa' => Professional::factory()->verified()->withCategories(['plumbers'])->locatedIn('Kinshasa', 'Gombe')->create(['rating_average' => 4.0]),
        'goma' => Professional::factory()->verified()->withCategories(['plumbers'])->locatedIn('Goma', 'Goma')->create(['rating_average' => 4.5]),
    ];
}

test('search shows pros in the visitor\'s town by default', function () {
    ['goma' => $goma] = plumbersInTwoTowns();

    $this->withUnencryptedCookie(VisitorCity::COOKIE, 'Goma')
        ->get(route('search'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('professionals.data', 1)
            ->where('professionals.data.0.slug', $goma->slug)
            ->where('filters.location', 'Goma')
            ->where('filters.locationIsVisitorDefault', true));
});

test('visitors can look at another town or the whole DRC from search', function (string $location, int $count) {
    plumbersInTwoTowns();

    $this->withUnencryptedCookie(VisitorCity::COOKIE, 'Goma')
        ->get(route('search', ['location' => $location]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('professionals.data', $count)
            ->where('filters.locationIsVisitorDefault', false));
})->with([
    'another town' => ['Kinshasa', 1],
    'the whole DRC' => [VisitorCity::ALL, 2],
]);

test('without a town every pro is shown', function (?string $cookie) {
    plumbersInTwoTowns();

    $request = $cookie === null ? $this : $this->withUnencryptedCookie(VisitorCity::COOKIE, $cookie);

    $request->get(route('search'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('professionals.data', 2)
            ->where('filters.location', ''));
})->with([
    'no cookie' => [null],
    'whole DRC chosen' => [VisitorCity::ALL],
    'a town we do not serve' => ['Paris'],
]);

test('the vehicle list shows fleets in the visitor\'s town by default', function () {
    $pickUps = Category::where('slug', 'pick-ups-4x4s')->sole();
    $gomaFleet = VehicleProvider::factory()->verified()->locatedIn('Goma', 'Goma')->create();
    $kinshasaFleet = VehicleProvider::factory()->verified()->locatedIn('Kinshasa', 'Gombe')->create();
    $gomaVehicle = Vehicle::factory()->for($gomaFleet, 'provider')->create(['category_id' => $pickUps->id]);
    Vehicle::factory()->for($kinshasaFleet, 'provider')->create(['category_id' => $pickUps->id]);

    $this->withUnencryptedCookie(VisitorCity::COOKIE, 'Goma')
        ->get(route('vehicles.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('vehicles.data', 1)
            ->where('vehicles.data.0.id', $gomaVehicle->id)
            ->where('filters.city', 'Goma')
            ->where('filters.cityIsVisitorDefault', true));

    $this->withUnencryptedCookie(VisitorCity::COOKIE, 'Goma')
        ->get(route('vehicles.index', ['city' => VisitorCity::ALL]))
        ->assertInertia(fn (Assert $page) => $page->has('vehicles.data', 2));
});

test('the category page knows the visitor\'s town', function () {
    plumbersInTwoTowns();

    $this->withUnencryptedCookie(VisitorCity::COOKIE, 'Goma')
        ->get(route('categories.show', 'plumbers'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('visitorCity', 'Goma')
            ->has('professionals', 2));
});

test('the home page lists top-rated pros from the visitor\'s town first', function () {
    ['kinshasa' => $kinshasa, 'goma' => $goma] = plumbersInTwoTowns();

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page->where('topRatedProfessionals.0.slug', $goma->slug));

    $this->withUnencryptedCookie(VisitorCity::COOKIE, 'Kinshasa')
        ->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('visitorCity', 'Kinshasa')
            ->where('topRatedProfessionals.0.slug', $kinshasa->slug));
});
