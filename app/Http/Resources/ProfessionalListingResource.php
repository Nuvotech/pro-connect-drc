<?php

namespace App\Http\Resources;

use App\Models\Professional;
use App\Models\ProfessionalPhoto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Professional
 */
class ProfessionalListingResource extends JsonResource
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
            'categories' => $this->categorySlugs(),
            'fullName' => $this->full_name,
            'businessName' => $this->business_name,
            'phone' => $this->phone,
            'isOnWhatsApp' => $this->is_on_whatsapp,
            'email' => $this->email,
            'city' => $this->city?->name,
            'commune' => $this->commune?->name,
            'address' => $this->address,
            'experienceYears' => $this->experience_years,
            'registryNumber' => $this->registry_number,
            'taxId' => $this->tax_id,
            'bio' => $this->bio,
            'preferredLanguage' => $this->preferred_language,
            'photoUrl' => $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null,
            'hasIdentityDocument' => $this->identity_document_path !== null,
            'hasBusinessRegistration' => $this->business_registration_path !== null,
            'gallery' => $this->photos->map(fn (ProfessionalPhoto $photo) => Storage::disk('public')->url($photo->path)),
            'isVerified' => $this->isVerified(),
            'verifiedAt' => $this->verified_at?->toDateString(),
            'createdAt' => $this->created_at?->toDateString(),
        ];
    }
}
