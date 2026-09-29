<?php

use App\Models\Customer;
use App\Models\Professional;
use App\Models\QuoteRequest;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBooking;
use App\Models\VehicleProvider;
use App\Notifications\NewBookingRequest;
use App\Notifications\NewCustomerRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

/**
 * @return array<string, mixed>
 */
function quoteRequestPayload(array $overrides = []): array
{
    return [
        'category' => 'plumbers',
        'service_type' => 'emergency',
        'description' => 'The kitchen sink is blocked and water is backing up into the second basin.',
        'timing' => 'urgent',
        'city' => 'Kinshasa',
        'commune' => 'Gombe',
        'address' => '12 Avenue du Commerce',
        'assessment' => 'in_person',
        'full_name' => 'Grace Mbuyi',
        'phone' => '81 220 4417',
        'email' => 'grace@example.com',
        'contact_channel' => 'whatsapp',
        ...$overrides,
    ];
}

/**
 * @return array<string, mixed>
 */
function bookingPayload(Vehicle $vehicle, array $overrides = []): array
{
    return [
        'vehicle_id' => $vehicle->id,
        'start_date' => now()->addDays(2)->toDateString(),
        'end_date' => now()->addDays(4)->toDateString(),
        'quantity' => 1,
        'with_driver' => '1',
        'pickup_location' => 'Gombe',
        'full_name' => 'Olivier Tshibangu',
        'phone' => '82 915 3302',
        'email' => 'olivier@example.com',
        ...$overrides,
    ];
}

test('a guest quote request creates the customer, the request and its photos', function () {
    Notification::fake();
    Storage::fake('public');
    $admin = User::factory()->admin()->create();
    $professional = Professional::factory()->verified()->withCategories(['plumbers'])->create();

    $this->post(route('quote-requests.store'), quoteRequestPayload([
        'professional' => $professional->slug,
        'photos' => [UploadedFile::fake()->image('sink.jpg'), UploadedFile::fake()->image('pipe.jpg')],
    ]))
        ->assertRedirect()
        ->assertInertiaFlash('reference', 'QR-000001');

    $request = QuoteRequest::sole();

    expect($request)
        ->status->toBe(QuoteRequest::STATUS_OPEN)
        ->needs_site_visit->toBeTrue()
        ->category->slug->toBe('plumbers')
        ->commune->name->toBe('Gombe')
        ->requested_professional_id->toBe($professional->id)
        ->and($request->customer)
        ->full_name->toBe('Grace Mbuyi')
        ->email->toBe('grace@example.com')
        ->user_id->toBeNull()
        ->and($request->photos)->toHaveCount(2);

    $request->photos->each(fn ($photo) => Storage::disk('public')->assertExists($photo->path));
    Notification::assertSentTo($admin, NewCustomerRequest::class);
});

test('a returning customer is found by their email', function () {
    $customer = Customer::factory()->create(['email' => 'grace@example.com', 'full_name' => 'Old Name']);

    $this->post(route('quote-requests.store'), quoteRequestPayload(['email' => 'GRACE@example.com']));

    expect(Customer::count())->toBe(1)
        ->and($customer->fresh()->full_name)->toBe('Grace Mbuyi')
        ->and(QuoteRequest::sole()->customer_id)->toBe($customer->id);
});

test('invalid quote requests are rejected', function (array $overrides, string $field) {
    $this->post(route('quote-requests.store'), quoteRequestPayload($overrides))
        ->assertSessionHasErrors($field);

    expect(QuoteRequest::count())->toBe(0);
})->with([
    'vehicle category' => [['category' => 'pick-ups-4x4s'], 'category'],
    'short description' => [['description' => 'Too short'], 'description'],
    'commune in another city' => [['commune' => 'Kenya'], 'commune'],
    'missing phone' => [['phone' => ''], 'phone'],
    'too many photos' => [['photos' => array_map(fn (int $index) => UploadedFile::fake()->image("{$index}.jpg"), range(1, 4))], 'photos'],
]);

test('a business request stores its attachment privately', function () {
    Notification::fake();
    Storage::fake('local');
    User::factory()->admin()->create();

    $this->post(route('service-request.store'), [
        'category' => 'law-firms',
        'description' => 'Review a supply contract with a mining company.',
        'timeline' => 'this_week',
        'full_name' => 'Thomas Weber',
        'email' => 'thomas@minerals.example',
        'phone' => '99 120 4471',
        'province' => 'Lubumbashi',
        'attachment' => UploadedFile::fake()->create('brief.pdf', 200, 'application/pdf'),
    ])->assertInertiaFlash('reference', 'SR-000001');

    $request = ServiceRequest::sole();

    expect($request)
        ->status->toBe(ServiceRequest::STATUS_NEW)
        ->category->slug->toBe('law-firms')
        ->city->name->toBe('Lubumbashi');
    Storage::disk('local')->assertExists($request->attachment_path);
    Notification::assertCount(1);
});

