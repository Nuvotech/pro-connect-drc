<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Translation\HasLocalePreference;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $role
 * @property string|null $locale
 * @property Carbon|null $pro_approved_at
 * @property Carbon|null $deactivated_at
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements HasLocalePreference, MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * System administrators, who use the admin panel.
     */
    public const ROLE_ADMIN = 'admin';

    /**
     * Service professionals and vehicle providers, who use the dashboard.
     */
    public const ROLE_PRO = 'pro';

    /**
     * Customers looking for pros, business services or vehicles.
     */
    public const ROLE_CUSTOMER = 'customer';

    /**
     * Staff who only add professionals and fleets for review.
     */
    public const ROLE_CAPTURER = 'capturer';

    /**
     * The language emails and notifications are sent in: the one the user
     * chose, or the app default.
     */
    public function preferredLocale(): string
    {
        return $this->locale ?? config('app.locale');
    }

    /**
     * Determine whether the user administers the platform.
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Determine whether the user is a customer rather than a pro.
     */
    public function isCustomer(): bool
    {
        return $this->role === self::ROLE_CUSTOMER;
    }

    /**
     * Determine whether the user is staff who only captures listings.
     */
    public function isCapturer(): bool
    {
        return $this->role === self::ROLE_CAPTURER;
    }

    /**
     * Determine whether the account may still sign in.
     */
    public function isActive(): bool
    {
        return $this->deactivated_at === null;
    }

    /**
     * The customer profile behind this account's requests and reviews.
     *
     * @return HasOne<Customer, $this>
     */
    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class);
    }

    /**
     * The service listing this pro manages, if they are a professional.
     *
     * @return HasOne<Professional, $this>
     */
    public function professional(): HasOne
    {
        return $this->hasOne(Professional::class);
    }

    /**
     * The fleet listing this pro manages, if they rent out vehicles.
     *
     * @return HasOne<VehicleProvider, $this>
     */
    public function vehicleProvider(): HasOne
    {
        return $this->hasOne(VehicleProvider::class);
    }

    /**
     * The pro's request to join, if they signed up through the join form.
     *
     * @return HasOne<ProApplication, $this>
     */
    public function proApplication(): HasOne
    {
        return $this->hasOne(ProApplication::class);
    }

    /**
     * Determine whether the pro has been approved to use the dashboard.
     */
    public function isApprovedPro(): bool
    {
        return $this->pro_approved_at !== null;
    }

    /**
     * What the pro may set up and what they already have, for the
     * dashboard navigation and overview.
     *
     * @return array{isApproved: bool, offersServices: bool, offersVehicles: bool, openQuoteCount: int, pendingBookingCount: int, listings: array{professional: array{id: int, isVerified: bool}|null, vehicleProvider: array{id: int, isVerified: bool}|null}}
     */
    public function proSummary(): array
    {
        $application = $this->proApplication?->loadMissing(['categories', 'customServices']);

        // Pros who joined before applications existed, or were onboarded by an
        // admin, have no application; they may set up either kind of listing.
        return [
            'isApproved' => $this->isApprovedPro(),
            'offersServices' => $this->professional !== null || ($application?->offersServices() ?? true),
            'offersVehicles' => $this->vehicleProvider !== null || ($application?->offersVehicles() ?? true),
            'openQuoteCount' => $this->professional?->quotes()->whereIn('status', [Quote::STATUS_INVITED, Quote::STATUS_VIEWED])->count() ?? 0,
            'pendingBookingCount' => $this->vehicleProvider?->bookings()->where('status', VehicleBooking::STATUS_REQUESTED)->count() ?? 0,
            'listings' => [
                'professional' => $this->professional
                    ? ['id' => $this->professional->id, 'isVerified' => $this->professional->isVerified()]
                    : null,
                'vehicleProvider' => $this->vehicleProvider
                    ? ['id' => $this->vehicleProvider->id, 'isVerified' => $this->vehicleProvider->isVerified()]
                    : null,
            ],
        ];
    }

    /**
     * Determine whether this pro already manages a listing.
     */
    public function hasListing(): bool
    {
        return $this->hasProfessionalListing() || $this->hasFleet();
    }

    /**
     * Determine whether this pro already has a service listing.
     */
    public function hasProfessionalListing(): bool
    {
        return $this->professional()->exists();
    }

    /**
     * Determine whether this pro already has a fleet listing.
     */
    public function hasFleet(): bool
    {
        return $this->vehicleProvider()->exists();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'pro_approved_at' => 'datetime',
            'deactivated_at' => 'datetime',
        ];
    }
}
