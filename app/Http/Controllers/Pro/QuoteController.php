<?php

namespace App\Http\Controllers\Pro;

use App\Actions\SendReviewInvitation;
use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\QuoteRequestPhoto;
use App\Models\Vehicle;
use App\Notifications\QuoteReceived;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A service pro's inbox of jobs they were invited to quote for.
 */
class QuoteController extends Controller
{
    /**
     * List the pro's quote invitations, newest first.
     */
    public function index(Request $request): Response
    {
        $professional = $request->user()->professional;

        abort_unless($professional, 404);

        $quotes = $professional->quotes()
            ->with(['quoteRequest.category', 'quoteRequest.city', 'quoteRequest.commune'])
            ->latest()
            ->get();

        return Inertia::render('dashboard/quotes/index', [
            'quotes' => $quotes->map(fn (Quote $quote) => $this->summary($quote))->all(),
        ]);
    }

    /**
     * Show a job in full and mark the invitation as seen.
     */
    public function show(Quote $quote): Response
    {
        Gate::authorize('respond', $quote);

        if ($quote->status === Quote::STATUS_INVITED) {
            $quote->update(['status' => Quote::STATUS_VIEWED]);
        }

        $quote->load(['quoteRequest.category', 'quoteRequest.city', 'quoteRequest.commune', 'quoteRequest.photos', 'quoteRequest.customer']);
        $request = $quote->quoteRequest;

        return Inertia::render('dashboard/quotes/show', [
            'quote' => [
                ...$this->summary($quote),
                'message' => $quote->message,
                'estimatedDuration' => $quote->estimated_duration,
                'description' => $request->description,
                'address' => $request->address,
                'needsSiteVisit' => $request->needs_site_visit,
                'photos' => $request->photos->map(fn (QuoteRequestPhoto $photo) => Storage::disk('public')->url($photo->path))->all(),
                'customer' => [
                    'name' => $request->customer->full_name,
                    'phone' => $request->customer->phone,
                    'email' => $request->customer->email,
                    'channel' => $request->contact_channel,
                ],
                'canRespond' => in_array($quote->status, [Quote::STATUS_INVITED, Quote::STATUS_VIEWED, Quote::STATUS_QUOTED], true),
                'canComplete' => in_array($quote->status, [Quote::STATUS_QUOTED, Quote::STATUS_ACCEPTED], true),
                'completedAt' => $quote->completed_at?->isoFormat('ll'),
            ],
            'currencies' => Vehicle::CURRENCIES,
        ]);
    }

    /**
     * Send the customer a price, or update one already sent.
     */
    public function update(Request $request, Quote $quote): RedirectResponse
    {
        Gate::authorize('respond', $quote);
        abort_unless(in_array($quote->status, [Quote::STATUS_INVITED, Quote::STATUS_VIEWED, Quote::STATUS_QUOTED], true), 409);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1', 'max:99999999'],
            'currency' => ['required', Rule::in(Vehicle::CURRENCIES)],
            'estimated_duration' => ['nullable', 'string', 'max:100'],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
        ], [
            'amount.required' => __('Enter your price.'),
            'amount.min' => __('Enter a price of at least 1.'),
            'message.required' => __('Tell the client what the price includes.'),
            'message.min' => __('Tell the client what the price includes.'),
        ]);

        $quote->update([...$validated, 'status' => Quote::STATUS_QUOTED, 'responded_at' => now()]);

        $quoteRequest = $quote->quoteRequest;

        if ($quoteRequest->status === QuoteRequest::STATUS_OPEN) {
            $quoteRequest->update(['status' => QuoteRequest::STATUS_QUOTED]);
        }

        if ($quoteRequest->customer->email) {
            Notification::route('mail', $quoteRequest->customer->email)->notify((new QuoteReceived($quote))->locale($quoteRequest->customer->preferred_language));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Your quote has been sent to the client.')]);

        return to_route('dashboard.quotes.show', $quote);
    }

    /**
     * Record that the job is finished and invite the customer to review it.
     */
    public function complete(Quote $quote, SendReviewInvitation $sendReviewInvitation): RedirectResponse
    {
        Gate::authorize('respond', $quote);
        abort_unless(in_array($quote->status, [Quote::STATUS_QUOTED, Quote::STATUS_ACCEPTED], true), 409);

        $quote->update(['status' => Quote::STATUS_COMPLETED, 'completed_at' => now()]);
        $quote->quoteRequest->update(['status' => QuoteRequest::STATUS_COMPLETED]);

        $sendReviewInvitation($quote);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Job marked as done. Thank you!')]);

        return to_route('dashboard.quotes.show', $quote);
    }

    /**
     * Turn the job down.
     */
    public function decline(Quote $quote): RedirectResponse
    {
        Gate::authorize('respond', $quote);
        abort_unless(in_array($quote->status, [Quote::STATUS_INVITED, Quote::STATUS_VIEWED], true), 409);

        $quote->update(['status' => Quote::STATUS_DECLINED, 'responded_at' => now()]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('You declined this job.')]);

        return to_route('dashboard.quotes.index');
    }

    /**
     * The fields shared by the list and the detail page.
     *
     * @return array<string, mixed>
     */
    private function summary(Quote $quote): array
    {
        $request = $quote->quoteRequest;

        return [
            'id' => $quote->id,
            'status' => $quote->status,
            'amount' => $quote->amount,
            'currency' => $quote->currency,
            'reference' => $request->reference,
            'category' => $request->category->name,
            'serviceType' => $request->service_type,
            'timing' => $request->timing,
            'location' => trim(($request->commune?->name ? $request->commune->name.', ' : '').($request->city?->name ?? ''), ', '),
            'excerpt' => str($request->description)->limit(120)->toString(),
            'invitedAt' => $quote->created_at?->isoFormat('ll'),
        ];
    }
}
