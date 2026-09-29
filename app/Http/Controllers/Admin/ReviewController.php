<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerReview;
use App\Models\Professional;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    /**
     * List reviews waiting for approval, or those already published.
     */
    public function index(Request $request): Response
    {
        $tab = $request->query('tab') === 'published' ? 'published' : 'pending';

        $reviews = CustomerReview::query()
            ->with(['reviewable', 'customer', 'quote.quoteRequest.category', 'vehicleBooking.vehicle'])
            ->when($tab === 'published', fn ($query) => $query->whereNotNull('published_at'), fn ($query) => $query->whereNull('published_at'))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (CustomerReview $review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'reply' => $review->reply,
                'customer' => $review->customer->full_name,
                'listing' => $review->reviewable->business_name ?? $review->reviewable->full_name,
                'listingType' => $review->reviewable instanceof Professional ? 'Professional' : 'Fleet',
                'job' => $review->quote
                    ? "{$review->quote->quoteRequest->category->name} · {$review->quote->quoteRequest->reference}"
                    : ($review->vehicleBooking?->vehicle
                        ? "{$review->vehicleBooking->vehicle->make} {$review->vehicleBooking->vehicle->model} · {$review->vehicleBooking->reference}"
                        : $review->vehicleBooking?->reference),
                'submittedAt' => $review->created_at?->isoFormat('ll'),
            ]);

        return Inertia::render('admin/reviews', [
            'tab' => $tab,
            'reviews' => $reviews,
            'counts' => [
                'pending' => CustomerReview::whereNull('published_at')->count(),
                'published' => CustomerReview::whereNotNull('published_at')->count(),
            ],
        ]);
    }

    /**
     * Publish a review on the listing.
     */
    public function approve(CustomerReview $review): RedirectResponse
    {
        $review->update(['published_at' => now()]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Review published.')]);

        return back();
    }

    /**
     * Remove a review that breaks the rules.
     */
    public function destroy(CustomerReview $review): RedirectResponse
    {
        $review->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Review removed.')]);

        return back();
    }
}
