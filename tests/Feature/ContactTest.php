<?php

use App\Models\ContactMessage;
use App\Models\User;
use App\Notifications\NewContactMessage;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * @return array<string, string>
 */
function contactPayload(array $overrides = []): array
{
    return [
        'name' => 'Amani Kasongo',
        'email' => 'amani@example.com',
        'phone' => '',
        'topic' => 'support',
        'message' => 'My plumber has not contacted me yet about my request.',
        ...$overrides,
    ];
}

test('the contact page shows the topics to choose from', function () {
    $this->get(route('contact'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/contact')
            ->has('topics', count(ContactMessage::TOPICS)));
});

test('a message is saved to the admin inbox', function () {
    Notification::fake();

    $this->post(route('contact.store'), contactPayload())
        ->assertRedirect(route('contact'));

    expect(ContactMessage::sole())
        ->name->toBe('Amani Kasongo')
        ->topic->toBe('support')
        ->read_at->toBeNull();

    Notification::assertNothingSent();
});

test('messages are also emailed once a contact address is set', function () {
    Notification::fake();
    config(['services.contact.email' => 'hello@proconnect.cd']);

    $this->post(route('contact.store'), contactPayload());

    Notification::assertSentTo(
        new AnonymousNotifiable,
        NewContactMessage::class,
        fn (NewContactMessage $notification, array $channels, AnonymousNotifiable $notifiable) => $notifiable->routes['mail'] === 'hello@proconnect.cd',
    );
});

test('a message is still saved when the email to the contact address fails', function () {
    config(['services.contact.email' => 'hello@proconnect.cd']);
    Notification::shouldReceive('route')->andThrow(new RuntimeException('Mail provider rejected the message'));

    $this->post(route('contact.store'), contactPayload())
        ->assertRedirect(route('contact'));

    expect(ContactMessage::count())->toBe(1);
});

test('a message needs a way to reply and a real message', function (array $overrides, string $field) {
    $this->post(route('contact.store'), contactPayload($overrides))
        ->assertSessionHasErrors($field);

    expect(ContactMessage::count())->toBe(0);
})->with([
    'no email or phone' => [['email' => '', 'phone' => ''], 'email'],
    'unknown topic' => [['topic' => 'spam'], 'topic'],
    'too short' => [['message' => 'Hi'], 'message'],
    'no name' => [['name' => ''], 'name'],
]);

test('a phone number is enough to be reached', function () {
    $this->post(route('contact.store'), contactPayload(['email' => '', 'phone' => '81 234 5678']))
        ->assertSessionHasNoErrors();

    expect(ContactMessage::sole()->phone)->toBe('81 234 5678');
});

test('admins read new messages and mark them as handled', function () {
    $admin = User::factory()->admin()->create();
    $new = ContactMessage::factory()->create();
    ContactMessage::factory()->read()->create();

    $this->actingAs($admin)
        ->get(route('admin.messages.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/messages')
            ->has('messages.data', 1)
            ->where('messages.data.0.id', $new->id)
            ->where('counts', ['unread' => 1, 'read' => 1])
            ->where('unreadMessageCount', 1));

    $this->actingAs($admin)
        ->patch(route('admin.messages.update', $new), ['is_read' => true])
        ->assertRedirect();

    expect($new->refresh()->read_at)->not->toBeNull();

    $this->actingAs($admin)
        ->delete(route('admin.messages.destroy', $new))
        ->assertRedirect(route('admin.messages.index'));

    expect(ContactMessage::find($new->id))->toBeNull();
});

test('only admins can open the inbox', function () {
    $message = ContactMessage::factory()->create();

    $this->actingAs(User::factory()->create())
        ->get(route('admin.messages.index'))
        ->assertForbidden();

    $this->actingAs(User::factory()->create())
        ->patch(route('admin.messages.update', $message), ['is_read' => true])
        ->assertForbidden();
});
