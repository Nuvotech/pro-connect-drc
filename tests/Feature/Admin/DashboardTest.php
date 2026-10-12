<?php

use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\CustomerReview;
use App\Models\ProApplication;
use App\Models\Professional;
use App\Models\QuoteRequest;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleBooking;
use App\Models\VehicleProvider;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are sent to the login page', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('the dashboard renders with nothing in the system yet', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('queues.signUps', 0)
            ->where('queues.listings', 0)
            ->where('directory.professionals', 0)
            ->where('directory.missingDocuments', 0)
            ->has('waitingListings', 0)
            ->has('latestRequests', 0));
});

test('the dashboard counts what is waiting in each queue', function () {
    ProApplication::factory()->count(2)->create();
    ProApplication::factory()->approved()->create();
    QuoteRequest::factory()->create(['status' => QuoteRequest::STATUS_OPEN]);
    QuoteRequest::factory()->create(['status' => QuoteRequest::STATUS_CANCELLED]);
    ServiceRequest::factory()->count(3)->create(['status' => ServiceRequest::STATUS_NEW]);
    ServiceRequest::factory()->create(['status' => ServiceRequest::STATUS_CLOSED]);
    VehicleBooking::factory()->create(['status' => VehicleBooking::STATUS_REQUESTED]);
    VehicleBooking::factory()->confirmed()->create();
    CustomerReview::factory()->unpublished()->count(2)->create();
    CustomerReview::factory()->create();
    ContactMessage::factory()->count(4)->create();
    ContactMessage::factory()->read()->create();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('queues.signUps', 2)
            ->where('queues.quotes', 1)
            ->where('queues.business', 3)
            ->where('queues.bookings', 1)
            ->where('queues.reviews', 2)
            ->where('queues.messages', 4));
});

test('the dashboard sums up the live directory and flags listings missing documents', function () {
    Professional::factory()->verified()->create(['identity_document_path' => 'professionals/documents/id.pdf']);
    Professional::factory()->verified()->create(['identity_document_path' => null]);
    Professional::factory()->create();
    $fleet = VehicleProvider::factory()->company(withRegistration: true)->verified()->create();
    Vehicle::factory()->for($fleet, 'provider')->create(['quantity' => 3]);
    Vehicle::factory()->for($fleet, 'provider')->create(['quantity' => 2]);
    Vehicle::factory()->for(VehicleProvider::factory(), 'provider')->create(['quantity' => 9]);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('directory.professionals', 2)
            ->where('directory.fleets', 1)
            ->where('directory.vehicles', 5)
            ->where('directory.categories', Category::where('is_active', true)->count())
            ->where('directory.missingDocuments', 1));
});

test('the dashboard lists the listings waiting longest, each with the key its review link needs', function () {
    $newest = Professional::factory()->create(['business_name' => 'Newest Plumbing', 'submitted_at' => now()->subHour()]);
    $oldest = VehicleProvider::factory()->create(['business_name' => 'Oldest Fleet', 'review_status' => 'resubmitted', 'submitted_at' => now()->subDays(3)]);
    Professional::factory()->count(5)->create(['submitted_at' => now()->subDay()]);
    Professional::factory()->verified()->create(['submitted_at' => now()->subWeek()]);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('queues.listings', 7)
            ->has('waitingListings', 5)
            ->where('waitingListings.0.key', "vehicle_provider-{$oldest->id}")
            ->where('waitingListings.0.name', 'Oldest Fleet')
            ->where('waitingListings', fn ($listings) => ! collect($listings)->contains('key', "professional-{$newest->id}")));
});

test('the dashboard lists the newest requests of every kind', function () {
    $booking = VehicleBooking::factory()->create(['created_at' => now()->subMinutes(5)]);
    $quote = QuoteRequest::factory()->create(['created_at' => now()->subHour()]);
    $business = ServiceRequest::factory()->create(['created_at' => now()->subDay()]);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('latestRequests', 3)
            ->where('latestRequests.0.tab', 'bookings')
            ->where('latestRequests.0.id', $booking->id)
            ->where('latestRequests.1.tab', 'quotes')
            ->where('latestRequests.1.id', $quote->id)
            ->where('latestRequests.1.customer', $quote->customer->full_name)
            ->where('latestRequests.2.tab', 'business')
            ->where('latestRequests.2.id', $business->id));
});
