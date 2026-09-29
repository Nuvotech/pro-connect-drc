<?php

namespace App\Models;

use Database\Factories\FavoriteFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Carbon;

/**
 * A professional or vehicle provider a customer saved for later.
 *
 * @property int $id
 * @property int $customer_id
 * @property string $favoritable_type
 * @property int $favoritable_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Favorite extends Model
{
    /** @use HasFactory<FavoriteFactory> */
    use HasFactory;

    /**
     * The customer who saved the listing.
     *
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * The saved professional or vehicle provider.
     *
     * @return MorphTo<Model, $this>
     */
    public function favoritable(): MorphTo
    {
        return $this->morphTo();
    }
}
