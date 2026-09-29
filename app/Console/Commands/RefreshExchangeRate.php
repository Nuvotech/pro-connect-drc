<?php

namespace App\Console\Commands;

use App\Models\ExchangeRate;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

#[Signature('rates:refresh')]
#[Description('Fetch the latest USD to CDF exchange rate')]
class RefreshExchangeRate extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        try {
            $rate = Http::timeout(10)
                ->retry(2, 500)
                ->get(config('services.exchange_rates.url'))
                ->throw()
                ->json('rates.CDF');
        } catch (Throwable $exception) {
            Log::warning('Exchange rate refresh failed.', ['error' => $exception->getMessage()]);
            $this->warn('Could not fetch the exchange rate; keeping the last one.');

            return self::FAILURE;
        }

        if (! is_numeric($rate) || $rate < ExchangeRate::MIN_RATE || $rate > ExchangeRate::MAX_RATE) {
            Log::warning('Exchange rate refresh returned an unexpected rate.', ['rate' => $rate]);
            $this->warn('The exchange rate API returned an unexpected rate; keeping the last one.');

            return self::FAILURE;
        }

        ExchangeRate::create([
            'rate' => (float) $rate,
            'source' => ExchangeRate::SOURCE_API,
            'effective_at' => now(),
        ]);

        $this->info('1 USD = '.number_format((float) $rate, 2).' CDF');

        return self::SUCCESS;
    }
}
