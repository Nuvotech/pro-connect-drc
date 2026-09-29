<?php

namespace App\Actions;

use App\Models\Professional;
use App\Models\User;
use App\Models\VehicleProvider;
use App\Notifications\AccountInvitation;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

/**
 * Gives the owner of an admin-onboarded listing a pro account, so they
 * can manage it from their dashboard. Onboarding counts as approval, so
 * the account skips the join application.
 */
class LinkProAccount
{
    /**
     * Link the listing to the pro account for this email, creating the
     * account and inviting them to set a password when it is new.
     */
    public function __invoke(Professional|VehicleProvider $listing, string $email, string $name): User
    {
        $user = User::where('email', $email)->first();
        $isNewAccount = $user === null;

        if ($isNewAccount) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Str::password(32),
            ]);
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $listing->user()->associate($user)->save();

        if (! $user->isApprovedPro()) {
            $user->forceFill(['pro_approved_at' => now()])->save();
        }

        if ($isNewAccount) {
            $user->notify(new AccountInvitation(Password::createToken($user)));
        }

        return $user;
    }
}
