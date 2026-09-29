<?php

namespace App\Notifications;

use App\Models\Quote;
use App\Models\User;
use App\Models\VehicleBooking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells admins a pro has finished a job or hire, so they can follow up
 * with the customer for a review.
 */
class JobCompleted extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Quote|VehicleBooking $job, public bool $customerWasEmailed) {}

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
        if ($this->job instanceof Quote) {
            $pro = $this->job->professional->business_name ?? $this->job->professional->full_name;
            $what = $this->job->quoteRequest->category->name;
            $reference = $this->job->quoteRequest->reference;
            $customer = $this->job->quoteRequest->customer;
            $link = route('admin.requests.index', ['tab' => 'quotes', 'status' => 'completed', 'request' => $this->job->quote_request_id]);
        } else {
            $pro = $this->job->vehicleProvider->business_name;
            $what = $this->job->vehicle ? "{$this->job->vehicle->make} {$this->job->vehicle->model} hire" : __('Vehicle hire');
            $reference = $this->job->reference;
            $customer = $this->job->customer;
            $link = route('admin.requests.index', ['tab' => 'bookings', 'status' => 'completed', 'request' => $this->job->id]);
        }

        return (new MailMessage)
            ->subject(__('Job done: :reference', ['reference' => $reference]))
            ->greeting(__('Hello :name,', ['name' => $notifiable->name]))
            ->line(__(':pro marked :what (:reference) as done for :customer.', [
                'pro' => $pro,
                'what' => $what,
                'reference' => $reference,
                'customer' => $customer->full_name,
            ]))
            ->line($this->customerWasEmailed
                ? __('We emailed them the review link. You can also send it on WhatsApp.')
                : __('They have no email address. Send them the review link on WhatsApp.'))
            ->action(__('Open the request'), $link);
    }
}
