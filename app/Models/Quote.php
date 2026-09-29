<?php

namespace App\Models;

use Database\Factories\QuoteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Carbon;

/**
 * A professional's response to a quote request they were matched with.
 *
 * @property int $id
 * @property int $quote_request_id
 * @property int $professional_id
 * @property string $status
 * @property string|null $amount
 * @property string $currency
 * @property string|null $message
 * @property string|null $estimated_duration
 * @property Carbon|null $site_visit_at
 * @property Carbon|null $responded_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'status',
    'amount',
    'currency',
    'message',
    'estimated_duration',
    'site_visit_at',
    'responded_at',
    'completed_at',
])]
class Quote extends Pivot
{
    /** @use HasFactory<QuoteFactory> */
    use HasFactory;

    /**
     * Quotes are full records with their own id, not a bare join table.
     *
     * @var bool
     */
    public $incrementing = true;

    /**
     * @var string
     */
    protected $table = 'quotes';

    public const STATUS_INVITED = 'invited';

    public const STATUS_VIEWED = 'viewed';

    public const STATUS_QUOTED = 'quoted';

    public const STATUS_DECLINED = 'declined';

    public const STATUS_ACCEPTED = 'accepted';

    public const STATUS_REJECTED = 'rejected';

    /**
     * The pro has finished the job; the customer can now review it.
     */
    public const STATUS_COMPLETED = 'completed';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'site_visit_at' => 'datetime',
            'responded_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * The request this quote answers.
     *
     * @return BelongsTo<QuoteRequest, $this>
     */
    public function quoteRequest(): BelongsTo
    {
        return $this->belongsTo(QuoteRequest::class);
    }

    /**
     * The professional who was asked to quote.
     *
     * @return BelongsTo<Professional, $this>
     */
    public function professional(): BelongsTo
    {
        return $this->belongsTo(Professional::class);
    }

    /**
     * The customer's review once the job is done.
     *
     * @return HasOne<CustomerReview, $this>
     */
    public function review(): HasOne
    {
        return $this->hasOne(CustomerReview::class, 'quote_id');
    }
}
