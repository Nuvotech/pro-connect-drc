<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A photo from a professional's work gallery.
 *
 * @property int $id
 * @property int $professional_id
 * @property string $path
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['path', 'position'])]
class ProfessionalPhoto extends Model
{
    /**
     * The most photos a professional can show in their gallery.
     */
    public const MAX_PHOTOS = 6;

    /**
     * The professional whose work this shows.
     *
     * @return BelongsTo<Professional, $this>
     */
    public function professional(): BelongsTo
    {
        return $this->belongsTo(Professional::class);
    }
}
