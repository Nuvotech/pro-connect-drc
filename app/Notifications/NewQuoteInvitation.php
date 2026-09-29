<?php

namespace App\Notifications;

use App\Models\Quote;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells a pro they've been invited to quote for a job.
 */
class NewQuoteInvitation extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Quote $quote) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(User $notifiable): MailMessage
    {
        $request = $this->quote->quoteRequest;

        return (new MailMessage)
            ->subject(__('New job: :category in :city', [
                'category' => $request->category->name,
                'city' => $request->city?->name ?? __('your area'),
            ]))
            ->greeting(__('Hello :name,', ['name' => $notifiable->name]))
            ->line(__('A client in :place is looking for :category and our team picked you to quote.', [
                'place' => trim(($request->commune?->name ? $request->commune->name.', ' : '').($request->city?->name ?? ''), ', '),
                'category' => $request->category->name,
            ]))
            ->line('"'.str($request->description)->limit(160).'"')
            ->action(__('See the request and send your price'), route('dashboard.quotes.show', $this->quote));
    }
}
