<?php

namespace App\Http\Resources;

use App\Models\Vehicle;
use Illuminate\Http\Request;

/**
 * A vehicle as clients see it: the fleet details without the number plate
 * or insurance dates, plus the fleet it belongs to.
 *
 * @mixin Vehicle
 */
class PublicVehicleResource extends FleetVehicleResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'registrationNumber' => null,
            'insuranceExpiresOn' => null,
            'isInsuranceExpired' => false,
            'fleet' => $this->whenLoaded('provider', fn () => [
                'slug' => $this->provider->slug,
                'name' => $this->provider->business_name ?? $this->provider->contact_name,
                'city' => $this->provider->city?->name,
            ]),
        ];
    }
}
