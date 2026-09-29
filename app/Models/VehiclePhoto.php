<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * One of the required photos of a vehicle, taken from a set angle.
 *
 * @property int $id
 * @property int $vehicle_id
 * @property string $angle
 * @property string $path
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['angle', 'path'])]
class VehiclePhoto extends Model
{
    /**
     * The photos every vehicle must have, in display order. Keep in sync
     * with `vehiclePhotoAngles` in `admin-data.ts`.
     *
     * @var array<string, string>
     */
    public const ANGLES = [
        'front' => 'front',
        'rear' => 'back',
        'left' => 'left side',
        'right' => 'right side',
        'interior' => 'interior',
        'engine' => 'engine',
    ];

    /**
     * The vehicle this photo belongs to.
     *
     * @return BelongsTo<Vehicle, $this>
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
