<?php

namespace App\Actions;

use App\Models\Quote;
use App\Models\User;
use App\Models\VehicleBooking;
use App\Notifications\Channels\WhatsAppChannel;
use App\Notifications\JobCompleted;
use App\Notifications\ReviewInvitation;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

/**
 * Once a job or hire is finished: sends the customer their private review
 * link (email now, WhatsApp once it is switched on) and tells the admins,
 * who can also send the link on WhatsApp themselves.
 */
class SendReviewInvitation
{
    /**
     * How long a review link stays valid.
     */
    public const LINK_LIFETIME_DAYS = 60;

    /**
     * Invite the customer to review the job and let the admins know.
     */
    public function __invoke(Quote|VehicleBooking $job): void
    {
        $customer = $job instanceof Quote ? $job->quoteRequest->customer : $job->customer;
        $routes = array_filter([
            'mail' => $customer->email,
            'whatsapp' => WhatsAppChannel::isEnabled() ? $customer->phone : null,
        ]);

        if ($routes !== []) {
            $notifiable = new AnonymousNotifiable;

            foreach ($routes as $channel => $route) {
                $notifiable->route($channel, $route);
            }

            $notifiable->notify((new ReviewInvitation($job, self::url($job)))->locale($customer->preferred_language));
        }

        Notification::send(
            User::where('role', User::ROLE_ADMIN)->get(),
            new JobCompleted($job, customerWasEmailed: filled($customer->email)),
        );
    }

    /**
     * The private link to review the job.
     */
    public static function url(Quote|VehicleBooking $job): string
    {
        return URL::temporarySignedRoute('reviews.create', now()->addDays(self::LINK_LIFETIME_DAYS), [
            'type' => $job instanceof Quote ? 'quote' : 'booking',
            'id' => $job->id,
        ]);
    }
}
