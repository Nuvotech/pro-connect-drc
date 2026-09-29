<?php

namespace App\Models;

use Database\Factories\VehicleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A vehicle or piece of equipment offered for hire.
 *
 * @property int $id
 * @property int $vehicle_provider_id
 * @property int|null $category_id
 * @property string $make
 * @property string $model
 * @property int $year
 * @property string $registration_number
 * @property string $transmission
 * @property string $fuel_type
 * @property int|null $seats
 * @property string|null $payload_tonnes
 * @property string $driver_option
 * @property string $daily_rate
 * @property string $currency
 * @property string|null $deposit
 * @property int $minimum_rental_days
 * @property int $quantity
 * @property Carbon|null $insurance_expires_on
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'category_id',
    'make',
    'model',
    'year',
    'registration_number',
    'transmission',
    'fuel_type',
    'seats',
    'payload_tonnes',
    'driver_option',
    'daily_rate',
    'currency',
    'deposit',
    'minimum_rental_days',
    'quantity',
    'insurance_expires_on',
    'notes',
])]
class Vehicle extends Model
{
    /** @use HasFactory<VehicleFactory> */
    use HasFactory;

    /** @var list<string> */
    public const TRANSMISSIONS = ['manual', 'automatic'];

    /** @var list<string> */
    public const FUEL_TYPES = ['diesel', 'petrol', 'hybrid', 'electric'];

    /** @var list<string> */
    public const DRIVER_OPTIONS = ['self_drive', 'with_driver', 'both'];

    /** @var list<string> */
    public const CURRENCIES = ['USD', 'CDF'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'seats' => 'integer',
            'payload_tonnes' => 'decimal:1',
            'daily_rate' => 'decimal:2',
            'deposit' => 'decimal:2',
            'minimum_rental_days' => 'integer',
            'quantity' => 'integer',
            'insurance_expires_on' => 'date',
        ];
    }

    /**
     * The provider renting out this vehicle.
     *
     * @return BelongsTo<VehicleProvider, $this>
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(VehicleProvider::class, 'vehicle_provider_id');
    }

    /**
     * The type of vehicle, such as a pick-up or a minibus.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Hire requests for this vehicle.
     *
     * @return HasMany<VehicleBooking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(VehicleBooking::class);
    }

    /**
     * The photos of this vehicle, one per required angle.
     *
     * @return HasMany<VehiclePhoto, $this>
     */
    public function photos(): HasMany
    {
        return $this->hasMany(VehiclePhoto::class);
    }
}
