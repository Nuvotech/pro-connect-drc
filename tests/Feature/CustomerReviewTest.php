<?php

use App\Actions\SendReviewInvitation;
use App\Models\Customer;
use App\Models\CustomerReview;
use App\Models\Professional;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\User;
use App\Models\VehicleBooking;
use App\Notifications\JobCompleted;
use App\Notifications\NewReviewSubmitted;
use App\Notifications\ReviewInvitation;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * A pro's quote for a customer with an email address.
 *
 * @return array{0: User, 1: Quote}
 */
function proWithQuotedJob(): array
{
    $pro = User::factory()->create();
    $professional = Professional::factory()->verified()->for($pro)->create(['business_name' => 'Kabongo Plomberie']);
    $quote = Quote::factory()->quoted()->for($professional)->create([
        'quote_request_id' => QuoteRequest::factory()->for(Customer::factory()->state(['email' => 'client@example.com'])),
    ]);

    return [$pro, $quote];
}

test('marking a job done emails the customer a review link and tells the admins', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    [$pro, $quote] = proWithQuotedJob();

    $this->actingAs($pro)
        ->post(route('dashboard.quotes.complete', $quote))
        ->assertRedirect(route('dashboard.quotes.show', $quote));

    Notification::assertSentTo($admin, JobCompleted::class, fn (JobCompleted $notification) => $notification->customerWasEmailed);

    $this->actingAs($pro)
        ->get(route('dashboard.quotes.show', $quote))
        ->assertInertia(fn (Assert $page) => $page
            ->where('quote.status', Quote::STATUS_COMPLETED)
            ->missing('quote.reviewUrl'));

    expect($quote->refresh())
        ->status->toBe(Quote::STATUS_COMPLETED)
        ->completed_at->not->toBeNull()
        ->and($quote->quoteRequest->status)->toBe(QuoteRequest::STATUS_COMPLETED);

    Notification::assertSentTo(
        new AnonymousNotifiable,
        ReviewInvitation::class,
        fn (ReviewInvitation $notification, array $channels, AnonymousNotifiable $notifiable) => $notifiable->routes['mail'] === 'client@example.com',
    );
});

test('a job must have a price before it can be marked done', function () {
    [$pro, $quote] = proWithQuotedJob();
    $quote->update(['status' => Quote::STATUS_INVITED]);

    $this->actingAs($pro)
        ->post(route('dashboard.quotes.complete', $quote))
        ->assertConflict();
});

test('another pro cannot mark the job done', function () {
    [, $quote] = proWithQuotedJob();

    $this->actingAs(User::factory()->create())
        ->post(route('dashboard.quotes.complete', $quote))
        ->assertForbidden();
});

test('the private link shows the review form and saves an unpublished review', function () {
    Notification::fake();
    User::factory()->admin()->create();
    $quote = Quote::factory()->completed()->create();

    $this->get(SendReviewInvitation::url($quote))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/review')
            ->where('review', null)
            ->where('job.reference', $quote->quoteRequest->reference));

    $submitUrl = URL::temporarySignedRoute('reviews.store', now()->addDay(), ['type' => 'quote', 'id' => $quote->id]);

    $this->post($submitUrl, ['rating' => 5, 'comment' => 'Fixed the leak the same day.'])->assertRedirect();

    $review = CustomerReview::sole();
    expect($review)
        ->rating->toBe(5)
        ->published_at->toBeNull()
        ->quote_id->toBe($quote->id)
        ->customer_id->toBe($quote->quoteRequest->customer_id)
        ->reviewable->is($quote->professional)->toBeTrue()
        ->and($quote->professional->refresh()->reviews_count)->toBe(0);

    Notification::assertCount(1);
    Notification::assertSentTimes(NewReviewSubmitted::class, 1);
});

test('a vehicle hire can be reviewed once it is completed', function () {
    Notification::fake();
    $booking = VehicleBooking::factory()->completed()->create();

    $this->post(URL::temporarySignedRoute('reviews.store', now()->addDay(), ['type' => 'booking', 'id' => $booking->id]), ['rating' => 4])
        ->assertRedirect();

    expect(CustomerReview::sole())
        ->vehicle_booking_id->toBe($booking->id)
        ->reviewable->is($booking->vehicleProvider)->toBeTrue();
});

test('review links must be signed and not expired', function () {
    $quote = Quote::factory()->completed()->create();

    $this->get(route('reviews.create', ['type' => 'quote', 'id' => $quote->id]))->assertForbidden();

    $expiredUrl = URL::temporarySignedRoute('reviews.create', now()->subMinute(), ['type' => 'quote', 'id' => $quote->id]);
    $this->get($expiredUrl)->assertForbidden();

    $this->post(route('reviews.store', ['type' => 'quote', 'id' => $quote->id]), ['rating' => 5])->assertForbidden();
    expect(CustomerReview::count())->toBe(0);
});

test('unfinished jobs cannot be reviewed', function () {
    $quote = Quote::factory()->quoted()->create();

    $this->get(SendReviewInvitation::url($quote))->assertNotFound();
});

test('a job can only be reviewed once', function () {
    Notification::fake();
    $quote = Quote::factory()->completed()->create();
    $submitUrl = URL::temporarySignedRoute('reviews.store', now()->addDay(), ['type' => 'quote', 'id' => $quote->id]);

    $this->post($submitUrl, ['rating' => 5])->assertRedirect();
    $this->post($submitUrl, ['rating' => 1])->assertConflict();

    expect(CustomerReview::sole()->rating)->toBe(5);

    $this->get(SendReviewInvitation::url($quote))
        ->assertInertia(fn (Assert $page) => $page
            ->where('review.rating', 5)
            ->where('review.isPublished', false));
});

test('the rating must be between one and five stars', function (mixed $rating) {
    $quote = Quote::factory()->completed()->create();

    $this->post(URL::temporarySignedRoute('reviews.store', now()->addDay(), ['type' => 'quote', 'id' => $quote->id]), ['rating' => $rating])
        ->assertSessionHasErrors('rating');
})->with(['missing' => null, 'zero' => 0, 'six' => 6, 'text' => 'great']);
