<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicCategoryResource;
use App\Http\Resources\PublicProfessionalResource;
use App\Http\Resources\PublicVehicleResource;
use App\Models\Category;
use App\Models\City;
use App\Models\CustomerReview;
use App\Models\Professional;
use App\Models\Vehicle;
use App\Models\VehicleProvider;
use App\Support\VisitorCity;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The public directory: verified pros, business firms and fleets.
 */
class DirectoryController extends Controller
{
    /**
     * Search results shown per page.
     */
    public const PER_PAGE = 10;

    /** @var list<string> */
    public const SORTS = ['rating', 'reviews', 'newest'];

    /**
     * Vehicles shown per page: three full rows of four.
     */
    public const VEHICLES_PER_PAGE = 12;

    /** @var list<string> */
    public const VEHICLE_SORTS = ['price_asc', 'price_desc', 'newest'];

    /** @var list<string> */
    public const DRIVER_FILTERS = ['self_drive', 'with_driver'];

    /**
     * Show the home page with the categories and the best-rated pros.
     */
    public function home(Request $request): Response
    {
        $visitorCity = VisitorCity::from($request);
        $visitorCityId = $visitorCity ? City::where('name', $visitorCity)->value('id') : null;

        return Inertia::render('public/home', [
            'visitorCity' => $visitorCity,
            'categories' => $this->popularTrades(8),
            'businessCategories' => $this->categoriesInGroup(Category::GROUP_BUSINESS, limit: 4),
            'vehicleCategories' => $this->categoriesInGroup(Category::GROUP_VEHICLE),
            'heroCategories' => PublicCategoryResource::collection(
                Category::query()
                    ->inGroup(Category::PROFESSIONAL_GROUPS)
                    ->where('is_active', true)
                    ->withCount(['professionals as published_count' => fn (Builder $query) => $query->published()])
                    ->inRandomOrder()
                    ->get(),
            )->resolve(),
            'topRatedProfessionals' => PublicProfessionalResource::collection(
                Professional::query()
                    ->published()
                    ->with(PublicProfessionalResource::relations())
                    ->whereNotNull('rating_average')
                    ->when($visitorCityId, fn (Builder $query) => $query->orderByRaw('city_id = ? desc', [$visitorCityId]))
                    ->orderByDesc('rating_average')
                    ->orderByDesc('reviews_count')
                    ->limit(3)
                    ->get(),
            )->resolve(),
        ]);
    }

