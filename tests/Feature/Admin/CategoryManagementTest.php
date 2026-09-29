<?php

use App\Models\Category;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @return array<string, string>
 */
function categoryPayload(array $overrides = []): array
{
    return [
        'group' => Category::GROUP_TRADE,
        'name' => 'Beekeepers',
        'name_fr' => 'Apiculteurs',
        'icon' => 'construction',
        'summary' => 'Hives, Honey, Pollination',
        ...$overrides,
    ];
}

test('admins see every category by group', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.categories.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/categories')
            ->has('groups', 3)
            ->where('groups.0.value', Category::GROUP_TRADE)
            ->where('groups.0.categories', fn ($categories) => collect($categories)->contains('slug', 'plumbers')));
});

test('an admin adds a category that shows on the site straight away', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.categories.store'), categoryPayload())
        ->assertRedirect();

    $category = Category::where('name', 'Beekeepers')->sole();

    expect($category)
        ->group->toBe(Category::GROUP_TRADE)
        ->slug->toBe('beekeepers')
        ->name_fr->toBe('Apiculteurs')
        ->icon->toBe('construction')
        ->is_active->toBeTrue();

    $this->get(route('categories.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('trades', fn ($categories) => collect($categories)->contains('slug', 'beekeepers')));
});

test('category names must be new within their group and use a known icon', function (array $overrides, string $field) {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.categories.store'), categoryPayload($overrides))
        ->assertSessionHasErrors($field);
})->with([
    'duplicate name' => [['name' => 'Plumbers'], 'name'],
    'missing French name' => [['name_fr' => ''], 'name_fr'],
    'unknown group' => [['group' => 'food'], 'group'],
    'unknown icon' => [['icon' => 'not-an-icon'], 'icon'],
]);

test('an admin corrects a category but cannot move it to another group', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::where('slug', 'plumbers')->sole();

    $this->actingAs($admin)
        ->put(route('admin.categories.update', $category), [
            'name' => 'Plumbers',
            'name_fr' => 'Plombiers & sanitaires',
            'icon' => 'water_drop',
        ])
        ->assertSessionHasNoErrors();

    expect($category->refresh())
        ->name_fr->toBe('Plombiers & sanitaires')
        ->icon->toBe('water_drop')
        ->slug->toBe('plumbers');

    $this->actingAs($admin)
        ->put(route('admin.categories.update', $category), [
            'group' => Category::GROUP_VEHICLE,
            'name' => 'Plumbers',
            'name_fr' => 'Plombiers',
            'icon' => 'plumbing',
        ])
        ->assertSessionHasErrors('group');
});

test('hidden categories disappear from the site and can be shown again', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::where('slug', 'plumbers')->sole();

    $this->actingAs($admin)
        ->patch(route('admin.categories.toggle', $category), ['is_active' => false]);

    expect($category->refresh()->is_active)->toBeFalse();
    $this->get(route('categories.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('trades', fn ($categories) => ! collect($categories)->contains('slug', 'plumbers')));

    $this->actingAs($admin)
        ->patch(route('admin.categories.toggle', $category), ['is_active' => true]);

    expect($category->refresh()->is_active)->toBeTrue();
});

test('only admins manage categories', function (Closure $makeUser) {
    $this->actingAs($makeUser())
        ->post(route('admin.categories.store'), categoryPayload())
        ->assertForbidden();

    expect(Category::where('name', 'Beekeepers')->exists())->toBeFalse();
})->with([
    'pro' => [fn () => User::factory()->create()],
    'capturer' => [fn () => User::factory()->capturer()->create()],
]);
