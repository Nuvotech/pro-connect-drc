<?php

use App\Models\CustomerReview;
use App\Models\Professional;
use App\Models\VehicleProvider;

test('published reviews set the listing rating', function () {
    $professional = Professional::factory()->create();

    CustomerReview::factory()->for($professional, 'reviewable')->create(['rating' => 5]);
    CustomerReview::factory()->for($professional, 'reviewable')->create(['rating' => 4]);
    CustomerReview::factory()->for($professional, 'reviewable')->unpublished()->create(['rating' => 1]);

    expect($professional->fresh())
        ->rating_average->toBe('4.5')
        ->reviews_count->toBe(2);
});

test('publishing and deleting a review updates the rating', function () {
    $provider = VehicleProvider::factory()->create();
    $review = CustomerReview::factory()->for($provider, 'reviewable')->unpublished()->create(['rating' => 3]);

    expect($provider->fresh()->reviews_count)->toBe(0);

    $review->update(['published_at' => now()]);

    expect($provider->fresh())
        ->rating_average->toBe('3.0')
        ->reviews_count->toBe(1);

    $review->delete();

    expect($provider->fresh())
        ->rating_average->toBeNull()
        ->reviews_count->toBe(0);
});
