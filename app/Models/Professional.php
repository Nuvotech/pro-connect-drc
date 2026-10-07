<?php

namespace App\Models;

use App\Actions\StoreCompressedImage;
use App\Concerns\HasCustomerReviews;
use App\Concerns\HasLocation;
use App\Concerns\HasSlug;
use App\Concerns\HasVerificationDocuments;
use App\Concerns\Reviewable;
use Database\Factories\ProfessionalFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $provider_type
 * @property string|null $slug
 * @property string $full_name
 * @property string|null $business_name
 * @property string|null $headline
 * @property string $phone
 * @property bool $is_on_whatsapp
 * @property string|null $email
 * @property string|null $address
 * @property string|null $service_area
 * @property string|null $starting_rate
 * @property string|null $rate_unit
 * @property string $currency
 * @property int|null $experience_years
 * @property string|null $registry_number
 * @property string|null $tax_id
 * @property string|null $bio
 * @property string $preferred_language
 * @property string|null $photo_path
 * @property string|null $cover_path
 * @property string|null $identity_document_path
 * @property string|null $business_registration_path
 * @property Carbon|null $verified_at
 * @property string $review_status
 * @property Carbon|null $submitted_at
 * @property int|null $onboarded_by_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'provider_type',
    'full_name',
    'business_name',
    'headline',
    'phone',
    'is_on_whatsapp',
    'email',
    'address',
    'service_area',
    'starting_rate',
    'rate_unit',
    'currency',
    'experience_years',
    'registry_number',
    'tax_id',
    'bio',
    'preferred_language',
])]
class Professional extends Model
{
    /** @use HasFactory<ProfessionalFactory> */
    use HasCustomerReviews, HasFactory, HasLocation, HasSlug, HasVerificationDocuments, Reviewable;

    /** @var list<string> */
    public const RATE_UNITS = ['hour', 'day', 'job'];

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'provider_type' => self::PROVIDER_INDIVIDUAL,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_on_whatsapp' => 'boolean',
            'experience_years' => 'integer',
            'starting_rate' => 'decimal:2',
            'rating_average' => 'decimal:1',
            'reviews_count' => 'integer',
            'verified_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * The name the listing's URL slug is built from.
     */
    protected function slugSource(): string
    {
        return $this->business_name ?? $this->full_name;
    }

    /**
     * The folder on the private disk where this listing's documents live.
     */
    protected function documentDirectory(): string
    {
        return 'professionals/documents';
    }

    /**
     * Compress and store a newly uploaded profile photo or cover image,
     * replacing the previous file. Call before saving.
     */
    public function storeProfileImages(Request $request): void
    {
        $images = [
            'photo' => ['photo_path', 'professionals/photos', 800],
            'cover' => ['cover_path', 'professionals/covers', 2000],
        ];

        foreach ($images as $input => [$attribute, $directory, $maxWidth]) {
            if (! $request->hasFile($input)) {
                continue;
            }

            if ($this->{$attribute}) {
                Storage::disk('public')->delete($this->{$attribute});
            }

            $this->{$attribute} = app(StoreCompressedImage::class)($request->file($input), $directory, $maxWidth);
        }
    }

    /**
     * The trades and business services this professional offers.
     *
     * @return BelongsToMany<Category, $this>
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->orderBy('sort_order');
    }

    /**
     * Replace the professional's categories with the ones given by slug.
     *
     * @param  list<string>  $slugs
     */
    public function syncCategories(array $slugs): void
    {
        $this->categories()->sync(Category::idsForSlugs($slugs));
        $this->unsetRelation('categories');
    }

    /**
     * The slugs of the professional's categories, as the forms use them.
     *
     * @return Collection<int, string>
     */
    public function categorySlugs(): Collection
    {
        return $this->categories->pluck('slug');
    }

    /**
     * This professional's responses to quote requests.
     *
     * @return HasMany<Quote, $this>
     */
    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    /**
     * The quote requests this professional was matched with.
     *
     * @return BelongsToMany<QuoteRequest, $this, Quote>
     */
    public function quoteRequests(): BelongsToMany
    {
        return $this->belongsToMany(QuoteRequest::class, 'quotes')
            ->using(Quote::class)
            ->withPivot(['id', 'status', 'amount', 'currency', 'responded_at'])
            ->withTimestamps();
    }

    /**
     * Business service requests matched with this firm.
     *
     * @return HasMany<ServiceRequest, $this>
     */
    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    /**
     * The pro account that manages this listing.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Photos from this professional's work gallery, in display order.
     *
     * @return HasMany<ProfessionalPhoto, $this>
     */
    public function photos(): HasMany
    {
        return $this->hasMany(ProfessionalPhoto::class)->orderBy('position');
    }

    /**
     * The admin who onboarded this professional.
     *
     * @return BelongsTo<User, $this>
     */
    public function onboardedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'onboarded_by_id');
    }

    /**
     * Determine whether the professional has been verified.
     */
    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    /**
     * What the listing needs before it can be verified, each item keyed so
     * the dashboard can link to where it is fixed.
     *
     * @return list<array{key: string, label: string, isDone: bool}>
     */
    public function completionChecklist(): array
    {
        return [
            ['key' => 'services', 'label' => 'Services chosen', 'isDone' => $this->categories->isNotEmpty()],
            ['key' => 'photo', 'label' => 'Profile photo added', 'isDone' => $this->photo_path !== null],
            ...$this->verificationChecklist(),
            ['key' => 'bio', 'label' => 'Description of your services', 'isDone' => filled($this->bio)],
            ['key' => 'gallery', 'label' => 'Photos of your work', 'isDone' => $this->photos()->exists()],
        ];
    }
}
