<?php

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehiclePhoto;
use App\Models\VehicleProvider;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @return array<string, UploadedFile>
 */
function fleetVehiclePhotos(): array
{
    return collect(VehiclePhoto::ANGLES)
        ->mapWithKeys(fn (string $label, string $angle) => [$angle => UploadedFile::fake()->image("{$angle}.jpg")])
        ->all();
}

/**
 * @return array<string, mixed>
 */
function fleetVehiclePayload(array $overrides = []): array
{
    return [
        'category' => 'vans-light-cargo',
        'make' => 'Toyota',
        'model' => 'HiAce Panel Van',
        'year' => '2020',
        'registration_number' => '5102AB03',
        'transmission' => 'manual',
        'fuel_type' => 'diesel',
        'driver_option' => 'both',
        'daily_rate' => '90',
        'currency' => 'USD',
        'photos' => fleetVehiclePhotos(),
        ...$overrides,
    ];
}

/**
 * @return array<string, mixed>
 */
function fleetDetailsPayload(array $overrides = []): array
{
    return [
        'contact_name' => 'Patrick Mbala',
        'business_name' => 'Kongo Fleet Services SARL',
        'phone' => '81 555 2204',
        'city' => 'Kinshasa',
        'commune' => 'Limete',
        'registry_number' => 'CD/KIN/RCCM/15-B-07731',
        'preferred_language' => 'fr',
        ...$overrides,
    ];
}

test('a pro can set up a fleet listing, which waits for verification', function () {
    Storage::fake('public');
    $pro = User::factory()->create();

    $this->actingAs($pro)
        ->post(route('dashboard.fleet.store'), [...fleetDetailsPayload(), 'vehicles' => [fleetVehiclePayload()]])
        ->assertRedirect(route('dashboard.fleet.show'));

    $provider = VehicleProvider::sole();

    expect($provider)
        ->user_id->toBe($pro->id)
        ->isVerified()->toBeFalse()
        ->and($provider->vehicles)->toHaveCount(1)
        ->and(VehiclePhoto::count())->toBe(6);
});

