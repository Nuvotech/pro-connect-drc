<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use App\Notifications\NewContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/**
 * The public "Contact us" form.
 */
class ContactController extends Controller
{
    /**
     * Show the contact form.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('public/contact', [
            'topics' => collect(ContactMessage::TOPICS)
                ->map(fn (string $label, string $value) => ['value' => $value, 'label' => __($label)])
                ->values()
                ->all(),
            'prefill' => [
                'name' => $request->user()?->name ?? '',
                'email' => $request->user()?->email ?? '',
            ],
        ]);
    }

    /**
     * Save the message to the admin inbox, and forward it by email once a
     * contact address is configured.
     */
    public function store(StoreContactMessageRequest $request): RedirectResponse
    {
        $contactMessage = new ContactMessage([
            ...$request->validated(),
            'locale' => app()->getLocale(),
        ]);
        $contactMessage->user()->associate($request->user());
        $contactMessage->save();

        if (filled(config('services.contact.email'))) {
            try {
                Notification::route('mail', config('services.contact.email'))
                    ->notify(new NewContactMessage($contactMessage));
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        Inertia::flash('sent', true);

        return to_route('contact');
    }
}
