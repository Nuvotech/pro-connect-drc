<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get(route('admin.applications'))
        ->assertRedirect(route('login'));
});

test('admins can view the applications review page', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.applications'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/applications'));
});
