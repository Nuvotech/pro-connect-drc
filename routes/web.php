<?php

use App\Http\Controllers\DirectoryController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'public/home')->name('home');
Route::inertia('search', 'public/search')->name('search');
Route::get('categories/{category}', [DirectoryController::class, 'category'])->name('categories.show');
Route::get('pros/{professional}', [DirectoryController::class, 'professional'])->name('professionals.show');
Route::inertia('become-a-pro', 'public/become-a-pro')->name('become-a-pro');
Route::inertia('business-services/request', 'public/service-request')->name('service-request');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
