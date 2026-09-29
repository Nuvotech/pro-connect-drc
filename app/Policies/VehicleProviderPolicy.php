<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VehicleProvider;

class VehicleProviderPolicy
{
    /**
     * Pros manage their own fleet listing; admins can manage any.
     */
    public function update(User $user, VehicleProvider $vehicleProvider): bool
    {
        return $user->isAdmin() || $vehicleProvider->user_id === $user->id;
    }
}
