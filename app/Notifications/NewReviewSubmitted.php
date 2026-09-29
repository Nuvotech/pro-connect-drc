<?php

namespace App\Notifications;

use App\Models\CustomerReview;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells admins a customer review is waiting for approval.
 */
class NewReviewSubmitted extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public CustomerReview $review) {}

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
        $reviewable = $this->review->reviewable;
        $name = $reviewable->business_name ?? $reviewable->full_name;

        return (new MailMessage)
            ->subject(__('New :rating-star review for :name', ['rating' => $this->review->rating, 'name' => $name]))
            ->greeting(__('Hello :name,', ['name' => $notifiable->name]))
            ->line(__(':customer left a :rating-star review for :name.', [
                'customer' => $this->review->customer->full_name,
                'rating' => $this->review->rating,
                'name' => $name,
            ]))
            ->action(__('Check the review'), route('admin.reviews.index'));
    }
}
