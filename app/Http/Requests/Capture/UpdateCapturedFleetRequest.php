<?php

namespace App\Http\Requests\Capture;

use App\Concerns\ListingValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * A capturer correcting a fleet's business details, before it is approved.
 */
class UpdateCapturedFleetRequest extends FormRequest
{
    use ListingValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('editCapture', $this->route('vehicleProvider'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->vehicleProviderListingRules($this->route('vehicleProvider')->id);
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->vehicleProviderListingMessages();
    }
}
