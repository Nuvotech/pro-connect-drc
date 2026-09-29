<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vehicle;

class VehiclePolicy
{
    /**
     * Pros edit vehicles in their own fleet; admins can edit any vehicle.
     */
    public function update(User $user, Vehicle $vehicle): bool
    {
        return $user->isAdmin() || $vehicle->provider->user_id === $user->id;
    }

    /**
     * Pros remove vehicles from their own fleet; admins can remove any.
     */
    public function delete(User $user, Vehicle $vehicle): bool
    {
        return $this->update($user, $vehicle);
    }
}
