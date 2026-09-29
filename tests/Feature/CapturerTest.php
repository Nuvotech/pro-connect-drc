<?php

use App\Models\Professional;
use App\Models\User;
use App\Models\VehiclePhoto;
use App\Models\VehicleProvider;
use App\Notifications\StaffInvitation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @return array<string, mixed>
 */
function capturedProfessional(array $overrides = []): array
{
    return [
        'categories' => ['electricians'],
        'full_name' => 'Christian Mukendi',
        'business_name' => 'ElectroTech Services RDC',
        'phone' => '82 441 9083',
        'email' => 'contact@electrotech-rdc.com',
        'city' => 'Kinshasa',
        'commune' => 'Limete',
        'preferred_language' => 'fr',
        ...$overrides,
    ];
}

/**
 * @return array<string, mixed>
 */
function capturedFleet(array $overrides = []): array
{
    return [
        'contact_name' => 'Patrick Mbala',
        'business_name' => 'Kongo Fleet Services SARL',
        'phone' => '81 555 2204',
        'email' => 'contact@kongofleet.example',
        'city' => 'Kinshasa',
        'commune' => 'Limete',
        'preferred_language' => 'fr',
        'vehicles' => [[
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
            'minimum_rental_days' => '1',
            'quantity' => '1',
            'photos' => collect(VehiclePhoto::ANGLES)
                ->mapWithKeys(fn (string $label, string $angle) => [$angle => UploadedFile::fake()->image("{$angle}.jpg")])
                ->all(),
        ]],
        ...$overrides,
    ];
}

beforeEach(function () {
    Notification::fake();
    Storage::fake('public');
    Storage::fake('local');
});

test('a capturer can open both capture forms', function (string $route) {
    $this->actingAs(User::factory()->capturer()->create())
        ->get(route($route))
        ->assertOk();
})->with(['admin.professionals.create', 'admin.vehicle-providers.create']);

test('a capturer adds a professional, which waits for review even if they ask to verify it', function () {
    $capturer = User::factory()->capturer()->create();

    $this->actingAs($capturer)
        ->post(route('admin.professionals.store'), capturedProfessional(['is_verified' => '1']))
        ->assertRedirect(route('captures.index'));

    $professional = Professional::sole();

    expect($professional->onboarded_by_id)->toBe($capturer->id)
        ->and($professional->verified_at)->toBeNull()
        ->and($professional->review_status)->toBe(Professional::REVIEW_PENDING);
});

test('a capturer adds a fleet, which waits for review', function () {
    $capturer = User::factory()->capturer()->create();

    $this->actingAs($capturer)
        ->post(route('admin.vehicle-providers.store'), capturedFleet(['is_verified' => '1']))
        ->assertRedirect(route('captures.index'));

    $provider = VehicleProvider::sole();

    expect($provider->onboarded_by_id)->toBe($capturer->id)
        ->and($provider->verified_at)->toBeNull()
        ->and($provider->review_status)->toBe(VehicleProvider::REVIEW_PENDING);
});

test('my captures lists only the capturer\'s own entries', function () {
    $capturer = User::factory()->capturer()->create();
    $own = Professional::factory()->create(['onboarded_by_id' => $capturer->id, 'business_name' => 'Mine SARL']);
    VehicleProvider::factory()->create(['onboarded_by_id' => $capturer->id]);
    Professional::factory()->create(['onboarded_by_id' => User::factory()->capturer()->create()->id]);

    $this->actingAs($capturer)
        ->get(route('captures.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('captures/index')
            ->has('captures', 2)
            ->where('captures', fn ($captures) => collect($captures)->contains('key', "professional-{$own->id}")));
});

test('capturers cannot use any other admin page', function (string $method, string $route, array $parameters = []) {
    $this->actingAs(User::factory()->capturer()->create())
        ->{$method}(route($route, $parameters))
        ->assertForbidden();
})->with([
    'listing reviews' => ['get', 'admin.applications'],
    'requests' => ['get', 'admin.requests.index'],
    'reviews' => ['get', 'admin.reviews.index'],
    'sign-ups' => ['get', 'admin.sign-ups.index'],
    'messages' => ['get', 'admin.messages.index'],
    'exchange rate' => ['get', 'admin.exchange-rate.edit'],
    'team' => ['get', 'admin.team.index'],
    'professionals list' => ['get', 'admin.professionals.index'],
    'fleets list' => ['get', 'admin.vehicle-providers.index'],
]);

test('pros and customers cannot capture', function (Closure $makeUser) {
    $this->actingAs($makeUser())
        ->get(route('captures.index'))
        ->assertForbidden();
})->with([
    'pro' => [fn () => User::factory()->create()],
    'customer' => [fn () => User::factory()->customer()->create()],
]);

test('capturers land on their captures after logging in', function () {
    $capturer = User::factory()->capturer()->create();

    $this->post(route('login.store'), ['email' => $capturer->email, 'password' => 'password'])
        ->assertRedirect(route('captures.index'));

    $this->get(route('dashboard'))->assertRedirect(route('captures.index'));
});

test('admins add capturers, who are emailed a link to set their password', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.team.store'), ['name' => 'Grace Ilunga', 'email' => 'grace@proconnect.cd'])
        ->assertRedirect();

    $capturer = User::where('email', 'grace@proconnect.cd')->sole();

    expect($capturer->isCapturer())->toBeTrue()
        ->and($capturer->email_verified_at)->not->toBeNull();
    Notification::assertSentTo($capturer, StaffInvitation::class);
});

test('a capturer email must be new', function () {
    $existing = User::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.team.store'), ['name' => 'Someone', 'email' => $existing->email])
        ->assertSessionHasErrors('email');
});

