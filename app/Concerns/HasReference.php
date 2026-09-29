<?php

namespace App\Concerns;

/**
 * Gives each record a short public reference such as `QR-000123`, built
 * from the model's `REFERENCE_PREFIX` constant and its id.
 *
 * @property string|null $reference
 */
trait HasReference
{
    /**
     * Assign the reference as soon as the record has an id.
     */
    public static function bootHasReference(): void
    {
        static::created(function (self $model): void {
            $model->forceFill([
                'reference' => static::REFERENCE_PREFIX.'-'.str_pad((string) $model->getKey(), 6, '0', STR_PAD_LEFT),
            ])->saveQuietly();
        });
    }
}
