<?php

namespace App\Http\Controllers;

use App\Actions\ResolveCustomer;
use App\Http\Requests\StoreVehicleBookingRequest;
use App\Models\VehicleBooking;
use App\Models\VehicleProvider;
use App\Notifications\NewBookingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Hire requests sent from a fleet's public page.
 */
class VehicleBookingController extends Controller
{
    /**
     * Save the booking request for the fleet to confirm.
     */
    public function store(StoreVehicleBookingRequest $request, VehicleProvider $vehicleProvider, ResolveCustomer $resolveCustomer): RedirectResponse
    {
        abort_unless($vehicleProvider->isVerified(), 404);

        $booking = DB::transaction(function () use ($request, $resolveCustomer) {
            $customer = $resolveCustomer($request->safe()->only([
                'full_name', 'phone', 'email', 'contact_channel', 'city',
            ]), $request->user());

            $booking = new VehicleBooking([
                ...$request->safe()->only(['start_date', 'end_date', 'quantity', 'pickup_location', 'notes']),
                'with_driver' => $request->boolean('with_driver'),
                'status' => VehicleBooking::STATUS_REQUESTED,
            ]);
            $booking->customer()->associate($customer);
            $booking->forVehicle($request->vehicle())->save();

            return $booking;
        });

        $vehicleProvider->user?->notify(new NewBookingRequest($booking->refresh()));

        Inertia::flash('reference', $booking->reference);

        return back();
    }
}