    /**
     * Search verified pros by text, place, category and rating.
     */
    public function search(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:100'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['string', 'max:100'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'type' => ['nullable', Rule::in(Professional::PROVIDER_TYPES)],
            'sort' => ['nullable', Rule::in(self::SORTS)],
        ]);

        $place = VisitorCity::filter($request, 'location');
        $term = trim($filters['q'] ?? '');
        $providerType = $filters['type'] ?? null;
        $categorySlugs = $filters['categories'] ?? [];
        $minimumRating = (float) ($filters['rating'] ?? 0);
        $sort = $filters['sort'] ?? 'rating';

        $this->countSearches($term, $categorySlugs);

        $professionals = Professional::query()
            ->published()
            ->with(PublicProfessionalResource::relations())
            ->when($term !== '', fn (Builder $query) => $query->where(function (Builder $query) use ($term) {
                $like = "%{$term}%";
                $query->where('full_name', 'like', $like)
                    ->orWhere('business_name', 'like', $like)
                    ->orWhere('headline', 'like', $like)
                    ->orWhere('bio', 'like', $like)
                    ->orWhereHas('categories', fn (Builder $categories) => $categories
                        ->where('name', 'like', $like)
                        ->orWhere('name_fr', 'like', $like));
            }))
            ->when($place['city'] !== null, fn (Builder $query) => $query->whereRelation('city', 'name', $place['city']))
            ->when($categorySlugs !== [], fn (Builder $query) => $query->whereHas('categories', fn (Builder $categories) => $categories->whereIn('slug', $categorySlugs)))
            ->when($minimumRating > 0, fn (Builder $query) => $query->where('rating_average', '>=', $minimumRating))
            ->when($providerType !== null, fn (Builder $query) => $query->where('provider_type', $providerType))
            ->when($sort === 'rating', fn (Builder $query) => $query->orderByRaw('rating_average is null')->orderByDesc('rating_average')->orderByDesc('reviews_count'))
            ->when($sort === 'reviews', fn (Builder $query) => $query->orderByDesc('reviews_count'))
            ->when($sort === 'newest', fn (Builder $query) => $query->latest('verified_at'))
            ->orderBy('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Professional $professional) => PublicProfessionalResource::make($professional)->resolve());

        return Inertia::render('public/search', [
            'professionals' => $professionals,
            'filters' => [
                'q' => $term,
                'location' => $place['city'] ?? '',
                'locationIsVisitorDefault' => $place['isVisitorDefault'],
                'categories' => $categorySlugs,
                'rating' => $minimumRating,
                'type' => $providerType,
                'sort' => $sort,
            ],
            'categories' => $this->categoriesInGroup([Category::GROUP_TRADE, Category::GROUP_BUSINESS]),
            'cities' => City::options(),
        ]);
    }

    /**
     * Show every trade and business service, with how many verified pros
     * offer each.
     */
    public function categories(): Response
    {
        return Inertia::render('public/categories', [
            'trades' => $this->categoriesInGroup(Category::GROUP_TRADE),
            'businessServices' => $this->categoriesInGroup(Category::GROUP_BUSINESS),
        ]);
    }

    /**
     * Show the verified pros listed under a trade or business category.
     */
    public function category(Request $request, string $category): Response
    {
        $category = Category::query()
            ->where('slug', $category)
            ->whereIn('group', Category::PROFESSIONAL_GROUPS)
            ->where('is_active', true)
            ->withCount(['professionals as published_count' => fn (Builder $query) => $query->published()])
            ->firstOrFail();

        Category::whereKey($category->id)->toBase()->increment('search_count');

        return Inertia::render('public/category', [
            'category' => PublicCategoryResource::make($category)->resolve(),
            'professionals' => PublicProfessionalResource::collection(
                $category->professionals()
                    ->published()
                    ->with(PublicProfessionalResource::relations())
                    ->orderByDesc('rating_average')
                    ->get(),
            )->resolve(),
            'cities' => City::options(),
            'visitorCity' => VisitorCity::from($request),
        ]);
    }

    /**
     * Show a verified professional's public profile and their reviews.
     */
    public function professional(string $professional): Response
    {
        $professional = Professional::query()
            ->published()
            ->where('slug', $professional)
            ->with([...PublicProfessionalResource::relations(), 'photos'])
            ->firstOrFail();

        return Inertia::render('public/professional', [
            'professional' => PublicProfessionalResource::make($professional)->resolve(),
            'reviews' => $professional->customerReviews()
                ->published()
                ->with('customer:id,full_name')
                ->latest('published_at')
                ->limit(20)
                ->get()
                ->map(fn (CustomerReview $review) => [
                    'id' => $review->id,
                    'author' => $this->reviewerName($review->customer?->full_name),
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'reply' => $review->reply,
                    'date' => $review->published_at?->isoFormat('ll'),
                ]),
        ]);
    }

    /**
     * Browse every vehicle offered by verified fleets, filtered by type,
     * city, hire option and currency.
     */
    public function vehicles(Request $request): Response
    {
        $filters = $request->validate([
            'types' => ['nullable', 'array'],
            'types.*' => ['string', 'max:100'],
            'city' => ['nullable', 'string', 'max:100'],
            'driver' => ['nullable', Rule::in(self::DRIVER_FILTERS)],
            'currency' => ['nullable', Rule::in(Vehicle::CURRENCIES)],
            'sort' => ['nullable', Rule::in(self::VEHICLE_SORTS)],
        ]);

        $place = VisitorCity::filter($request, 'city');
        $types = $filters['types'] ?? [];
        $sort = $filters['sort'] ?? 'price_asc';

        $vehicles = Vehicle::query()
            ->whereHas('provider', fn (Builder $query) => $query
                ->published()
                ->when($place['city'] !== null, fn (Builder $query) => $query->whereRelation('city', 'name', $place['city'])))
            ->when($types !== [], fn (Builder $query) => $query->whereHas('category', fn (Builder $category) => $category->whereIn('slug', $types)))
            ->when(($filters['driver'] ?? null) === 'self_drive', fn (Builder $query) => $query->whereIn('driver_option', ['self_drive', 'both']))
            ->when(($filters['driver'] ?? null) === 'with_driver', fn (Builder $query) => $query->whereIn('driver_option', ['with_driver', 'both']))
            ->when(filled($filters['currency'] ?? null), fn (Builder $query) => $query->where('currency', $filters['currency']))
            ->when($sort === 'price_asc', fn (Builder $query) => $query->orderBy('daily_rate'))
            ->when($sort === 'price_desc', fn (Builder $query) => $query->orderByDesc('daily_rate'))
            ->when($sort === 'newest', fn (Builder $query) => $query->latest())
            ->orderBy('id')
            ->with(['category', 'photos', 'provider.city'])
            ->paginate(self::VEHICLES_PER_PAGE)
            ->withQueryString()
            ->through(fn (Vehicle $vehicle) => PublicVehicleResource::make($vehicle)->resolve());

        $typeCounts = Vehicle::query()
            ->whereHas('provider', fn (Builder $query) => $query->published())
            ->selectRaw('category_id, count(*) as vehicle_count')
            ->groupBy('category_id')
            ->pluck('vehicle_count', 'category_id');

        return Inertia::render('public/vehicles', [
            'vehicles' => $vehicles,
            'filters' => [
                'types' => $types,
                'city' => $place['city'] ?? '',
                'cityIsVisitorDefault' => $place['isVisitorDefault'],
                'driver' => $filters['driver'] ?? '',
                'currency' => $filters['currency'] ?? '',
                'sort' => $sort,
            ],
            'types' => Category::query()
                ->inGroup(Category::GROUP_VEHICLE)
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (Category $category) => [
                    'slug' => $category->slug,
                    'name' => $category->name,
                    'icon' => $category->icon,
                    'count' => (int) ($typeCounts[$category->id] ?? 0),
                ]),
            'cities' => City::query()
                ->whereHas('vehicleProviders', fn (Builder $query) => $query->published())
                ->orderBy('sort_order')
                ->pluck('name'),
            'currencies' => Vehicle::CURRENCIES,
        ]);
    }

    /**
     * Old per-type links open the vehicle list with that type selected.
     */
    public function vehicleCategory(string $category): RedirectResponse
    {
        abort_unless(
            Category::query()->where('slug', $category)->where('group', Category::GROUP_VEHICLE)->exists(),
            404,
        );

        return to_route('vehicles.index', ['types' => [$category]]);
    }

    /**
     * Show a verified fleet and the vehicles it rents out.
     */
    public function fleet(Request $request, string $vehicleProvider): Response
    {
        $provider = VehicleProvider::query()
            ->published()
            ->where('slug', $vehicleProvider)
            ->with(['city', 'commune', 'vehicles' => fn ($query) => $query->orderBy('category_id')->orderBy('make'), 'vehicles.category', 'vehicles.photos'])
            ->firstOrFail();

        return Inertia::render('public/fleet', [
            'fleet' => [
                'slug' => $provider->slug,
                'name' => $provider->business_name ?? $provider->contact_name,
                'isCompany' => $provider->isCompany(),
                'city' => $provider->city?->name,
                'commune' => $provider->commune?->name,
                'phone' => '+243'.preg_replace('/\D/', '', $provider->phone),
                'isOnWhatsApp' => $provider->is_on_whatsapp,
                'rating' => (float) ($provider->rating_average ?? 0),
                'reviewsCount' => (int) $provider->reviews_count,
                'vehicleCount' => (int) $provider->vehicles->sum('quantity'),
                'lowestDailyRate' => $provider->lowestDailyRate(),
            ],
            'vehicles' => PublicVehicleResource::collection($provider->vehicles)->resolve(),
            'selectedVehicleId' => $provider->vehicles->firstWhere('id', $request->integer('vehicle'))?->id,
        ]);
    }

    /**
     * Active categories in the given groups, with how many verified
     * listings each has. With a limit, the busiest categories come first.
     *
     * @param  string|list<string>  $groups
     * @return array<int, array<string, mixed>>
     */
    private function categoriesInGroup(string|array $groups, ?int $limit = null): array
    {
        /** @var Collection<int, Category> $categories */
        $categories = Category::query()
            ->inGroup($groups)
            ->where('is_active', true)
            ->withCount(['professionals as published_count' => fn (Builder $query) => $query->published()])
            ->when(
                $limit !== null,
                fn (Builder $query) => $query->orderByDesc('published_count')->orderBy('sort_order')->limit($limit),
            )
            ->orderBy('name')
            ->get();

        return PublicCategoryResource::collection($categories)->resolve();
    }

    /**
     * The trades people look for most: by searches and category visits,
     * then the services most in demand in the DRC, then the busiest.
     *
     * @return array<int, array<string, mixed>>
     */
    private function popularTrades(int $limit): array
    {
        $categories = Category::query()
            ->inGroup(Category::GROUP_TRADE)
            ->where('is_active', true)
            ->withCount(['professionals as published_count' => fn (Builder $query) => $query->published()])
            ->orderByDesc('search_count')
            ->orderByRaw('featured_rank is null')
            ->orderBy('featured_rank')
            ->orderByDesc('published_count')
            ->orderBy('name')
            ->limit($limit)
            ->get();

        return PublicCategoryResource::collection($categories)->resolve();
    }

    /**
     * Count a search against the categories it was for: those picked as
     * filters, or the one category the search text names.
     *
     * @param  list<string>  $categorySlugs
     */
    private function countSearches(string $term, array $categorySlugs): void
    {
        if ($categorySlugs === [] && mb_strlen($term) >= 3) {
            $matches = Category::query()
                ->where(fn (Builder $query) => $query->where('name', 'like', "%{$term}%")->orWhere('name_fr', 'like', "%{$term}%"))
                ->limit(2)
                ->pluck('slug');

            $categorySlugs = $matches->count() === 1 ? $matches->all() : [];
        }

        if ($categorySlugs !== [] && ! request()->has('page')) {
            Category::query()->whereIn('slug', $categorySlugs)->toBase()->increment('search_count');
        }
    }

    /**
     * A reviewer's first name and last initial, such as "Grace M.".
     */
    private function reviewerName(?string $fullName): string
    {
        $parts = preg_split('/\s+/', trim((string) $fullName)) ?: [];

        if ($parts === [] || $parts[0] === '') {
            return 'Client';
        }

        $initial = count($parts) > 1 ? ' '.mb_substr(end($parts), 0, 1).'.' : '';

        return $parts[0].$initial;
    }
}
