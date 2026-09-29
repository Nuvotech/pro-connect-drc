<?php

namespace App\Http\Controllers\Capture;

use App\Http\Controllers\Controller;
use App\Http\Requests\Capture\UpdateCapturedFleetRequest;
use App\Http\Resources\FleetVehicleResource;
use App\Http\Resources\VehicleProviderResource;
use App\Models\ListingReview;
use App\Models\VehicleProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A fleet as the capturer who added it sees it: editable, vehicles
 * included, until our team approves it, read-only afterwards.
 */
class CapturedFleetController extends Controller
{
    /**
     * Show the fleet's details and vehicles.
     */
    public function show(Request $request, VehicleProvider $vehicleProvider): Response
    {
        Gate::authorize('viewCapture', $vehicleProvider);

        $vehicleProvider->load([
            'vehicles' => fn ($query) => $query->orderBy('category_id')->orderBy('make'),
            'vehicles.category',
            'vehicles.photos',
        ]);

        return Inertia::render('captures/fleet', [
            'provider' => VehicleProviderResource::make($vehicleProvider)->resolve(),
            'vehicles' => FleetVehicleResource::collection($vehicleProvider->vehicles)->resolve(),
            'review' => $vehicleProvider->reviewSummary(),
            'canEdit' => $request->user()->can('editCapture', $vehicleProvider),
        ]);
    }

    /**
     * Save the capturer's corrections to the business details.
     */
    public function update(UpdateCapturedFleetRequest $request, VehicleProvider $vehicleProvider): RedirectResponse
    {
        $vehicleProvider->fill($request->safe()->except(['identity_document']))
            ->placeIn($request->validated('city'), $request->validated('commune'));

        if ($request->hasFile('identity_document')) {
            if ($vehicleProvider->identity_document_path) {
                Storage::disk('local')->delete($vehicleProvider->identity_document_path);
            }

            $vehicleProvider->identity_document_path = $request->file('identity_document')
                ->store('vehicle-providers/documents', 'local');
        }

        $vehicleProvider->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => self::resubmitIfSentBack($vehicleProvider)
            ? __('Changes saved and sent back for review.')
            : __('Changes saved.')]);

        return to_route('captures.fleets.show', $vehicleProvider);
    }

    /**
     * Put a fleet our team sent back into the review queue again. Returns
     * whether it was resubmitted.
     */
    public static function resubmitIfSentBack(VehicleProvider $vehicleProvider): bool
    {
        if (! $vehicleProvider->canResubmit()) {
            return false;
        }

        $vehicleProvider->submitForReview(ListingReview::EVENT_RESUBMITTED);

        return true;
    }
}
