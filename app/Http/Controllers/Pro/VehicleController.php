<?php

namespace App\Http\Controllers\Pro;

use App\Actions\SaveVehicle;
use App\Http\Controllers\Controller;
use App\Http\Requests\Pro\StoreVehicleRequest;
use App\Http\Requests\Pro\UpdateVehicleRequest;
use App\Http\Resources\FleetVehicleResource;
use App\Models\ListingReview;
use App\Models\Vehicle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The vehicles in a pro's own fleet.
 */
class VehicleController extends Controller
{
    /**
     * Show the form for adding a vehicle.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if (! $request->user()->vehicleProvider) {
            return to_route('dashboard');
        }

        return Inertia::render('dashboard/vehicles/create');
    }

    /**
     * Add a vehicle to the pro's fleet. New vehicles need an admin to check
     * them, so the listing goes back to pending.
     */
    public function store(StoreVehicleRequest $request, SaveVehicle $saveVehicle): RedirectResponse
    {
        $provider = $request->user()->vehicleProvider;

        abort_unless($provider, 404);
        Gate::authorize('update', $provider);

        $needsReReview = $provider->isVerified();

        DB::transaction(function () use ($request, $saveVehicle, $provider, $needsReReview) {
            $saveVehicle->create($provider, $request->validated());

            if ($needsReReview) {
                $provider->markForReReview();
                $provider->save();
                $provider->logReviewEvent(ListingReview::EVENT_KEY_DETAILS_CHANGED, message: 'A vehicle was added.');
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => $needsReReview
            ? __('Vehicle added. Your fleet will be re-verified.')
            : __('Vehicle added.')]);

        return to_route('dashboard.fleet.show');
    }

    /**
     * Show the form for editing a vehicle.
     */
    public function edit(Vehicle $vehicle): Response
    {
        Gate::authorize('update', $vehicle);

        return Inertia::render('dashboard/vehicles/edit', [
            'vehicle' => FleetVehicleResource::make($vehicle->load('photos'))->resolve(),
        ]);
    }

    /**
     * Update a vehicle's details and replace any uploaded photos.
     */
    public function update(UpdateVehicleRequest $request, Vehicle $vehicle, SaveVehicle $saveVehicle): RedirectResponse
    {
        $saveVehicle->update($vehicle, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Vehicle updated.')]);

        return to_route('dashboard.fleet.show');
    }

    /**
     * Remove a vehicle and its photos from the fleet.
     */
    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        Gate::authorize('delete', $vehicle);

        Storage::disk('public')->delete($vehicle->photos->pluck('path')->all());
        $vehicle->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Vehicle removed.')]);

        return to_route('dashboard.fleet.show');
    }
}
