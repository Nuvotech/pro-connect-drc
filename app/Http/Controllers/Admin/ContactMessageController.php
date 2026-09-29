<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The team's inbox of messages sent through the contact form.
 */
class ContactMessageController extends Controller
{
    /**
     * List messages, newest first, and open the selected one.
     */
    public function index(Request $request): Response
    {
        $tab = $request->query('tab') === 'read' ? 'read' : 'unread';

        $messages = ContactMessage::query()
            ->when($tab === 'unread', fn ($query) => $query->whereNull('read_at'), fn ($query) => $query->whereNotNull('read_at'))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ContactMessage $message) => [
                'id' => $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'phone' => $message->phone,
                'topic' => __(ContactMessage::TOPICS[$message->topic] ?? $message->topic),
                'message' => $message->message,
                'locale' => $message->locale,
                'isRead' => $message->read_at !== null,
                'sentAt' => $message->created_at?->isoFormat('lll'),
            ]);

        return Inertia::render('admin/messages', [
            'tab' => $tab,
            'messages' => $messages,
            'selectedId' => $request->integer('message') ?: null,
            'counts' => [
                'unread' => ContactMessage::whereNull('read_at')->count(),
                'read' => ContactMessage::whereNotNull('read_at')->count(),
            ],
        ]);
    }

    /**
     * Mark a message as handled, or back to unread.
     */
    public function update(Request $request, ContactMessage $contactMessage): RedirectResponse
    {
        $validated = $request->validate(['is_read' => ['required', 'boolean']]);

        $contactMessage->forceFill(['read_at' => $validated['is_read'] ? now() : null])->save();

        return back();
    }

    /**
     * Delete a message, such as spam.
     */
    public function destroy(ContactMessage $contactMessage): RedirectResponse
    {
        $contactMessage->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Message deleted.')]);

        return to_route('admin.messages.index');
    }
}
