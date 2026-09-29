<?php

namespace App\Http\Controllers\Capture;

use App\Actions\SaveVehicle;
use App\Http\Controllers\Controller;
use App\Http\Requests\Capture\SaveCapturedVehicleRequest;
use App\Http\Resources\FleetVehicleResource;
use App\Models\Vehicle;
use App\Models\VehicleProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Vehicles in a fleet a capturer added, which they can add, correct or
 * remove until the fleet is approved.
 */
class CapturedVehicleController extends Controller
{
    /**
     * Show the form for adding a vehicle to the fleet.
     */
    public function create(VehicleProvider $vehicleProvider): Response
    {
        Gate::authorize('editCapture', $vehicleProvider);

        return Inertia::render('captures/vehicle', [
            'fleet' => ['id' => $vehicleProvider->id, 'name' => $vehicleProvider->business_name ?? $vehicleProvider->contact_name],
            'vehicle' => null,
        ]);
    }

    /**
     * Add the vehicle.
     */
    public function store(SaveCapturedVehicleRequest $request, VehicleProvider $vehicleProvider, SaveVehicle $saveVehicle): RedirectResponse
    {
        $saveVehicle->create($vehicleProvider, $request->validated());

        return $this->done($vehicleProvider, __('Vehicle added.'));
    }

    /**
     * Show the form for correcting a vehicle.
     */
    public function edit(Vehicle $vehicle): Response
    {
        $provider = $vehicle->provider;
        Gate::authorize('editCapture', $provider);

        return Inertia::render('captures/vehicle', [
            'fleet' => ['id' => $provider->id, 'name' => $provider->business_name ?? $provider->contact_name],
            'vehicle' => FleetVehicleResource::make($vehicle->load('photos'))->resolve(),
        ]);
    }

    /**
     * Save the corrections, replacing any uploaded photos.
     */
    public function update(SaveCapturedVehicleRequest $request, Vehicle $vehicle, SaveVehicle $saveVehicle): RedirectResponse
    {
        $saveVehicle->update($vehicle, $request->validated());

        return $this->done($vehicle->provider, __('Vehicle updated.'));
    }

    /**
     * Remove the vehicle and its photos.
     */
    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        $provider = $vehicle->provider;
        Gate::authorize('editCapture', $provider);

        Storage::disk('public')->delete($vehicle->photos->pluck('path')->all());
        $vehicle->delete();

        return $this->done($provider, __('Vehicle removed.'));
    }

    /**
     * Back to the fleet, resubmitting it if our team had sent it back.
     */
    private function done(VehicleProvider $provider, string $message): RedirectResponse
    {
        $wasResubmitted = CapturedFleetController::resubmitIfSentBack($provider);

        Inertia::flash('toast', ['type' => 'success', 'message' => $wasResubmitted
            ? __(':action The fleet was sent back for review.', ['action' => $message])
            : $message]);

        return to_route('captures.fleets.show', $provider);
    }
}
