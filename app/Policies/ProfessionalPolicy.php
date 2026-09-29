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
}
