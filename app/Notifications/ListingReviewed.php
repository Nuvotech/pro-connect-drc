<?php

namespace App\Notifications;

use App\Models\Professional;
use App\Models\User;
use App\Models\VehicleProvider;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells a pro what an admin decided about their listing.
 */
class ListingReviewed extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Professional|VehicleProvider $listing,
        public string $status,
        public ?string $adminMessage,
    ) {}

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
        $name = $this->listing instanceof Professional
            ? ($this->listing->business_name ?? $this->listing->full_name)
            : ($this->listing->business_name ?? $this->listing->contact_name);

        $mail = (new MailMessage)->greeting(__('Hello :name,', ['name' => $notifiable->name]));

        $mail = match ($this->status) {
            Professional::REVIEW_APPROVED => $mail
                ->subject(__(':name is now verified on ProConnect', ['name' => $name]))
                ->line(__('Good news: our team has verified :name. Clients can now find you on ProConnect RDC.', ['name' => $name])),
            Professional::REVIEW_CHANGES_REQUESTED => $mail
                ->subject(__('Changes needed before :name can go live', ['name' => $name]))
                ->line(__('Our team reviewed :name and needs a few changes before it can be verified.', ['name' => $name])),
            default => $mail
                ->subject(__(':name was not approved', ['name' => $name]))
                ->line(__('Our team reviewed :name and could not approve it.', ['name' => $name])),
        };

        if ($this->adminMessage) {
            $mail->line(__('Message from our team:'))->line('"'.$this->adminMessage.'"');
        }

        if ($this->status !== Professional::REVIEW_APPROVED) {
            $mail->line(__('Update your listing, then use "Resubmit for review" on your dashboard.'));
        }

        return $mail->action(__('Open your dashboard'), route('dashboard'));
    }
}
