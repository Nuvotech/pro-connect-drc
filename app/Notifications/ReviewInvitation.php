<?php

namespace App\Notifications;

use App\Models\Quote;
use App\Models\VehicleBooking;
use App\Notifications\Channels\WhatsAppChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Asks a customer to review a finished job or vehicle hire, by email and,
 * once it is switched on, by WhatsApp.
 */
class ReviewInvitation extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Quote|VehicleBooking $job, public string $reviewUrl) {}

    /**
     * Get the notification's delivery channels: whichever the customer can
     * be reached on.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $routes = $notifiable instanceof AnonymousNotifiable ? $notifiable->routes : [];

        return array_values(array_filter([
            isset($routes['mail']) ? 'mail' : null,
            isset($routes['whatsapp']) && WhatsAppChannel::isEnabled() ? WhatsAppChannel::class : null,
        ]));
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('How did :name do?', ['name' => $this->proName()]))
            ->greeting(__('Hello :name,', ['name' => $this->customerName()]))
            ->line(__(':name has marked :what as finished.', ['name' => $this->proName(), 'what' => $this->what()]))
            ->line(__('A quick rating helps other customers choose, and takes less than a minute.'))
            ->action(__('Leave a review'), $this->reviewUrl);
    }

    /**
     * The approved WhatsApp template and its parameters: the pro's name and
     * the review link.
     *
     * @return array{template: string, parameters: list<string>}
     */
    public function toWhatsApp(object $notifiable): array
    {
        return [
            'template' => config('services.whatsapp.review_template'),
            'parameters' => [$this->proName(), $this->reviewUrl],
        ];
    }

    private function proName(): string
    {
        return $this->job instanceof Quote
            ? ($this->job->professional->business_name ?? $this->job->professional->full_name)
            : $this->job->vehicleProvider->business_name;
    }

    private function customerName(): string
    {
        return $this->job instanceof Quote
            ? $this->job->quoteRequest->customer->full_name
            : $this->job->customer->full_name;
    }

    private function what(): string
    {
        return $this->job instanceof Quote
            ? __('your :category job', ['category' => $this->job->quoteRequest->category->name])
            : __('your vehicle hire');
    }
}
