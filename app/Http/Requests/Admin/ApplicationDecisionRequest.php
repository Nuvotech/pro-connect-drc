<?php

namespace App\Http\Requests\Admin;

use App\Concerns\ResolvesListings;
use App\Models\Professional;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ApplicationDecisionRequest extends FormRequest
{
    use ResolvesListings;

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
     * Get the "after" validation callables for the request.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->input('decision') !== 'approve') {
                    return;
                }

                $missing = $this->resolveListing($this->route('type'), (int) $this->route('id'))->missingCompanyDetails();

                if ($missing !== []) {
                    $validator->errors()->add('decision', __('A company can only be verified once its registration is on file. Still missing: :items.', [
                        'items' => implode(', ', array_map(fn (string $item) => __($item), $missing)),
                    ]));
                }
            },
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
