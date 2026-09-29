<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\CustomerReview;
use App\Models\Professional;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\ServiceRequest;
use App\Models\User;
use App\Models\VehicleBooking;
use App\Models\VehicleProvider;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

/**
 * Demo customers and everything they do: quote requests with the pros'
 * quotes, business service requests, vehicle bookings, reviews and saved
 * listings.
 */
class CustomerSeeder extends Seeder
{
    /**
     * Customers with an account; their password is `password`.
     *
     * @var list<array{full_name: string, email: string, phone: string, city: string, commune: string, organization?: string}>
     */
    private const REGISTERED = [
        ['full_name' => 'Grace Mbuyi', 'email' => 'grace.mbuyi@example.com', 'phone' => '81 220 4417', 'city' => 'Kinshasa', 'commune' => 'Gombe'],
        ['full_name' => 'Olivier Tshibangu', 'email' => 'olivier.tshibangu@example.com', 'phone' => '82 915 3302', 'city' => 'Kinshasa', 'commune' => 'Limete'],
        ['full_name' => 'Nadine Kasongo', 'email' => 'nadine.kasongo@example.com', 'phone' => '99 431 7780', 'city' => 'Lubumbashi', 'commune' => 'Kampemba'],
        ['full_name' => 'Samuel Ngoy', 'email' => 'samuel.ngoy@example.com', 'phone' => '81 667 1029', 'city' => 'Kinshasa', 'commune' => 'Ngaliema', 'organization' => 'Ngoy Construction SARL'],
        ['full_name' => 'Chantal Mujinga', 'email' => 'chantal.mujinga@example.com', 'phone' => '97 208 5561', 'city' => 'Goma', 'commune' => 'Karisimbi'],
    ];

    /**
     * Guests who sent a request without registering.
     *
     * @var list<array{full_name: string, email: string|null, phone: string, city: string, commune: string, organization?: string}>
     */
    private const GUESTS = [
        ['full_name' => 'Fiston Kabeya', 'email' => null, 'phone' => '84 553 9021', 'city' => 'Kinshasa', 'commune' => 'Kintambo'],
        ['full_name' => 'Sarah Lelo', 'email' => 'sarah.lelo@example.com', 'phone' => '81 774 2208', 'city' => 'Kinshasa', 'commune' => 'Bandalungwa'],
        ['full_name' => 'Thomas Weber', 'email' => 'thomas.weber@minerals-intl.example', 'phone' => '99 120 4471', 'city' => 'Kinshasa', 'commune' => 'Gombe', 'organization' => 'Minerals International GmbH'],
    ];

    /**
     * What customers typically ask each trade for.
     *
     * @var array<string, list<string>>
     */
    private const JOBS = [
        'plumbers' => [
            'The kitchen sink drain is blocked and water is backing up into the second basin. Needs clearing and checking.',
            'Water heater in the main bathroom stopped heating. It is a 100 L electric unit, about 6 years old.',
            'Leak under the upstairs bathroom that is staining the ceiling below. Need someone to find and repair it.',
            'Install a water pump and a 2,000 L tank on the roof so the house has pressure during cuts.',
        ],
        'electricians' => [
            'Several sockets in the living room stopped working after a power surge. Please check the wiring and breakers.',
            'Install a 3 kW solar kit with batteries for a small office, including the changeover switch.',
            'Rewire an old apartment (2 bedrooms) and replace the distribution board.',
        ],
        'carpenters' => [
            'Build fitted wardrobes for two bedrooms, about 2.4 m wide each, with sliding doors.',
            'Replace a damaged wooden front door and frame, including the lock.',
        ],
        'architects' => [
            'Plans and building permit for a two-storey family house on a 20 × 25 m plot.',
            'Redesign the ground floor of a commercial building into three shops.',
        ],
    ];

    /** @var list<string> */
    private const REVIEW_COMMENTS = [
        'Arrived on time, explained the problem clearly and fixed it the same day. Fair price.',
        'Very professional work and left everything clean. I will call again.',
        'Good job overall, though it took a day longer than planned.',
        'Excellent. Found the real cause of the problem when others had failed.',
        'Friendly and careful. The quote matched the final price exactly.',
        'Quick response on WhatsApp and solid work. Recommended.',
        'Did what was agreed, but communication could have been better.',
        'Honest advice, didn\'t try to sell me things I didn\'t need.',
    ];

    /**
     * Seed the customers and their activity.
     */
    public function run(): void
    {
        fake()->seed(2026);

        $customers = $this->seedCustomers();
        $this->seedQuoteRequests($customers);
        $this->seedServiceRequests($customers);
        $this->seedVehicleBookings($customers);
        $this->seedFavorites($customers);
    }

    /**
     * @return Collection<int, Customer>
     */
    private function seedCustomers(): Collection
    {
        $registered = collect(self::REGISTERED)->map(function (array $details) {
            $user = User::factory()->customer()->create([
                'name' => $details['full_name'],
                'email' => $details['email'],
                'password' => AccountSeeder::PASSWORD,
            ]);

            return $this->makeCustomer($details, $user);
        });

        $guests = collect(self::GUESTS)->map(fn (array $details) => $this->makeCustomer($details));

        return $registered->concat($guests);
    }

