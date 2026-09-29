<?php

namespace App\Http\Requests;

use App\Models\ContactMessage;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Someone writing to ProConnect through the contact form.
 */
class StoreContactMessageRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'required_without:phone', 'email', 'max:255'],
            'phone' => ['nullable', 'required_without:email', 'string', 'regex:/^[0-9 +]{9,20}$/'],
            'topic' => ['required', Rule::in(array_keys(ContactMessage::TOPICS))],
            'message' => ['required', 'string', 'min:10', 'max:3000'],
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
            'name.required' => __('Please enter your name.'),
            'email.required_without' => __('Give us an email address or a phone number so we can reply.'),
            'phone.required_without' => __('Give us an email address or a phone number so we can reply.'),
            'email.email' => __('Please enter a valid email address.'),
            'phone.regex' => __('Enter a phone number of at least 9 digits.'),
            'topic.required' => __('Choose what your message is about.'),
            'message.required' => __('Please write your message.'),
            'message.min' => __('Please write a little more so we can help.'),
        ];
    }
}
