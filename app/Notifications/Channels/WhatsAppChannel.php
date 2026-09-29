<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Sends approved WhatsApp template messages through the WhatsApp Business
 * Cloud API. Stays silent until it is switched on in `services.whatsapp`.
 */
class WhatsAppChannel
{
    /**
     * Whether WhatsApp sending is switched on and configured.
     */
    public static function isEnabled(): bool
    {
        return (bool) config('services.whatsapp.enabled')
            && filled(config('services.whatsapp.token'))
            && filled(config('services.whatsapp.phone_number_id'));
    }

    /**
     * Send the notification's template message. Failures are logged and
     * never stop the action that triggered the message.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        $phone = $notifiable->routeNotificationFor('whatsapp', $notification);

        if (! self::isEnabled() || blank($phone) || ! method_exists($notification, 'toWhatsApp')) {
            return;
        }

        /** @var array{template: string, parameters: list<string>} $message */
        $message = $notification->toWhatsApp($notifiable);

        try {
            Http::withToken(config('services.whatsapp.token'))
                ->timeout(10)
                ->post(sprintf(
                    'https://graph.facebook.com/%s/%s/messages',
                    config('services.whatsapp.api_version'),
                    config('services.whatsapp.phone_number_id'),
                ), [
                    'messaging_product' => 'whatsapp',
                    'to' => self::internationalNumber($phone),
                    'type' => 'template',
                    'template' => [
                        'name' => $message['template'],
                        'language' => ['code' => config('services.whatsapp.language')],
                        'components' => [[
                            'type' => 'body',
                            'parameters' => array_map(
                                fn (string $text) => ['type' => 'text', 'text' => $text],
                                $message['parameters'],
                            ),
                        ]],
                    ],
                ])
                ->throw();
        } catch (Throwable $exception) {
            Log::warning('WhatsApp message failed.', ['error' => $exception->getMessage()]);
        }
    }

    /**
     * A DRC number as WhatsApp expects it: country code and digits only.
     */
    public static function internationalNumber(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        return str_starts_with($digits, '243') ? $digits : '243'.ltrim($digits, '0');
    }
}
