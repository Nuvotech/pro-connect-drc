<?php

namespace App\Http\Controllers;

use App\Actions\ResolveCustomer;
use App\Http\Requests\StoreQuoteRequestRequest;
use App\Models\Category;
use App\Models\Professional;
use App\Models\QuoteRequest;
use App\Models\User;
use App\Notifications\NewCustomerRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

/**
 * Quote requests sent from the public wizard. The team then invites the
 * pros who should quote.
 */
class QuoteRequestController extends Controller
{
    /**
     * Save the customer's request and its photos.
     */
    public function store(StoreQuoteRequestRequest $request, ResolveCustomer $resolveCustomer): RedirectResponse
    {
        $quoteRequest = DB::transaction(function () use ($request, $resolveCustomer) {
            $customer = $resolveCustomer($request->safe()->only([
                'full_name', 'phone', 'email', 'contact_channel', 'city', 'commune',
            ]), $request->user());

            $quoteRequest = new QuoteRequest([
                'service_type' => $request->validated('service_type'),
                'description' => $request->validated('description'),
                'timing' => $request->validated('timing'),
                'address' => $request->validated('address'),
                'needs_site_visit' => $request->validated('assessment') === 'in_person',
                'contact_channel' => $request->validated('contact_channel') ?? 'whatsapp',
                'status' => QuoteRequest::STATUS_OPEN,
            ]);
            $quoteRequest->customer()->associate($customer);
            $quoteRequest->category()->associate(Category::where('slug', $request->validated('category'))->sole());
            $quoteRequest->placeIn($request->validated('city'), $request->validated('commune'));

            if ($request->filled('professional')) {
                $quoteRequest->requestedProfessional()->associate(
                    Professional::published()->where('slug', $request->validated('professional'))->first(),
                );
            }

            $quoteRequest->save();

            $quoteRequest->photos()->createMany(
                collect($request->file('photos', []))
                    ->values()
                    ->map(fn (UploadedFile $photo, int $position) => [
                        'path' => $photo->store("quote-requests/{$quoteRequest->id}", 'public'),
                        'position' => $position,
                    ])
                    ->all(),
            );

            return $quoteRequest;
        });

        Notification::send(User::where('role', User::ROLE_ADMIN)->get(), new NewCustomerRequest($quoteRequest->refresh()));

        Inertia::flash('reference', $quoteRequest->reference);

        return back();
    }
}
