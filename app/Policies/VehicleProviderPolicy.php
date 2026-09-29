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

    /**
     * A capturer may view the fleets they added.
     */
    public function viewCapture(User $user, VehicleProvider $vehicleProvider): bool
    {
        return $user->isCapturer() && $vehicleProvider->onboarded_by_id === $user->id;
    }

    /**
     * A capturer may edit a fleet they added, and its vehicles, until our
     * team approves it.
     */
    public function editCapture(User $user, VehicleProvider $vehicleProvider): bool
    {
        return $this->viewCapture($user, $vehicleProvider)
            && $vehicleProvider->review_status !== VehicleProvider::REVIEW_APPROVED;
    }
}
