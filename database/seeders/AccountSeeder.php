<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * The demo accounts used locally. Every account's password is `password`.
 */
class AccountSeeder extends Seeder
{
    public const PASSWORD = 'password';

    public const ADMIN_EMAIL = 'admin@proconnect.test';

    public const FLEET_OWNER_EMAIL = 'test@example.com';

    public const PLUMBER_EMAIL = 'kabongo@pc.com';

    /**
     * Seed the admin and the pro accounts that own the demo listings.
     */
    public function run(): void
    {
        $accounts = [
            ['email' => self::ADMIN_EMAIL, 'name' => 'ProConnect Admin', 'role' => User::ROLE_ADMIN],
            ['email' => self::FLEET_OWNER_EMAIL, 'name' => 'Mutombo Tshomba', 'role' => User::ROLE_PRO],
            ['email' => self::PLUMBER_EMAIL, 'name' => 'Jean-Pierre Kabongo', 'role' => User::ROLE_PRO],
        ];

        foreach ($accounts as $account) {
            $user = User::firstOrNew(['email' => $account['email']]);
            $user->forceFill([
                'name' => $account['name'],
                'role' => $account['role'],
                'password' => self::PASSWORD,
                'email_verified_at' => now(),
                'pro_approved_at' => $account['role'] === User::ROLE_PRO ? now() : null,
            ])->save();
        }
    }
}
