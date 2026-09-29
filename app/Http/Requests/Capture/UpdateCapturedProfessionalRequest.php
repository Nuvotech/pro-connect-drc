<?php

namespace App\Http\Requests\Capture;

use App\Concerns\ListingValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * A capturer correcting a professional they added, before it is approved.
 */
class UpdateCapturedProfessionalRequest extends FormRequest
{
    use ListingValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('editCapture', $this->route('professional'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->professionalListingRules($this->route('professional')->id);
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->professionalListingMessages();
    }
}
