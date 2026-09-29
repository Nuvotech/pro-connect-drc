<?php

namespace App\Notifications;

use App\Models\User;
use App\Models\VehicleBooking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells a fleet owner a customer wants to hire one of their vehicles.
 */
class NewBookingRequest extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public VehicleBooking $booking) {}

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
        $vehicle = $this->booking->vehicle;

        return (new MailMessage)
            ->subject(__('New booking request :reference', ['reference' => $this->booking->reference]))
            ->greeting(__('Hello :name,', ['name' => $notifiable->name]))
            ->line(__(':customer would like to hire your :vehicle from :start to :end.', [
                'customer' => $this->booking->customer->full_name,
                'vehicle' => $vehicle ? "{$vehicle->make} {$vehicle->model}" : __('vehicle'),
                'start' => $this->booking->start_date->isoFormat('ll'),
                'end' => $this->booking->end_date->isoFormat('ll'),
            ]))
            ->line(__('Confirm or decline the request from your dashboard.'))
            ->action(__('Review the booking'), route('dashboard.bookings.index'));
    }
}
