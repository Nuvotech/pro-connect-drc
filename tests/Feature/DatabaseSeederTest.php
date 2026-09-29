<?php

use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerReview;
use App\Models\Favorite;
use App\Models\Professional;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\VehicleBooking;
use App\Models\VehicleProvider;
use Database\Seeders\AccountSeeder;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Storage;

test('the demo data seeds with its accounts and listings', function () {
    Storage::fake('public');

    $this->seed(DatabaseSeeder::class);

    expect(User::where('email', AccountSeeder::ADMIN_EMAIL)->sole()->isAdmin())->toBeTrue()
        ->and(User::where('email', AccountSeeder::PLUMBER_EMAIL)->sole()->professional->review_status)->toBe('pending')
        ->and(User::where('email', AccountSeeder::FLEET_OWNER_EMAIL)->sole()->vehicleProvider)
        ->business_name->toBe('Kongo Fleet Services SARL')
        ->isVerified()->toBeTrue()
        ->and(User::where('role', User::ROLE_CUSTOMER)->count())->toBe(5);

    $kongoVehicle = VehicleProvider::where('email', 'contact@kongofleet.example')->sole()->vehicles()->first();
    Storage::disk('public')->assertExists($kongoVehicle->photos()->first()->path);

    foreach ([Professional::class, Customer::class, QuoteRequest::class, Quote::class, ServiceRequest::class, VehicleBooking::class, CustomerReview::class, Favorite::class] as $model) {
        expect($model::count())->toBeGreaterThan(0, "{$model} has no seeded rows");
    }

    expect(Category::where('group', Category::GROUP_TRADE)->count())->toBeGreaterThanOrEqual(40)
        ->and(Category::where('group', Category::GROUP_BUSINESS)->count())->toBeGreaterThanOrEqual(20)
        ->and(Category::count())->toBe(Category::distinct()->count('slug'));

    expect(Professional::whereNotNull('rating_average')->exists())->toBeTrue()
        ->and(QuoteRequest::first()->reference)->toBe('QR-000001');
});
