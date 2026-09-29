<?php

use App\Models\ListingReview;
use App\Models\Professional;
use App\Models\User;
use App\Models\VehiclePhoto;
use App\Models\VehicleProvider;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('a new service listing joins the review queue', function () {
    $pro = User::factory()->create();

    $this->actingAs($pro)->post(route('dashboard.listing.store'), [
        'categories' => ['plumbers'],
        'full_name' => 'Jean Dupont',
        'phone' => '81 234 5678',
        'city' => 'Kinshasa',
        'commune' => 'Gombe',
        'preferred_language' => 'fr',
    ])->assertRedirect(route('dashboard.listing.show'));

    $professional = Professional::sole();

    expect($professional)
        ->review_status->toBe('pending')
        ->submitted_at->not->toBeNull()
        ->and($professional->reviews->pluck('event')->all())->toBe([ListingReview::EVENT_SUBMITTED]);
});

test('admin onboarding records whether the listing was approved', function (bool $isVerified, string $status, string $event) {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.professionals.store'), [
        'categories' => ['electricians'],
        'full_name' => 'Christian Mukendi',
        'phone' => '82 441 9083',
        'city' => 'Kinshasa',
        'commune' => 'Limete',
        'preferred_language' => 'fr',
        'is_verified' => $isVerified ? '1' : '0',
    ]);

    $professional = Professional::sole();
    $review = $professional->reviews()->sole();

    expect($professional->review_status)->toBe($status)
        ->and($professional->isVerified())->toBe($isVerified)
        ->and($review->event)->toBe($event)
        ->and($review->reviewer_id)->toBe($isVerified ? $admin->id : null);
})->with([
    'verified' => [true, 'approved', ListingReview::EVENT_APPROVED],
    'not verified' => [false, 'pending', ListingReview::EVENT_SUBMITTED],
]);

test('changing key details on an approved listing puts it back in the queue', function () {
    $pro = User::factory()->create();
    $professional = Professional::factory()->verified()->for($pro)->withCategories(['plumbers'])->locatedIn('Kinshasa', 'Gombe')->create();

    $this->actingAs($pro)->patch(route('dashboard.listing.update'), [
        'categories' => ['plumbers'],
        'full_name' => $professional->full_name,
        'phone' => $professional->phone,
        'city' => 'Kinshasa',
        'commune' => 'Gombe',
        'preferred_language' => 'fr',
        'registry_number' => 'CD/KIN/RCCM/99-Z-00001',
    ]);

    $professional->refresh();

    expect($professional->review_status)->toBe('pending')
        ->and($professional->isVerified())->toBeFalse()
        ->and($professional->reviews()->first()->event)->toBe(ListingReview::EVENT_KEY_DETAILS_CHANGED);
});

test('key changes wait for the pro to resubmit after changes were requested', function () {
    $pro = User::factory()->create();
    $professional = Professional::factory()->for($pro)->withCategories(['plumbers'])->locatedIn('Kinshasa', 'Gombe')->create([
        'review_status' => 'changes_requested',
    ]);

    $this->actingAs($pro)->patch(route('dashboard.listing.update'), [
        'categories' => ['plumbers'],
        'full_name' => $professional->full_name,
        'phone' => $professional->phone,
        'city' => 'Kinshasa',
        'commune' => 'Gombe',
        'preferred_language' => 'fr',
        'registry_number' => 'CD/KIN/RCCM/99-Z-00001',
    ]);

    expect($professional->fresh()->review_status)->toBe('changes_requested')
        ->and($professional->reviews()->count())->toBe(0);
});

test('adding a vehicle re-queues only an approved fleet', function (bool $isApproved, string $expectedStatus, int $expectedEvents) {
    Storage::fake('public');
    $pro = User::factory()->create();
    $factory = VehicleProvider::factory()->for($pro);
    $provider = ($isApproved ? $factory->verified() : $factory)->create();

    $this->actingAs($pro)->post(route('dashboard.vehicles.store'), [
        'category' => 'vans-light-cargo',
        'make' => 'Toyota',
        'model' => 'HiAce',
        'year' => '2020',
        'registration_number' => '5102AB03',
        'transmission' => 'manual',
        'fuel_type' => 'diesel',
        'driver_option' => 'both',
        'daily_rate' => '90',
        'currency' => 'USD',
        'photos' => collect(VehiclePhoto::ANGLES)
            ->mapWithKeys(fn (string $label, string $angle) => [$angle => UploadedFile::fake()->image("{$angle}.jpg")])
            ->all(),
    ])->assertRedirect(route('dashboard.fleet.show'));

    expect($provider->fresh()->review_status)->toBe($expectedStatus)
        ->and($provider->reviews()->count())->toBe($expectedEvents);
})->with([
    'approved fleet' => [true, 'pending', 1],
    'fleet already in review' => [false, 'pending', 0],
]);

test('a pro can resubmit after changes were requested or a decline', function (string $status) {
    $pro = User::factory()->create();
    $professional = Professional::factory()->for($pro)->create(['review_status' => $status]);

    $this->actingAs($pro)
        ->from(route('dashboard.listing.show'))
        ->post(route('dashboard.listing.resubmit'))
        ->assertRedirect(route('dashboard.listing.show'))
        ->assertInertiaFlash('toast.type', 'success');

    $professional->refresh();

    expect($professional->review_status)->toBe('resubmitted')
        ->and($professional->submitted_at)->not->toBeNull()
        ->and($professional->reviews()->sole()->event)->toBe(ListingReview::EVENT_RESUBMITTED);
})->with(['changes_requested', 'declined']);

test('a listing already in the queue or approved cannot be resubmitted', function (string $status) {
    $pro = User::factory()->create();
    $provider = VehicleProvider::factory()->for($pro)->create(['review_status' => $status]);

    $this->actingAs($pro)
        ->from(route('dashboard.fleet.show'))
        ->post(route('dashboard.fleet.resubmit'))
        ->assertRedirect(route('dashboard.fleet.show'))
        ->assertInertiaFlash('toast.type', 'error');

    expect($provider->fresh()->review_status)->toBe($status)
        ->and($provider->reviews()->count())->toBe(0);
})->with(['pending', 'resubmitted', 'approved']);

test('a pro sees the admin\'s message on their dashboard and listing', function () {
    $admin = User::factory()->admin()->create();
    $pro = User::factory()->create();
    $professional = Professional::factory()->for($pro)->create();
    $professional->recordDecision($admin, 'request_changes', 'Please upload a clearer ID document.', notify: false);

    $this->actingAs($pro)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('overviews.0.reviewStatus', 'changes_requested')
            ->where('overviews.0.adminMessage', 'Please upload a clearer ID document.')
            ->where('overviews.0.canResubmit', true));

    $this->actingAs($pro)
        ->get(route('dashboard.listing.show'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('review.adminMessage', 'Please upload a clearer ID document.')
            ->where('review.canResubmit', true));
});
