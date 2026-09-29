<?php

namespace App\Http\Controllers\Pro;

use App\Http\Controllers\Controller;
use App\Models\CustomerReview;
use App\Models\Professional;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The published reviews on a pro's listings, with a public reply each.
 */
class ReviewController extends Controller
{
    /**
     * List the published reviews on the pro's service listing and fleet.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $listings = collect([$user->professional, $user->vehicleProvider])->filter();

        $reviews = CustomerReview::query()
            ->published()
            ->where(function ($query) use ($listings) {
                foreach ($listings as $listing) {
                    $query->orWhere(fn ($query) => $query->whereMorphedTo('reviewable', $listing));
                }
            })
            ->when($listings->isEmpty(), fn ($query) => $query->whereRaw('1 = 0'))
            ->with(['customer', 'reviewable'])
            ->latest('published_at')
            ->get();

        return Inertia::render('dashboard/reviews', [
            'reviews' => $reviews->map(fn (CustomerReview $review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'reply' => $review->reply,
                'customer' => str($review->customer->full_name)->before(' ')->toString(),
                'listing' => $review->reviewable instanceof Professional ? 'Services' : 'Fleet',
                'publishedAt' => $review->published_at?->isoFormat('ll'),
            ])->all(),
            'averageRating' => $reviews->isEmpty() ? null : round($reviews->avg('rating'), 1),
        ]);
    }

    /**
     * Post or update the pro's public reply to a review.
     */
    public function reply(Request $request, CustomerReview $review): RedirectResponse
    {
        abort_unless($review->published_at !== null && $review->reviewable?->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'reply' => ['required', 'string', 'max:1000'],
        ], [
            'reply.required' => __('Write a reply, or close this box.'),
        ]);

        $review->update(['reply' => $validated['reply'], 'replied_at' => now()]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Your reply is now public.')]);

        return back();
    }
}
