<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Forwards a contact-form message to the ProConnect contact inbox, once a
 * contact email address is configured.
 */
class NewContactMessage extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public ContactMessage $contactMessage) {}

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
        $message = $this->contactMessage;
        $topic = __(ContactMessage::TOPICS[$message->topic] ?? $message->topic);

        $mail = (new MailMessage)
            ->subject(__('New message: :topic', ['topic' => $topic]))
            ->line(__('From: :name', ['name' => $message->name]));

        if ($message->email) {
            $mail->replyTo($message->email, $message->name)
                ->line(__('Email: :email', ['email' => $message->email]));
        }

        if ($message->phone) {
            $mail->line(__('Phone: :phone', ['phone' => $message->phone]));
        }

        return $mail
            ->line('"'.$message->message.'"')
            ->action(__('Open the inbox'), route('admin.messages.index', ['message' => $message->id]));
    }
}
