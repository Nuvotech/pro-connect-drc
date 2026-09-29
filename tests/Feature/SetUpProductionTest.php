<?php

use App\Models\Category;
use App\Models\City;
use App\Models\Professional;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

beforeEach(fn () => Http::fake(['*' => Http::response(['rates' => ['CDF' => 2310]])]));

test('the install command creates the first admin with reference data and no demo data', function () {
    $this->artisan('proconnect:install', [
        '--admin-email' => 'owner@proconnect.cd',
        '--admin-password' => 'a-long-secure-password',
    ])->assertSuccessful();

    $admin = User::where('email', 'owner@proconnect.cd')->sole();

    expect($admin->isAdmin())->toBeTrue()
        ->and($admin->email_verified_at)->not->toBeNull()
        ->and(Hash::check('a-long-secure-password', $admin->password))->toBeTrue()
        ->and(City::where('name', 'Kinshasa')->exists())->toBeTrue()
        ->and(Category::where('slug', 'plumbers')->exists())->toBeTrue()
        ->and(Professional::count())->toBe(0)
        ->and(User::where('email', 'admin@proconnect.test')->exists())->toBeFalse();
});

test('an existing account with the admin email is promoted instead', function () {
    $user = User::factory()->create(['email' => 'owner@proconnect.cd']);

    $this->artisan('proconnect:install', ['--admin-email' => 'owner@proconnect.cd'])
        ->assertSuccessful();

    expect($user->refresh()->isAdmin())->toBeTrue()
        ->and(User::where('email', 'owner@proconnect.cd')->count())->toBe(1);
});

test('a weak admin password is refused', function () {
    $this->artisan('proconnect:install', [
        '--admin-email' => 'owner@proconnect.cd',
        '--admin-password' => 'short',
    ])->assertFailed();

    expect(User::where('email', 'owner@proconnect.cd')->exists())->toBeFalse();
});
