<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use App\Models\ProApplication;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Approving an application. Every service the applicant typed in must be
 * matched to an existing category or added as a new one.
 */
class ApproveProApplicationRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'custom_services' => ['array'],
            'custom_services.*.category_slug' => ['nullable', 'string', Rule::exists(Category::class, 'slug')],
            'custom_services.*.new_category' => ['nullable', 'array'],
            'custom_services.*.new_category.name' => ['required_with:custom_services.*.new_category', 'string', 'max:60', Rule::unique(Category::class, 'name')],
            'custom_services.*.new_category.group' => ['required_with:custom_services.*.new_category', Rule::in(array_keys(Category::GROUP_LABELS))],
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
                /** @var ProApplication $application */
                $application = $this->route('application');

                if (! $application->isPending()) {
                    $validator->errors()->add('application', 'This application has already been decided.');

                    return;
                }

                foreach ($application->customServices as $customService) {
                    $resolution = $this->input("custom_services.{$customService->id}", []);

                    if (blank($resolution['category_slug'] ?? null) && blank($resolution['new_category']['name'] ?? null)) {
                        $validator->errors()->add(
                            "custom_services.{$customService->id}",
                            "Match \"{$customService->name}\" to a category or add it as a new one.",
                        );
                    }
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
            'custom_services.*.new_category.name.unique' => __('A category with this name already exists. Match it instead.'),
            'custom_services.*.new_category.group.in' => __('Choose where the new category belongs.'),
        ];
    }
}
