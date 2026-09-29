<?php

namespace App\Models;

use Database\Factories\ExchangeRateFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * How many Congolese francs one US dollar buys, either fetched from the
 * exchange-rate API or set by an admin.
 *
 * @property int $id
 * @property string $base
 * @property string $quote
 * @property float $rate
 * @property string $source
 * @property Carbon $effective_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['base', 'quote', 'rate', 'source', 'effective_at'])]
class ExchangeRate extends Model
{
    /** @use HasFactory<ExchangeRateFactory> */
    use HasFactory;

    public const SOURCE_API = 'api';

    public const SOURCE_MANUAL = 'manual';

    /**
     * The lowest and highest francs per dollar we accept, to reject typos
     * and broken API responses.
     */
    public const MIN_RATE = 500;

    public const MAX_RATE = 20000;

    private const CACHE_KEY = 'exchange-rate.current';

    /**
     * Forget the cached current rate whenever rates change.
     */
    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }

    /**
     * The rate in force: a manual rate newer than the latest fetched one
     * wins, otherwise the latest fetched rate.
     */
    public static function current(): ?self
    {
        $latestApi = static::query()->where('source', self::SOURCE_API)->latest('effective_at')->first();
        $latestManual = static::query()->where('source', self::SOURCE_MANUAL)->latest('effective_at')->first();

        if ($latestManual && (! $latestApi || $latestManual->effective_at->gte($latestApi->effective_at))) {
            return $latestManual;
        }

        return $latestApi;
    }

    /**
     * The current rate as the public pages read it, cached as plain data
     * since every page shares it.
     *
     * @return array{rate: float, updatedAt: string, source: string}|null
     */
    public static function shared(): ?array
    {
        return Cache::remember(self::CACHE_KEY, now()->addHour(), function (): ?array {
            $current = static::current();

            return $current ? [
                'rate' => $current->rate,
                'updatedAt' => $current->effective_at->toIso8601String(),
                'source' => $current->source,
            ] : null;
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rate' => 'float',
            'effective_at' => 'datetime',
        ];
    }
}
