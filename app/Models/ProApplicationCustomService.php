<?php

namespace App\Models;

use Database\Factories\ProApplicationCustomServiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A service an applicant typed in because it wasn't in the category list.
 * The admin matches it to a category, or creates one, when approving.
 *
 * @property int $id
 * @property int $pro_application_id
 * @property string $name
 * @property int|null $category_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name'])]
class ProApplicationCustomService extends Model
{
    /** @use HasFactory<ProApplicationCustomServiceFactory> */
    use HasFactory;

    /**
     * The application the service was entered on.
     *
     * @return BelongsTo<ProApplication, $this>
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(ProApplication::class, 'pro_application_id');
    }

    /**
     * The category the admin matched it to or created for it.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Match the service to an existing category, or create a new one, as
     * the admin decided.
     *
     * @param  array{category_slug?: string|null, new_category?: array{name: string, group: string}|null}  $resolution
     */
    public function resolve(array $resolution): Category
    {
        $category = filled($resolution['category_slug'] ?? null)
            ? Category::where('slug', $resolution['category_slug'])->firstOrFail()
            : Category::createInGroup($resolution['new_category']['group'], $resolution['new_category']['name']);

        $this->category()->associate($category)->save();

        return $category;
    }
}
