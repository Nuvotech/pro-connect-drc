<?php

namespace App\Concerns;

use App\Models\ListingReview;
use App\Models\User;
use App\Notifications\ListingReviewed;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * The admin review workflow shared by professional and fleet listings.
 *
 * `verified_at` stays the single "is it live" flag; `review_status` says
 * where the listing is in the review loop.
 *
 * @property-read User|null $user
 * @property string $review_status
 * @property Carbon|null $submitted_at
 */
trait Reviewable
{
    public const REVIEW_PENDING = 'pending';

    public const REVIEW_RESUBMITTED = 'resubmitted';

    public const REVIEW_CHANGES_REQUESTED = 'changes_requested';

    public const REVIEW_APPROVED = 'approved';

    public const REVIEW_DECLINED = 'declined';

    /**
     * Admin decisions and the review status each one leads to.
     *
     * @var array<string, string>
     */
    public const DECISION_STATUSES = [
        'approve' => self::REVIEW_APPROVED,
        'request_changes' => self::REVIEW_CHANGES_REQUESTED,
        'decline' => self::REVIEW_DECLINED,
    ];

    /**
     * The listing's review history, newest first.
     *
     * @return MorphMany<ListingReview, $this>
     */
    public function reviews(): MorphMany
    {
        return $this->morphMany(ListingReview::class, 'reviewable')->latest('id');
    }

    /**
     * The most recent decision an admin made about this listing.
     */
    public function latestAdminReview(): ?ListingReview
    {
        return $this->reviews()->whereNotNull('reviewer_id')->first();
    }

    /**
     * Only listings the team has verified, which are the ones clients see.
     *
     * @param  Builder<static>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->whereNotNull('verified_at');
    }

    /**
     * Determine whether the listing is waiting in the admin queue.
     */
    public function isAwaitingReview(): bool
    {
        return in_array($this->review_status, [self::REVIEW_PENDING, self::REVIEW_RESUBMITTED], true);
    }

    /**
     * Determine whether the pro can send the listing back for review.
     */
    public function canResubmit(): bool
    {
        return in_array($this->review_status, [self::REVIEW_CHANGES_REQUESTED, self::REVIEW_DECLINED], true);
    }

    /**
     * Where the listing is in the review loop, and the admin's last word,
     * for the pro's dashboard.
     *
     * @return array{isVerified: bool, reviewStatus: string, submittedAt: string|null, canResubmit: bool, adminMessage: string|null, decidedAt: string|null}
     */
    public function reviewSummary(): array
    {
        $latestDecision = $this->latestAdminReview();

        return [
            'isVerified' => $this->isVerified(),
            'reviewStatus' => $this->review_status,
            'submittedAt' => $this->submitted_at?->toDateString(),
            'canResubmit' => $this->canResubmit(),
            'adminMessage' => $latestDecision?->message,
            'decidedAt' => $latestDecision?->created_at?->toDateString(),
        ];
    }

    /**
     * Put the listing in the admin queue and record why.
     */
    public function submitForReview(string $event = ListingReview::EVENT_SUBMITTED): void
    {
        $this->forceFill([
            'verified_at' => null,
            'review_status' => $event === ListingReview::EVENT_RESUBMITTED ? self::REVIEW_RESUBMITTED : self::REVIEW_PENDING,
            'submitted_at' => now(),
        ])->save();

        $this->logReviewEvent($event);
    }

    /**
     * Record an admin's decision, update the listing and let the pro know.
     */
    public function recordDecision(User $admin, string $decision, ?string $message = null, ?string $internalNote = null, bool $notify = true): ListingReview
    {
        $status = self::DECISION_STATUSES[$decision];

        $review = DB::transaction(function () use ($admin, $status, $message, $internalNote) {
            $this->forceFill([
                'review_status' => $status,
                'verified_at' => $status === self::REVIEW_APPROVED ? now() : null,
            ])->save();

            return $this->logReviewEvent($status, $admin, $message, $internalNote);
        });

        if ($notify && $this->user) {
            $this->user->notify(new ListingReviewed($this, $status, $message));
        }

        return $review;
    }

    /**
     * When details an admin approved change, take the listing off the site
     * and back into the queue. Call before saving; returns whether it did.
     * Listings already waiting for review, or for the pro to make
     * requested changes, are left as they are.
     */
    public function resetVerificationIfKeyFieldsChanged(): bool
    {
        if (! $this->isVerified() || ! $this->isDirty(['provider_type', 'registry_number', 'tax_id', 'identity_document_path', 'business_registration_path'])) {
            return false;
        }

        $this->markForReReview();

        return true;
    }

    /**
     * Take an approved listing off the site and back into the queue, for
     * example after a new vehicle is added. Call before saving.
     */
    public function markForReReview(): void
    {
        $this->forceFill([
            'verified_at' => null,
            'review_status' => self::REVIEW_PENDING,
            'submitted_at' => now(),
        ]);
    }

    /**
     * Add a step to the listing's review history.
     */
    public function logReviewEvent(string $event, ?User $reviewer = null, ?string $message = null, ?string $internalNote = null): ListingReview
    {
        $review = new ListingReview([
            'event' => $event,
            'message' => $message,
            'internal_note' => $internalNote,
        ]);
        $review->reviewer()->associate($reviewer);

        return $this->reviews()->save($review);
    }
}
