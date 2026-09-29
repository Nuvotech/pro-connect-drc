<?php

use App\Models\ListingReview;
use App\Models\Professional;
use App\Models\User;
use App\Models\VehicleProvider;
use App\Notifications\ListingReviewed;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('the queue shows listings that need review, of both kinds', function () {
    $pendingPro = Professional::factory()->create(['business_name' => 'Pending Plumbing', 'submitted_at' => now()->subDay()]);
    $resubmittedFleet = VehicleProvider::factory()->create(['business_name' => 'Resubmitted Fleet', 'review_status' => 'resubmitted', 'submitted_at' => now()]);
    Professional::factory()->verified()->create(['business_name' => 'Approved Electrics']);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.applications'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/applications')
            ->where('tab', 'needs_review')
            ->has('applications', 2)
            ->where('applications.0.key', "professional-{$pendingPro->id}")
            ->where('applications.1.key', "vehicle_provider-{$resubmittedFleet->id}")
            ->where('counts.needs_review', 2)
            ->where('counts.approved', 1));
});

test('a review link opens the listing in the tab it belongs to', function () {
    $approved = VehicleProvider::factory()->verified()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.applications', ['listing' => "vehicle_provider-{$approved->id}"]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('tab', 'approved')
            ->where('selectedKey', "vehicle_provider-{$approved->id}")
            ->has('applications', 1));
});

test('the queue explains what a listing is missing', function () {
    Professional::factory()->create(['photo_path' => null, 'identity_document_path' => null, 'bio' => null]);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.applications'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('applications.0.missingCount', 4)
            ->where('applications.0.documents.0.isOnFile', false));
});

test('approving a listing verifies it, logs the decision and emails the pro', function () {
    Notification::fake();
    $admin = User::factory()->admin()->create();
    $pro = User::factory()->create();
    $professional = Professional::factory()->for($pro)->create();

    $this->actingAs($admin)
        ->post(route('admin.applications.decision', ['type' => 'professional', 'id' => $professional->id]), [
            'decision' => 'approve',
            'internal_note' => 'Registry checked',
        ])
        ->assertRedirect();

    $professional->refresh();
    $review = $professional->reviews()->sole();

    expect($professional)
        ->review_status->toBe('approved')
        ->isVerified()->toBeTrue()
        ->and($review)
        ->event->toBe(ListingReview::EVENT_APPROVED)
        ->reviewer_id->toBe($admin->id)
        ->internal_note->toBe('Registry checked');

    Notification::assertSentTo($pro, ListingReviewed::class, fn (ListingReviewed $notification) => $notification->status === 'approved');
});

test('requesting changes or declining needs a message for the pro', function (string $decision) {
    $provider = VehicleProvider::factory()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.applications.decision', ['type' => 'vehicle_provider', 'id' => $provider->id]), ['decision' => $decision])
        ->assertSessionHasErrors(['message' => 'Tell the pro what to fix or why their listing was declined.']);

    expect($provider->fresh()->review_status)->toBe('pending');
})->with(['request_changes', 'decline']);

test('an admin can ask for changes or decline a listing', function (string $decision, string $status) {
    Notification::fake();
    $pro = User::factory()->create();
    $provider = VehicleProvider::factory()->verified()->for($pro)->create();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.applications.decision', ['type' => 'vehicle_provider', 'id' => $provider->id]), [
            'decision' => $decision,
            'message' => 'Please add photos of the engine for every vehicle.',
        ])
        ->assertRedirect();

    $provider->refresh();

    expect($provider->review_status)->toBe($status)
        ->and($provider->isVerified())->toBeFalse()
        ->and($provider->latestAdminReview()->message)->toBe('Please add photos of the engine for every vehicle.');

    Notification::assertSentTo($pro, ListingReviewed::class);
})->with([
    'request changes' => ['request_changes', 'changes_requested'],
    'decline' => ['decline', 'declined'],
]);

test('the pro is not emailed when the admin turns notifications off', function () {
    Notification::fake();
    $professional = Professional::factory()->for(User::factory())->create();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.applications.decision', ['type' => 'professional', 'id' => $professional->id]), [
            'decision' => 'approve',
            'notify' => false,
        ]);

    Notification::assertNothingSent();
});

test('admins can open a listing’s private ID document', function () {
    Storage::fake('local');
    Storage::disk('local')->put('professionals/documents/id.pdf', 'pdf-content');
    $professional = Professional::factory()->create(['identity_document_path' => 'professionals/documents/id.pdf']);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.listings.documents.show', ['type' => 'professional', 'id' => $professional->id, 'document' => 'identity-document']))
        ->assertOk();
});

test('a missing document is not found', function () {
    $professional = Professional::factory()->create(['business_registration_path' => null]);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.listings.documents.show', ['type' => 'professional', 'id' => $professional->id, 'document' => 'business-registration']))
        ->assertNotFound();
});

test('pros cannot open other listings’ documents', function () {
    Storage::fake('local');
    Storage::disk('local')->put('professionals/documents/id.pdf', 'pdf-content');
    $professional = Professional::factory()->create(['identity_document_path' => 'professionals/documents/id.pdf']);

    $this->actingAs(User::factory()->create())
        ->get(route('admin.listings.documents.show', ['type' => 'professional', 'id' => $professional->id, 'document' => 'identity-document']))
        ->assertForbidden();
});
