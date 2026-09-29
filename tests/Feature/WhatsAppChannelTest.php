<?php

use App\Actions\SendReviewInvitation;
use App\Models\Customer;
use App\Models\Quote;
use App\Models\QuoteRequest;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * A finished job for a customer with no email, reachable only by phone.
 */
function finishedJobForPhoneOnlyCustomer(): Quote
{
    return Quote::factory()->completed()->create([
        'quote_request_id' => QuoteRequest::factory()->for(Customer::factory()->state(['email' => null, 'phone' => '81 234 5678'])),
    ]);
}

function enableWhatsApp(): void
{
    config([
        'services.whatsapp.enabled' => true,
        'services.whatsapp.token' => 'test-token',
        'services.whatsapp.phone_number_id' => '1234567890',
        'services.whatsapp.review_template' => 'review_request',
    ]);
}

test('no WhatsApp message is sent until WhatsApp is switched on', function () {
    Http::fake();

    app(SendReviewInvitation::class)(finishedJobForPhoneOnlyCustomer());

    Http::assertNothingSent();
});

test('once switched on, the review link is sent to the customer on WhatsApp', function () {
    enableWhatsApp();
    Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.1']]])]);
    $quote = finishedJobForPhoneOnlyCustomer();

    app(SendReviewInvitation::class)($quote);

    Http::assertSent(fn (Request $request) => $request->url() === 'https://graph.facebook.com/v21.0/1234567890/messages'
        && $request->hasHeader('Authorization', 'Bearer test-token')
        && $request['to'] === '243812345678'
        && $request['template']['name'] === 'review_request'
        && str_contains($request['template']['components'][0]['parameters'][1]['text'], "/reviews/quote/{$quote->id}"));
});

test('a WhatsApp failure is logged and does not stop the job being completed', function () {
    enableWhatsApp();
    Http::fake(['graph.facebook.com/*' => Http::response(['error' => 'invalid'], 400)]);
    Log::spy();

    app(SendReviewInvitation::class)(finishedJobForPhoneOnlyCustomer());

    Log::shouldHaveReceived('warning')->withArgs(fn (string $message) => $message === 'WhatsApp message failed.')->once();
});
