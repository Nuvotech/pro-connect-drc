<?php

namespace App\Models;

use Database\Factories\QuoteRequestPhotoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A photo a customer attached to a quote request.
 *
 * @property int $id
 * @property int $quote_request_id
 * @property string $path
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['path', 'position'])]
class QuoteRequestPhoto extends Model
{
    /** @use HasFactory<QuoteRequestPhotoFactory> */
    use HasFactory;

    /**
     * The request the photo belongs to.
     *
     * @return BelongsTo<QuoteRequest, $this>
     */
    public function quoteRequest(): BelongsTo
    {
        return $this->belongsTo(QuoteRequest::class);
    }
}
