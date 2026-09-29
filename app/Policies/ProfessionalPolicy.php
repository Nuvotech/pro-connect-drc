<?php

namespace App\Policies;

use App\Models\Professional;
use App\Models\User;

class ProfessionalPolicy
{
    /**
     * Pros manage their own listing; admins can manage any listing.
     */
    public function update(User $user, Professional $professional): bool
    {
        return $user->isAdmin() || $professional->user_id === $user->id;
    }

    /**
     * A capturer may view the professionals they added.
     */
    public function viewCapture(User $user, Professional $professional): bool
    {
        return $user->isCapturer() && $professional->onboarded_by_id === $user->id;
    }

    /**
     * A capturer may edit what they added until our team approves it.
     */
    public function editCapture(User $user, Professional $professional): bool
    {
        return $this->viewCapture($user, $professional)
            && $professional->review_status !== Professional::REVIEW_APPROVED;
    }
}
