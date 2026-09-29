<?php

namespace App\Http\Requests\Pro;

use App\Models\ProfessionalPhoto;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * A pro adding photos of their work, up to the gallery limit.
 */
class StoreGalleryPhotosRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'photos' => ['required', 'array', 'min:1', 'max:'.max(0, $this->remainingSlots())],
            'photos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'photos.required' => __('Choose at least one photo.'),
            'photos.max' => $this->remainingSlots() > 0
                ? 'You can add '.$this->remainingSlots().' more photo(s). Your gallery holds up to '.ProfessionalPhoto::MAX_PHOTOS.'.'
                : 'Your gallery is full. Remove a photo to add another.',
            'photos.*.image' => __('Each file must be an image.'),
            'photos.*.max' => __('Each photo must be 5 MB or smaller.'),
        ];
    }

    /**
     * How many more photos the gallery can take.
     */
    private function remainingSlots(): int
    {
        return ProfessionalPhoto::MAX_PHOTOS - ($this->user()->professional?->photos()->count() ?? 0);
    }
}
