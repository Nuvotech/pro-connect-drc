<?php

use App\Models\Professional;
use App\Models\User;
use App\Notifications\AccountInvitation;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @return array<string, mixed>
 */
function validProfessionalPayload(array $overrides = []): array
{
    return [
        'categories' => ['electricians'],
        'full_name' => 'Christian Mukendi',
        'business_name' => 'ElectroTech Services RDC',
        'phone' => '82 441 9083',
        'is_on_whatsapp' => '1',
        'email' => 'contact@electrotech-rdc.com',
        'city' => 'Kinshasa',
        'commune' => 'Limete',
        'address' => '18 Av. du Métallique',
        'experience_years' => '14',
        'registry_number' => 'CD/KIN/RCCM/21-A-04892',
        'tax_id' => '01-92-K55140P',
        'bio' => 'Industrial and residential electrical installations.',
        'preferred_language' => 'fr',
        ...$overrides,
    ];
}

test('guests are redirected to the login page', function () {
    $this->get(route('admin.professionals.index'))
        ->assertRedirect(route('login'));

    $this->post(route('admin.professionals.store'), validProfessionalPayload())
        ->assertRedirect(route('login'));

    expect(Professional::count())->toBe(0);
});

test('the professionals list shows onboarded professionals', function () {
    $professional = Professional::factory()->verified()->create(['full_name' => 'Aline Mbuyi']);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.professionals.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/professionals/index')
            ->has('professionals.data', 1)
            ->where('professionals.data.0.id', $professional->id)
            ->where('professionals.data.0.fullName', 'Aline Mbuyi')
            ->where('professionals.data.0.isVerified', true));
});

test('admins can open a professional to see their full details', function () {
    $professional = Professional::factory()->verified()->withCategories(['plumbers'])->create([
        'full_name' => 'Aline Mbuyi',
        'identity_document_path' => 'professionals/documents/id.pdf',
    ]);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.professionals.show', $professional))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/professionals/show')
            ->where('professional.fullName', 'Aline Mbuyi')
            ->where('professional.services', ['Plumbers'])
            ->where('professional.identityDocumentUrl', route('admin.listings.documents.show', [
                'type' => 'professional',
                'id' => $professional->id,
                'document' => 'identity-document',
            ]))
            ->where('professional.publicUrl', route('professionals.show', $professional->slug)));
});

test('only admins can open a professional\'s details', function () {
    $professional = Professional::factory()->create();

    $this->actingAs(User::factory()->create())
        ->get(route('admin.professionals.show', $professional))
        ->assertForbidden();
});

test('the onboarding form renders', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.professionals.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/professionals/create'));
});

test('an admin can onboard a verified professional with a photo and ID document', function () {
    Storage::fake('public');
    Storage::fake('local');
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.professionals.store'), validProfessionalPayload([
            'is_verified' => '1',
            'photo' => UploadedFile::fake()->image('portrait.jpg'),
            'identity_document' => UploadedFile::fake()->create('passport.pdf', 200, 'application/pdf'),
        ]))
        ->assertRedirect(route('admin.professionals.index'))
        ->assertSessionHasNoErrors();

    $professional = Professional::sole();

    expect($professional)
        ->categorySlugs()->all()->toBe(['electricians'])
        ->full_name->toBe('Christian Mukendi')
        ->business_name->toBe('ElectroTech Services RDC')
        ->phone->toBe('82 441 9083')
        ->is_on_whatsapp->toBeTrue()
        ->email->toBe('contact@electrotech-rdc.com')
        ->city->name->toBe('Kinshasa')
        ->commune->name->toBe('Limete')
        ->experience_years->toBe(14)
        ->registry_number->toBe('CD/KIN/RCCM/21-A-04892')
        ->preferred_language->toBe('fr')
        ->onboarded_by_id->toBe($admin->id)
        ->and($professional->isVerified())->toBeTrue();

    Storage::disk('public')->assertExists($professional->photo_path);
    Storage::disk('local')->assertExists($professional->identity_document_path);
    Storage::disk('public')->assertMissing($professional->identity_document_path);
});

test('a professional stays unverified when the admin does not verify them', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.professionals.store'), Arr::except(validProfessionalPayload(), 'is_on_whatsapp'))
        ->assertRedirect(route('admin.professionals.index'));

    expect(Professional::sole())
        ->verified_at->toBeNull()
        ->is_on_whatsapp->toBeFalse()
        ->photo_path->toBeNull()
        ->identity_document_path->toBeNull();
});

