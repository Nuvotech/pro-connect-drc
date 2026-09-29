<?php

use App\Models\Category;
use App\Models\CustomerReview;
use App\Models\Professional;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\VehicleBooking;
use App\Notifications\NewQuoteInvitation;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('admins see quote requests with the pros they could invite', function () {
    $plumbers = Category::where('slug', 'plumbers')->sole();
    $request = QuoteRequest::factory()->for($plumbers)->create();
    $candidate = Professional::factory()->verified()->withCategories(['plumbers'])->create(['business_name' => 'Verified Plumbing']);
    Professional::factory()->withCategories(['plumbers'])->create();
    Professional::factory()->verified()->withCategories(['electricians'])->create();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.requests.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/requests')
            ->where('tab', 'quotes')
            ->where('requests.0.id', $request->id)
            ->where('requests.0.candidates', [[
                'id' => $candidate->id,
                'name' => 'Verified Plumbing',
                'city' => $candidate->city->name,
                'slug' => $candidate->slug,
            ]])
            ->where('counts.quotes', 1));
});

test('the business and bookings tabs list their requests', function (string $tab, Closure $create) {
    $create();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.requests.index', ['tab' => $tab]))
        ->assertInertia(fn (Assert $page) => $page->where('tab', $tab)->has('requests', 1));
})->with([
    'business' => ['business', fn () => ServiceRequest::factory()->create()],
    'bookings' => ['bookings', fn () => VehicleBooking::factory()->create()],
]);

test('admins get the review link for finished jobs until the customer reviews', function (string $tab, Closure $createJob, string $path) {
    $job = $createJob();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.requests.index', ['tab' => $tab]))
        ->assertInertia(fn (Assert $page) => $page
            ->where("{$path}.reviewUrl", fn (string $url) => str_contains($url, '/reviews/') && str_contains($url, 'signature='))
            ->where("{$path}.isReviewed", false));

    CustomerReview::factory()->unpublished()->create([
        $job instanceof Quote ? 'quote_id' : 'vehicle_booking_id' => $job->id,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.requests.index', ['tab' => $tab]))
        ->assertInertia(fn (Assert $page) => $page
            ->where("{$path}.reviewUrl", null)
            ->where("{$path}.isReviewed", true));
})->with([
    'quote' => ['quotes', fn () => Quote::factory()->completed()->create(), 'requests.0.quotes.0'],
    'booking' => ['bookings', fn () => VehicleBooking::factory()->completed()->create(), 'requests.0'],
]);

test('inviting pros creates their quotes once and emails them', function () {
    Notification::fake();
    $plumbers = Category::where('slug', 'plumbers')->sole();
    $request = QuoteRequest::factory()->for($plumbers)->create();
    $first = Professional::factory()->verified()->withCategories(['plumbers'])->for(User::factory())->create();
    $second = Professional::factory()->verified()->withCategories(['plumbers'])->for(User::factory())->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.quote-requests.invite', $request), ['professional_ids' => [$first->id, $second->id]])
        ->assertRedirect()
        ->assertInertiaFlash('toast.message', '2 pros invited.');

    $this->actingAs($admin)
        ->post(route('admin.quote-requests.invite', $request), ['professional_ids' => [$first->id]])
        ->assertInertiaFlash('toast.message', 'Those pros were already invited.');

    expect($request->quotes()->count())->toBe(2)
        ->and($request->quotes()->pluck('status')->unique()->all())->toBe([Quote::STATUS_INVITED]);
    Notification::assertSentTo($first->user, NewQuoteInvitation::class);
    Notification::assertSentTimes(NewQuoteInvitation::class, 2);
});

test('only verified pros in the request\'s category can be invited', function (Closure $makePro) {
    $request = QuoteRequest::factory()->for(Category::where('slug', 'plumbers')->sole())->create();
    $pro = $makePro();

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.quote-requests.invite', $request), ['professional_ids' => [$pro->id]])
        ->assertSessionHasErrors('professional_ids.0');

    expect($request->quotes()->count())->toBe(0);
})->with([
    'unverified' => [fn () => Professional::factory()->withCategories(['plumbers'])->create()],
    'other category' => [fn () => Professional::factory()->verified()->withCategories(['electricians'])->create()],
]);

test('admins assign a firm to a business request', function () {
    $lawFirms = Category::where('slug', 'law-firms')->sole();
    $request = ServiceRequest::factory()->for($lawFirms)->create();
    $firm = Professional::factory()->verified()->withCategories(['law-firms'])->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->patch(route('admin.service-requests.update', $request), [
            'status' => ServiceRequest::STATUS_MATCHED,
            'professional_id' => $firm->id,
        ])
        ->assertRedirect();

    expect($request->fresh())
        ->status->toBe(ServiceRequest::STATUS_MATCHED)
        ->professional_id->toBe($firm->id)
        ->handled_by_id->toBe($admin->id);
});

test('admins can download a business request attachment', function () {
    Storage::fake('local');
    Storage::disk('local')->put('service-requests/brief.pdf', 'pdf');
    $request = ServiceRequest::factory()->create(['attachment_path' => 'service-requests/brief.pdf']);

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.service-requests.attachment', $request))
        ->assertOk()
        ->assertDownload();
});

test('pros cannot use the admin requests tools', function (string $method, Closure $route) {
    $this->actingAs(User::factory()->create())
        ->{$method}($route())
        ->assertForbidden();
})->with([
    'list' => ['get', fn () => route('admin.requests.index')],
    'invite' => ['post', fn () => route('admin.quote-requests.invite', QuoteRequest::factory()->create())],
    'update business request' => ['patch', fn () => route('admin.service-requests.update', ServiceRequest::factory()->create())],
]);
