<?php

namespace App\Http\Controllers\Capture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Capture\UpdateCapturedProfessionalRequest;
use App\Http\Resources\ProfessionalListingResource;
use App\Models\ListingReview;
use App\Models\Professional;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A professional as the capturer who added it sees it: editable until our
 * team approves it, read-only afterwards.
 */
class CapturedProfessionalController extends Controller
{
    /**
     * Show the capture: an edit form while it can still change, otherwise
     * its details.
     */
    public function show(Request $request, Professional $professional): Response
    {
        Gate::authorize('viewCapture', $professional);

        return Inertia::render('captures/professional', [
            'listing' => ProfessionalListingResource::make($professional->load(['photos', 'categories', 'city', 'commune']))->resolve(),
            'review' => $professional->reviewSummary(),
            'canEdit' => $request->user()->can('editCapture', $professional),
        ]);
    }

    /**
     * Save the capturer's corrections. A listing our team sent back goes
     * into the review queue again.
     */
    public function update(UpdateCapturedProfessionalRequest $request, Professional $professional): RedirectResponse
    {
        $professional->fill($request->safe()->except(['photo', 'cover', 'identity_document', 'business_registration']))
            ->placeIn($request->validated('city'), $request->validated('commune'));
        $professional->storeProfileImages($request);
        $professional->storeVerificationDocuments($request);

        $professional->save();
        $professional->syncCategories($request->validated('categories'));

        $wasResubmitted = $professional->canResubmit();

        if ($wasResubmitted) {
            $professional->submitForReview(ListingReview::EVENT_RESUBMITTED);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => $wasResubmitted
            ? __('Changes saved and sent back for review.')
            : __('Changes saved.')]);

        return to_route('captures.professionals.show', $professional);
    }
}
