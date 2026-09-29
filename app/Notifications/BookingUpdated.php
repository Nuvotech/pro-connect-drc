<?php

namespace App\Notifications;

use App\Models\VehicleBooking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells a customer whether the fleet confirmed their booking.
 */
class BookingUpdated extends Notification
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
    public function toMail(object $notifiable): MailMessage
    {
        $provider = $this->booking->vehicleProvider;
        $fleet = $provider->business_name ?? $provider->contact_name;
        $isConfirmed = $this->booking->status === VehicleBooking::STATUS_CONFIRMED;

        $mail = (new MailMessage)
            ->subject($isConfirmed
                ? __('Booking :reference confirmed', ['reference' => $this->booking->reference])
                : __('Booking :reference not available', ['reference' => $this->booking->reference]))
            ->greeting(__('Hello :name,', ['name' => $this->booking->customer->full_name]));

        if ($isConfirmed) {
            return $mail
                ->line(__(':fleet confirmed your booking from :start to :end.', [
                    'fleet' => $fleet,
                    'start' => $this->booking->start_date->isoFormat('ll'),
                    'end' => $this->booking->end_date->isoFormat('ll'),
                ]))
                ->line(__('Estimated total: :amount :currency', ['amount' => number_format((float) $this->booking->estimated_total, 2), 'currency' => $this->booking->currency]))
                ->line(__('They will contact you on +243 :phone to arrange pickup.', ['phone' => $this->booking->customer->phone]));
        }

        return $mail
            ->line(__(':fleet cannot take your booking for these dates.', ['fleet' => $fleet]))
            ->action(__('See other vehicles'), route('fleets.show', $provider->slug));
    }
}
