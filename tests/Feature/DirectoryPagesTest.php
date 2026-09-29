<?php

use App\Models\Category;
use App\Models\CustomerReview;
use App\Models\Professional;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleProvider;
use Inertia\Testing\AssertableInertia as Assert;

test('public directory pages render their components', function (string $url, string $component) {
    $this->get($url)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'home' => ['/', 'public/home'],
    'search' => ['/search', 'public/search'],
    'become a pro' => ['/become-a-pro', 'public/become-a-pro'],
    'business service request' => ['/business-services/request', 'public/service-request'],
]);

test('the home page shows categories with their verified pro counts and the top-rated pros', function () {
    $best = Professional::factory()->verified()->withCategories(['plumbers'])->create(['business_name' => 'Best Plumbing']);
    CustomerReview::factory()->for($best, 'reviewable')->create(['rating' => 5]);
    Professional::factory()->withCategories(['plumbers'])->create();

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('categories', fn ($categories) => collect($categories)->firstWhere('slug', 'plumbers')['prosCount'] === 1)
            ->has('businessCategories', 4)
            ->has('vehicleCategories', 6)
            ->has('topRatedProfessionals', 1)
            ->where('topRatedProfessionals.0.name', 'Best Plumbing')
            ->where('topRatedProfessionals.0.rating', 5));
});

test('the home page shows the eight most common DRC services until real searches take over', function () {
    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('categories', 8)
            ->where('categories', fn ($categories) => collect($categories)->pluck('slug')->all() === [
                'electricians', 'plumbers', 'masons', 'auto-mechanics',
                'solar-installers', 'generator-technicians', 'carpenters', 'phone-repair',
            ]));

    Category::where('slug', 'tailors')->update(['search_count' => 50]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('categories.0.slug', 'tailors')
            ->where('categories.1.slug', 'electricians'));
});

test('the home hero shows every active trade and business service', function () {
    Category::where('slug', 'tailors')->update(['is_active' => false]);

    $expectedSlugs = Category::query()
        ->inGroup(Category::PROFESSIONAL_GROUPS)
        ->where('is_active', true)
        ->pluck('slug')
        ->sort()
        ->values()
        ->all();

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('heroCategories', fn ($categories) => collect($categories)->pluck('slug')->sort()->values()->all() === $expectedSlugs)
            ->has('heroCategories.0', fn (Assert $category) => $category
                ->hasAll(['slug', 'name', 'nameFr', 'icon'])
                ->etc()));
});

test('public pages share city coordinates for location detection', function () {
    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('cities', fn ($cities) => collect($cities)->firstWhere('name', 'Kinshasa')['latitude'] === -4.3217
                && collect($cities)->firstWhere('name', 'Kinshasa')['longitude'] === 15.3126));
});

test('category visits and category searches are counted', function () {
    $this->get(route('categories.show', 'plumbers'));
    $this->get(route('search', ['categories' => ['plumbers', 'tailors']]));
    $this->get(route('search', ['q' => 'maçon']));
    $this->get(route('search', ['q' => 'repair']));

    expect(Category::where('slug', 'plumbers')->value('search_count'))->toBe(2)
        ->and(Category::where('slug', 'tailors')->value('search_count'))->toBe(1)
        ->and(Category::where('slug', 'masons')->value('search_count'))->toBe(1)
        ->and(Category::where('slug', 'phone-repair')->value('search_count'))->toBe(0);
});

