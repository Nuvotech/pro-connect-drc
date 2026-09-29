<?php

namespace App\Models;

use App\Concerns\HasReference;
use Database\Factories\VehicleBookingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * A customer's request to hire a vehicle for a period. The rate is copied
 * from the vehicle so the booking keeps its price if the rate changes.
 *
 * @property int $id
 * @property string|null $reference
 * @property int $customer_id
 * @property int $vehicle_provider_id
 * @property int|null $vehicle_id
 * @property Carbon $start_date
 * @property Carbon $end_date
 * @property int $quantity
 * @property bool $with_driver
 * @property string|null $pickup_location
 * @property string|null $notes
 * @property string $daily_rate
 * @property string $currency
 * @property string $estimated_total
 * @property string $status
 * @property Carbon|null $responded_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'start_date',
    'end_date',
    'quantity',
    'with_driver',
    'pickup_location',
    'notes',
    'status',
    'responded_at',
])]
class VehicleBooking extends Model
{
    /** @use HasFactory<VehicleBookingFactory> */
    use HasFactory, HasReference;

    public const REFERENCE_PREFIX = 'VB';

    public const STATUS_REQUESTED = 'requested';

    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUS_DECLINED = 'declined';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_COMPLETED = 'completed';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'quantity' => 'integer',
            'with_driver' => 'boolean',
            'daily_rate' => 'decimal:2',
            'estimated_total' => 'decimal:2',
            'responded_at' => 'datetime',
        ];
    }

    /**
     * Book a vehicle, copying its rate and working out the estimated total.
     */
    public function forVehicle(Vehicle $vehicle): static
    {
        $this->vehicle()->associate($vehicle);
        $this->vehicleProvider()->associate($vehicle->vehicle_provider_id);

        $days = max(1, (int) $this->start_date->diffInDays($this->end_date) + 1);

        $this->forceFill([
            'daily_rate' => $vehicle->daily_rate,
            'currency' => $vehicle->currency,
            'estimated_total' => (float) $vehicle->daily_rate * $days * ($this->quantity ?? 1),
        ]);

        return $this;
    }

    /**
     * The customer hiring the vehicle.
     *
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * The provider renting it out.
     *
     * @return BelongsTo<VehicleProvider, $this>
     */
    public function vehicleProvider(): BelongsTo
    {
        return $this->belongsTo(VehicleProvider::class);
    }

    /**
     * The vehicle booked; empty if the provider has since removed it.
     *
     * @return BelongsTo<Vehicle, $this>
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * The customer's review once the hire is over.
     *
     * @return HasOne<CustomerReview, $this>
     */
    public function review(): HasOne
    {
        return $this->hasOne(CustomerReview::class);
    }
}
