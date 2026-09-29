<?php

namespace App\Models;

use App\Concerns\HasLocation;
use Database\Factories\ProApplicationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Someone's request to join as a pro: who they are and what they want to
 * offer. Approving it unlocks the pro dashboard, where they build their
 * listing.
 *
 * @property int $id
 * @property int $user_id
 * @property string $full_name
 * @property string|null $business_name
 * @property string $phone
 * @property bool $is_on_whatsapp
 * @property string|null $description
 * @property string $status
 * @property string|null $decision_message
 * @property int|null $reviewed_by_id
 * @property Carbon|null $reviewed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['full_name', 'business_name', 'phone', 'is_on_whatsapp', 'description'])]
class ProApplication extends Model
{
    /** @use HasFactory<ProApplicationFactory> */
    use HasFactory, HasLocation;

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_DECLINED = 'declined';

    /** @var list<string> */
    public const STATUSES = [self::STATUS_PENDING, self::STATUS_APPROVED, self::STATUS_DECLINED];

    /**
     * Most services an applicant can type in themselves.
     */
    public const MAX_CUSTOM_SERVICES = 5;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_on_whatsapp' => 'boolean',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * The account that applied.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The admin who approved or declined the application.
     *
     * @return BelongsTo<User, $this>
     */
    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_id');
    }

    /**
     * Categories the applicant picked from the list.
     *
     * @return BelongsToMany<Category, $this>
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)->orderBy('sort_order');
    }

    /**
     * Services the applicant typed in because they weren't listed.
     *
     * @return HasMany<ProApplicationCustomService, $this>
     */
    public function customServices(): HasMany
    {
        return $this->hasMany(ProApplicationCustomService::class);
    }

    /**
     * Determine whether the application is waiting for a decision.
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Whether the applicant offers a trade or business service.
     */
    public function offersServices(): bool
    {
        return $this->categories->contains(fn (Category $category) => in_array($category->group, Category::PROFESSIONAL_GROUPS, true))
            || ($this->isPending() && $this->customServices->isNotEmpty());
    }

    /**
     * Whether the applicant rents out vehicles or equipment.
     */
    public function offersVehicles(): bool
    {
        return $this->categories->contains('group', Category::GROUP_VEHICLE);
    }

    /**
     * Details from the application to pre-fill a new listing's form, in the
     * shape the listing fields expect.
     *
     * @param  'professional'|'vehicle_provider'  $listingType
     * @return array<string, mixed>
     */
    public function listingDefaults(string $listingType): array
    {
        $this->loadMissing(['categories', 'city', 'commune', 'user']);

        $shared = [
            'business_name' => $this->business_name,
            'phone' => $this->phone,
            'email' => $this->user->email,
            'is_on_whatsapp' => $this->is_on_whatsapp,
            'preferred_language' => 'fr',
            'city' => $this->city?->name ?? '',
            'commune' => $this->commune?->name ?? '',
            'address' => null,
            'registry_number' => null,
            'tax_id' => null,
            'has_identity_document' => false,
        ];

        if ($listingType === 'vehicle_provider') {
            return [...$shared, 'contact_name' => $this->full_name];
        }

        return [
            ...$shared,
            'full_name' => $this->full_name,
            'categories' => $this->categories
                ->whereIn('group', Category::PROFESSIONAL_GROUPS)
                ->pluck('slug')
                ->values()
                ->all(),
            'experience_years' => null,
            'bio' => $this->description,
            'has_photo' => false,
        ];
    }

    /**
     * Approve the applicant. Each typed-in service is first matched to an
     * existing category or added as a new one, then joins the categories
     * the applicant offers.
     *
     * @param  array<int, array{category_slug?: string|null, new_category?: array{name: string, group: string}|null}>  $resolutions  Keyed by custom service id.
     */
    public function approve(User $admin, array $resolutions): void
    {
        DB::transaction(function () use ($admin, $resolutions) {
            foreach ($this->customServices as $customService) {
                $category = $customService->resolve($resolutions[$customService->id] ?? []);
                $this->categories()->syncWithoutDetaching([$category->id]);
            }

            $this->decide($admin, self::STATUS_APPROVED);
            $this->user->forceFill(['pro_approved_at' => now()])->save();
        });

        $this->unsetRelation('categories');
    }

    /**
     * Decline the applicant, with a reason they will see.
     */
    public function decline(User $admin, string $message): void
    {
        $this->decide($admin, self::STATUS_DECLINED, $message);
    }

    /**
     * Record the admin's decision.
     */
    private function decide(User $admin, string $status, ?string $message = null): void
    {
        $this->forceFill([
            'status' => $status,
            'decision_message' => $message,
            'reviewed_at' => now(),
        ]);
        $this->reviewedBy()->associate($admin);
        $this->save();
    }
}
