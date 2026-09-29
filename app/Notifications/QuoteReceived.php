<?php

namespace App\Notifications;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells a customer a pro has sent a price for their job.
 */
class QuoteReceived extends Notification
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
    public function toMail(object $notifiable): MailMessage
    {
        $request = $this->quote->quoteRequest;
        $professional = $this->quote->professional;
        $name = $professional->business_name ?? $professional->full_name;
        $amount = number_format((float) $this->quote->amount, 2).' '.$this->quote->currency;

        $mail = (new MailMessage)
            ->subject(__('New quote for :reference from :name', ['reference' => $request->reference, 'name' => $name]))
            ->greeting(__('Hello :name,', ['name' => $request->customer->full_name]))
            ->line(__(':name has sent a quote for your :category request.', ['name' => $name, 'category' => $request->category->name]))
            ->line(__('Price: :amount', ['amount' => $amount]));

        if ($this->quote->estimated_duration) {
            $mail->line(__('Estimated time: :duration', ['duration' => $this->quote->estimated_duration]));
        }

        return $mail
            ->line('"'.$this->quote->message.'"')
            ->line(__('Contact them on +243 :phone to go ahead.', ['phone' => $professional->phone]))
            ->action(__('View their profile'), route('professionals.show', $professional->slug));
    }
}
