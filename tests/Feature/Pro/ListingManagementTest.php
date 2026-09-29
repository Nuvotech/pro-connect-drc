<?php

use App\Models\Professional;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @return array<string, mixed>
 */
function listingPayload(array $overrides = []): array
{
    return [
        'categories' => ['electricians'],
        'full_name' => 'Christian Mukendi',
        'business_name' => 'ElectroTech Services RDC',
        'phone' => '82 441 9083',
        'is_on_whatsapp' => '1',
        'email' => 'contact@electrotech-rdc.example',
        'city' => 'Kinshasa',
        'commune' => 'Limete',
        'experience_years' => '14',
        'registry_number' => 'CD/KIN/RCCM/21-A-04892',
        'preferred_language' => 'fr',
        ...$overrides,
    ];
}

test('a pro can set up a service listing, which waits for verification', function () {
    $pro = User::factory()->create();

    $this->actingAs($pro)
        ->post(route('dashboard.listing.store'), listingPayload())
        ->assertRedirect(route('dashboard.listing.show'));

    expect(Professional::sole())
        ->user_id->toBe($pro->id)
        ->business_name->toBe('ElectroTech Services RDC')
        ->isVerified()->toBeFalse();
});

test('a pro cannot create a second listing', function () {
    $pro = User::factory()->create();
    Professional::factory()->for($pro)->create();

    $this->actingAs($pro)
        ->post(route('dashboard.listing.store'), listingPayload())
        ->assertRedirect(route('dashboard'));

    expect(Professional::count())->toBe(1);
});

test('a pro sees and can edit their own listing', function () {
    $pro = User::factory()->create();
    Professional::factory()->for($pro)->create(['full_name' => 'Aline Mbuyi']);

    $this->actingAs($pro)
        ->get(route('dashboard.listing.show'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/listing/show')
            ->where('listing.fullName', 'Aline Mbuyi'));

    $this->actingAs($pro)
        ->get(route('dashboard.listing.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('dashboard/listing/edit'));
});

test('a pro without a listing is sent to the overview', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('dashboard.listing.show'))
        ->assertRedirect(route('dashboard'));
});

test('editing contact details keeps the listing verified', function () {
    $pro = User::factory()->create();
    $professional = Professional::factory()->verified()->for($pro)
        ->withCategories(['electricians'])
        ->locatedIn('Kinshasa', 'Limete')
        ->create(Arr::except(listingPayload(), ['categories', 'city', 'commune']));

    $this->actingAs($pro)
        ->patch(route('dashboard.listing.update'), listingPayload(['phone' => '99 111 2222', 'bio' => 'New description.']))
        ->assertRedirect(route('dashboard.listing.show'));

    expect($professional->fresh())
        ->phone->toBe('99 111 2222')
        ->bio->toBe('New description.')
        ->isVerified()->toBeTrue();
});

test('changing registration details sends the listing back for verification', function (array $change) {
    Storage::fake('local');
    $pro = User::factory()->create();
    $professional = Professional::factory()->verified()->for($pro)
        ->withCategories(['electricians'])
        ->locatedIn('Kinshasa', 'Limete')
        ->create(Arr::except(listingPayload(), ['categories', 'city', 'commune']));

    $this->actingAs($pro)
        ->patch(route('dashboard.listing.update'), listingPayload($change))
        ->assertRedirect(route('dashboard.listing.show'));

    expect($professional->fresh()->isVerified())->toBeFalse();
})->with([
    'RCCM number' => [['registry_number' => 'CD/KIN/RCCM/99-Z-00001']],
    'tax ID' => [['tax_id' => '01-00-X99999X']],
    'ID document' => [fn () => ['identity_document' => UploadedFile::fake()->create('new-id.pdf', 100, 'application/pdf')]],
]);

test('a new ID document replaces the old file', function () {
    Storage::fake('local');
    Storage::disk('local')->put('professionals/documents/old.pdf', 'old');
    $pro = User::factory()->create();
    $professional = Professional::factory()->for($pro)->locatedIn('Kinshasa', 'Limete')->create([
        ...Arr::except(listingPayload(), ['categories', 'city', 'commune']),
        'identity_document_path' => 'professionals/documents/old.pdf',
    ]);

    $this->actingAs($pro)->patch(route('dashboard.listing.update'), listingPayload([
        'identity_document' => UploadedFile::fake()->create('new-id.pdf', 100, 'application/pdf'),
    ]));

    Storage::disk('local')->assertMissing('professionals/documents/old.pdf');
    Storage::disk('local')->assertExists($professional->fresh()->identity_document_path);
});
