<?php

namespace App\Models;

use App\Concerns\HasLocation;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Someone looking for a pro, a business service or a vehicle. Guests become
 * customers when they send a request; `user_id` is set once they register.
 *
 * @property int $id
 * @property int|null $user_id
 * @property string $full_name
 * @property string|null $organization
 * @property string|null $email
 * @property string $phone
 * @property bool $is_on_whatsapp
 * @property string|null $address
 * @property string $preferred_language
 * @property string $preferred_contact_channel
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'full_name',
    'organization',
    'email',
    'phone',
    'is_on_whatsapp',
    'address',
    'preferred_language',
    'preferred_contact_channel',
])]
class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use HasFactory, HasLocation;

    /** @var list<string> */
    public const CONTACT_CHANNELS = ['whatsapp', 'call', 'email'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_on_whatsapp' => 'boolean',
        ];
    }

    /**
     * The customer's account, if they have registered.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Quote requests the customer sent to service professionals.
     *
     * @return HasMany<QuoteRequest, $this>
     */
    public function quoteRequests(): HasMany
    {
        return $this->hasMany(QuoteRequest::class);
    }

    /**
     * Business service requests the customer sent.
     *
     * @return HasMany<ServiceRequest, $this>
     */
    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    /**
     * Vehicles the customer asked to hire.
     *
     * @return HasMany<VehicleBooking, $this>
     */
    public function vehicleBookings(): HasMany
    {
        return $this->hasMany(VehicleBooking::class);
    }

    /**
     * Reviews the customer has written.
     *
     * @return HasMany<CustomerReview, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(CustomerReview::class);
    }

    /**
     * Listings the customer saved.
     *
     * @return HasMany<Favorite, $this>
     */
    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }
}