test('a business request saves the company and preferred contact on the customer', function () {
    Notification::fake();

    $this->post(route('service-request.store'), [
        'category' => 'law-firms',
        'description' => 'Review a supply contract with a mining company.',
        'timeline' => 'flexible',
        'full_name' => 'Thomas Weber',
        'organization' => 'Katanga Minerals SARL',
        'email' => 'thomas@minerals.example',
        'phone' => '99 120 4471',
        'province' => 'Kinshasa',
        'contact_channel' => 'call',
    ])->assertInertiaFlash('reference');

    expect(ServiceRequest::sole()->customer)
        ->organization->toBe('Katanga Minerals SARL')
        ->preferred_contact_channel->toBe('call');
});

test('a trade cannot be requested as a business service', function () {
    $this->post(route('service-request.store'), [
        'category' => 'plumbers',
        'description' => 'Review a supply contract.',
        'timeline' => 'flexible',
        'full_name' => 'Thomas Weber',
        'email' => 'thomas@minerals.example',
        'phone' => '99 120 4471',
        'province' => 'other',
    ])->assertSessionHasErrors('category');
});

test('a booking request copies the rate, works out the total and tells the fleet', function () {
    Notification::fake();
    $owner = User::factory()->create();
    $fleet = VehicleProvider::factory()->verified()->for($owner)->create();
    $vehicle = Vehicle::factory()->for($fleet, 'provider')->create([
        'daily_rate' => 120,
        'currency' => 'USD',
        'quantity' => 2,
        'driver_option' => 'both',
    ]);

    $this->post(route('fleets.bookings.store', $fleet->slug), bookingPayload($vehicle, ['quantity' => 2]))
        ->assertInertiaFlash('reference', 'VB-000001');

    expect(VehicleBooking::sole())
        ->status->toBe(VehicleBooking::STATUS_REQUESTED)
        ->vehicle_provider_id->toBe($fleet->id)
        ->daily_rate->toBe('120.00')
        ->estimated_total->toBe('720.00')
        ->with_driver->toBeTrue();
    Notification::assertSentTo($owner, NewBookingRequest::class);
});

test('invalid bookings are rejected', function (Closure $makeOverrides, string $field) {
    $fleet = VehicleProvider::factory()->verified()->create();
    $vehicle = Vehicle::factory()->for($fleet, 'provider')->create(['quantity' => 1, 'driver_option' => 'self_drive', 'minimum_rental_days' => 1]);

    $this->post(route('fleets.bookings.store', $fleet->slug), bookingPayload($vehicle, $makeOverrides()))
        ->assertSessionHasErrors($field);

    expect(VehicleBooking::count())->toBe(0);
})->with([
    'vehicle from another fleet' => [fn () => ['vehicle_id' => Vehicle::factory()->create()->id], 'vehicle_id'],
    'start in the past' => [fn () => ['start_date' => now()->subDay()->toDateString()], 'start_date'],
    'return before start' => [fn () => ['end_date' => now()->addDay()->toDateString()], 'end_date'],
    'more units than the fleet has' => [fn () => ['quantity' => 3], 'quantity'],
    'driver on a self-drive vehicle' => [fn () => ['with_driver' => '1'], 'with_driver'],
]);

test('unverified fleets cannot be booked', function () {
    $fleet = VehicleProvider::factory()->create();
    $vehicle = Vehicle::factory()->for($fleet, 'provider')->create(['driver_option' => 'both']);

    $this->post(route('fleets.bookings.store', $fleet->slug), bookingPayload($vehicle))
        ->assertNotFound();
});

test('a quote request can be sent without an email when the customer prefers WhatsApp', function () {
    $this->post(route('quote-requests.store'), quoteRequestPayload(['email' => '', 'contact_channel' => 'whatsapp']))
        ->assertSessionHasNoErrors();

    expect(QuoteRequest::sole()->customer->email)->toBeNull();
});

test('choosing email as the contact channel requires an email address', function () {
    $this->post(route('quote-requests.store'), quoteRequestPayload(['email' => '', 'contact_channel' => 'email']))
        ->assertSessionHasErrors(['email' => 'Enter your email address, or choose WhatsApp or a phone call.']);
});

test('a business request can come from any city we serve, or another province', function (string $province, ?string $city) {
    $this->post(route('service-request.store'), [
        'category' => 'law-firms',
        'description' => 'Review a supply contract with a mining company.',
        'timeline' => 'flexible',
        'full_name' => 'Thomas Weber',
        'email' => 'thomas@minerals.example',
        'phone' => '99 120 4471',
        'province' => $province,
    ])->assertSessionHasNoErrors();

    expect(ServiceRequest::sole()->city?->name)->toBe($city);
})->with([
    'Bukavu' => ['Bukavu', 'Bukavu'],
    'other province' => ['other', null],
]);
