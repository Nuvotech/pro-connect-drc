<?php

use App\Models\ProApplication;
use App\Models\User;
use App\Notifications\NewProApplication;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @return array<string, mixed>
 */
function proApplicationPayload(array $overrides = []): array
{
    return [
        'provider_type' => 'company',
        'full_name' => 'Jean Dupont',
        'business_name' => 'Dupont Services SARL',
        'phone' => '81 234 5678',
        'is_on_whatsapp' => '1',
        'email' => 'jean@dupont.example',
        'city' => 'Kinshasa',
        'commune' => 'Gombe',
        'categories' => ['plumbers', 'law-firms', 'pick-ups-4x4s'],
        'custom_services' => ['Generator repair'],
        'description' => 'Plumbing, legal advice and pick-up hire.',
        'password' => 'a-strong-password-123',
        'password_confirmation' => 'a-strong-password-123',
        ...$overrides,
    ];
}

test('the join form offers every category and city from the database', function () {
    $this->get(route('become-a-pro'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/become-a-pro')
            ->has('categoryGroups', 3)
            ->where('categoryGroups.0.label', 'Trades')
            ->where('categoryGroups.1.label', 'Business services')
            ->where('categoryGroups.2.label', 'Vehicle & equipment rental')
            ->where('categoryGroups.2.options.0', ['slug' => 'chauffeur-driven-vip', 'name' => 'Chauffeur-Driven & VIP', 'nameFr' => 'Avec chauffeur & VIP'])
            ->where('categoryGroups.0.options', fn ($options) => collect($options)->contains(fn ($option) => $option['slug'] === 'masons' && $option['nameFr'] === 'Maçons'))
            ->where('cities.0.name', 'Kinshasa')
            ->where('maxCustomServices', ProApplication::MAX_CUSTOM_SERVICES));
});

test('applying creates a locked account with a pending application', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();

    $this->post(route('become-a-pro.store'), proApplicationPayload())
        ->assertRedirect(route('dashboard'));

    $user = User::where('email', 'jean@dupont.example')->sole();
    $application = ProApplication::sole();

    $this->assertAuthenticatedAs($user);

    expect($user)
        ->name->toBe('Jean Dupont')
        ->isApprovedPro()->toBeFalse()
        ->and($application)
        ->user_id->toBe($user->id)
        ->status->toBe(ProApplication::STATUS_PENDING)
        ->isCompany()->toBeTrue()
        ->business_name->toBe('Dupont Services SARL')
        ->city->name->toBe('Kinshasa')
        ->commune->name->toBe('Gombe')
        ->and($application->categories->pluck('slug')->all())->toEqualCanonicalizing(['plumbers', 'law-firms', 'pick-ups-4x4s'])
        ->and($application->customServices->pluck('name')->all())->toBe(['Generator repair'])
        ->and($application->offersServices())->toBeTrue()
        ->and($application->offersVehicles())->toBeTrue();

    Notification::assertSentTo($admin, NewProApplication::class);
});

test('a typed-in service alone is enough to apply', function () {
    $this->post(route('become-a-pro.store'), proApplicationPayload([
        'categories' => [],
        'custom_services' => ['Solar panel cleaning'],
    ]))->assertRedirect(route('dashboard'));

    expect(ProApplication::sole()->customServices->pluck('name')->all())->toBe(['Solar panel cleaning']);
});

test('invalid applications are rejected', function (array $overrides, string $field, string $message) {
    $this->post(route('become-a-pro.store'), proApplicationPayload($overrides))
        ->assertSessionHasErrors([$field => $message]);

    expect(ProApplication::count())->toBe(0);
})->with([
    'no services at all' => [['categories' => [], 'custom_services' => []], 'categories', 'Choose at least one service, or add your own.'],
    'unknown category' => [['categories' => ['astronauts']], 'categories.0', 'Choose services from the list.'],
    'typed-in service too long' => [['custom_services' => [str_repeat('a', 61)]], 'custom_services.0', 'Keep each service under 60 characters.'],
    'too many typed-in services' => [['custom_services' => ['One', 'Two', 'Three', 'Four', 'Five', 'Six']], 'custom_services', 'You can add up to 5 services of your own.'],
    'commune in another city' => [['commune' => 'Kenya'], 'commune', 'Choose a commune in the selected city.'],
    'no provider type' => [['provider_type' => null], 'provider_type', 'Choose whether you work for yourself or for a company.'],
    'company without a name' => [['business_name' => ''], 'business_name', 'Enter your company name.'],
]);

test('an individual can apply without a business name', function () {
    $this->post(route('become-a-pro.store'), proApplicationPayload([
        'provider_type' => 'individual',
        'business_name' => '',
    ]))->assertRedirect(route('dashboard'));

    expect(ProApplication::sole())
        ->isCompany()->toBeFalse()
        ->business_name->toBeNull();
});

test('an email that already has an account cannot apply again', function () {
    User::factory()->create(['email' => 'jean@dupont.example']);

    $this->post(route('become-a-pro.store'), proApplicationPayload())
        ->assertSessionHasErrors('email');

    expect(ProApplication::count())->toBe(0);
});

test('signed-in users cannot apply again', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('become-a-pro.store'), proApplicationPayload())
        ->assertRedirect(route('dashboard'));

    expect(ProApplication::count())->toBe(0);
});
