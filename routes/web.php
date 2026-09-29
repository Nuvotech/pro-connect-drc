<?php

use App\Http\Controllers\Admin\ApplicationController;
use App\Http\Controllers\Admin\ApplicationDecisionController;
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\CustomerRequestController;
use App\Http\Controllers\Admin\ExchangeRateController;
use App\Http\Controllers\Admin\ListingDocumentController;
use App\Http\Controllers\Admin\ProApplicationController;
use App\Http\Controllers\Admin\ProfessionalController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\VehicleProviderController;
use App\Http\Controllers\Auth\ProRegistrationController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CustomerAccountController;
use App\Http\Controllers\DirectoryController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\Pro\BookingController;
use App\Http\Controllers\Pro\DashboardController;
use App\Http\Controllers\Pro\FleetController;
use App\Http\Controllers\Pro\GalleryController;
use App\Http\Controllers\Pro\ListingController;
use App\Http\Controllers\Pro\QuoteController;
use App\Http\Controllers\Pro\ReviewController as ProReviewController;
use App\Http\Controllers\Pro\VehicleController;
use App\Http\Controllers\QuoteRequestController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ServiceRequestController;
use App\Http\Controllers\VehicleBookingController;
use Illuminate\Support\Facades\Route;

Route::controller(DirectoryController::class)->group(function () {
    Route::get('/', 'home')->name('home');
    Route::get('search', 'search')->name('search');
    Route::get('categories', 'categories')->name('categories.index');
    Route::get('categories/{category}', 'category')->name('categories.show');
    Route::get('pros/{professional}', 'professional')->name('professionals.show');
    Route::get('vehicles', 'vehicles')->name('vehicles.index');
    Route::get('vehicles/{category}', 'vehicleCategory')->name('vehicles.category');
    Route::get('fleets/{vehicleProvider}', 'fleet')->name('fleets.show');
});
Route::post('locale', [LocaleController::class, 'update'])->name('locale.update');

