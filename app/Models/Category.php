<?php

namespace App\Models;

use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * A directory category: a trade, a business service, or a vehicle type.
 *
 * @property int $id
 * @property string $group
 * @property string $slug
 * @property string $name
 * @property string $name_fr
 * @property string $icon
 * @property string|null $tagline
 * @property string|null $summary
 * @property string|null $description
 * @property int $sort_order
 * @property int|null $featured_rank
 * @property int $search_count
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['group', 'slug', 'name', 'name_fr', 'icon', 'tagline', 'summary', 'description', 'sort_order', 'featured_rank', 'is_active'])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory;

    /**
     * Home and building trades, such as plumbers.
     */
    public const GROUP_TRADE = 'trade';

    /**
     * Business services, such as law firms.
     */
    public const GROUP_BUSINESS = 'business';

    /**
     * Types of vehicle and equipment for hire.
     */
    public const GROUP_VEHICLE = 'vehicle';

    /**
     * Groups a service professional can be listed under.
     *
     * @var list<string>
     */
    public const PROFESSIONAL_GROUPS = [self::GROUP_TRADE, self::GROUP_BUSINESS];

    /**
     * How each group is named in pickers.
     *
     * @var array<string, string>
     */
    public const GROUP_LABELS = [
        self::GROUP_TRADE => 'Trades',
        self::GROUP_BUSINESS => 'Business services',
        self::GROUP_VEHICLE => 'Vehicle & equipment rental',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'featured_rank' => 'integer',
            'search_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Only categories in the given groups.
     *
     * @param  Builder<self>  $query
     * @param  string|list<string>  $groups
     */
    #[Scope]
    protected function inGroup(Builder $query, string|array $groups): void
    {
        $query->whereIn('group', (array) $groups);
    }

    /**
     * The category's name in the active language.
     */
    public function localizedName(): string
    {
        return app()->getLocale() === 'fr' && filled($this->name_fr) ? $this->name_fr : $this->name;
    }

    /**
     * Professionals listed under this category.
     *
     * @return BelongsToMany<Professional, $this>
     */
    public function professionals(): BelongsToMany
    {
        return $this->belongsToMany(Professional::class);
    }

    /**
     * Vehicles of this type.
     *
     * @return HasMany<Vehicle, $this>
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    /**
     * Quote requests customers made in this category.
     *
     * @return HasMany<QuoteRequest, $this>
     */
    public function quoteRequests(): HasMany
    {
        return $this->hasMany(QuoteRequest::class);
    }

    /**
     * Business service requests made in this category.
     *
     * @return HasMany<ServiceRequest, $this>
     */
    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    /**
     * Active trades and business services, grouped for the service pickers.
     *
     * @return list<array{label: string, options: list<array{slug: string, name: string, nameFr: string}>}>
     */
    public static function professionalOptions(): array
    {
        return array_map(
            fn (array $group) => ['label' => $group['label'], 'options' => $group['options']],
            static::groupedOptions(self::PROFESSIONAL_GROUPS),
        );
    }

    /**
     * Active categories in the given groups, grouped and sorted by name so
     * categories added later slot into place.
     *
     * @param  list<string>  $groups
     * @return list<array{group: string, label: string, options: list<array{slug: string, name: string, nameFr: string}>}>
     */
    public static function groupedOptions(array $groups = [self::GROUP_TRADE, self::GROUP_BUSINESS, self::GROUP_VEHICLE]): array
    {
        return static::query()
            ->inGroup($groups)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['group', 'slug', 'name', 'name_fr'])
            ->groupBy('group')
            ->sortBy(fn ($categories, string $group) => array_search($group, $groups, true))
            ->map(fn ($categories, string $group) => [
                'group' => $group,
                'label' => __(self::GROUP_LABELS[$group]),
                'options' => $categories
                    ->map(fn (self $category) => ['slug' => $category->slug, 'name' => $category->localizedName(), 'nameFr' => $category->name_fr])
                    ->values()
                    ->all(),
            ])
            ->values()
            ->all();
    }

    /**
     * The ids of the categories with the given slugs.
     *
     * @param  list<string>  $slugs
     * @return list<int>
     */
    public static function idsForSlugs(array $slugs): array
    {
        return static::query()->whereIn('slug', $slugs)->pluck('id')->all();
    }
}
