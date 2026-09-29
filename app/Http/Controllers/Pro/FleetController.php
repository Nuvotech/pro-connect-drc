<?php

namespace App\Http\Controllers\Pro;

use App\Actions\SaveVehicle;
use App\Http\Controllers\Controller;
use App\Http\Requests\Pro\StoreFleetRequest;
use App\Http\Requests\Pro\UpdateFleetRequest;
use App\Http\Resources\FleetVehicleResource;
use App\Http\Resources\VehicleProviderResource;
use App\Models\ListingReview;
use App\Models\VehicleProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A vehicle provider's own fleet listing.
 */
class FleetController extends Controller
{
    /**
     * Show the pro's business details and fleet.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $provider = $request->user()->vehicleProvider;

        if (! $provider) {
            return to_route('dashboard');
        }

        $provider->load([
            'vehicles' => fn ($query) => $query->orderBy('category_id')->orderBy('make'),
            'vehicles.category',
            'vehicles.photos',
        ]);

        return Inertia::render('dashboard/fleet/show', [
            'provider' => VehicleProviderResource::make($provider)->resolve(),
            'vehicles' => FleetVehicleResource::collection($provider->vehicles)->resolve(),
            'review' => $provider->reviewSummary(),
        ]);
    }

    /**
     * Send the fleet back to the admins after making requested changes.
     */
    public function resubmit(Request $request): RedirectResponse
    {
        $provider = $request->user()->vehicleProvider;

        abort_unless($provider, 404);
        Gate::authorize('update', $provider);

        if (! $provider->canResubmit()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Your fleet is already waiting for review.')]);

            return back();
        }

        $provider->submitForReview(ListingReview::EVENT_RESUBMITTED);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Thanks! Your fleet is back in the review queue.')]);

        return back();
    }

    /**
     * Show the form for setting up a fleet listing.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()->hasFleet()) {
            return to_route('dashboard');
        }

        return Inertia::render('dashboard/fleet/create', [
            'defaults' => $request->user()->proApplication?->listingDefaults('vehicle_provider'),
        ]);
    }

    /**
     * Set up the pro's fleet listing with its first vehicles, pending
     * verification.
     */
    public function store(StoreFleetRequest $request, SaveVehicle $saveVehicle): RedirectResponse
    {
        if ($request->user()->hasFleet()) {
            return to_route('dashboard');
        }

        $provider = DB::transaction(function () use ($request, $saveVehicle) {
            $provider = new VehicleProvider($request->safe()->except(['identity_document', 'vehicles']));
            $provider->placeIn($request->validated('city'), $request->validated('commune'));
            $provider->user()->associate($request->user());
            $this->storeIdentityDocument($request, $provider);
            $provider->save();

            foreach ($request->validated('vehicles') as $vehicleData) {
                $saveVehicle->create($provider, $vehicleData);
            }

            return $provider;
        });

        $provider->submitForReview();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Your fleet has been sent for verification.')]);

        return to_route('dashboard.fleet.show');
    }

    /**
     * Show the form for editing the pro's business details.
     */
    public function edit(Request $request): Response|RedirectResponse
    {
        $provider = $request->user()->vehicleProvider;

        if (! $provider) {
            return to_route('dashboard');
        }

        Gate::authorize('update', $provider);

        return Inertia::render('dashboard/fleet/edit', [
            'provider' => VehicleProviderResource::make($provider)->resolve(),
        ]);
    }

    /**
     * Update the pro's business details. Changing registration details or
     * the ID document sends the listing back for verification.
     */
    public function update(UpdateFleetRequest $request): RedirectResponse
    {
        $provider = $request->user()->vehicleProvider;

        abort_unless($provider, 404);
        Gate::authorize('update', $provider);

        $provider->fill($request->safe()->except(['identity_document']))->placeIn($request->validated('city'), $request->validated('commune'));
        $this->storeIdentityDocument($request, $provider);
        $needsReReview = $provider->resetVerificationIfKeyFieldsChanged();
        $provider->save();

        if ($needsReReview) {
            $provider->logReviewEvent(ListingReview::EVENT_KEY_DETAILS_CHANGED);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => $needsReReview
            ? __('Details updated. Your listing will be re-verified because you changed registration details.')
            : __('Details updated.')]);

        return to_route('dashboard.fleet.show');
    }

    /**
     * Store a newly uploaded ID document, replacing the previous file.
     */
    private function storeIdentityDocument(StoreFleetRequest|UpdateFleetRequest $request, VehicleProvider $provider): void
    {
        if (! $request->hasFile('identity_document')) {
            return;
        }

        if ($provider->identity_document_path) {
            Storage::disk('local')->delete($provider->identity_document_path);
        }

        $provider->identity_document_path = $request->file('identity_document')->store('vehicle-providers/documents', 'local');
    }
}
