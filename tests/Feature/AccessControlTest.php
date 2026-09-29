<?php

use App\Models\User;
use App\Models\VehicleProvider;

test('pros cannot open the admin panel', function (string $method, Closure $url) {
    $this->actingAs(User::factory()->create())
        ->{$method}($url())
        ->assertForbidden();
})->with([
    'applications' => ['get', fn () => route('admin.applications')],
    'professionals list' => ['get', fn () => route('admin.professionals.index')],
    'onboard professional' => ['post', fn () => route('admin.professionals.store')],
    'vehicle providers list' => ['get', fn () => route('admin.vehicle-providers.index')],
    'vehicle provider' => ['get', fn () => route('admin.vehicle-providers.show', VehicleProvider::factory()->create())],
    'onboard vehicle provider' => ['post', fn () => route('admin.vehicle-providers.store')],
    'review decision' => ['post', fn () => route('admin.applications.decision', ['type' => 'vehicle_provider', 'id' => VehicleProvider::factory()->create()->id])],
]);

test('admins can open the admin panel', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.professionals.index'))
        ->assertOk();
});

test('new users are pros', function () {
    expect(User::factory()->create()->isAdmin())->toBeFalse();
});

test('admins land on the admin panel after logging in', function () {
    $admin = User::factory()->admin()->create();

    $this->post(route('login.store'), ['email' => $admin->email, 'password' => 'password'])
        ->assertRedirect(route('admin.applications'));
});

test('pros land on their dashboard after logging in', function () {
    $pro = User::factory()->create();

    $this->post(route('login.store'), ['email' => $pro->email, 'password' => 'password'])
        ->assertRedirect(route('dashboard'));
});

test('a pro is not sent back to an admin page after logging in', function () {
    $pro = User::factory()->create();

    $this->get(route('admin.applications'))->assertRedirect(route('login'));

    $this->post(route('login.store'), ['email' => $pro->email, 'password' => 'password'])
        ->assertRedirect(route('dashboard'));
});

test('admins are sent from the dashboard to the admin panel', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('dashboard'))
        ->assertRedirect(route('admin.applications'));
});

test('the make-admin command promotes a user', function () {
    $user = User::factory()->create(['email' => 'ops@example.com']);

    $this->artisan('app:make-admin', ['email' => 'ops@example.com'])
        ->assertSuccessful();

    expect($user->fresh()->isAdmin())->toBeTrue();
});

test('the make-admin command fails for an unknown email', function () {
    $this->artisan('app:make-admin', ['email' => 'nobody@example.com'])
        ->assertFailed();
});
