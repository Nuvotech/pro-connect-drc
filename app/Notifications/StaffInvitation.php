<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Invites a new capturer to set their password and start adding pros.
 */
class StaffInvitation extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public string $token) {}

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
        return (new MailMessage)
            ->subject(__('You have been added to the ProConnect team'))
            ->greeting(__('Hello :name,', ['name' => $notifiable->name]))
            ->line(__('You can now add professionals and vehicle fleets to ProConnect RDC. Our team checks each one before it goes live.'))
            ->action(__('Set your password'), route('password.reset', [
                'token' => $this->token,
                'email' => $notifiable->email,
            ]))
            ->line(__('This link expires in :count minutes. If it has expired, use "Forgot password" on the login page.', [
                'count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
            ]));
    }
}
