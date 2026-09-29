<?php

namespace App\Http\Middleware;

use App\Http\Controllers\Admin\ApplicationController;
use App\Models\Category;
use App\Models\City;
use App\Models\ContactMessage;
use App\Models\CustomerReview;
use App\Models\ExchangeRate;
use App\Models\ProApplication;
use App\Models\Professional;
use App\Models\QuoteRequest;
use App\Models\ServiceRequest;
use App\Models\VehicleProvider;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'locale' => app()->getLocale(),
            'translations' => Inertia::once(fn () => $this->translations())
                ->as('translations-'.app()->getLocale().'-'.$this->translationsVersion()),
            'auth' => [
                'user' => $request->user(),
                'pro' => fn () => $request->user() && ! $request->user()->isAdmin() && ! $request->user()->isCustomer() && ! $request->user()->isCapturer()
                    ? $request->user()->proSummary()
                    : null,
            ],
            'categories' => fn () => Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['slug', 'name', 'name_fr', 'group', 'icon'])
                ->map(fn (Category $category) => [
                    'slug' => $category->slug,
                    'name' => $category->localizedName(),
                    'nameEn' => $category->name,
                    'nameFr' => $category->name_fr,
                    'group' => $category->group,
                    'icon' => $category->icon,
                ]),
            'cities' => fn () => City::options(),
            'exchangeRate' => fn () => ExchangeRate::shared(),
            'reviewQueueCount' => fn () => $request->user()?->isAdmin()
                ? Professional::whereIn('review_status', ApplicationController::TABS['needs_review'])->count()
                    + VehicleProvider::whereIn('review_status', ApplicationController::TABS['needs_review'])->count()
                : null,
            'requestQueueCount' => fn () => $request->user()?->isAdmin()
                ? QuoteRequest::where('status', QuoteRequest::STATUS_OPEN)->doesntHave('quotes')->count()
                    + ServiceRequest::where('status', ServiceRequest::STATUS_NEW)->count()
                : null,
            'unreadMessageCount' => fn () => $request->user()?->isAdmin()
                ? ContactMessage::whereNull('read_at')->count()
                : null,
            'pendingReviewCount' => fn () => $request->user()?->isAdmin()
                ? CustomerReview::whereNull('published_at')->count()
                : null,
            'signUpQueueCount' => fn () => $request->user()?->isAdmin()
                ? ProApplication::where('status', ProApplication::STATUS_PENDING)->count()
                : null,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * The interface strings for the active language, keyed by their English
     * text. English needs none: the keys are the English text.
     *
     * @return array<string, string>
     */
    private function translations(): array
    {
        $path = lang_path(app()->getLocale().'.json');

        return is_file($path) ? json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR) : [];
    }

    /**
     * Changes whenever the translation file does, so browsers holding the
     * old strings fetch the new ones.
     */
    private function translationsVersion(): string
    {
        $path = lang_path(app()->getLocale().'.json');

        return is_file($path) ? (string) filemtime($path) : '0';
    }
}
