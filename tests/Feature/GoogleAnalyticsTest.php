<?php

test('pages load the google analytics tag when a measurement id is set', function () {
    config(['services.google_analytics.measurement_id' => 'G-TEST123']);

    $this->get(route('home'))
        ->assertOk()
        ->assertSee('https://www.googletagmanager.com/gtag/js?id=G-TEST123', false)
        ->assertSee("gtag('config', 'G-TEST123')", false);
});

test('pages skip the google analytics tag when no measurement id is set', function () {
    config(['services.google_analytics.measurement_id' => null]);

    $this->get(route('home'))
        ->assertOk()
        ->assertDontSee('googletagmanager.com', false);
});
