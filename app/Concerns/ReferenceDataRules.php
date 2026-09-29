<?php

namespace App\Concerns;

use App\Models\Category;
use App\Models\City;
use App\Models\Commune;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

/**
 * Validation against the reference tables: categories, cities and
 * communes. Forms submit slugs and names, never ids.
 */
trait ReferenceDataRules
{
    /**
     * Rules for the trades and business services a professional offers.
     *
     * @return array<string, array<mixed>>
     */
    protected function professionalCategoryRules(): array
    {
        return [
            'categories' => ['required', 'array', 'min:1'],
            'categories.*' => ['string', 'distinct', $this->categoryExists(Category::PROFESSIONAL_GROUPS)],
        ];
    }

    /**
     * A category slug that exists, and is active, in the given groups.
     *
     * @param  string|list<string>  $groups
     */
    protected function categoryExists(string|array $groups): Exists
    {
        return Rule::exists(Category::class, 'slug')
            ->whereIn('group', (array) $groups)
            ->where('is_active', true);
    }

    /**
     * Rules for a city and a commune within that city, given by name.
     *
     * @return array<string, array<mixed>>
     */
    protected function locationRules(): array
    {
        return [
            'city' => ['required', 'string', Rule::exists(City::class, 'name')],
            'commune' => [
                'required',
                'string',
                Rule::exists(Commune::class, 'name')->where(
                    'city_id',
                    City::query()->where('name', (string) $this->input('city'))->value('id') ?? 0,
                ),
            ],
        ];
    }

    /**
     * Friendly messages for the reference data rules.
     *
     * @return array<string, string>
     */
    protected function referenceDataMessages(): array
    {
        return [
            'categories.required' => __('Choose at least one service.'),
            'categories.*.exists' => __('Choose services from the list.'),
            'city.required' => __('Please choose your city.'),
            'city.exists' => __('Choose a city from the list.'),
            'commune.required' => __('Please choose your commune.'),
            'commune.exists' => __('Choose a commune in the selected city.'),
        ];
    }
}
