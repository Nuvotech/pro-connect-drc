<?php

namespace App\Models;

use App\Concerns\HasLocation;
use App\Concerns\HasReference;
use Database\Factories\QuoteRequestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A customer's request for quotes on a job, sent to matching professionals.
 *
 * @property int $id
 * @property string|null $reference
 * @property int $customer_id
 * @property int $category_id
 * @property int|null $requested_professional_id
 * @property string $service_type
 * @property string $description
 * @property string $timing
 * @property string|null $address
 * @property bool $needs_site_visit
 * @property string $contact_channel
 * @property string $status
 * @property Carbon|null $closed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'service_type',
    'description',
    'timing',
    'address',
    'needs_site_visit',
    'contact_channel',
    'status',
    'closed_at',
])]
class QuoteRequest extends Model
{
    /** @use HasFactory<QuoteRequestFactory> */
    use HasFactory, HasLocation, HasReference;

    public const REFERENCE_PREFIX = 'QR';

    public const STATUS_OPEN = 'open';

    public const STATUS_QUOTED = 'quoted';

    public const STATUS_ACCEPTED = 'accepted';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_EXPIRED = 'expired';

    /** @var list<string> */
    public const SERVICE_TYPES = ['emergency', 'installation', 'renovation', 'maintenance'];

    /** @var list<string> */
    public const TIMINGS = ['urgent', '48h', 'week', 'flexible'];

    /**
     * Most photos a customer can attach.
     */
    public const MAX_PHOTOS = 3;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'needs_site_visit' => 'boolean',
            'closed_at' => 'datetime',
        ];
    }

    /**
     * The customer who asked for quotes.
     *
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * The trade the job is for.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * The professional the customer asked for, when they started from a
     * pro's profile. The admin decides who is actually invited.
     *
     * @return BelongsTo<Professional, $this>
     */
    public function requestedProfessional(): BelongsTo
    {
        return $this->belongsTo(Professional::class, 'requested_professional_id');
    }

    /**
     * Photos of the job, in the order the customer added them.
     *
     * @return HasMany<QuoteRequestPhoto, $this>
     */
    public function photos(): HasMany
    {
        return $this->hasMany(QuoteRequestPhoto::class)->orderBy('position');
    }

    /**
     * Each matched professional's response.
     *
     * @return HasMany<Quote, $this>
     */
    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    /**
     * The professionals the request was sent to.
     *
     * @return BelongsToMany<Professional, $this, Quote>
     */
    public function professionals(): BelongsToMany
    {
        return $this->belongsToMany(Professional::class, 'quotes')
            ->using(Quote::class)
            ->withPivot(['id', 'status', 'amount', 'currency', 'responded_at'])
            ->withTimestamps();
    }
}
