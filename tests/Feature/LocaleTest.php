<?php

use App\Models\Customer;
use App\Models\Professional;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\User;
use App\Notifications\QuoteReceived;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('visitors see French by default, with the French strings and category names', function () {
    config(['app.locale' => 'fr']);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'fr')
            ->where('translations.Log out', 'Se déconnecter')
            ->where('categories', fn ($categories) => collect($categories)->firstWhere('slug', 'plumbers')['name'] === 'Plombiers'));
});

test('visitors can switch to English and the choice is remembered', function () {
    config(['app.locale' => 'fr']);

    $this->from(route('home'))
        ->post(route('locale.update'), ['locale' => 'en'])
        ->assertRedirect(route('home'));

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'en')
            ->where('categories', fn ($categories) => collect($categories)->firstWhere('slug', 'plumbers')['name'] === 'Plumbers'));
});

test('only French and English can be chosen', function () {
    $this->post(route('locale.update'), ['locale' => 'de'])
        ->assertSessionHasErrors('locale');
});

test('signed-in users keep their language on their account', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('locale.update'), ['locale' => 'fr']);

    expect($user->refresh()->locale)->toBe('fr');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'fr'));
});

test('validation messages come back in French', function () {
    $this->withSession(['locale' => 'fr'])
        ->post(route('account.register.store'), ['full_name' => '', 'email' => 'nope'])
        ->assertSessionHasErrors([
            'full_name' => 'Saisissez votre nom complet.',
            'email' => 'Le champ adresse e-mail doit être une adresse e-mail valide.',
        ]);
});

test('customer emails are sent in the language the customer used', function () {
    Notification::fake();
    $pro = User::factory()->create();
    $quote = Quote::factory()->for(Professional::factory()->verified()->for($pro))->create([
        'quote_request_id' => QuoteRequest::factory()->for(Customer::factory()->state([
            'email' => 'client@example.com',
            'preferred_language' => 'fr',
        ])),
    ]);

    $this->actingAs($pro)->patch(route('dashboard.quotes.update', $quote), [
        'amount' => 120,
        'currency' => 'USD',
        'message' => 'Materials and labour included.',
    ]);

    Notification::assertSentTo(new AnonymousNotifiable, QuoteReceived::class, fn (QuoteReceived $notification) => $notification->locale === 'fr');

    app()->setLocale('fr');
    expect((new QuoteReceived($quote->refresh()))->toMail(new AnonymousNotifiable)->greeting)->toStartWith('Bonjour');
});

test('every French string is filled in and keeps its placeholders', function () {
    $translations = json_decode(file_get_contents(lang_path('fr.json')), true, flags: JSON_THROW_ON_ERROR);

    foreach ($translations as $english => $french) {
        expect($french)->toBeString()->not->toBe('');

        preg_match_all('/:[A-Za-z]+/', $english, $needed);
        foreach ($needed[0] as $placeholder) {
            expect($french)->toContain($placeholder);
        }
    }
});
