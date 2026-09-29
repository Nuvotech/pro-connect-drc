<?php

namespace App\Concerns;

use App\Models\Professional;
use App\Models\VehicleProvider;
use Illuminate\Database\Eloquent\Relations\Relation;

trait ResolvesListings
{
    /**
     * Find a listing from its morph type (`professional` or
     * `vehicle_provider`) and id, or fail with a 404.
     */
    protected function resolveListing(string $type, int $id): Professional|VehicleProvider
    {
        $class = Relation::getMorphedModel($type);

        abort_unless(in_array($class, [Professional::class, VehicleProvider::class], true), 404);

        return $class::findOrFail($id);
    }
}
