<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterCustomerRequest;
use App\Models\Customer;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\User;
use App\Models\VehicleBooking;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A customer's own area: their requests, hires and the reviews they owe.
 */
class CustomerAccountController extends Controller
{
    /**
     * List the customer's quote requests and vehicle hires.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user->isCustomer(), 403);

        $customer = $user->customer;

        $quoteRequests = $customer?->quoteRequests()
            ->with(['category', 'quotes' => fn ($query) => $query->where('status', Quote::STATUS_COMPLETED)->with(['professional', 'review'])])
            ->latest()
            ->get() ?? collect();

        $bookings = $customer?->vehicleBookings()
            ->with(['vehicleProvider', 'vehicle', 'review'])
            ->latest()
            ->get() ?? collect();

        return Inertia::render('account/index', [
            'customerName' => $customer?->full_name ?? $user->name,
            'quoteRequests' => $quoteRequests->map(fn (QuoteRequest $quoteRequest) => [
                'reference' => $quoteRequest->reference,
                'category' => $quoteRequest->category->name,
                'status' => $quoteRequest->status,
                'createdAt' => $quoteRequest->created_at?->isoFormat('ll'),
                'finishedJobs' => $quoteRequest->quotes->map(fn (Quote $quote) => [
                    'proName' => $quote->professional->business_name ?? $quote->professional->full_name,
                    'reviewUrl' => route('reviews.create', ['type' => 'quote', 'id' => $quote->id]),
                    'isReviewed' => $quote->review !== null,
                ])->all(),
            ])->all(),
            'bookings' => $bookings->map(fn (VehicleBooking $booking) => [
                'reference' => $booking->reference,
                'vehicle' => $booking->vehicle ? "{$booking->vehicle->make} {$booking->vehicle->model}" : 'Vehicle hire',
                'fleet' => $booking->vehicleProvider->business_name,
                'dates' => $booking->start_date->isoFormat('ll').' – '.$booking->end_date->isoFormat('ll'),
                'status' => $booking->status,
                'reviewUrl' => $booking->status === VehicleBooking::STATUS_COMPLETED
                    ? route('reviews.create', ['type' => 'booking', 'id' => $booking->id])
                    : null,
                'isReviewed' => $booking->review !== null,
            ])->all(),
        ]);
    }

    /**
     * Show the customer sign-up form.
     */
    public function create(): Response
    {
        return Inertia::render('account/register');
    }

    /**
     * Create the customer's account and link the requests they already
     * sent with the same email, or the same phone when no email was given.
     */
    public function store(RegisterCustomerRequest $request): RedirectResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = new User([
                'name' => $request->validated('full_name'),
                'email' => $request->validated('email'),
                'password' => $request->validated('password'),
            ]);
            $user->role = User::ROLE_CUSTOMER;
            $user->save();

            $email = mb_strtolower(trim($request->validated('email')));
            $customer = Customer::whereNull('user_id')->where('email', $email)->first()
                ?? Customer::whereNull('user_id')->whereNull('email')->where('phone', $request->validated('phone'))->first()
                ?? new Customer(['preferred_contact_channel' => 'whatsapp']);

            $customer->fill([
                'full_name' => $customer->full_name ?? $request->validated('full_name'),
                'phone' => $request->validated('phone'),
                'email' => $email,
            ]);
            $customer->user()->associate($user);
            $customer->save();

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);
        $request->session()->regenerate();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Welcome! Your account is ready.')]);

        return to_route('account.index');
    }
}