    /**
     * @param  array{full_name: string, email: string|null, phone: string, city: string, commune: string, organization?: string}  $details
     */
    private function makeCustomer(array $details, ?User $user = null): Customer
    {
        $customer = new Customer([
            'full_name' => $details['full_name'],
            'organization' => $details['organization'] ?? null,
            'email' => $details['email'],
            'phone' => $details['phone'],
            'is_on_whatsapp' => true,
            'preferred_language' => fake()->randomElement(['fr', 'fr', 'en']),
            'preferred_contact_channel' => $details['email'] ? fake()->randomElement(Customer::CONTACT_CHANNELS) : 'whatsapp',
        ]);
        $customer->placeIn($details['city'], $details['commune']);
        $customer->user()->associate($user);
        $customer->save();

        return $customer;
    }

    /**
     * Quote requests in every status. Completed jobs get a review.
     *
     * @param  Collection<int, Customer>  $customers
     */
    private function seedQuoteRequests(Collection $customers): void
    {
        $statuses = [
            ...array_fill(0, 12, QuoteRequest::STATUS_COMPLETED),
            QuoteRequest::STATUS_ACCEPTED,
            QuoteRequest::STATUS_ACCEPTED,
            QuoteRequest::STATUS_QUOTED,
            QuoteRequest::STATUS_QUOTED,
            QuoteRequest::STATUS_QUOTED,
            QuoteRequest::STATUS_OPEN,
            QuoteRequest::STATUS_OPEN,
            QuoteRequest::STATUS_CANCELLED,
        ];

        foreach ($statuses as $index => $status) {
            $slug = array_keys(self::JOBS)[$index % count(self::JOBS)];
            $pros = Professional::query()
                ->where('review_status', Professional::REVIEW_APPROVED)
                ->whereRelation('categories', 'slug', $slug)
                ->inRandomOrder()
                ->limit(3)
                ->get();

            if ($pros->isEmpty()) {
                continue;
            }

            $customer = $customers[$index % $customers->count()];
            $createdAt = now()->subDays(fake()->numberBetween(2, 90));

            $request = new QuoteRequest([
                'service_type' => fake()->randomElement(QuoteRequest::SERVICE_TYPES),
                'description' => fake()->randomElement(self::JOBS[$slug]),
                'timing' => fake()->randomElement(QuoteRequest::TIMINGS),
                'address' => fake()->streetAddress(),
                'needs_site_visit' => fake()->boolean(),
                'contact_channel' => $customer->preferred_contact_channel,
                'status' => $status,
                'closed_at' => in_array($status, [QuoteRequest::STATUS_COMPLETED, QuoteRequest::STATUS_CANCELLED], true)
                    ? $createdAt->addDays(fake()->numberBetween(3, 14))
                    : null,
            ]);
            $request->customer()->associate($customer);
            $request->category()->associate(Category::where('slug', $slug)->sole());
            $request->city()->associate($customer->city_id);
            $request->commune()->associate($customer->commune_id);
            $request->created_at = $createdAt;
            $request->save();

            $this->seedQuotes($request, $pros, $createdAt);
        }
    }

    /**
     * Each matched pro's quote, matching the request's status.
     *
     * @param  Collection<int, Professional>  $pros
     */
    private function seedQuotes(QuoteRequest $request, Collection $pros, mixed $createdAt): void
    {
        $hasWinner = in_array($request->status, [QuoteRequest::STATUS_ACCEPTED, QuoteRequest::STATUS_COMPLETED], true);

        foreach ($pros->values() as $position => $professional) {
            $factory = Quote::factory()->for($request)->for($professional);

            $quote = match (true) {
                $hasWinner && $position === 0 => $factory->accepted()->create(),
                $hasWinner => $factory->quoted()->create(['status' => Quote::STATUS_REJECTED]),
                $request->status === QuoteRequest::STATUS_QUOTED && $position < 2 => $factory->quoted()->create(),
                $request->status === QuoteRequest::STATUS_OPEN && $position === 0 => $factory->create(['status' => Quote::STATUS_VIEWED]),
                default => $factory->create(),
            };

            if ($request->status === QuoteRequest::STATUS_COMPLETED && $quote->status === Quote::STATUS_ACCEPTED) {
                $review = new CustomerReview([
                    'rating' => fake()->randomElement([5, 5, 5, 4, 4, 3]),
                    'comment' => fake()->randomElement(self::REVIEW_COMMENTS),
                    'published_at' => $request->closed_at?->addDays(2),
                ]);
                $review->customer()->associate($request->customer_id);
                $review->quote()->associate($quote);
                $review->reviewable()->associate($professional);
                $review->save();
            }
        }
    }

