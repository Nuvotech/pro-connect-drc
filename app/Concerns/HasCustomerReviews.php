<?php

namespace App\Concerns;

use App\Models\CustomerReview;
use App\Models\Favorite;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * Customer ratings and saves for a public listing, with the rating cached
 * on the listing so directory pages don't recount reviews.
 *
 * @property string|null $rating_average
 * @property int $reviews_count
 */
trait HasCustomerReviews
{
    /**
     * Reviews customers have left for this listing.
     *
     * @return MorphMany<CustomerReview, $this>
     */
    public function customerReviews(): MorphMany
    {
        return $this->morphMany(CustomerReview::class, 'reviewable');
    }

    /**
     * Customers who saved this listing.
     *
     * @return MorphMany<Favorite, $this>
     */
    public function favorites(): MorphMany
    {
        return $this->morphMany(Favorite::class, 'favoritable');
    }

    /**
     * Recalculate the cached rating from the published reviews.
     */
    public function refreshRating(): void
    {
        $published = $this->customerReviews()->published();

        $this->forceFill([
            'rating_average' => $published->clone()->avg('rating'),
            'reviews_count' => $published->clone()->count(),
        ])->saveQuietly();
    }
}
