<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * An admin adding a service or vehicle category, or correcting one.
 */
class SaveCategoryRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $category = $this->route('category');
        $group = $category instanceof Category ? $category->group : $this->input('group');

        return [
            'group' => [$category ? 'prohibited' : 'required', Rule::in(array_keys(Category::GROUP_LABELS))],
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique(Category::class, 'name')->where('group', $group)->ignore($category),
            ],
            'name_fr' => ['required', 'string', 'max:100'],
            'icon' => ['required', Rule::in(Category::ICONS)],
            'summary' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
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
            'group.required' => __('Choose where the new category belongs.'),
            'name.required' => __('Enter the category name in English.'),
            'name.unique' => __('A category with this name already exists in this group.'),
            'name_fr.required' => __('Enter the category name in French.'),
            'icon.required' => __('Choose an icon.'),
        ];
    }
}
