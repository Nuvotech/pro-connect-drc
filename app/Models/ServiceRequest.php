<?php

namespace App\Models;

use App\Concerns\HasReference;
use Database\Factories\ServiceRequestFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A request for a business service (legal, accounting, trade…), matched to
 * a firm by the ProConnect team.
 *
 * @property int $id
 * @property string|null $reference
 * @property int $customer_id
 * @property int $category_id
 * @property string $description
 * @property string $timeline
 * @property int|null $city_id
 * @property string|null $attachment_path
 * @property string $status
 * @property int|null $professional_id
 * @property int|null $handled_by_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['description', 'timeline', 'attachment_path', 'status'])]
class ServiceRequest extends Model
{
    /** @use HasFactory<ServiceRequestFactory> */
    use HasFactory, HasReference;

    public const REFERENCE_PREFIX = 'SR';

    public const STATUS_NEW = 'new';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_MATCHED = 'matched';

    public const STATUS_CLOSED = 'closed';

    /** @var list<string> */
    public const TIMELINES = ['urgent', 'this_week', 'flexible'];

    /**
     * The customer who made the request.
     *
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * The business service asked for.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Where the service is needed; empty for provinces not in the list.
     *
     * @return BelongsTo<City, $this>
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * The firm the request was matched with.
     *
     * @return BelongsTo<Professional, $this>
     */
    public function professional(): BelongsTo
    {
        return $this->belongsTo(Professional::class);
    }

    /**
     * The admin handling the request.
     *
     * @return BelongsTo<User, $this>
     */
    public function handledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by_id');
    }
}
