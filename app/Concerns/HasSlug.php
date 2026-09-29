<?php

namespace App\Concerns;

use Illuminate\Support\Str;

/**
 * Gives a listing a unique URL slug from its display name when it is
 * created, adding a number when the name is already taken.
 *
 * @property string|null $slug
 */
trait HasSlug
{
    /**
     * Generate the slug before the listing is first saved.
     */
    public static function bootHasSlug(): void
    {
        static::creating(function (self $model): void {
            if (filled($model->slug)) {
                return;
            }

            $base = Str::slug($model->slugSource()) ?: 'listing';
            $slug = $base;
            $suffix = 2;

            while (static::query()->where('slug', $slug)->exists()) {
                $slug = "{$base}-{$suffix}";
                $suffix++;
            }

            $model->slug = $slug;
        });
    }

    /**
     * The name the slug is built from.
     */
    abstract protected function slugSource(): string;
}
