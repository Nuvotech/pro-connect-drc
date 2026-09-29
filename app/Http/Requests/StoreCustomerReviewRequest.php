<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * A customer rating a finished job or vehicle hire.
 */
class StoreCustomerReviewRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:1000'],
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
            'rating.required' => __('Choose a rating from 1 to 5 stars.'),
            'rating.between' => __('Choose a rating from 1 to 5 stars.'),
            'comment.max' => __('Please keep your comment under 1000 characters.'),
        ];
    }
}
