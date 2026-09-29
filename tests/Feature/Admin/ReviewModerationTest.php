<?php

use App\Models\CustomerReview;
use App\Models\Professional;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admins see reviews waiting for approval', function () {
    $pending = CustomerReview::factory()->unpublished()->create();
    CustomerReview::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.reviews.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reviews')
            ->where('tab', 'pending')
            ->has('reviews.data', 1)
            ->where('reviews.data.0.id', $pending->id)
            ->where('counts', ['pending' => 1, 'published' => 1]));
});

test('approving a review publishes it and updates the rating', function () {
    $professional = Professional::factory()->verified()->create();
    $review = CustomerReview::factory()->unpublished()->for($professional, 'reviewable')->create(['rating' => 4]);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.reviews.approve', $review))
        ->assertRedirect();

    expect($review->refresh()->published_at)->not->toBeNull()
        ->and($professional->refresh())
        ->reviews_count->toBe(1)
        ->and((float) $professional->rating_average)->toBe(4.0);
});

test('removing a review deletes it', function () {
    $review = CustomerReview::factory()->unpublished()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->delete(route('admin.reviews.destroy', $review))
        ->assertRedirect();

    expect(CustomerReview::count())->toBe(0);
});

test('only admins can moderate reviews', function () {
    $review = CustomerReview::factory()->unpublished()->create();

    $this->actingAs(User::factory()->create())
        ->post(route('admin.reviews.approve', $review))
        ->assertForbidden();

    expect($review->refresh()->published_at)->toBeNull();
});
