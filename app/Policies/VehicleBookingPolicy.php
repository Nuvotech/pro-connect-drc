<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VehicleBooking;

class VehicleBookingPolicy
{
    /**
     * Fleet owners confirm or decline only their own booking requests.
     */
    public function respond(User $user, VehicleBooking $booking): bool
    {
        return $booking->vehicleProvider?->user_id === $user->id;
    }
}
