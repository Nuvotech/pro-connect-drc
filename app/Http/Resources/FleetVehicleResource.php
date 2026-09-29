<?php

namespace App\Http\Resources;

use App\Models\Vehicle;
use App\Models\VehiclePhoto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Vehicle
 */
class FleetVehicleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $angleOrder = array_keys(VehiclePhoto::ANGLES);

        return [
            'id' => $this->id,
            'category' => $this->category?->slug,
            'make' => $this->make,
            'model' => $this->model,
            'year' => $this->year,
            'registrationNumber' => $this->registration_number,
            'transmission' => $this->transmission,
            'fuelType' => $this->fuel_type,
            'seats' => $this->seats,
            'payloadTonnes' => $this->payload_tonnes,
            'driverOption' => $this->driver_option,
            'dailyRate' => $this->daily_rate,
            'currency' => $this->currency,
            'deposit' => $this->deposit,
            'minimumRentalDays' => $this->minimum_rental_days,
            'quantity' => $this->quantity,
            'insuranceExpiresOn' => $this->insurance_expires_on?->toDateString(),
            'isInsuranceExpired' => $this->insurance_expires_on?->isPast() ?? false,
            'notes' => $this->notes,
            'photos' => $this->photos
                ->sortBy(fn (VehiclePhoto $photo) => array_search($photo->angle, $angleOrder, true))
                ->map(fn (VehiclePhoto $photo) => [
                    'angle' => $photo->angle,
                    'url' => Storage::disk('public')->url($photo->path),
                ])
                ->values(),
        ];
    }
}
