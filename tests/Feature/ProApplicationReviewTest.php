<?php

use App\Models\Category;
use App\Models\ProApplication;
use App\Models\User;
use App\Notifications\ProApplicationReviewed;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('an applicant waiting for review sees their application, not the listing tools', function () {
    $application = ProApplication::factory()->forCategories(['plumbers'])->withCustomServices(['Solar panel cleaning'])->create();

    $this->actingAs($application->user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('application.status', 'pending')
            ->where('application.services', ['Plumbers', 'Solar panel cleaning'])
            ->where('overviews', [])
            ->where('auth.pro.isApproved', false));

    $this->actingAs($application->user)
        ->get(route('dashboard.listing.create'))
        ->assertRedirect(route('dashboard'));

    $this->actingAs($application->user)
        ->get(route('dashboard.fleet.create'))
        ->assertRedirect(route('dashboard'));
});

test('a declined applicant sees why', function () {
    $application = ProApplication::factory()->create([
        'status' => ProApplication::STATUS_DECLINED,
        'decision_message' => 'We could not verify your phone number.',
    ]);

    $this->actingAs($application->user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('application.status', 'declined')
            ->where('application.decisionMessage', 'We could not verify your phone number.'));
});

test('the sign-up queue lists applications by status', function () {
    $waiting = ProApplication::factory()->create();
    ProApplication::factory()->create(['status' => ProApplication::STATUS_DECLINED]);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.sign-ups.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/sign-ups')
            ->where('status', 'pending')
            ->has('applications', 1)
            ->where('applications.0.id', $waiting->id)
            ->where('counts', ['pending' => 1, 'approved' => 0, 'declined' => 1]));
});

test('approving resolves typed-in services and unlocks the dashboard', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    $application = ProApplication::factory()
        ->forCategories(['plumbers'])
        ->withCustomServices(['Plumbing work', 'Generator rental'])
        ->create();
    [$matched, $created] = $application->customServices;

    $this->actingAs($admin)
        ->post(route('admin.sign-ups.approve', $application), [
            'custom_services' => [
                $matched->id => ['category_slug' => 'plumbers'],
                $created->id => ['new_category' => ['name' => 'Generator rental', 'group' => 'vehicle']],
            ],
        ])
        ->assertRedirect(route('admin.sign-ups.index', ['status' => 'pending']));

    $newCategory = Category::where('name', 'Generator rental')->sole();
    $application->refresh();

    expect($application->status)->toBe(ProApplication::STATUS_APPROVED)
        ->and($application->reviewed_by_id)->toBe($admin->id)
        ->and($application->user->isApprovedPro())->toBeTrue()
        ->and($newCategory->group)->toBe(Category::GROUP_VEHICLE)
        ->and($newCategory->slug)->toBe('generator-rental')
        ->and($created->fresh()->category_id)->toBe($newCategory->id)
        ->and($matched->fresh()->category->slug)->toBe('plumbers')
        ->and($application->categories->pluck('slug')->all())->toEqualCanonicalizing(['plumbers', 'generator-rental']);

    Notification::assertSentTo($application->user, ProApplicationReviewed::class);

    $this->actingAs($application->user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('setup', ['services' => true, 'vehicles' => true])
            ->where('auth.pro.isApproved', true));
});

test('every typed-in service must be resolved before approving', function () {
    $application = ProApplication::factory()->withCustomServices(['Generator rental'])->create();
    $customService = $application->customServices->sole();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.sign-ups.approve', $application))
        ->assertSessionHasErrors(["custom_services.{$customService->id}" => 'Match "Generator rental" to a category or add it as a new one.']);

    expect($application->fresh()->status)->toBe(ProApplication::STATUS_PENDING)
        ->and($application->user->fresh()->isApprovedPro())->toBeFalse();
});

test('declining needs a reason and tells the applicant', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    $application = ProApplication::factory()->create();

    $this->actingAs($admin)
        ->post(route('admin.sign-ups.decline', $application))
        ->assertSessionHasErrors(['message' => 'Tell the applicant why they were not approved.']);

    $this->actingAs($admin)
        ->post(route('admin.sign-ups.decline', $application), ['message' => 'Incomplete contact details.'])
        ->assertRedirect();

    expect($application->fresh())
        ->status->toBe(ProApplication::STATUS_DECLINED)
        ->decision_message->toBe('Incomplete contact details.')
        ->and($application->user->fresh()->isApprovedPro())->toBeFalse();

    Notification::assertSentTo($application->user, ProApplicationReviewed::class);
});

test('an application can only be decided once', function () {
    $application = ProApplication::factory()->create(['status' => ProApplication::STATUS_DECLINED]);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.sign-ups.approve', $application))
        ->assertSessionHasErrors(['application' => 'This application has already been decided.']);

    expect($application->user->fresh()->isApprovedPro())->toBeFalse();
});

test('pros cannot review sign-ups', function (string $method, string $routeName) {
    $application = ProApplication::factory()->create();

    $this->actingAs(User::factory()->create())
        ->{$method}(route($routeName, $application))
        ->assertForbidden();
})->with([
    'queue' => ['get', 'admin.sign-ups.index'],
    'approve' => ['post', 'admin.sign-ups.approve'],
    'decline' => ['post', 'admin.sign-ups.decline'],
]);

test('an approved pro offering both can set up a service listing and a fleet', function () {
    $application = ProApplication::factory()->approved()->forCategories(['electricians', 'vans-light-cargo'])->create();
    $pro = $application->user;

    $this->actingAs($pro)
        ->get(route('dashboard.listing.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('defaults.full_name', $application->full_name)
            ->where('defaults.categories', ['electricians']));

    $this->actingAs($pro)->post(route('dashboard.listing.store'), [
        'categories' => ['electricians'],
        'full_name' => $application->full_name,
        'phone' => '81 234 5678',
        'city' => 'Kinshasa',
        'commune' => 'Gombe',
        'preferred_language' => 'fr',
    ])->assertRedirect(route('dashboard.listing.show'));

    $this->actingAs($pro)
        ->get(route('dashboard.fleet.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('defaults.contact_name', $application->full_name));

    expect($pro->fresh()->hasProfessionalListing())->toBeTrue()
        ->and($pro->fresh()->hasFleet())->toBeFalse();
});

test('admins get a verification link to send only while the applicant is unverified', function () {
    $unverified = ProApplication::factory()->create();
    $unverified->user->forceFill(['email' => null, 'phone' => '243812345678', 'email_verified_at' => null])->save();
    $verified = ProApplication::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.sign-ups.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('applications.0.email', null)
            ->where('applications.0.isVerified', false)
            ->where('applications.0.verificationUrl', fn (?string $url) => str_contains((string) $url, '/email/verify/'.$unverified->user_id.'/'))
            ->where('applications.1.isVerified', true)
            ->where('applications.1.verificationUrl', null));
});
