<?php

namespace App\Http\Requests\Admin;

use App\Models\Professional;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApplicationDecisionRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'decision' => ['required', Rule::in(array_keys(Professional::DECISION_STATUSES))],
            'message' => ['nullable', 'string', 'max:2000', 'required_unless:decision,approve'],
            'internal_note' => ['nullable', 'string', 'max:2000'],
            'notify' => ['boolean'],
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
            'message.required_unless' => __('Tell the pro what to fix or why their listing was declined.'),
        ];
    }
}
