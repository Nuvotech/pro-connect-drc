<?php

use App\Models\Category;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehiclePhoto;
use App\Models\VehicleProvider;
use App\Notifications\AccountInvitation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @return array<string, mixed>
 */
function validVehiclePayload(array $overrides = []): array
{
    return [
        'category' => 'pick-ups-4x4s',
        'make' => 'Toyota',
        'model' => 'Hilux Double Cab',
        'year' => '2021',
        'registration_number' => '4821AB01',
        'transmission' => 'manual',
        'fuel_type' => 'diesel',
        'seats' => '5',
        'driver_option' => 'both',
        'daily_rate' => '120',
        'currency' => 'USD',
        'deposit' => '500',
        'minimum_rental_days' => '2',
        'quantity' => '6',
        'insurance_expires_on' => '2027-06-30',
        'photos' => vehiclePhotos(),
        ...$overrides,
    ];
}

/**
 * @return array<string, UploadedFile>
 */
function vehiclePhotos(): array
{
    return collect(VehiclePhoto::ANGLES)
        ->mapWithKeys(fn (string $label, string $angle) => [$angle => UploadedFile::fake()->image("{$angle}.jpg")])
        ->all();
}

/**
 * @param  list<array<string, mixed>>|null  $vehicles
 * @return array<string, mixed>
 */
function validVehicleProviderPayload(array $overrides = [], ?array $vehicles = null): array
{
    return [
        'contact_name' => 'Patrick Mbala',
        'business_name' => 'Kongo Fleet Services SARL',
        'phone' => '81 555 2204',
        'is_on_whatsapp' => '1',
        'email' => 'contact@kongofleet.example',
        'city' => 'Kinshasa',
        'commune' => 'Limete',
        'address' => '42 Boulevard Lumumba',
        'preferred_language' => 'fr',
        'vehicles' => $vehicles ?? [validVehiclePayload()],
        ...$overrides,
    ];
}

test('guests are redirected to the login page', function () {
    $this->get(route('admin.vehicle-providers.index'))
        ->assertRedirect(route('login'));

    $this->post(route('admin.vehicle-providers.store'), validVehicleProviderPayload())
        ->assertRedirect(route('login'));

    expect(VehicleProvider::count())->toBe(0);
});

test('the fleet list summarises each provider', function () {
    $provider = VehicleProvider::factory()->verified()->create(['business_name' => 'Kongo Fleet Services SARL']);
    Vehicle::factory()->for($provider, 'provider')->create([
        'category_id' => Category::where('slug', 'heavy-trucks-freight')->value('id'),
        'daily_rate' => 350,
        'quantity' => 3,
    ]);
    Vehicle::factory()->for($provider, 'provider')->create([
        'category_id' => Category::where('slug', 'pick-ups-4x4s')->value('id'),
        'daily_rate' => 120,
        'quantity' => 6,
    ]);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.vehicle-providers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/vehicle-providers/index')
            ->has('providers.data', 1)
            ->where('providers.data.0.businessName', 'Kongo Fleet Services SARL')
            ->where('providers.data.0.vehicleCount', 9)
            ->where('providers.data.0.categories', ['heavy-trucks-freight', 'pick-ups-4x4s'])
            ->where('providers.data.0.lowestDailyRate', ['amount' => '120.00', 'currency' => 'USD']));
});

test('the onboarding form renders', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.vehicle-providers.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/vehicle-providers/create'));
});

