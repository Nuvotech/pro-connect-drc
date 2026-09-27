<?php

use Inertia\Testing\AssertableInertia as Assert;

test('public directory pages render their components', function (string $url, string $component) {
    $this->get($url)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'home' => ['/', 'public/home'],
    'search' => ['/search', 'public/search'],
    'become a pro' => ['/become-a-pro', 'public/become-a-pro'],
    'business service request' => ['/business-services/request', 'public/service-request'],
]);

test('category page receives the category slug', function () {
    $this->get(route('categories.show', 'plumbers'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/category')
            ->where('slug', 'plumbers'));
});

test('professional profile page receives the professional slug', function () {
    $this->get(route('professionals.show', 'jean-pierre-kamba'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/professional')
            ->where('slug', 'jean-pierre-kamba'));
});
