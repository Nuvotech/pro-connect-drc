<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Invites a pro whose listing an admin created to set their password and
 * manage the listing from their dashboard.
 */
class AccountInvitation extends Notification
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
        $setPasswordUrl = route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->email,
        ]);

        return (new MailMessage)
            ->subject(__('Your ProConnect account is ready'))
            ->greeting(__('Welcome to ProConnect, :name!', ['name' => $notifiable->name]))
            ->line(__('Our team has added your business to ProConnect RDC. Set a password to manage your listing, update your details and follow up on client requests.'))
            ->action(__('Set your password'), $setPasswordUrl)
            ->line(__('This link expires in :count minutes. If it has expired, use "Forgot password" on the login page.', [
                'count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
            ]));
    }
}
