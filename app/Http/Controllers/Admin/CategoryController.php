<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The services and vehicle types pros can be listed under.
 */
class CategoryController extends Controller
{
    /**
     * List every category by group, with how many listings use each.
     */
    public function index(): Response
    {
        $categories = Category::query()
            ->withCount(['professionals', 'vehicles'])
            ->orderBy('group')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/categories', [
            'groups' => collect(Category::GROUP_LABELS)
                ->map(fn (string $label, string $group) => [
                    'value' => $group,
                    'label' => __($label),
                    'categories' => $categories
                        ->where('group', $group)
                        ->values()
                        ->map(fn (Category $category) => [
                            'id' => $category->id,
                            'slug' => $category->slug,
                            'name' => $category->name,
                            'nameFr' => $category->name_fr,
                            'icon' => $category->icon,
                            'summary' => $category->summary,
                            'description' => $category->description,
                            'isActive' => $category->is_active,
                            'listings' => $category->group === Category::GROUP_VEHICLE
                                ? $category->vehicles_count
                                : $category->professionals_count,
                        ])
                        ->all(),
                ])
                ->values()
                ->all(),
            'icons' => Category::ICONS,
        ]);
    }

    /**
     * Add a category at the end of its group.
     */
    public function store(SaveCategoryRequest $request): RedirectResponse
    {
        $category = Category::createInGroup(
            $request->validated('group'),
            $request->validated('name'),
            $request->validated('name_fr'),
            $request->validated('icon'),
            $request->validated('summary'),
            $request->validated('description'),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name was added.', ['name' => $category->name])]);

        return back();
    }

    /**
     * Correct a category's names, icon or wording.
     */
    public function update(SaveCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->safe()->only(['name', 'name_fr', 'icon', 'summary', 'description']));

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name was updated.', ['name' => $category->name])]);

        return back();
    }

    /**
     * Hide a category from the public site and pickers, or show it again.
     */
    public function toggle(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate(['is_active' => ['required', 'boolean']]);

        $category->update(['is_active' => $validated['is_active']]);

        Inertia::flash('toast', ['type' => 'success', 'message' => $validated['is_active']
            ? __(':name is visible again.', ['name' => $category->name])
            : __(':name is now hidden.', ['name' => $category->name])]);

        return back();
    }
}
