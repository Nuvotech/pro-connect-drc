<?php

namespace App\Policies;

use App\Models\Quote;
use App\Models\User;

class QuotePolicy
{
    /**
     * Pros see and answer only the quotes they were invited to.
     */
    public function respond(User $user, Quote $quote): bool
    {
        return $quote->professional?->user_id === $user->id;
    }
}
