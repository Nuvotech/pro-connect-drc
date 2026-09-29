<?php

namespace App\Models;

use Database\Factories\CustomerReviewFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * A customer's rating of a professional or vehicle provider, usually tied
 * to the quote or booking it is about. Only published reviews count
 * towards the listing's rating.
 *
 * @property int $id
 * @property string $reviewable_type
 * @property int $reviewable_id
 * @property int $customer_id
 * @property int|null $quote_id
 * @property int|null $vehicle_booking_id
 * @property int $rating
 * @property string|null $comment
 * @property string|null $reply
 * @property Carbon|null $replied_at
 * @property Carbon|null $published_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['rating', 'comment', 'reply', 'replied_at', 'published_at'])]
class CustomerReview extends Model
{
    /** @use HasFactory<CustomerReviewFactory> */
    use HasFactory;

    /**
     * Keep the listing's cached rating in step with its reviews.
     */
    protected static function booted(): void
    {
        $refresh = function (self $review): void {
            $review->reviewable?->refreshRating();
        };

        static::saved($refresh);
        static::deleted($refresh);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'replied_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    /**
     * Only reviews that are visible on the listing.
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->whereNotNull('published_at');
    }

    /**
     * The professional or vehicle provider being reviewed.
     *
     * @return MorphTo<Model, $this>
     */
    public function reviewable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * The customer who wrote the review.
     *
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * The quote for the job being reviewed.
     *
     * @return BelongsTo<Quote, $this>
     */
    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    /**
     * The vehicle hire being reviewed.
     *
     * @return BelongsTo<VehicleBooking, $this>
     */
    public function vehicleBooking(): BelongsTo
    {
        return $this->belongsTo(VehicleBooking::class);
    }
}