test('search only lists verified pros and filters them', function () {
    $plumber = Professional::factory()->verified()->withCategories(['plumbers'])->locatedIn('Kinshasa', 'Gombe')->create(['business_name' => 'Kinshasa Plumbing']);
    Professional::factory()->verified()->withCategories(['electricians'])->locatedIn('Goma', 'Goma')->create(['business_name' => 'Goma Electric']);
    Professional::factory()->withCategories(['plumbers'])->create(['business_name' => 'Unverified Plumbing']);

    $this->get(route('search'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/search')
            ->where('professionals.total', 2));

    $this->get(route('search', ['categories' => ['plumbers']]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('professionals.total', 1)
            ->where('professionals.data.0.slug', $plumber->slug));

    $this->get(route('search', ['location' => 'Goma']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('professionals.total', 1)
            ->where('professionals.data.0.name', 'Goma Electric'));

    $this->get(route('search', ['q' => 'plombier']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('professionals.total', 1)
            ->where('professionals.data.0.name', 'Kinshasa Plumbing'));
});

test('search filters by minimum rating and sorts by reviews', function () {
    $wellReviewed = Professional::factory()->verified()->create(['business_name' => 'Many Reviews']);
    CustomerReview::factory()->count(3)->for($wellReviewed, 'reviewable')->create(['rating' => 4]);
    $topRated = Professional::factory()->verified()->create(['business_name' => 'Top Rated']);
    CustomerReview::factory()->for($topRated, 'reviewable')->create(['rating' => 5]);
    Professional::factory()->verified()->create(['business_name' => 'Not Rated']);

    $this->get(route('search', ['rating' => 4.5]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('professionals.total', 1)
            ->where('professionals.data.0.name', 'Top Rated'));

    $this->get(route('search', ['sort' => 'reviews']))
        ->assertInertia(fn (Assert $page) => $page
            ->where('professionals.total', 3)
            ->where('professionals.data.0.name', 'Many Reviews'));
});

test('search results are paginated', function () {
    Professional::factory()->count(12)->verified()->create();

    $this->get(route('search', ['page' => 2]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('professionals.current_page', 2)
            ->where('professionals.last_page', 2)
            ->has('professionals.data', 2));
});

test('a category page lists its verified pros', function () {
    Professional::factory()->verified()->withCategories(['plumbers'])->create(['business_name' => 'Verified Plumbing']);
    Professional::factory()->withCategories(['plumbers'])->create();
    Professional::factory()->verified()->withCategories(['electricians'])->create();

    $this->get(route('categories.show', 'plumbers'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/category')
            ->where('category.slug', 'plumbers')
            ->where('category.prosCount', 1)
            ->has('professionals', 1)
            ->where('professionals.0.name', 'Verified Plumbing'));
});

test('unknown and vehicle categories have no service category page', function (string $slug) {
    $this->get(route('categories.show', $slug))->assertNotFound();
})->with(['astronauts', 'pick-ups-4x4s']);

test('a verified pro has a public profile with published reviews', function () {
    $professional = Professional::factory()->verified()->withCategories(['plumbers'])->create([
        'business_name' => 'Kabongo Plomberie',
        'starting_rate' => 25,
        'rate_unit' => 'hour',
        'currency' => 'USD',
    ]);
    CustomerReview::factory()->for($professional, 'reviewable')->create(['rating' => 5, 'comment' => 'Fixed the leak quickly.']);
    CustomerReview::factory()->for($professional, 'reviewable')->unpublished()->create();

    $this->get(route('professionals.show', $professional->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/professional')
            ->where('professional.name', 'Kabongo Plomberie')
            ->where('professional.startingRate', '$25/hr')
            ->where('professional.startingRateAmount', 25)
            ->where('professional.startingRateCurrency', 'USD')
            ->where('professional.rateUnit', 'hour')
            ->where('professional.categorySlug', 'plumbers')
            ->has('reviews', 1)
            ->where('reviews.0.comment', 'Fixed the leak quickly.'));
});

test('unverified pros have no public profile', function () {
    $professional = Professional::factory()->create();

    $this->get(route('professionals.show', $professional->slug))->assertNotFound();
});

test('the vehicle list shows every vehicle from verified fleets by default', function () {
    $pickUps = Category::where('slug', 'pick-ups-4x4s')->sole();
    $trucks = Category::where('slug', 'heavy-trucks-freight')->sole();
    $fleet = VehicleProvider::factory()->verified()->create(['business_name' => 'Kongo Fleet']);
    Vehicle::factory()->for($fleet, 'provider')->create(['category_id' => $pickUps->id, 'model' => 'Hilux', 'daily_rate' => 120]);
    Vehicle::factory()->for($fleet, 'provider')->create(['category_id' => $trucks->id, 'model' => 'Actros', 'daily_rate' => 350]);
    Vehicle::factory()->for(VehicleProvider::factory(), 'provider')->create(['category_id' => $pickUps->id]);

    $this->get(route('vehicles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/vehicles')
            ->where('vehicles.total', 2)
            ->where('vehicles.data.0.model', 'Hilux')
            ->where('vehicles.data.0.fleet.name', 'Kongo Fleet')
            ->where('vehicles.data.0.registrationNumber', null)
            ->where('types', fn ($types) => collect($types)->firstWhere('slug', 'pick-ups-4x4s')['count'] === 1));
});

test('the vehicle list filters by type, city, driver and currency and sorts by price', function () {
    $pickUps = Category::where('slug', 'pick-ups-4x4s')->sole();
    $kinshasa = VehicleProvider::factory()->verified()->locatedIn('Kinshasa', 'Gombe')->create();
    $goma = VehicleProvider::factory()->verified()->locatedIn('Goma', 'Goma')->create();
    Vehicle::factory()->for($kinshasa, 'provider')->create(['category_id' => $pickUps->id, 'model' => 'Hilux', 'driver_option' => 'self_drive', 'currency' => 'USD', 'daily_rate' => 100]);
    Vehicle::factory()->for($goma, 'provider')->create(['category_id' => Category::where('slug', 'minibuses-buses')->value('id'), 'model' => 'Coaster', 'driver_option' => 'with_driver', 'currency' => 'CDF', 'daily_rate' => 300000]);

    $expectOnly = fn (array $query, string $model) => $this->get(route('vehicles.index', $query))
        ->assertInertia(fn (Assert $page) => $page
            ->where('vehicles.total', 1)
            ->where('vehicles.data.0.model', $model));

    $expectOnly(['types' => ['pick-ups-4x4s']], 'Hilux');
    $expectOnly(['city' => 'Goma'], 'Coaster');
    $expectOnly(['driver' => 'with_driver'], 'Coaster');
    $expectOnly(['currency' => 'USD'], 'Hilux');

    $this->get(route('vehicles.index', ['sort' => 'price_desc']))
        ->assertInertia(fn (Assert $page) => $page->where('vehicles.data.0.model', 'Coaster'));
});

test('a vehicle type link opens the list with that type selected', function () {
    $this->get(route('vehicles.category', 'pick-ups-4x4s'))
        ->assertRedirect(route('vehicles.index', ['types' => ['pick-ups-4x4s']]));

    $this->get(route('vehicles.category', 'plumbers'))->assertNotFound();
});

test('a verified fleet has a public page and an unverified one does not', function () {
    $fleet = VehicleProvider::factory()->verified()->create(['business_name' => 'Kongo Fleet']);
    Vehicle::factory()->count(2)->for($fleet, 'provider')->create();
    $pending = VehicleProvider::factory()->create();

    $this->get(route('fleets.show', $fleet->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/fleet')
            ->where('fleet.name', 'Kongo Fleet')
            ->has('vehicles', 2));

    $this->get(route('fleets.show', $pending->slug))->assertNotFound();
});

test('the services page lists every trade and business service', function () {
    $this->get(route('categories.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/categories')
            ->where('trades', fn ($trades) => count($trades) === Category::where('group', Category::GROUP_TRADE)->count())
            ->where('businessServices', fn ($services) => count($services) === Category::where('group', Category::GROUP_BUSINESS)->count()));
});

test('a vehicle link opens that vehicle on the fleet page', function () {
    $fleet = VehicleProvider::factory()->verified()->create();
    $vehicle = Vehicle::factory()->for($fleet, 'provider')->create();
    $otherFleetVehicle = Vehicle::factory()->create();

    $this->get(route('fleets.show', ['vehicleProvider' => $fleet->slug, 'vehicle' => $vehicle->id]))
        ->assertInertia(fn (Assert $page) => $page->where('selectedVehicleId', $vehicle->id));

    $this->get(route('fleets.show', ['vehicleProvider' => $fleet->slug, 'vehicle' => $otherFleetVehicle->id]))
        ->assertInertia(fn (Assert $page) => $page->where('selectedVehicleId', null));
});

test('profiles say whether the pro is on WhatsApp', function () {
    $professional = Professional::factory()->verified()->create(['is_on_whatsapp' => true]);

    $this->get(route('professionals.show', $professional->slug))
        ->assertInertia(fn (Assert $page) => $page->where('professional.isOnWhatsApp', true));
});

test('customers are sent home instead of to the pro dashboard', function () {
    $this->actingAs(User::factory()->customer()->create())
        ->get(route('dashboard'))
        ->assertRedirect(route('home'));
});
