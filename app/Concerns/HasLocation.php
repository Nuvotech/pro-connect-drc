<?php

namespace App\Concerns;

use App\Models\City;
use App\Models\Commune;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A record located in one of the reference cities and communes.
 *
 * @property int|null $city_id
 * @property int|null $commune_id
 * @property-read City|null $city
 * @property-read Commune|null $commune
 */
trait HasLocation
{
    /**
     * The city this record is in.
     *
     * @return BelongsTo<City, $this>
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * The commune this record is in.
     *
     * @return BelongsTo<Commune, $this>
     */
    public function commune(): BelongsTo
    {
        return $this->belongsTo(Commune::class);
    }

    /**
     * Point the record at a city and commune given by name, as the forms
     * submit them. Names must already have passed validation.
     */
    public function placeIn(string $cityName, string $communeName): static
    {
        $commune = Commune::resolve($cityName, $communeName);

        $this->city()->associate($commune->city);
        $this->commune()->associate($commune);

        return $this;
    }
}
