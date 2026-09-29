<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminCustomerRequestResource;
use App\Models\Professional;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\ServiceRequest;
use App\Models\VehicleBooking;
use App\Notifications\NewQuoteInvitation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Everything customers ask for: quote requests, business requests and
 * vehicle bookings.
 */
class CustomerRequestController extends Controller
{
    /** @var list<string> */
    public const TABS = ['quotes', 'business', 'bookings'];

    /**
     * Show one tab of the requests list, newest first.
     */
    public function index(Request $request): Response
    {
        $tab = in_array($request->string('tab')->toString(), self::TABS, true) ? $request->string('tab')->toString() : 'quotes';
        $status = $request->string('status')->toString() ?: null;

        $items = match ($tab) {
            'quotes' => QuoteRequest::query()
                ->with(['customer', 'category', 'city', 'commune', 'photos', 'requestedProfessional.city', 'quotes.professional.city', 'quotes.review'])
                ->when($status, fn (Builder $query) => $query->where('status', $status))
                ->latest()
                ->limit(100)
                ->get(),
            'business' => ServiceRequest::query()
                ->with(['customer', 'category', 'city', 'handledBy'])
                ->when($status, fn (Builder $query) => $query->where('status', $status))
                ->latest()
                ->limit(100)
                ->get(),
            default => VehicleBooking::query()
                ->with(['customer', 'vehicle', 'vehicleProvider', 'review'])
                ->when($status, fn (Builder $query) => $query->where('status', $status))
                ->latest()
                ->limit(100)
                ->get(),
        };

        if ($tab !== 'bookings') {
            $candidates = $this->candidatesFor($items);
            $items->each(fn (QuoteRequest|ServiceRequest $item) => $item->setRelation('candidates', $candidates[$item->id]));
        }

        return Inertia::render('admin/requests', [
            'tab' => $tab,
            'status' => $status,
            'selectedId' => $request->integer('request') ?: null,
            'requests' => AdminCustomerRequestResource::collection($items)->resolve(),
            'counts' => [
                'quotes' => QuoteRequest::where('status', QuoteRequest::STATUS_OPEN)->doesntHave('quotes')->count(),
                'business' => ServiceRequest::where('status', ServiceRequest::STATUS_NEW)->count(),
                'bookings' => VehicleBooking::where('status', VehicleBooking::STATUS_REQUESTED)->count(),
            ],
            'statuses' => [
                'quotes' => [QuoteRequest::STATUS_OPEN, QuoteRequest::STATUS_QUOTED, QuoteRequest::STATUS_ACCEPTED, QuoteRequest::STATUS_COMPLETED, QuoteRequest::STATUS_CANCELLED, QuoteRequest::STATUS_EXPIRED],
                'business' => [ServiceRequest::STATUS_NEW, ServiceRequest::STATUS_IN_PROGRESS, ServiceRequest::STATUS_MATCHED, ServiceRequest::STATUS_CLOSED],
                'bookings' => [VehicleBooking::STATUS_REQUESTED, VehicleBooking::STATUS_CONFIRMED, VehicleBooking::STATUS_DECLINED, VehicleBooking::STATUS_CANCELLED, VehicleBooking::STATUS_COMPLETED],
            ][$tab],
        ]);
    }

    /**
     * Invite pros to quote for a request.
     */
    public function invite(Request $request, QuoteRequest $quoteRequest): RedirectResponse
    {
        $validated = $request->validate([
            'professional_ids' => ['required', 'array', 'min:1', 'max:10'],
            'professional_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('category_professional', 'professional_id')->where('category_id', $quoteRequest->category_id),
                Rule::exists(Professional::class, 'id')->whereNotNull('verified_at'),
            ],
        ], [
            'professional_ids.required' => __('Choose at least one pro to invite.'),
            'professional_ids.*.exists' => __('Only verified pros in this category can be invited.'),
        ]);

        $alreadyInvited = $quoteRequest->quotes()->pluck('professional_id')->all();
        $newIds = array_values(array_diff($validated['professional_ids'], $alreadyInvited));

        foreach (Professional::with('user')->whereKey($newIds)->get() as $professional) {
            $quote = new Quote(['status' => Quote::STATUS_INVITED, 'currency' => 'USD']);
            $quote->quoteRequest()->associate($quoteRequest);
            $quote->professional()->associate($professional);
            $quote->save();

            $professional->user?->notify(new NewQuoteInvitation($quote));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => trans_choice('{0} Those pros were already invited.|{1} 1 pro invited.|[2,*] :count pros invited.', count($newIds))]);

        return back();
    }

    /**
     * Assign a firm to a business request and move it along.
     */
    public function updateServiceRequest(Request $request, ServiceRequest $serviceRequest): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([ServiceRequest::STATUS_NEW, ServiceRequest::STATUS_IN_PROGRESS, ServiceRequest::STATUS_MATCHED, ServiceRequest::STATUS_CLOSED])],
            'professional_id' => [
                'nullable',
                'integer',
                Rule::exists('category_professional', 'professional_id')->where('category_id', $serviceRequest->category_id),
                Rule::exists(Professional::class, 'id')->whereNotNull('verified_at'),
            ],
        ], [
            'professional_id.exists' => __('Only verified firms offering this service can be assigned.'),
        ]);

        $serviceRequest->status = $validated['status'];
        $serviceRequest->professional()->associate($validated['professional_id'] ?? null);
        $serviceRequest->handledBy()->associate($request->user());
        $serviceRequest->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Request :reference updated.', ['reference' => $serviceRequest->reference])]);

        return back();
    }

    /**
     * Download the file a customer attached to a business request.
     */
    public function attachment(ServiceRequest $serviceRequest): StreamedResponse
    {
        abort_unless($serviceRequest->attachment_path && Storage::disk('local')->exists($serviceRequest->attachment_path), 404);

        return Storage::disk('local')->download($serviceRequest->attachment_path, "{$serviceRequest->reference}-attachment.".pathinfo($serviceRequest->attachment_path, PATHINFO_EXTENSION));
    }

    /**
     * Verified pros offering each request's category, those in the
     * customer's city first.
     *
     * @param  Collection<int, QuoteRequest|ServiceRequest>  $items
     * @return array<int, Collection<int, Professional>>
     */
    private function candidatesFor(Collection $items): array
    {
        $prosByCategory = Professional::query()
            ->published()
            ->with(['city:id,name', 'categories:id'])
            ->whereHas('categories', fn (Builder $query) => $query->whereIn('categories.id', $items->pluck('category_id')->unique()))
            ->get();

        return $items->mapWithKeys(fn (QuoteRequest|ServiceRequest $item) => [
            $item->id => $prosByCategory
                ->filter(fn (Professional $professional) => $professional->categories->contains('id', $item->category_id))
                ->sortBy(fn (Professional $professional) => [$professional->city_id === $item->city_id ? 0 : 1, $professional->business_name ?? $professional->full_name])
                ->values(),
        ])->all();
    }
}
