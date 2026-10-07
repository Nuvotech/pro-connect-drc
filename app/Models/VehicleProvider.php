<?php

namespace App\Models;

use App\Concerns\HasCustomerReviews;
use App\Concerns\HasLocation;
use App\Concerns\HasSlug;
use App\Concerns\HasVerificationDocuments;
use App\Concerns\Reviewable;
use Database\Factories\VehicleProviderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A business or individual that rents out vehicles and equipment.
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $provider_type
 * @property string|null $slug
 * @property string $contact_name
 * @property string|null $business_name
 * @property string $phone
 * @property bool $is_on_whatsapp
 * @property string|null $email
 * @property string|null $address
 * @property string|null $registry_number
 * @property string|null $tax_id
 * @property string $preferred_language
 * @property string|null $identity_document_path
 * @property string|null $business_registration_path
 * @property Carbon|null $verified_at
 * @property string $review_status
 * @property Carbon|null $submitted_at
 * @property int|null $onboarded_by_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'provider_type',
    'contact_name',
    'business_name',
    'phone',
    'is_on_whatsapp',
    'email',
    'address',
    'registry_number',
    'tax_id',
    'preferred_language',
])]
class VehicleProvider extends Model
{
    /** @use HasFactory<VehicleProviderFactory> */
    use HasCustomerReviews, HasFactory, HasLocation, HasSlug, HasVerificationDocuments, Reviewable;

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'provider_type' => self::PROVIDER_INDIVIDUAL,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_on_whatsapp' => 'boolean',
            'rating_average' => 'decimal:1',
            'reviews_count' => 'integer',
            'verified_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * The name the listing's URL slug is built from.
     */
    protected function slugSource(): string
    {
        return $this->business_name ?? $this->contact_name;
    }

    /**
     * The folder on the private disk where this listing's documents live.
     */
    protected function documentDirectory(): string
    {
        return 'vehicle-providers/documents';
    }

    /**
     * Hire requests customers sent to this provider.
     *
     * @return HasMany<VehicleBooking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(VehicleBooking::class);
    }

    /**
     * The vehicles this provider rents out.
     *
     * @return HasMany<Vehicle, $this>
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    /**
     * The pro account that manages this listing.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The admin who onboarded this provider.
     *
     * @return BelongsTo<User, $this>
     */
    public function onboardedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'onboarded_by_id');
    }

    /**
     * Determine whether the provider has been verified.
     */
    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    /**
     * The cheapest daily rate across the fleet.
     *
     * @return array{amount: string, currency: string}|null
     */
    public function lowestDailyRate(): ?array
    {
        $cheapest = $this->vehicles->sortBy(fn (Vehicle $vehicle) => (float) $vehicle->daily_rate)->first();

        return $cheapest
            ? ['amount' => $cheapest->daily_rate, 'currency' => $cheapest->currency]
            : null;
    }

    /**
     * What the fleet listing needs before it can be verified, each item
     * keyed so the dashboard can link to where it is fixed.
     *
     * @return list<array{key: string, label: string, isDone: bool}>
     */
    public function completionChecklist(): array
    {
        $this->loadMissing('vehicles.photos');
        $hasVehicles = $this->vehicles->isNotEmpty();

        return [
            ['key' => 'vehicles', 'label' => 'At least one vehicle listed', 'isDone' => $hasVehicles],
            ['key' => 'vehicle_photos', 'label' => 'All 6 photos for every vehicle', 'isDone' => $hasVehicles && $this->firstVehicleMissingPhotos() === null],
            ...$this->verificationChecklist(),
        ];
    }

    /**
     * The first vehicle that doesn't have all of its required photos yet.
     */
    public function firstVehicleMissingPhotos(): ?Vehicle
    {
        $this->loadMissing('vehicles.photos');

        return $this->vehicles->first(fn (Vehicle $vehicle) => $vehicle->photos->count() < count(VehiclePhoto::ANGLES));
    }
}