test('a professional can offer several services', function () {
    $services = ['electricians', 'hvac', 'carpenters'];

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.professionals.store'), validProfessionalPayload([
            'categories' => $services,
        ]))
        ->assertRedirect(route('admin.professionals.index'));

    expect(Professional::sole()->categorySlugs()->all())->toEqualCanonicalizing($services);
});

test('required fields must be provided', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.professionals.store'), [])
        ->assertSessionHasErrors(['categories', 'full_name', 'phone', 'city', 'commune', 'preferred_language']);

    expect(Professional::count())->toBe(0);
});

test('invalid onboarding details are rejected', function (array $overrides, string $field, string $message) {
    Professional::factory()->create(['email' => 'taken@example.com']);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.professionals.store'), validProfessionalPayload($overrides))
        ->assertSessionHasErrors([$field => $message]);

    expect(Professional::count())->toBe(1);
})->with([
    'unknown service' => [['categories' => ['astronauts']], 'categories.0', 'Choose services from the list.'],
    'vehicle rental service' => [['categories' => ['heavy-trucks-freight']], 'categories.0', 'Choose services from the list.'],
    'short phone number' => [['phone' => '1234'], 'phone', 'Enter a phone number of at least 9 digits.'],
    'duplicate email' => [['email' => 'taken@example.com'], 'email', 'A professional with this email is already registered.'],
    'unknown city' => [['city' => 'Atlantis'], 'city', 'Choose a city from the list.'],
    'commune in another city' => [['city' => 'Lubumbashi', 'commune' => 'Limete'], 'commune', 'Choose a commune in the selected city.'],
]);

test('the profile photo must be an image', function () {
    Storage::fake('public');

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.professionals.store'), validProfessionalPayload([
            'photo' => UploadedFile::fake()->create('photo.pdf', 100, 'application/pdf'),
        ]))
        ->assertSessionHasErrors('photo');

    expect(Professional::count())->toBe(0);
});

test('onboarding with an email creates the pro account and invites them', function () {
    Notification::fake();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.professionals.store'), validProfessionalPayload())
        ->assertRedirect(route('admin.professionals.index'));

    $pro = User::where('email', 'contact@electrotech-rdc.com')->sole();

    expect($pro)
        ->name->toBe('Christian Mukendi')
        ->isAdmin()->toBeFalse()
        ->isApprovedPro()->toBeTrue()
        ->and(Professional::sole()->user_id)->toBe($pro->id);

    Notification::assertSentTo($pro, AccountInvitation::class);
});

test('onboarding links an existing pro account without inviting them again', function () {
    Notification::fake();
    $pro = User::factory()->create(['email' => 'contact@electrotech-rdc.com']);

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.professionals.store'), validProfessionalPayload())
        ->assertRedirect(route('admin.professionals.index'));

    expect(Professional::sole()->user_id)->toBe($pro->id)
        ->and(User::where('email', 'contact@electrotech-rdc.com')->count())->toBe(1);

    Notification::assertNothingSent();
});

test('onboarding without an email leaves the listing unlinked', function () {
    Notification::fake();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.professionals.store'), validProfessionalPayload(['email' => '']))
        ->assertRedirect(route('admin.professionals.index'));

    expect(Professional::sole()->user_id)->toBeNull()
        ->and(User::count())->toBe(1);

    Notification::assertNothingSent();
});

test('an email that cannot own a new listing is rejected', function (Closure $existingAccount, string $message) {
    $existingAccount();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.professionals.store'), validProfessionalPayload())
        ->assertSessionHasErrors(['email' => $message]);

    expect(Professional::where('email', 'contact@electrotech-rdc.com')->exists())->toBeFalse();
})->with([
    'admin account' => [
        fn () => User::factory()->admin()->create(['email' => 'contact@electrotech-rdc.com']),
        'This email belongs to an admin account.',
    ],
    'pro with a listing' => [
        fn () => Professional::factory()->for(User::factory()->create(['email' => 'contact@electrotech-rdc.com']))->create(['email' => null]),
        'This email is already linked to another listing.',
    ],
]);

test('an admin can verify a pending professional', function () {
    $professional = Professional::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.applications.decision', ['type' => 'professional', 'id' => $professional->id]), ['decision' => 'approve'])
        ->assertRedirect();

    expect($professional->fresh()->isVerified())->toBeTrue();
});

test('pros cannot verify listings', function () {
    $professional = Professional::factory()->create();

    $this->actingAs(User::factory()->create())
        ->post(route('admin.applications.decision', ['type' => 'professional', 'id' => $professional->id]), ['decision' => 'approve'])
        ->assertForbidden();

    expect($professional->fresh()->isVerified())->toBeFalse();
});
