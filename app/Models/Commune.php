<?php

namespace App\Models;

use Database\Factories\CommuneFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A commune (district) within a city.
 *
 * @property int $id
 * @property int $city_id
 * @property string $name
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name'])]
class Commune extends Model
{
    /** @use HasFactory<CommuneFactory> */
    use HasFactory;

    /**
     * The city this commune belongs to.
     *
     * @return BelongsTo<City, $this>
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Find a commune from the city and commune names the forms submit.
     */
    public static function resolve(string $cityName, string $communeName): self
    {
        return static::query()
            ->with('city')
            ->where('name', $communeName)
            ->whereRelation('city', 'name', $cityName)
            ->firstOrFail();
    }
}
