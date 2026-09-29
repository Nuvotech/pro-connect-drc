<?php

namespace App\Http\Controllers\Pro;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pro\SaveProfessionalListingRequest;
use App\Http\Resources\ProfessionalListingResource;
use App\Models\ListingReview;
use App\Models\Professional;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A service professional's own listing.
 */
class ListingController extends Controller
{
    /**
     * Show the pro's listing.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $professional = $request->user()->professional;

        if (! $professional) {
            return to_route('dashboard');
        }

        $professional->load(['photos', 'categories', 'city', 'commune']);

        return Inertia::render('dashboard/listing/show', [
            'listing' => ProfessionalListingResource::make($professional)->resolve(),
            'review' => $professional->reviewSummary(),
        ]);
    }

    /**
     * Send the listing back to the admins after making requested changes.
     */
    public function resubmit(Request $request): RedirectResponse
    {
        $professional = $request->user()->professional;

        abort_unless($professional, 404);
        Gate::authorize('update', $professional);

        if (! $professional->canResubmit()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Your listing is already waiting for review.')]);

            return back();
        }

        $professional->submitForReview(ListingReview::EVENT_RESUBMITTED);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Thanks! Your listing is back in the review queue.')]);

        return back();
    }

    /**
     * Show the form for setting up a service listing.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()->hasProfessionalListing()) {
            return to_route('dashboard');
        }

        return Inertia::render('dashboard/listing/create', [
            'defaults' => $request->user()->proApplication?->listingDefaults('professional'),
        ]);
    }

    /**
     * Set up the pro's service listing, pending verification.
     */
    public function store(SaveProfessionalListingRequest $request): RedirectResponse
    {
        if ($request->user()->hasProfessionalListing()) {
            return to_route('dashboard');
        }

        $professional = new Professional($request->safe()->except(['photo', 'identity_document']));
        $professional->placeIn($request->validated('city'), $request->validated('commune'));
        $professional->user()->associate($request->user());
        $this->storeFiles($request, $professional);
        $professional->save();
        $professional->syncCategories($request->validated('categories'));
        $professional->submitForReview();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Your listing has been sent for verification.')]);

        return to_route('dashboard.listing.show');
    }

    /**
     * Show the form for editing the pro's listing.
     */
    public function edit(Request $request): Response|RedirectResponse
    {
        $professional = $request->user()->professional;

        if (! $professional) {
            return to_route('dashboard');
        }

        Gate::authorize('update', $professional);

        return Inertia::render('dashboard/listing/edit', [
            'listing' => ProfessionalListingResource::make($professional->load(['photos', 'categories', 'city', 'commune']))->resolve(),
        ]);
    }

    /**
     * Update the pro's listing. Changing registration details or the ID
     * document sends it back for verification.
     */
    public function update(SaveProfessionalListingRequest $request): RedirectResponse
    {
        $professional = $request->user()->professional;

        abort_unless($professional, 404);
        Gate::authorize('update', $professional);

        $professional->fill($request->safe()->except(['photo', 'identity_document']))->placeIn($request->validated('city'), $request->validated('commune'));
        $this->storeFiles($request, $professional);
        $needsReReview = $professional->resetVerificationIfKeyFieldsChanged();
        $professional->save();
        $professional->syncCategories($request->validated('categories'));

        if ($needsReReview) {
            $professional->logReviewEvent(ListingReview::EVENT_KEY_DETAILS_CHANGED);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => $needsReReview
            ? __('Listing updated. It will be re-verified because you changed registration details.')
            : __('Listing updated.')]);

        return to_route('dashboard.listing.show');
    }

    /**
     * Store a newly uploaded profile photo or ID document, replacing the
     * previous file.
     */
    private function storeFiles(SaveProfessionalListingRequest $request, Professional $professional): void
    {
        if ($request->hasFile('photo')) {
            if ($professional->photo_path) {
                Storage::disk('public')->delete($professional->photo_path);
            }

            $professional->photo_path = $request->file('photo')->store('professionals/photos', 'public');
        }

        if ($request->hasFile('identity_document')) {
            if ($professional->identity_document_path) {
                Storage::disk('local')->delete($professional->identity_document_path);
            }

            $professional->identity_document_path = $request->file('identity_document')->store('professionals/documents', 'local');
        }
    }
}
