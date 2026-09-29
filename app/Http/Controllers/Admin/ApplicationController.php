<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewApplicationResource;
use App\Models\Professional;
use App\Models\VehicleProvider;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    /**
     * Queue tabs and the review statuses each one shows.
     *
     * @var array<string, list<string>>
     */
    public const TABS = [
        'needs_review' => [Professional::REVIEW_PENDING, Professional::REVIEW_RESUBMITTED],
        'changes_requested' => [Professional::REVIEW_CHANGES_REQUESTED],
        'approved' => [Professional::REVIEW_APPROVED],
        'declined' => [Professional::REVIEW_DECLINED],
    ];

    /**
     * Show the review queue: service and fleet listings together, oldest
     * submission first, with the selected listing's full details.
     */
    public function index(Request $request): Response
    {
        $selectedKey = $request->string('listing')->toString() ?: null;
        $tab = $this->tabForListing($selectedKey) ?? $request->string('status')->toString();
        $tab = array_key_exists($tab, self::TABS) ? $tab : 'needs_review';

        $applications = $this->listingsWithStatuses(self::TABS[$tab])
            ->sortBy(fn (Professional|VehicleProvider $listing) => $listing->submitted_at?->getTimestamp() ?? 0)
            ->values();

        return Inertia::render('admin/applications', [
            'tab' => $tab,
            'selectedKey' => $selectedKey,
            'applications' => ReviewApplicationResource::collection($applications)->resolve(),
            'counts' => collect(self::TABS)->map(fn (array $statuses) => $this->countWithStatuses($statuses)),
            'averageDecisionHours' => $this->averageDecisionHours(),
        ]);
    }

    /**
     * Both kinds of listing in the given review statuses, ready to show.
     *
     * @param  list<string>  $statuses
     * @return Collection<int, Professional|VehicleProvider>
     */
    private function listingsWithStatuses(array $statuses): Collection
    {
        $withReviews = ['reviews.reviewer:id,name', 'city', 'commune'];

        return Professional::query()
            ->whereIn('review_status', $statuses)
            ->with([...$withReviews, 'photos', 'categories'])
            ->get()
            ->concat(
                VehicleProvider::query()
                    ->whereIn('review_status', $statuses)
                    ->with([...$withReviews, 'vehicles.photos', 'vehicles.category'])
                    ->get(),
            );
    }

    /**
     * @param  list<string>  $statuses
     */
    private function countWithStatuses(array $statuses): int
    {
        return Professional::whereIn('review_status', $statuses)->count()
            + VehicleProvider::whereIn('review_status', $statuses)->count();
    }

    /**
     * The tab a preselected listing (`professional-5`) currently sits in.
     */
    private function tabForListing(?string $key): ?string
    {
        if (! $key || ! preg_match('/^(professional|vehicle_provider)-(\d+)$/', $key, $matches)) {
            return null;
        }

        $query = $matches[1] === 'professional' ? Professional::query() : VehicleProvider::query();
        $status = $query->whereKey((int) $matches[2])->value('review_status');

        return collect(self::TABS)->search(fn (array $statuses) => in_array($status, $statuses, true)) ?: null;
    }

    /**
     * Average time from submission to an admin's decision, in hours.
     */
    private function averageDecisionHours(): ?float
    {
        $decided = fn (Builder $query) => $query
            ->whereIn('review_status', [Professional::REVIEW_APPROVED, Professional::REVIEW_CHANGES_REQUESTED, Professional::REVIEW_DECLINED])
            ->whereNotNull('submitted_at');

        $hours = Professional::query()->tap($decided)->with('reviews')->get()
            ->concat(VehicleProvider::query()->tap($decided)->with('reviews')->get())
            ->map(function (Professional|VehicleProvider $listing) {
                $decision = $listing->reviews->firstWhere('reviewer_id', '!=', null);

                return $decision?->created_at && $listing->submitted_at
                    ? max(0, $listing->submitted_at->diffInMinutes($decision->created_at) / 60)
                    : null;
            })
            ->filter(fn (?float $value) => $value !== null);

        return $hours->isEmpty() ? null : round($hours->avg(), 1);
    }
}