test('an admin can onboard a provider with their fleet', function () {
    Storage::fake('public');
    Storage::fake('local');
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.vehicle-providers.store'), validVehicleProviderPayload(
            [
                'is_verified' => '1',
                'identity_document' => UploadedFile::fake()->create('carte-grise.pdf', 200, 'application/pdf'),
            ],
            [
                validVehiclePayload(),
                validVehiclePayload([
                    'category' => 'heavy-trucks-freight',
                    'make' => 'Mercedes-Benz',
                    'model' => 'Actros 3340',
                    'year' => '2018',
                    'registration_number' => '7710KN02',
                    'seats' => null,
                    'payload_tonnes' => '30',
                    'driver_option' => 'with_driver',
                    'daily_rate' => '350',
                    'quantity' => '3',
                ]),
            ],
        ))
        ->assertRedirect(route('admin.vehicle-providers.index'))
        ->assertSessionHasNoErrors();

    $provider = VehicleProvider::sole();

    expect($provider)
        ->contact_name->toBe('Patrick Mbala')
        ->business_name->toBe('Kongo Fleet Services SARL')
        ->onboarded_by_id->toBe($admin->id)
        ->and($provider->isVerified())->toBeTrue()
        ->and($provider->vehicles)->toHaveCount(2);

    [$pickUp, $truck] = $provider->vehicles->sortBy('id')->values()->all();

    expect($pickUp)
        ->make->toBe('Toyota')
        ->model->toBe('Hilux Double Cab')
        ->year->toBe(2021)
        ->daily_rate->toBe('120.00')
        ->currency->toBe('USD')
        ->deposit->toBe('500.00')
        ->minimum_rental_days->toBe(2)
        ->quantity->toBe(6)
        ->insurance_expires_on->toDateString()->toBe('2027-06-30');

    expect($truck)
        ->category->slug->toBe('heavy-trucks-freight')
        ->payload_tonnes->toBe('30.0')
        ->driver_option->toBe('with_driver');

    expect($pickUp->photos->pluck('angle')->sort()->values()->all())
        ->toBe(collect(VehiclePhoto::ANGLES)->keys()->sort()->values()->all())
        ->and(VehiclePhoto::count())->toBe(12);

    $pickUp->photos->each(fn (VehiclePhoto $photo) => Storage::disk('public')->assertExists($photo->path));
    Storage::disk('local')->assertExists($provider->identity_document_path);
    Storage::disk('public')->assertMissing($provider->identity_document_path);
});

test('quantity and minimum rental days default to one', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.vehicle-providers.store'), validVehicleProviderPayload(vehicles: [
            validVehiclePayload(['quantity' => null, 'minimum_rental_days' => null]),
        ]))
        ->assertRedirect(route('admin.vehicle-providers.index'));

    expect(Vehicle::sole())
        ->quantity->toBe(1)
        ->minimum_rental_days->toBe(1);
});

test('a provider needs at least one vehicle', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.vehicle-providers.store'), validVehicleProviderPayload(['vehicles' => []]))
        ->assertSessionHasErrors(['vehicles' => 'Add at least one vehicle.']);

    expect(VehicleProvider::count())->toBe(0);
});

test('invalid vehicle details are rejected', function (array $vehicleOverrides, string $field, string $message) {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.vehicle-providers.store'), validVehicleProviderPayload(vehicles: [
            validVehiclePayload($vehicleOverrides),
        ]))
        ->assertSessionHasErrors(["vehicles.0.{$field}" => $message]);

    expect(VehicleProvider::count())->toBe(0);
})->with([
    'missing make' => [['make' => ''], 'make', 'Enter the make.'],
    'year too old' => [['year' => '1975'], 'year', 'Enter a year from 1980 onwards.'],
    'missing number plate' => [['registration_number' => ''], 'registration_number', 'Enter the number plate.'],
    'missing daily rate' => [['daily_rate' => ''], 'daily_rate', 'Enter the daily rate.'],
    'zero daily rate' => [['daily_rate' => '0'], 'daily_rate', 'The daily rate must be at least 1.'],
]);

test('a service category cannot be used as a vehicle type', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.vehicle-providers.store'), validVehicleProviderPayload(vehicles: [
            validVehiclePayload(['category' => 'plumbers']),
        ]))
        ->assertSessionHasErrors('vehicles.0.category');
});

test('nothing is saved when one vehicle in the fleet is invalid', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.vehicle-providers.store'), validVehicleProviderPayload(vehicles: [
            validVehiclePayload(),
            validVehiclePayload(['model' => '']),
        ]))
        ->assertSessionHasErrors(['vehicles.1.model' => 'Enter the model.']);

    expect(VehicleProvider::count())->toBe(0)
        ->and(Vehicle::count())->toBe(0);
});

