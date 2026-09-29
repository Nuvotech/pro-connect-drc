<?php

namespace App\Http\Resources;

use App\Models\VehicleProvider;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin VehicleProvider
 */
class VehicleProviderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contactName' => $this->contact_name,
            'businessName' => $this->business_name,
            'phone' => $this->phone,
            'isOnWhatsApp' => $this->is_on_whatsapp,
            'email' => $this->email,
            'city' => $this->city?->name,
            'commune' => $this->commune?->name,
            'address' => $this->address,
            'registryNumber' => $this->registry_number,
            'taxId' => $this->tax_id,
            'preferredLanguage' => $this->preferred_language,
            'hasIdentityDocument' => $this->identity_document_path !== null,
            'isVerified' => $this->isVerified(),
            'verifiedAt' => $this->verified_at?->toDateString(),
            'onboardedBy' => $this->whenLoaded('onboardedBy', fn () => $this->onboardedBy?->name),
            'createdAt' => $this->created_at?->toDateString(),
            'lowestDailyRate' => $this->lowestDailyRate(),
        ];
    }
}
