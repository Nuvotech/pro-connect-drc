<?php

namespace App\Notifications;

use App\Models\ProApplication;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells admins that someone has applied to join as a pro.
 */
class NewProApplication extends Notification
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
        $name = $this->application->business_name ?? $this->application->full_name;
        $services = $this->application->categories->pluck('name')
            ->concat($this->application->customServices->pluck('name'))
            ->join(', ');

        return (new MailMessage)
            ->subject(__('New pro application: :name', ['name' => $name]))
            ->greeting(__('Hello :name,', ['name' => $notifiable->name]))
            ->line(__(':name has applied to join ProConnect.', ['name' => $name]))
            ->line(__('Services: :services', ['services' => $services]))
            ->action(__('Review the application'), route('admin.sign-ups.index', ['application' => $this->application->id]));
    }
}