test('guests cannot view a provider', function () {
    $provider = VehicleProvider::factory()->create();

    $this->get(route('admin.vehicle-providers.show', $provider))
        ->assertRedirect(route('login'));
});

test('an admin can view a provider with their fleet', function () {
    $provider = VehicleProvider::factory()->verified()->create([
        'business_name' => 'Kongo Fleet Services SARL',
        'identity_document_path' => 'vehicle-providers/documents/id.pdf',
    ]);
    $truck = Vehicle::factory()->for($provider, 'provider')->create([
        'category_id' => Category::where('slug', 'heavy-trucks-freight')->value('id'),
        'make' => 'Mercedes-Benz',
        'model' => 'Actros 3340',
        'daily_rate' => 350,
        'insurance_expires_on' => now()->subDay(),
    ]);
    $pickUp = Vehicle::factory()->for($provider, 'provider')->create([
        'category_id' => Category::where('slug', 'pick-ups-4x4s')->value('id'),
        'daily_rate' => 120,
        'insurance_expires_on' => now()->addYear(),
    ]);
    Vehicle::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.vehicle-providers.show', $provider))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/vehicle-providers/show')
            ->where('provider.id', $provider->id)
            ->where('provider.businessName', 'Kongo Fleet Services SARL')
            ->where('provider.hasIdentityDocument', true)
            ->where('provider.lowestDailyRate', ['amount' => '120.00', 'currency' => 'USD'])
            ->has('vehicles', 2)
            ->where('vehicles.0.id', $truck->id)
            ->where('vehicles.0.model', 'Actros 3340')
            ->where('vehicles.0.isInsuranceExpired', true)
            ->where('vehicles.1.id', $pickUp->id)
            ->where('vehicles.1.isInsuranceExpired', false));
});

test('viewing an unknown provider returns not found', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.vehicle-providers.show', 999))
        ->assertNotFound();
});

test('each vehicle needs a photo from every required angle', function () {
    $photos = vehiclePhotos();
    unset($photos['engine']);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.vehicle-providers.store'), validVehicleProviderPayload(vehicles: [
            validVehiclePayload(['photos' => $photos]),
        ]))
        ->assertSessionHasErrors(['vehicles.0.photos.engine' => 'Add a photo of the engine.']);

    expect(VehicleProvider::count())->toBe(0);
});

test('photos beyond the six required angles are rejected', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.vehicle-providers.store'), validVehicleProviderPayload(vehicles: [
            validVehiclePayload(['photos' => [
                ...vehiclePhotos(),
                'roof' => UploadedFile::fake()->image('roof.jpg'),
            ]]),
        ]))
        ->assertSessionHasErrors(['vehicles.0.photos' => 'Only the 6 required photos can be uploaded.']);

    expect(VehicleProvider::count())->toBe(0);
});

test('vehicle photos are listed front first', function () {
    $vehicle = Vehicle::factory()->create();

    foreach (array_reverse(array_keys(VehiclePhoto::ANGLES)) as $angle) {
        $vehicle->photos()->create(['angle' => $angle, 'path' => "vehicles/{$vehicle->id}/{$angle}.jpg"]);
    }

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.vehicle-providers.show', $vehicle->vehicle_provider_id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('vehicles.0.photos', 6)
            ->where('vehicles.0.photos.0.angle', 'front')
            ->where('vehicles.0.photos.5.angle', 'engine'));
});

test('onboarding a provider with an email creates their pro account and invites them', function () {
    Notification::fake();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.vehicle-providers.store'), validVehicleProviderPayload())
        ->assertRedirect(route('admin.vehicle-providers.index'));

    $pro = User::where('email', 'contact@kongofleet.example')->sole();

    expect(VehicleProvider::sole()->user_id)->toBe($pro->id)
        ->and($pro->isAdmin())->toBeFalse();

    Notification::assertSentTo($pro, AccountInvitation::class);
});

test('an admin can verify a pending provider', function () {
    $provider = VehicleProvider::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.applications.decision', ['type' => 'vehicle_provider', 'id' => $provider->id]), ['decision' => 'approve'])
        ->assertRedirect();

    expect($provider->fresh()->isVerified())->toBeTrue();
});
