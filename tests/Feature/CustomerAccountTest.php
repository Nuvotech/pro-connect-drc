<?php

use App\Models\Customer;
use App\Models\CustomerReview;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('registering links the requests a customer already sent', function () {
    $customer = Customer::factory()->create(['email' => 'amani@example.com']);
    $quoteRequest = QuoteRequest::factory()->for($customer)->create();

    $this->post(route('account.register.store'), [
        'full_name' => 'Amani Kasongo',
        'email' => 'Amani@example.com',
        'phone' => '81 234 5678',
        'password' => 'correct-horse-battery',
        'password_confirmation' => 'correct-horse-battery',
    ])->assertRedirect(route('account.index'));

    $user = User::where('email', 'Amani@example.com')->sole();
    expect($user->isCustomer())->toBeTrue()
        ->and($customer->refresh()->user_id)->toBe($user->id);

    $this->get(route('account.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('account/index')
            ->has('quoteRequests', 1)
            ->where('quoteRequests.0.reference', $quoteRequest->reference));
});

test('the account lists only the signed-in customer\'s own jobs', function () {
    $customer = Customer::factory()->withAccount()->create();
    $ownQuote = Quote::factory()->completed()->create(['quote_request_id' => QuoteRequest::factory()->for($customer)]);
    Quote::factory()->completed()->create();

    $this->actingAs($customer->user)
        ->get(route('account.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('quoteRequests', 1)
            ->where('quoteRequests.0.finishedJobs.0.reviewUrl', route('reviews.create', ['type' => 'quote', 'id' => $ownQuote->id]))
            ->where('quoteRequests.0.finishedJobs.0.isReviewed', false));
});

test('signed-in customers can review their own jobs without a private link', function () {
    Notification::fake();
    $customer = Customer::factory()->withAccount()->create();
    $quote = Quote::factory()->completed()->create(['quote_request_id' => QuoteRequest::factory()->for($customer)]);

    $this->actingAs($customer->user)
        ->get(route('reviews.create', ['type' => 'quote', 'id' => $quote->id]))
        ->assertOk();

    $this->actingAs($customer->user)
        ->post(route('reviews.store', ['type' => 'quote', 'id' => $quote->id]), ['rating' => 4])
        ->assertRedirect(route('reviews.create', ['type' => 'quote', 'id' => $quote->id]));

    expect(CustomerReview::sole()->customer_id)->toBe($customer->id);
});

test('customers cannot review someone else\'s job', function () {
    $customer = Customer::factory()->withAccount()->create();
    $otherQuote = Quote::factory()->completed()->create();

    $this->actingAs($customer->user)
        ->post(route('reviews.store', ['type' => 'quote', 'id' => $otherQuote->id]), ['rating' => 1])
        ->assertForbidden();

    expect(CustomerReview::count())->toBe(0);
});

test('customers land on their account after logging in', function () {
    $customer = Customer::factory()->withAccount()->create();

    $this->post(route('login.store'), [
        'email' => $customer->user->email,
        'password' => 'password',
    ])->assertRedirect(route('account.index'));
});

test('pros cannot open the customer account', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('account.index'))
        ->assertForbidden();
});
