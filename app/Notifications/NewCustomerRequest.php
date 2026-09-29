<?php

namespace App\Notifications;

use App\Models\QuoteRequest;
use App\Models\ServiceRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Tells admins a customer has sent a request that needs handling.
 */
class NewCustomerRequest extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public QuoteRequest|ServiceRequest $customerRequest) {}

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
        $isQuote = $this->customerRequest instanceof QuoteRequest;
        $category = $this->customerRequest->category->name;

        return (new MailMessage)
            ->subject(__('New :kind :reference: :category', [
                'kind' => $isQuote ? __('quote request') : __('business request'),
                'reference' => $this->customerRequest->reference,
                'category' => $category,
            ]))
            ->greeting(__('Hello :name,', ['name' => $notifiable->name]))
            ->line(__(':customer is looking for :category.', [
                'customer' => $this->customerRequest->customer->full_name,
                'category' => $category,
            ]))
            ->line($isQuote
                ? __('Choose which pros should quote for this job.')
                : __('Assign a firm to this request.'))
            ->action(__('Open the request'), route('admin.requests.index', [
                'tab' => $isQuote ? 'quotes' : 'business',
                'request' => $this->customerRequest->id,
            ]));
    }
}