    /**
     * Business service requests, some already matched with a firm.
     *
     * @param  Collection<int, Customer>  $customers
     */
    private function seedServiceRequests(Collection $customers): void
    {
        $admin = User::where('email', AccountSeeder::ADMIN_EMAIL)->sole();
        $businessCustomers = $customers->filter(fn (Customer $customer) => $customer->organization !== null)->values();

        $requests = [
            ['category' => 'law-firms', 'status' => ServiceRequest::STATUS_MATCHED, 'timeline' => 'this_week', 'description' => 'We need a lawyer to review a supply contract with a mining company and advise on the dispute resolution clauses.'],
            ['category' => 'accountants', 'status' => ServiceRequest::STATUS_IN_PROGRESS, 'timeline' => 'flexible', 'description' => 'Annual accounts and tax filing for a small construction company (about 25 employees).'],
            ['category' => 'import-export', 'status' => ServiceRequest::STATUS_NEW, 'timeline' => 'urgent', 'description' => 'Customs clearance for two containers of equipment arriving at Matadi port next week.'],
            ['category' => 'consultancy', 'status' => ServiceRequest::STATUS_NEW, 'timeline' => 'flexible', 'description' => 'Market entry study for opening a distribution office in the DRC.'],
        ];

        foreach ($requests as $index => $details) {
            $category = Category::where('slug', $details['category'])->sole();

            $request = new ServiceRequest([
                'description' => $details['description'],
                'timeline' => $details['timeline'],
                'status' => $details['status'],
            ]);
            $request->customer()->associate($businessCustomers[$index % $businessCustomers->count()]);
            $request->category()->associate($category);
            $request->city()->associate($details['category'] === 'consultancy' ? null : $request->customer->city_id);

            if ($details['status'] !== ServiceRequest::STATUS_NEW) {
                $request->handledBy()->associate($admin);
                $request->professional()->associate($category->professionals()->first());
            }

            $request->save();
        }
    }

    /**
     * Hire requests for Kongo Fleet's vehicles. Finished hires get a review.
     *
     * @param  Collection<int, Customer>  $customers
     */
    private function seedVehicleBookings(Collection $customers): void
    {
        $provider = VehicleProvider::where('email', 'contact@kongofleet.example')->with('vehicles')->sole();

        $bookings = [
            [VehicleBooking::STATUS_COMPLETED, -40, 3],
            [VehicleBooking::STATUS_COMPLETED, -25, 5],
            [VehicleBooking::STATUS_COMPLETED, -12, 2],
            [VehicleBooking::STATUS_CONFIRMED, 6, 4],
            [VehicleBooking::STATUS_REQUESTED, 14, 7],
            [VehicleBooking::STATUS_DECLINED, 3, 2],
        ];

        foreach ($bookings as $index => [$status, $startsInDays, $days]) {
            $vehicle = $provider->vehicles[$index % $provider->vehicles->count()];
            $customer = $customers[($index + 1) % $customers->count()];

            $booking = new VehicleBooking([
                'start_date' => now()->addDays($startsInDays)->startOfDay(),
                'end_date' => now()->addDays($startsInDays + $days - 1)->startOfDay(),
                'quantity' => 1,
                'with_driver' => $vehicle->driver_option !== 'self_drive',
                'pickup_location' => "{$customer->commune->name}, {$customer->city->name}",
                'notes' => fake()->optional()->randomElement(['Site access from 7am.', 'Needed for a staff transfer to the airport.', 'Two return trips to the depot.']),
                'status' => $status,
                'responded_at' => $status === VehicleBooking::STATUS_REQUESTED ? null : now()->addDays($startsInDays - 5),
            ]);
            $booking->customer()->associate($customer);
            $booking->forVehicle($vehicle)->save();

            if ($status === VehicleBooking::STATUS_COMPLETED) {
                $review = new CustomerReview([
                    'rating' => fake()->randomElement([5, 4, 4]),
                    'comment' => fake()->randomElement([
                        'Vehicle in good condition and the driver knew the route well.',
                        'Clean truck, delivered on time to the site. Will book again.',
                        'Smooth booking over WhatsApp and a fair deposit.',
                    ]),
                    'published_at' => $booking->end_date->addDay(),
                ]);
                $review->customer()->associate($customer);
                $review->vehicleBooking()->associate($booking);
                $review->reviewable()->associate($provider);
                $review->save();
            }
        }
    }

    /**
     * Registered customers save a few listings.
     *
     * @param  Collection<int, Customer>  $customers
     */
    private function seedFavorites(Collection $customers): void
    {
        $listings = Professional::where('review_status', Professional::REVIEW_APPROVED)->get()
            ->concat(VehicleProvider::where('review_status', VehicleProvider::REVIEW_APPROVED)->get());

        $customers->whereNotNull('user_id')->each(function (Customer $customer) use ($listings) {
            $listings->random(fake()->numberBetween(1, 3))->each(function (Professional|VehicleProvider $listing) use ($customer) {
                $customer->favorites()->make()->favoritable()->associate($listing)->save();
            });
        });
    }
}
