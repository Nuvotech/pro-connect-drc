<?php

namespace App\Http\Requests;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * A customer creating an account to follow their requests and reviews.
 */
class RegisterCustomerRequest extends FormRequest
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => $this->nameRules(),
            'email' => $this->emailRules(),
            'phone' => ['required', 'string', 'regex:/^[0-9 ]{9,20}$/'],
            'password' => $this->passwordRules(),
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
            'full_name.required' => __('Please enter your full name.'),
            'phone.required' => __('Please enter your phone number.'),
            'phone.regex' => __('Enter a phone number of at least 9 digits.'),
            'email.unique' => __('An account with this email already exists. Log in instead.'),
        ];
    }
}