Route::get('contact', [ContactController::class, 'create'])->name('contact');
Route::post('contact', [ContactController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');

Route::get('become-a-pro', [ProRegistrationController::class, 'create'])->name('become-a-pro');
Route::post('become-a-pro', [ProRegistrationController::class, 'store'])
    ->middleware(['guest', 'throttle:6,1'])
    ->name('become-a-pro.store');
Route::get('business-services/request', [ServiceRequestController::class, 'create'])->name('service-request');

Route::controller(ReviewController::class)->prefix('reviews/{type}/{id}')->name('reviews.')
    ->whereIn('type', ['quote', 'booking'])
    ->whereNumber('id')
    ->group(function () {
        Route::get('/', 'create')->name('create');
        Route::post('/', 'store')->middleware('throttle:10,1')->name('store');
    });

Route::controller(CustomerAccountController::class)->prefix('account')->name('account.')->group(function () {
    Route::get('/', 'index')->middleware('auth')->name('index');
    Route::get('register', 'create')->middleware('guest')->name('register');
    Route::post('register', 'store')->middleware(['guest', 'throttle:6,1'])->name('register.store');
});

Route::middleware('throttle:10,1')->group(function () {
    Route::post('quote-requests', [QuoteRequestController::class, 'store'])->name('quote-requests.store');
    Route::post('business-services/request', [ServiceRequestController::class, 'store'])->name('service-request.store');
    Route::post('fleets/{vehicleProvider:slug}/bookings', [VehicleBookingController::class, 'store'])->name('fleets.bookings.store');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::prefix('dashboard')->name('dashboard.')->middleware('approved-pro')->group(function () {
        Route::controller(ListingController::class)->prefix('listing')->name('listing.')->group(function () {
            Route::get('/', 'show')->name('show');
            Route::get('create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::get('edit', 'edit')->name('edit');
            Route::patch('/', 'update')->name('update');
            Route::post('resubmit', 'resubmit')->name('resubmit');
        });

        Route::controller(GalleryController::class)->prefix('listing/gallery')->name('listing.gallery.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/', 'store')->name('store');
            Route::delete('{photo}', 'destroy')->name('destroy');
        });

        Route::controller(QuoteController::class)->prefix('quotes')->name('quotes.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('{quote}', 'show')->name('show');
            Route::patch('{quote}', 'update')->name('update');
            Route::post('{quote}/decline', 'decline')->name('decline');
            Route::post('{quote}/complete', 'complete')->name('complete');
        });

        Route::controller(ProReviewController::class)->prefix('reviews')->name('reviews.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::patch('{review}/reply', 'reply')->name('reply');
        });

        Route::controller(BookingController::class)->prefix('bookings')->name('bookings.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::patch('{booking}', 'update')->name('update');
        });

        Route::controller(FleetController::class)->prefix('fleet')->name('fleet.')->group(function () {
            Route::get('/', 'show')->name('show');
            Route::get('create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::get('edit', 'edit')->name('edit');
            Route::patch('/', 'update')->name('update');
            Route::post('resubmit', 'resubmit')->name('resubmit');
        });

        Route::controller(VehicleController::class)->prefix('fleet/vehicles')->name('vehicles.')->group(function () {
            Route::get('create', 'create')->name('create');
            Route::post('/', 'store')->name('store');
            Route::get('{vehicle}/edit', 'edit')->name('edit');
            Route::patch('{vehicle}', 'update')->name('update');
            Route::delete('{vehicle}', 'destroy')->name('destroy');
        });
    });
});

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::controller(CustomerRequestController::class)->group(function () {
        Route::get('requests', 'index')->name('requests.index');
        Route::post('quote-requests/{quoteRequest}/invitations', 'invite')->name('quote-requests.invite');
        Route::patch('service-requests/{serviceRequest}', 'updateServiceRequest')->name('service-requests.update');
        Route::get('service-requests/{serviceRequest}/attachment', 'attachment')->name('service-requests.attachment');
    });

    Route::prefix('sign-ups')->name('sign-ups.')->controller(ProApplicationController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('{application}/approve', 'approve')->name('approve');
        Route::post('{application}/decline', 'decline')->name('decline');
    });

    Route::get('applications', [ApplicationController::class, 'index'])->name('applications');
    Route::post('applications/{type}/{id}/decision', [ApplicationDecisionController::class, 'store'])
        ->whereIn('type', ['professional', 'vehicle_provider'])
        ->whereNumber('id')
        ->name('applications.decision');
    Route::get('listings/{type}/{id}/documents/{document}', [ListingDocumentController::class, 'show'])
        ->whereIn('type', ['professional', 'vehicle_provider'])
        ->whereNumber('id')
        ->whereIn('document', ['identity-document', 'business-registration'])
        ->name('listings.documents.show');

    Route::prefix('messages')->name('messages.')->controller(ContactMessageController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::patch('{contactMessage}', 'update')->name('update');
        Route::delete('{contactMessage}', 'destroy')->name('destroy');
    });

    Route::prefix('reviews')->name('reviews.')->controller(AdminReviewController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('{review}/approve', 'approve')->name('approve');
        Route::delete('{review}', 'destroy')->name('destroy');
    });

    Route::prefix('exchange-rate')->name('exchange-rate.')->controller(ExchangeRateController::class)->group(function () {
        Route::get('/', 'edit')->name('edit');
        Route::put('/', 'update')->name('update');
        Route::delete('/', 'destroy')->name('destroy');
    });

    Route::prefix('professionals')->name('professionals.')->controller(ProfessionalController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('{professional:id}', 'show')->whereNumber('professional')->name('show');
    });

    Route::prefix('vehicle-providers')->name('vehicle-providers.')->controller(VehicleProviderController::class)->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('{vehicleProvider}', 'show')->name('show');
    });
});

require __DIR__.'/settings.php';
