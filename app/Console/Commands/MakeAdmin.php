<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:make-admin {email : The email address of the user to promote}')]
#[Description('Give an existing user access to the admin panel')]
class MakeAdmin extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();

        if (! $user) {
            $this->error("No user found with the email {$this->argument('email')}.");

            return self::FAILURE;
        }

        $user->forceFill(['role' => User::ROLE_ADMIN])->save();

        $this->info("{$user->name} ({$user->email}) is now an admin.");

        return self::SUCCESS;
    }
}
