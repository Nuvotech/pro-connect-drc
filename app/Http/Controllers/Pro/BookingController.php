<?php

namespace App\Http\Controllers\Pro;

use App\Actions\SendReviewInvitation;
use App\Http\Controllers\Controller;
use App\Models\VehicleBooking;
use App\Notifications\BookingUpdated;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A fleet owner's inbox of hire requests.
 */
class BookingController extends Controller
{
    /**
     * List the fleet's booking requests, newest first.
     */
    public function index(Request $request): Response
    {
        $provider = $request->user()->vehicleProvider;

        abort_unless($provider, 404);

        $bookings = $provider->bookings()->with(['customer', 'vehicle'])->latest()->get();

        return Inertia::render('dashboard/bookings/index', [
            'bookings' => $bookings->map(fn (VehicleBooking $booking) => [
                'id' => $booking->id,
                'reference' => $booking->reference,
                'status' => $booking->status,
                'vehicle' => $booking->vehicle ? "{$booking->vehicle->make} {$booking->vehicle->model}" : 'Removed vehicle',
                'startDate' => $booking->start_date->isoFormat('ll'),
                'endDate' => $booking->end_date->isoFormat('ll'),
                'days' => (int) $booking->start_date->diffInDays($booking->end_date) + 1,
                'quantity' => $booking->quantity,
                'withDriver' => $booking->with_driver,
                'pickupLocation' => $booking->pickup_location,
                'notes' => $booking->notes,
                'estimatedTotal' => $booking->estimated_total,
                'currency' => $booking->currency,
                'customer' => [
                    'name' => $booking->customer->full_name,
                    'phone' => $booking->customer->phone,
                    'email' => $booking->customer->email,
                ],
                'requestedAt' => $booking->created_at?->isoFormat('ll'),
            ])->all(),
        ]);
    }

    /**
     * Confirm or decline a booking request, or mark a confirmed hire as
     * completed so the customer can review it.
     */
    public function update(Request $request, VehicleBooking $booking, SendReviewInvitation $sendReviewInvitation): RedirectResponse
    {
        Gate::authorize('respond', $booking);

        $allowedStatuses = match ($booking->status) {
            VehicleBooking::STATUS_REQUESTED => [VehicleBooking::STATUS_CONFIRMED, VehicleBooking::STATUS_DECLINED],
            VehicleBooking::STATUS_CONFIRMED => [VehicleBooking::STATUS_COMPLETED],
            default => abort(409),
        };

        $validated = $request->validate([
            'status' => ['required', Rule::in($allowedStatuses)],
        ]);

        if ($validated['status'] === VehicleBooking::STATUS_COMPLETED) {
            $booking->update(['status' => VehicleBooking::STATUS_COMPLETED]);
            $sendReviewInvitation($booking);

            Inertia::flash('toast', ['type' => 'success', 'message' => __('Hire marked as completed. Thank you!')]);

            return back();
        }

        $booking->update(['status' => $validated['status'], 'responded_at' => now()]);

        if ($booking->customer->email) {
            Notification::route('mail', $booking->customer->email)->notify((new BookingUpdated($booking))->locale($booking->customer->preferred_language));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => $validated['status'] === VehicleBooking::STATUS_CONFIRMED
            ? __('Booking confirmed. The client has been told.')
            : __('Booking declined.')]);

        return back();
    }
}