test('a pro sees their own fleet', function () {
    $pro = User::factory()->create();
    $provider = VehicleProvider::factory()->for($pro)->create(['business_name' => 'Kongo Fleet Services SARL']);
    Vehicle::factory()->for($provider, 'provider')->create(['model' => 'Coaster']);

    $this->actingAs($pro)
        ->get(route('dashboard.fleet.show'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/fleet/show')
            ->where('provider.businessName', 'Kongo Fleet Services SARL')
            ->has('vehicles', 1)
            ->where('vehicles.0.model', 'Coaster'));
});

test('editing business contact details keeps the fleet verified', function () {
    $pro = User::factory()->create();
    $provider = VehicleProvider::factory()->verified()->for($pro)->locatedIn('Kinshasa', 'Limete')->create(Arr::except(fleetDetailsPayload(), ['city', 'commune']));

    $this->actingAs($pro)
        ->patch(route('dashboard.fleet.update'), fleetDetailsPayload(['phone' => '99 000 1111']))
        ->assertRedirect(route('dashboard.fleet.show'));

    expect($provider->fresh())
        ->phone->toBe('99 000 1111')
        ->isVerified()->toBeTrue();
});

test('changing the RCCM number sends the fleet back for verification', function () {
    $pro = User::factory()->create();
    $provider = VehicleProvider::factory()->verified()->for($pro)->locatedIn('Kinshasa', 'Limete')->create(Arr::except(fleetDetailsPayload(), ['city', 'commune']));

    $this->actingAs($pro)
        ->patch(route('dashboard.fleet.update'), fleetDetailsPayload(['registry_number' => 'CD/KIN/RCCM/99-Z-00001']));

    expect($provider->fresh()->isVerified())->toBeFalse();
});

test('a company fleet can be saved before its registration documents are on file', function () {
    Storage::fake('public');
    $pro = User::factory()->create();

    $this->actingAs($pro)
        ->post(route('dashboard.fleet.store'), [
            ...fleetDetailsPayload(['provider_type' => 'company', 'registry_number' => null]),
            'vehicles' => [fleetVehiclePayload()],
        ])
        ->assertRedirect(route('dashboard.fleet.show'));

    $provider = VehicleProvider::sole();

    expect($provider)
        ->isCompany()->toBeTrue()
        ->isVerified()->toBeFalse()
        ->and(collect($provider->completionChecklist())->pluck('key')->all())
        ->toBe(['vehicles', 'vehicle_photos', 'registry_number', 'tax_id', 'business_registration']);
});

test('uploading a business registration sends a verified company fleet back for verification', function () {
    Storage::fake('local');
    $pro = User::factory()->create();
    $provider = VehicleProvider::factory()->company(withRegistration: true)->verified()->for($pro)->locatedIn('Kinshasa', 'Limete')->create();

    $this->actingAs($pro)
        ->patch(route('dashboard.fleet.update'), fleetDetailsPayload([
            'provider_type' => 'company',
            'business_name' => $provider->business_name,
            'registry_number' => $provider->registry_number,
            'tax_id' => $provider->tax_id,
            'business_registration' => UploadedFile::fake()->create('rccm.pdf', 200, 'application/pdf'),
        ]))
        ->assertSessionHasNoErrors();

    $provider->refresh();

    expect($provider->isVerified())->toBeFalse();
    Storage::disk('local')->assertExists($provider->business_registration_path);
});

test('adding a vehicle needs all six photos and sends the fleet back for verification', function () {
    Storage::fake('public');
    $pro = User::factory()->create();
    $provider = VehicleProvider::factory()->verified()->for($pro)->create();

    $this->actingAs($pro)
        ->post(route('dashboard.vehicles.store'), fleetVehiclePayload(['photos' => Arr::except(fleetVehiclePhotos(), 'engine')]))
        ->assertSessionHasErrors(['photos.engine' => 'Add a photo of the engine.']);

    expect($provider->vehicles()->count())->toBe(0);

    $this->actingAs($pro)
        ->post(route('dashboard.vehicles.store'), fleetVehiclePayload())
        ->assertRedirect(route('dashboard.fleet.show'));

    expect($provider->vehicles()->count())->toBe(1)
        ->and($provider->fresh()->isVerified())->toBeFalse();
});

test('editing a vehicle keeps its photos unless new ones are uploaded', function () {
    Storage::fake('public');
    $pro = User::factory()->create();
    $provider = VehicleProvider::factory()->for($pro)->create();
    $vehicle = Vehicle::factory()->for($provider, 'provider')->create(['daily_rate' => 90]);
    foreach (array_keys(VehiclePhoto::ANGLES) as $angle) {
        Storage::disk('public')->put("vehicles/{$vehicle->id}/{$angle}.jpg", 'old');
        $vehicle->photos()->create(['angle' => $angle, 'path' => "vehicles/{$vehicle->id}/{$angle}.jpg"]);
    }

    $this->actingAs($pro)
        ->patch(route('dashboard.vehicles.update', $vehicle), fleetVehiclePayload([
            'daily_rate' => '110',
            'photos' => ['front' => UploadedFile::fake()->image('new-front.jpg')],
        ]))
        ->assertRedirect(route('dashboard.fleet.show'));

    $vehicle->refresh();
    $front = $vehicle->photos()->where('angle', 'front')->sole();

    expect($vehicle->daily_rate)->toBe('110.00')
        ->and($vehicle->photos()->count())->toBe(6)
        ->and($front->path)->not->toBe("vehicles/{$vehicle->id}/front.jpg");

    Storage::disk('public')->assertMissing("vehicles/{$vehicle->id}/front.jpg");
    Storage::disk('public')->assertExists("vehicles/{$vehicle->id}/rear.jpg");
    Storage::disk('public')->assertExists($front->path);
});

test('a pro can remove a vehicle and its photos', function () {
    Storage::fake('public');
    $pro = User::factory()->create();
    $provider = VehicleProvider::factory()->for($pro)->create();
    $vehicle = Vehicle::factory()->for($provider, 'provider')->create();
    Storage::disk('public')->put("vehicles/{$vehicle->id}/front.jpg", 'photo');
    $vehicle->photos()->create(['angle' => 'front', 'path' => "vehicles/{$vehicle->id}/front.jpg"]);

    $this->actingAs($pro)
        ->delete(route('dashboard.vehicles.destroy', $vehicle))
        ->assertRedirect(route('dashboard.fleet.show'));

    expect(Vehicle::count())->toBe(0);
    Storage::disk('public')->assertMissing("vehicles/{$vehicle->id}/front.jpg");
});

test("a pro cannot touch another pro's vehicles", function (string $method, string $routeName) {
    $vehicle = Vehicle::factory()->create();

    $this->actingAs(User::factory()->create())
        ->{$method}(route($routeName, $vehicle), fleetVehiclePayload())
        ->assertForbidden();

    expect(Vehicle::whereKey($vehicle->id)->exists())->toBeTrue();
})->with([
    'view edit form' => ['get', 'dashboard.vehicles.edit'],
    'update' => ['patch', 'dashboard.vehicles.update'],
    'remove' => ['delete', 'dashboard.vehicles.destroy'],
]);
