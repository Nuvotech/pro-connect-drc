<?php

namespace App\Models;

use Database\Factories\CityFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A city the directory serves.
 *
 * @property int $id
 * @property string $name
 * @property string $region
 * @property float|null $latitude
 * @property float|null $longitude
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'region', 'latitude', 'longitude', 'sort_order'])]
class City extends Model
{
    /** @use HasFactory<CityFactory> */
    use HasFactory;

    /**
     * The city's communes.
     *
     * @return HasMany<Commune, $this>
     */
    public function communes(): HasMany
    {
        return $this->hasMany(Commune::class)->orderBy('name');
    }

    /**
     * Every city with its communes, in display order, for location pickers.
     *
     * @return list<array{name: string, region: string, latitude: float|null, longitude: float|null, communes: list<string>}>
     */
    public static function options(): array
    {
        return static::query()
            ->with('communes:id,city_id,name')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (self $city) => [
                'name' => $city->name,
                'region' => $city->region,
                'latitude' => $city->latitude,
                'longitude' => $city->longitude,
                'communes' => $city->communes->pluck('name')->all(),
            ])
            ->all();
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    /**
     * Service professionals based in this city.
     *
     * @return HasMany<Professional, $this>
     */
    public function professionals(): HasMany
    {
        return $this->hasMany(Professional::class);
    }

    /**
     * Vehicle providers based in this city.
     *
     * @return HasMany<VehicleProvider, $this>
     */
    public function vehicleProviders(): HasMany
    {
        return $this->hasMany(VehicleProvider::class);
    }
}
