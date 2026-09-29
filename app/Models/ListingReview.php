<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * One step in a listing's review history: a submission by the pro, a
 * decision by an admin, or a change that needs a fresh review.
 *
 * @property int $id
 * @property string $reviewable_type
 * @property int $reviewable_id
 * @property int|null $reviewer_id
 * @property string $event
 * @property string|null $message
 * @property string|null $internal_note
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['event', 'message', 'internal_note'])]
class ListingReview extends Model
{
    public const EVENT_SUBMITTED = 'submitted';

    public const EVENT_RESUBMITTED = 'resubmitted';

    public const EVENT_KEY_DETAILS_CHANGED = 'key_details_changed';

    public const EVENT_APPROVED = 'approved';

    public const EVENT_CHANGES_REQUESTED = 'changes_requested';

    public const EVENT_DECLINED = 'declined';

    /**
     * The listing this review step belongs to.
     *
     * @return MorphTo<Model, $this>
     */
    public function reviewable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * The admin who made the decision, if any.
     *
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
