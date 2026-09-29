<?php

namespace App\Http\Controllers;

use App\Actions\SendReviewInvitation;
use App\Http\Requests\StoreCustomerReviewRequest;
use App\Models\Customer;
use App\Models\CustomerReview;
use App\Models\Quote;
use App\Models\User;
use App\Models\VehicleBooking;
use App\Notifications\NewReviewSubmitted;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Customers rating a finished job or vehicle hire, either through the
 * private link they were sent or from their account.
 */
class ReviewController extends Controller
{
    /**
     * Show the review form, or the review already left.
     */
    public function create(Request $request, string $type, int $id): Response
    {
        $job = $this->findJob($type, $id);
        $this->authorizeReviewer($request, $job);

        $review = $job->review;
        $isOwner = $this->isCustomerOwner($request->user(), $job);

        return Inertia::render('public/review', [
            'job' => $this->describe($job),
            'review' => $review ? [
                'rating' => $review->rating,
                'comment' => $review->comment,
                'isPublished' => $review->published_at !== null,
            ] : null,
            'submitUrl' => $isOwner
                ? route('reviews.store', ['type' => $type, 'id' => $id])
                : URL::temporarySignedRoute('reviews.store', now()->addDay(), ['type' => $type, 'id' => $id]),
            'canCreateAccount' => $request->user() === null,
        ]);
    }

    /**
     * Save the review for an admin to check before it goes live.
     */
    public function store(StoreCustomerReviewRequest $request, string $type, int $id): RedirectResponse
    {
        $job = $this->findJob($type, $id);
        $this->authorizeReviewer($request, $job);

        abort_if($job->review()->exists(), 409);

        $review = new CustomerReview($request->safe()->only(['rating', 'comment']));
        $review->customer()->associate($this->customerOf($job));
        $review->reviewable()->associate($job instanceof Quote ? $job->professional : $job->vehicleProvider);
        $job instanceof Quote ? $review->quote()->associate($job) : $review->vehicleBooking()->associate($job);
        $review->save();

        Notification::send(User::where('role', User::ROLE_ADMIN)->get(), new NewReviewSubmitted($review));

        return $this->isCustomerOwner($request->user(), $job)
            ? to_route('reviews.create', ['type' => $type, 'id' => $id])
            : redirect()->to(SendReviewInvitation::url($job));
    }

    /**
     * The finished job or hire behind the link. Unfinished ones can't be
     * reviewed yet.
     */
    private function findJob(string $type, int $id): Quote|VehicleBooking
    {
        $job = match ($type) {
            'quote' => Quote::with(['quoteRequest.customer', 'quoteRequest.category', 'professional', 'review'])->findOrFail($id),
            'booking' => VehicleBooking::with(['customer', 'vehicleProvider', 'vehicle', 'review'])->findOrFail($id),
            default => abort(404),
        };

        $isFinished = $job instanceof Quote
            ? $job->status === Quote::STATUS_COMPLETED
            : $job->status === VehicleBooking::STATUS_COMPLETED;

        abort_unless($isFinished, 404);

        return $job;
    }

    /**
     * Allow a valid private link, or the signed-in customer the job
     * belongs to.
     */
    private function authorizeReviewer(Request $request, Quote|VehicleBooking $job): void
    {
        abort_unless($request->hasValidSignature() || $this->isCustomerOwner($request->user(), $job), 403);
    }

    private function isCustomerOwner(?User $user, Quote|VehicleBooking $job): bool
    {
        return $user !== null
            && $user->isCustomer()
            && $user->customer?->id === $this->customerOf($job)->id;
    }

    private function customerOf(Quote|VehicleBooking $job): Customer
    {
        return $job instanceof Quote ? $job->quoteRequest->customer : $job->customer;
    }

    /**
     * What the customer is reviewing, in their words.
     *
     * @return array{proName: string, what: string, reference: string|null, customerName: string}
     */
    private function describe(Quote|VehicleBooking $job): array
    {
        if ($job instanceof Quote) {
            return [
                'proName' => $job->professional->business_name ?? $job->professional->full_name,
                'what' => $job->quoteRequest->category->name,
                'reference' => $job->quoteRequest->reference,
                'customerName' => $job->quoteRequest->customer->full_name,
            ];
        }

        return [
            'proName' => $job->vehicleProvider->business_name,
            'what' => $job->vehicle ? "{$job->vehicle->make} {$job->vehicle->model} hire" : 'Vehicle hire',
            'reference' => $job->reference,
            'customerName' => $job->customer->full_name,
        ];
    }
}
