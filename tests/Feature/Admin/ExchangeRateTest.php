<?php

use App\Models\ExchangeRate;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

test('the daily refresh stores the rate from the exchange rate API', function () {
    Http::fake(['*' => Http::response(['rates' => ['CDF' => 2311.5]])]);
    $this->travel(1)->minutes();

    $this->artisan('rates:refresh')->assertSuccessful();

    expect(ExchangeRate::current())
        ->rate->toBe(2311.5)
        ->source->toBe(ExchangeRate::SOURCE_API);
});

test('a failed or implausible API response keeps the last rate', function (Closure $response) {
    Http::fake(['*' => $response]);
    $before = ExchangeRate::count();

    $this->artisan('rates:refresh')->assertFailed();

    expect(ExchangeRate::count())->toBe($before)
        ->and(ExchangeRate::current()->rate)->toBe(2300.0);
})->with([
    'server error' => fn () => fn () => Http::response(null, 500),
    'missing rate' => fn () => fn () => Http::response(['rates' => []]),
    'absurd rate' => fn () => fn () => Http::response(['rates' => ['CDF' => 3]]),
]);

test('an admin can override the automatic rate and switch back', function () {
    $admin = User::factory()->admin()->create();

    $this->travel(1)->minutes();

    $this->actingAs($admin)
        ->put(route('admin.exchange-rate.update'), ['rate' => 2800])
        ->assertRedirect(route('admin.exchange-rate.edit'));

    expect(ExchangeRate::current())
        ->rate->toBe(2800.0)
        ->source->toBe(ExchangeRate::SOURCE_MANUAL);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('exchangeRate.rate', 2800)
            ->where('exchangeRate.source', 'manual'));

    $this->actingAs($admin)
        ->delete(route('admin.exchange-rate.destroy'))
        ->assertRedirect(route('admin.exchange-rate.edit'));

    expect(ExchangeRate::current())
        ->rate->toBe(2300.0)
        ->source->toBe(ExchangeRate::SOURCE_API);
});

test('a newer fetched rate replaces an older manual rate', function () {
    ExchangeRate::factory()->manual()->create(['rate' => 2800, 'effective_at' => now()->addMinute()]);
    ExchangeRate::factory()->create(['rate' => 2320, 'effective_at' => now()->addMinutes(2)]);

    expect(ExchangeRate::current()->rate)->toBe(2320.0);
});

test('the manual rate must be a plausible number of francs', function (mixed $rate) {
    $this->actingAs(User::factory()->admin()->create())
        ->put(route('admin.exchange-rate.update'), ['rate' => $rate])
        ->assertSessionHasErrors('rate');
})->with(['empty' => '', 'text' => 'abc', 'too low' => 10, 'too high' => 50000]);

test('admins see the exchange rate page', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.exchange-rate.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/exchange-rate')
            ->where('current.rate', 2300)
            ->where('latestApi.rate', 2300));
});

test('only admins can manage the exchange rate', function () {
    $this->get(route('admin.exchange-rate.edit'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->put(route('admin.exchange-rate.update'), ['rate' => 2800])
        ->assertForbidden();

    expect(ExchangeRate::where('source', ExchangeRate::SOURCE_MANUAL)->exists())->toBeFalse();
});
