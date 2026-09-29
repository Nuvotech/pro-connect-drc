<?php

namespace App\Notifications;

use App\Models\ProApplication;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells an applicant whether they can now use the pro dashboard.
 */
class ProApplicationReviewed extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public ProApplication $application) {}

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
        $mail = (new MailMessage)->greeting(__('Hello :name,', ['name' => $notifiable->name]));

        if ($this->application->status === ProApplication::STATUS_APPROVED) {
            return $mail
                ->subject(__('Welcome to ProConnect: you are approved'))
                ->line(__('Your application has been approved. You can now set up your listing from your dashboard.'))
                ->line(__('Add your details, documents and photos, then send your listing for verification so clients can find you.'))
                ->action(__('Set up your listing'), route('dashboard'));
        }

        return $mail
            ->subject(__('Your ProConnect application'))
            ->line(__('Thank you for applying. Unfortunately we could not approve your application at this time.'))
            ->line(__('Message from our team:'))
            ->line('"'.$this->application->decision_message.'"')
            ->action(__('Open your account'), route('dashboard'));
    }
}
