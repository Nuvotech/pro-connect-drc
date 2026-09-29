<?php

namespace App\Console\Commands;

use App\Models\User;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

/**
 * Prepares a fresh production install: tables, the reference data every
 * environment needs (cities, categories, a starting exchange rate), the
 * public storage link and the first admin account. It never loads the
 * demo pros, customers and reviews that `db:seed` creates locally.
 */
#[Signature('proconnect:install
    {--admin-email= : Email address of the first admin}
    {--admin-name=ProConnect Admin : Name of the first admin}
    {--admin-password= : Password for the first admin (asked for when left out)}
    {--skip-admin : Do not create an admin account}')]
#[Description('Set up a production install with reference data and the first admin, without demo data')]
class SetUpProduction extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->components->info('Setting up ProConnect RDC');

        $this->components->task('Running migrations', fn () => $this->callSilently('migrate', ['--force' => true]) === self::SUCCESS);
        $this->components->task('Seeding cities, categories and exchange rate', fn () => $this->callSilently('db:seed', [
            '--class' => ReferenceDataSeeder::class,
            '--force' => true,
        ]) === self::SUCCESS);

        if (! file_exists(public_path('storage'))) {
            $this->components->task('Linking public storage', fn () => $this->callSilently('storage:link') === self::SUCCESS);
        }

        $this->components->task('Fetching today\'s exchange rate', fn () => $this->callSilently('rates:refresh') === self::SUCCESS);

        if (! $this->option('skip-admin') && $this->createAdmin() === self::FAILURE) {
            return self::FAILURE;
        }

        $this->newLine();
        $this->components->info('Done. Remember to run the queue worker and the scheduler (schedule:run every minute).');

        return self::SUCCESS;
    }

    /**
     * Create the first admin, or promote an existing account with that
     * email to admin.
     */
    private function createAdmin(): int
    {
        $email = $this->option('admin-email') ?: text(
            label: 'Admin email address',
            required: true,
            validate: fn (string $value) => filter_var($value, FILTER_VALIDATE_EMAIL) ? null : 'Enter a valid email address.',
        );

        $existing = User::where('email', $email)->first();

        if ($existing) {
            $existing->forceFill(['role' => User::ROLE_ADMIN, 'email_verified_at' => $existing->email_verified_at ?? now()])->save();
            $this->components->info("{$email} is now an admin.");

            return self::SUCCESS;
        }

        $plainPassword = $this->option('admin-password') ?: password(
            label: 'Admin password',
            required: true,
            hint: 'At least 12 characters.',
        );

        $validator = Validator::make(
            ['email' => $email, 'password' => $plainPassword],
            ['email' => ['required', 'email'], 'password' => ['required', Password::min(12)]],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->components->error($error);
            }

            return self::FAILURE;
        }

        $admin = new User([
            'name' => $this->option('admin-name'),
            'email' => $email,
            'password' => $plainPassword,
        ]);
        $admin->forceFill(['role' => User::ROLE_ADMIN, 'email_verified_at' => now()])->save();

        $this->components->info("Admin account created for {$email}. Turn on two-factor authentication after signing in.");

        return self::SUCCESS;
    }
}
