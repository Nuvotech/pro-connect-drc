<?php

namespace App\Http\Requests\Admin;

use App\Models\ExchangeRate;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * An admin setting the USD to CDF rate by hand.
 */
class UpdateExchangeRateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rate' => ['required', 'numeric', 'between:'.ExchangeRate::MIN_RATE.','.ExchangeRate::MAX_RATE],
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
            'rate.required' => __('Enter how many francs one dollar buys.'),
            'rate.numeric' => __('Enter the rate as a number, e.g. 2850.'),
            'rate.between' => __('Enter a rate between :min and :max FC.', ['min' => number_format(ExchangeRate::MIN_RATE), 'max' => number_format(ExchangeRate::MAX_RATE)]),
        ];
    }
}
