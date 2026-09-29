<?php

use App\Models\Customer;
use App\Models\Professional;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBooking;
use App\Models\VehicleProvider;
use App\Notifications\BookingUpdated;
use App\Notifications\QuoteReceived;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * A pro with a service listing and one quote invitation.
 *
 * @return array{0: User, 1: Quote}
 */
function proWithInvitation(): array
{
    $pro = User::factory()->create();
    $professional = Professional::factory()->verified()->for($pro)->create();
    $quote = Quote::factory()->for($professional)->create([
        'quote_request_id' => QuoteRequest::factory()->for(Customer::factory()->state(['email' => 'client@example.com'])),
    ]);

    return [$pro, $quote];
}

test('a pro sees only their own quote invitations', function () {
    [$pro, $quote] = proWithInvitation();
    Quote::factory()->create();

    $this->actingAs($pro)
        ->get(route('dashboard.quotes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/quotes/index')
            ->has('quotes', 1)
            ->where('quotes.0.id', $quote->id));
});

test('opening an invitation marks it as viewed', function () {
    [$pro, $quote] = proWithInvitation();

    $this->actingAs($pro)
        ->get(route('dashboard.quotes.show', $quote))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/quotes/show')
            ->where('quote.canRespond', true)
            ->where('quote.customer.email', 'client@example.com'));

    expect($quote->fresh()->status)->toBe(Quote::STATUS_VIEWED);
});

test('sending a price updates the quote and the request and emails the client', function () {
    Notification::fake();
    [$pro, $quote] = proWithInvitation();

    $this->actingAs($pro)
        ->patch(route('dashboard.quotes.update', $quote), [
            'amount' => '150',
            'currency' => 'USD',
            'estimated_duration' => '1 day',
            'message' => 'Includes new pipes and the call-out fee.',
        ])
        ->assertRedirect(route('dashboard.quotes.show', $quote));

    expect($quote->fresh())
        ->status->toBe(Quote::STATUS_QUOTED)
        ->amount->toBe('150.00')
        ->responded_at->not->toBeNull()
        ->and($quote->quoteRequest->fresh()->status)->toBe(QuoteRequest::STATUS_QUOTED);

    Notification::assertSentTo(
        new AnonymousNotifiable,
        QuoteReceived::class,
        fn (QuoteReceived $notification, array $channels, AnonymousNotifiable $notifiable) => $notifiable->routes['mail'] === 'client@example.com',
    );
});

test('a quote needs a price and a message', function () {
    [$pro, $quote] = proWithInvitation();

    $this->actingAs($pro)
        ->patch(route('dashboard.quotes.update', $quote), ['currency' => 'USD'])
        ->assertSessionHasErrors(['amount' => 'Enter your price.', 'message' => 'Tell the client what the price includes.']);

    expect($quote->fresh()->status)->toBe(Quote::STATUS_INVITED);
});

test('a pro can decline an invitation', function () {
    [$pro, $quote] = proWithInvitation();

    $this->actingAs($pro)
        ->post(route('dashboard.quotes.decline', $quote))
        ->assertRedirect(route('dashboard.quotes.index'));

    expect($quote->fresh()->status)->toBe(Quote::STATUS_DECLINED);
});

test('pros cannot open or answer another pro\'s quote', function (string $method, string $routeName) {
    [, $quote] = proWithInvitation();
    $otherPro = User::factory()->create();
    Professional::factory()->verified()->for($otherPro)->create();

    $this->actingAs($otherPro)
        ->{$method}(route($routeName, $quote), ['amount' => 10, 'currency' => 'USD', 'message' => 'Not my job to price.'])
        ->assertForbidden();
})->with([
    'view' => ['get', 'dashboard.quotes.show'],
    'send price' => ['patch', 'dashboard.quotes.update'],
    'decline' => ['post', 'dashboard.quotes.decline'],
]);

test('a fleet confirms a booking and the client is emailed', function (string $status) {
    Notification::fake();
    $owner = User::factory()->create();
    $fleet = VehicleProvider::factory()->verified()->for($owner)->create();
    $booking = VehicleBooking::factory()->create([
        'vehicle_provider_id' => $fleet->id,
        'vehicle_id' => Vehicle::factory()->for($fleet, 'provider'),
        'customer_id' => Customer::factory()->state(['email' => 'client@example.com']),
    ]);

    $this->actingAs($owner)
        ->get(route('dashboard.bookings.index'))
        ->assertInertia(fn (Assert $page) => $page->component('dashboard/bookings/index')->has('bookings', 1));

    $this->actingAs($owner)
        ->patch(route('dashboard.bookings.update', $booking), ['status' => $status])
        ->assertRedirect();

    expect($booking->fresh())
        ->status->toBe($status)
        ->responded_at->not->toBeNull();
    Notification::assertSentTo(new AnonymousNotifiable, BookingUpdated::class);
})->with([VehicleBooking::STATUS_CONFIRMED, VehicleBooking::STATUS_DECLINED]);

test('a fleet cannot answer another fleet\'s booking', function () {
    $booking = VehicleBooking::factory()->create();
    $otherOwner = User::factory()->create();
    VehicleProvider::factory()->verified()->for($otherOwner)->create();

    $this->actingAs($otherOwner)
        ->patch(route('dashboard.bookings.update', $booking), ['status' => VehicleBooking::STATUS_CONFIRMED])
        ->assertForbidden();

    expect($booking->fresh()->status)->toBe(VehicleBooking::STATUS_REQUESTED);
});
