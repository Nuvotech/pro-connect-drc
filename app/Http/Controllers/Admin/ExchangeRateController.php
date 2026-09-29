<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateExchangeRateRequest;
use App\Models\ExchangeRate;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ExchangeRateController extends Controller
{
    /**
     * Show the rate in force and the latest fetched rate.
     */
    public function edit(): Response
    {
        $latestApi = ExchangeRate::query()
            ->where('source', ExchangeRate::SOURCE_API)
            ->latest('effective_at')
            ->first();

        return Inertia::render('admin/exchange-rate', [
            'current' => ExchangeRate::shared(),
            'latestApi' => $latestApi ? [
                'rate' => $latestApi->rate,
                'updatedAt' => $latestApi->effective_at->toIso8601String(),
            ] : null,
        ]);
    }

    /**
     * Set a manual rate that overrides the fetched one.
     */
    public function update(UpdateExchangeRateRequest $request): RedirectResponse
    {
        ExchangeRate::create([
            'rate' => (float) $request->validated('rate'),
            'source' => ExchangeRate::SOURCE_MANUAL,
            'effective_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Exchange rate updated.')]);

        return to_route('admin.exchange-rate.edit');
    }

    /**
     * Drop manual rates and go back to the fetched rate.
     */
    public function destroy(): RedirectResponse
    {
        ExchangeRate::query()->where('source', ExchangeRate::SOURCE_MANUAL)->get()->each->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Using the automatic rate again.')]);

        return to_route('admin.exchange-rate.edit');
    }
}
