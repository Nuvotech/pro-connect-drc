<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A directory category as the public pages show it. Covers the fields of
 * the `Category`, `BusinessCategory` and `VehicleRentalCategory` types.
 *
 * @mixin Category
 */
class PublicCategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name' => $this->localizedName(),
            'nameEn' => $this->name,
            'nameFr' => $this->name_fr,
            'icon' => $this->icon,
            'group' => $this->group,
            'prosCount' => (int) ($this->published_count ?? 0),
            'description' => $this->description ?? $this->summary ?? '',
            'summary' => $this->summary ?? '',
            'specialties' => $this->description ?? $this->summary ?? '',
            'tagline' => $this->tagline ?? '',
            'isPremium' => $this->slug === 'chauffeur-driven-vip',
            'serviceTypes' => [],
        ];
    }
}
