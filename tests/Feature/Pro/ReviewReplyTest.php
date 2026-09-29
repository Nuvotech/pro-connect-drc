<?php

use App\Models\CustomerReview;
use App\Models\Professional;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a pro sees the published reviews on their listing', function () {
    $pro = User::factory()->create();
    $professional = Professional::factory()->verified()->for($pro)->create();
    $published = CustomerReview::factory()->for($professional, 'reviewable')->create(['rating' => 5]);
    CustomerReview::factory()->unpublished()->for($professional, 'reviewable')->create();
    CustomerReview::factory()->create();

    $this->actingAs($pro)
        ->get(route('dashboard.reviews.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/reviews')
            ->has('reviews', 1)
            ->where('reviews.0.id', $published->id)
            ->where('averageRating', 5));
});

test('a pro can reply publicly to a review of their listing', function () {
    $pro = User::factory()->create();
    $professional = Professional::factory()->verified()->for($pro)->create();
    $review = CustomerReview::factory()->for($professional, 'reviewable')->create();

    $this->actingAs($pro)
        ->patch(route('dashboard.reviews.reply', $review), ['reply' => 'Thank you, it was a pleasure!'])
        ->assertRedirect();

    expect($review->refresh())
        ->reply->toBe('Thank you, it was a pleasure!')
        ->replied_at->not->toBeNull();
});

test('a pro cannot reply to reviews of another listing', function () {
    $pro = User::factory()->create();
    Professional::factory()->verified()->for($pro)->create();
    $review = CustomerReview::factory()->create();

    $this->actingAs($pro)
        ->patch(route('dashboard.reviews.reply', $review), ['reply' => 'Not mine'])
        ->assertForbidden();

    expect($review->refresh()->reply)->toBeNull();
});
