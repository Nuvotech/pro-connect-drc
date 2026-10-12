<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\CustomerReview;
use App\Models\ProApplication;
use App\Models\Professional;
use App\Models\QuoteRequest;
use App\Models\ServiceRequest;
use App\Models\Vehicle;
use App\Models\VehicleBooking;
use App\Models\VehicleProvider;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The admin home page: what is waiting for the team and how the
 * directory is doing, with every figure linking to the page behind it.
 */
class DashboardController extends Controller
{
    /**
     * How many rows each of the dashboard's short lists shows.
     */
    private const LIST_LENGTH = 5;

    /**
     * Show the admin dashboard.
     */
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'queues' => $this->queues(),
            'directory' => $this->directory(),
            'waitingListings' => $this->waitingListings(),
            'latestRequests' => $this->latestRequests(),
        ]);
    }

    /**
     * How many items sit in each queue the team works through.
     *
     * @return array{signUps: int, listings: int, quotes: int, business: int, bookings: int, reviews: int, messages: int}
     */
    private function queues(): array
    {
        $needsReview = ApplicationController::TABS['needs_review'];

        return [
            'signUps' => ProApplication::where('status', ProApplication::STATUS_PENDING)->count(),
            'listings' => Professional::whereIn('review_status', $needsReview)->count()
                + VehicleProvider::whereIn('review_status', $needsReview)->count(),
            'quotes' => QuoteRequest::where('status', QuoteRequest::STATUS_OPEN)->doesntHave('quotes')->count(),
            'business' => ServiceRequest::where('status', ServiceRequest::STATUS_NEW)->count(),
            'bookings' => VehicleBooking::where('status', VehicleBooking::STATUS_REQUESTED)->count(),
            'reviews' => CustomerReview::whereNull('published_at')->count(),
            'messages' => ContactMessage::whereNull('read_at')->count(),
        ];
    }

    /**
     * What clients can find on the site today.
     *
     * @return array{professionals: int, fleets: int, vehicles: int, categories: int, missingDocuments: int}
     */
    private function directory(): array
    {
        $documentColumns = ['id', 'provider_type', 'verified_at', 'registry_number', 'tax_id', 'identity_document_path', 'business_registration_path'];
        $liveListings = Professional::published()->get($documentColumns)
            ->concat(VehicleProvider::published()->get($documentColumns));

        return [
            'professionals' => $liveListings->whereInstanceOf(Professional::class)->count(),
            'fleets' => $liveListings->whereInstanceOf(VehicleProvider::class)->count(),
            'vehicles' => (int) Vehicle::whereHas('provider', fn (Builder $query) => $query->published())->sum('quantity'),
            'categories' => Category::where('is_active', true)->count(),
            'missingDocuments' => $liveListings
                ->reject(fn (Professional|VehicleProvider $listing) => $listing->hasVerifiedBadge())
                ->count(),
        ];
    }

    /**
     * The listings that have waited longest for a review decision.
     *
     * @return list<array{key: string, type: string, name: string, city: string|null, submittedAgo: string|null}>
     */
    private function waitingListings(): array
    {
        $waiting = fn (Builder $query) => $query
            ->whereIn('review_status', ApplicationController::TABS['needs_review'])
            ->with('city:id,name')
            ->oldest('submitted_at')
            ->limit(self::LIST_LENGTH);

        return Professional::query()->tap($waiting)->get()
            ->concat(VehicleProvider::query()->tap($waiting)->get())
            ->sortBy(fn (Professional|VehicleProvider $listing) => $listing->submitted_at?->getTimestamp() ?? 0)
            ->take(self::LIST_LENGTH)
            ->map(function (Professional|VehicleProvider $listing) {
                $type = $listing instanceof Professional ? 'professional' : 'vehicle_provider';

                return [
                    'key' => "{$type}-{$listing->id}",
                    'type' => $type,
                    'name' => $listing->business_name ?? $listing->full_name ?? $listing->contact_name,
                    'city' => $listing->city?->name,
                    'submittedAgo' => $listing->submitted_at?->diffForHumans(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * The newest quote requests, business requests and bookings together.
     *
     * @return list<array{id: int, tab: string, reference: string|null, title: string, customer: string, createdAgo: string|null}>
     */
    private function latestRequests(): array
    {
        $quotes = QuoteRequest::query()->with(['customer', 'category:id,name'])->latest()->limit(self::LIST_LENGTH)->get();
        $business = ServiceRequest::query()->with(['customer', 'category:id,name'])->latest()->limit(self::LIST_LENGTH)->get();
        $bookings = VehicleBooking::query()->with(['customer', 'vehicle:id,make,model'])->latest()->limit(self::LIST_LENGTH)->get();

        return $quotes->concat($business)->concat($bookings)
            ->sortByDesc(fn (QuoteRequest|ServiceRequest|VehicleBooking $item) => $item->created_at?->getTimestamp() ?? 0)
            ->take(self::LIST_LENGTH)
            ->map(fn (QuoteRequest|ServiceRequest|VehicleBooking $item) => [
                'id' => $item->id,
                'tab' => match (true) {
                    $item instanceof QuoteRequest => 'quotes',
                    $item instanceof ServiceRequest => 'business',
                    default => 'bookings',
                },
                'reference' => $item->reference,
                'title' => $item instanceof VehicleBooking
                    ? ($item->vehicle ? "{$item->vehicle->make} {$item->vehicle->model}" : 'Removed vehicle')
                    : $item->category->name,
                'customer' => $item->customer->full_name,
                'createdAgo' => $item->created_at?->diffForHumans(),
            ])
            ->values()
            ->all();
    }
}