test('only admins manage the team', function () {
    $this->actingAs(User::factory()->capturer()->create())
        ->post(route('admin.team.store'), ['name' => 'Grace', 'email' => 'grace@proconnect.cd'])
        ->assertForbidden();

    expect(User::where('email', 'grace@proconnect.cd')->exists())->toBeFalse();
});

test('a deactivated capturer cannot log in and is signed out', function () {
    $admin = User::factory()->admin()->create();
    $capturer = User::factory()->capturer()->create();

    $this->actingAs($admin)
        ->patch(route('admin.team.update', $capturer), ['is_active' => false])
        ->assertRedirect();

    expect($capturer->refresh()->isActive())->toBeFalse();

    $this->actingAs($capturer)
        ->get(route('captures.index'))
        ->assertRedirect(route('login'));
    $this->assertGuest();

    $this->post(route('login.store'), ['email' => $capturer->email, 'password' => 'password'])
        ->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('a capturer can edit their capture while it waits for review', function () {
    $capturer = User::factory()->capturer()->create();
    $professional = Professional::factory()->create([
        'onboarded_by_id' => $capturer->id,
        'review_status' => Professional::REVIEW_PENDING,
    ]);

    $this->actingAs($capturer)
        ->get(route('captures.professionals.show', $professional))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('captures/professional')
            ->where('canEdit', true));

    $this->actingAs($capturer)
        ->put(route('captures.professionals.update', $professional), capturedProfessional(['full_name' => 'Christian Mukendi Jr']))
        ->assertRedirect(route('captures.professionals.show', $professional));

    expect($professional->refresh())
        ->full_name->toBe('Christian Mukendi Jr')
        ->review_status->toBe(Professional::REVIEW_PENDING);
});

test('fixing a capture the team sent back puts it back in the review queue', function () {
    $capturer = User::factory()->capturer()->create();
    $professional = Professional::factory()->create([
        'onboarded_by_id' => $capturer->id,
        'review_status' => Professional::REVIEW_CHANGES_REQUESTED,
    ]);

    $this->actingAs($capturer)
        ->put(route('captures.professionals.update', $professional), capturedProfessional());

    expect($professional->refresh()->review_status)->toBe(Professional::REVIEW_RESUBMITTED);
});

test('once approved, a capture is read-only', function () {
    $capturer = User::factory()->capturer()->create();
    $professional = Professional::factory()->verified()->create([
        'onboarded_by_id' => $capturer->id,
        'full_name' => 'Original Name',
        'review_status' => Professional::REVIEW_APPROVED,
    ]);

    $this->actingAs($capturer)
        ->get(route('captures.professionals.show', $professional))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('canEdit', false));

    $this->actingAs($capturer)
        ->put(route('captures.professionals.update', $professional), capturedProfessional(['full_name' => 'Changed']))
        ->assertForbidden();

    expect($professional->refresh()->full_name)->toBe('Original Name');
});

test('capturers cannot open or edit someone else\'s capture', function () {
    $professional = Professional::factory()->create([
        'onboarded_by_id' => User::factory()->capturer()->create()->id,
        'review_status' => Professional::REVIEW_PENDING,
    ]);
    $otherCapturer = User::factory()->capturer()->create();

    $this->actingAs($otherCapturer)
        ->get(route('captures.professionals.show', $professional))
        ->assertForbidden();

    $this->actingAs($otherCapturer)
        ->put(route('captures.professionals.update', $professional), capturedProfessional())
        ->assertForbidden();
});

test('a capturer can correct a fleet and its vehicles until it is approved', function () {
    $capturer = User::factory()->capturer()->create();
    $this->actingAs($capturer)->post(route('admin.vehicle-providers.store'), capturedFleet());
    $provider = VehicleProvider::sole();
    $vehicle = $provider->vehicles()->sole();

    $this->actingAs($capturer)
        ->put(route('captures.fleets.update', $provider), [...collect(capturedFleet())->except('vehicles')->all(), 'business_name' => 'Kongo Fleet Services'])
        ->assertRedirect(route('captures.fleets.show', $provider));
    expect($provider->refresh()->business_name)->toBe('Kongo Fleet Services');

    $this->actingAs($capturer)
        ->put(route('captures.vehicles.update', $vehicle), [...collect(capturedFleet()['vehicles'][0])->except('photos')->all(), 'model' => 'Land Cruiser'])
        ->assertRedirect(route('captures.fleets.show', $provider));
    expect($vehicle->refresh()->model)->toBe('Land Cruiser');

    $this->actingAs($capturer)
        ->post(route('captures.vehicles.store', $provider), capturedFleet()['vehicles'][0])
        ->assertRedirect(route('captures.fleets.show', $provider));
    expect($provider->vehicles()->count())->toBe(2);

    $this->actingAs($capturer)
        ->delete(route('captures.vehicles.destroy', $vehicle))
        ->assertRedirect(route('captures.fleets.show', $provider));
    expect($provider->vehicles()->count())->toBe(1);

    $provider->forceFill(['review_status' => VehicleProvider::REVIEW_APPROVED])->save();
    $remaining = $provider->vehicles()->sole();

    $this->actingAs($capturer)->get(route('captures.fleets.show', $provider))
        ->assertInertia(fn (Assert $page) => $page->where('canEdit', false));
    $this->actingAs($capturer)->get(route('captures.vehicles.edit', $remaining))->assertForbidden();
    $this->actingAs($capturer)->delete(route('captures.vehicles.destroy', $remaining))->assertForbidden();
    $this->actingAs($capturer)->post(route('captures.vehicles.store', $provider), capturedFleet()['vehicles'][0])->assertForbidden();
});
