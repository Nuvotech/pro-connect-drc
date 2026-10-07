<?php

namespace App\Http\Resources;

use App\Models\Professional;
use App\Models\ProfessionalPhoto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * A verified professional as clients see them in the directory. Matches
 * the `Professional` type in `resources/js/types/directory.ts`.
 *
 * @mixin Professional
 */
class PublicProfessionalResource extends JsonResource
{
    public const PLACEHOLDER_PHOTO = '/images/directory/placeholder-pro.svg';

    public const DEFAULT_COVER = '/images/directory/profile-cover.svg';

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $categories = $this->categories;
        $categoryNames = $categories->pluck('name')->all();
        $paragraphs = collect(preg_split('/\R{2,}/', trim((string) $this->bio)) ?: [])
            ->map(fn (string $paragraph) => trim($paragraph))
            ->filter()
            ->values()
            ->all();

        return [
            'slug' => $this->slug,
            'name' => $this->business_name ?? $this->full_name,
            'title' => $this->headline ?? ($categories->first()?->name ?? 'Professional'),
            'categorySlug' => $categories->first()?->slug ?? '',
            'categorySlugs' => $categories->pluck('slug')->all(),
            'serviceTypes' => $categoryNames,
            'photo' => $this->photo_path ? Storage::disk('public')->url($this->photo_path) : self::PLACEHOLDER_PHOTO,
            'cover' => $this->cover_path ? Storage::disk('public')->url($this->cover_path) : self::DEFAULT_COVER,
            'commune' => $this->commune?->name ?? '',
            'city' => $this->city?->name ?? '',
            'rating' => (float) ($this->rating_average ?? 0),
            'reviewsCount' => (int) $this->reviews_count,
            'summary' => Str::limit($paragraphs[0] ?? implode(', ', $categoryNames), 140),
            'tags' => array_slice($categoryNames, 0, 3),
            'isVerified' => $this->isVerified(),
            'isCompany' => $this->isCompany(),
            'experienceYears' => (int) ($this->experience_years ?? 0),
            'serviceArea' => $this->service_area ?? $this->city?->name ?? '',
            'startingRate' => $this->formattedStartingRate(),
            'startingRateAmount' => $this->starting_rate === null ? null : (float) $this->starting_rate,
            'startingRateCurrency' => $this->currency ?? 'USD',
            'rateUnit' => $this->rate_unit,
            'phone' => '+243'.preg_replace('/\D/', '', $this->phone),
            'isOnWhatsApp' => $this->is_on_whatsapp,
            'about' => $paragraphs,
            'projects' => $this->relationLoaded('photos')
                ? $this->photos->map(fn (ProfessionalPhoto $photo) => Storage::disk('public')->url($photo->path))->all()
                : [],
        ];
    }

    /**
     * The starting rate as clients read it, such as "$25/hr".
     */
    private function formattedStartingRate(): string
    {
        if ($this->starting_rate === null) {
            return 'On request';
        }

        $amount = number_format((float) $this->starting_rate, 0);
        $unit = ['hour' => '/hr', 'day' => '/day', 'job' => '/job'][$this->rate_unit] ?? '';

        return $this->currency === 'CDF' ? "{$amount} FC{$unit}" : "\${$amount}{$unit}";
    }

    /**
     * The eager loads this resource needs.
     *
     * @return list<string>
     */
    public static function relations(): array
    {
        return ['categories:id,slug,name,icon', 'city:id,name', 'commune:id,name'];
    }
}
