<?php

namespace App\Http\Controllers\Pro;

use App\Http\Controllers\Controller;
use App\Models\ProApplication;
use App\Models\Professional;
use App\Models\VehicleProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show a pro their dashboard. Admins work in the admin panel instead.
     */
    public function __invoke(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return to_route('admin.applications');
        }

        if ($user->isCustomer()) {
            return to_route('home');
        }

        if (! $user->isApprovedPro()) {
            return Inertia::render('dashboard', [
                'application' => $this->applicationStatus($user->proApplication),
                'overviews' => [],
                'setup' => ['services' => false, 'vehicles' => false],
            ]);
        }

        $summary = $user->proSummary();

        return Inertia::render('dashboard', [
            'application' => null,
            'overviews' => array_values(array_filter([
                $user->professional ? $this->professionalOverview($user->professional) : null,
                $user->vehicleProvider ? $this->fleetOverview($user->vehicleProvider) : null,
            ])),
            'setup' => [
                'services' => $user->professional === null && $summary['offersServices'],
                'vehicles' => $user->vehicleProvider === null && $summary['offersVehicles'],
            ],
        ]);
    }

    /**
     * Where a pro's application stands while the dashboard is locked.
     *
     * @return array<string, mixed>|null
     */
    private function applicationStatus(?ProApplication $application): ?array
    {
        if (! $application) {
            return null;
        }

        $application->load(['categories', 'customServices']);

        return [
            'status' => $application->status,
            'services' => $application->categories->pluck('name')
                ->concat($application->customServices->pluck('name'))
                ->values()
                ->all(),
            'submittedAt' => $application->created_at?->isoFormat('ll'),
            'decisionMessage' => $application->decision_message,
        ];
    }

    /**
     * Status, checklist and stats for a service professional's listing.
     *
     * @return array<string, mixed>
     */
    private function professionalOverview(Professional $professional): array
    {
        return [
            'type' => 'professional',
            'name' => $professional->business_name ?? $professional->full_name,
            ...$professional->reviewSummary(),
            'checklist' => $professional->completionChecklist(),
            'stats' => [
                ['label' => 'Services', 'value' => (string) $professional->categories()->count()],
                ['label' => 'Experience', 'value' => $professional->experience_years !== null ? "{$professional->experience_years} yrs" : '—'],
                ['label' => 'Work photos', 'value' => (string) $professional->photos()->count()],
            ],
        ];
    }

    /**
     * Status, checklist and stats for a vehicle provider's fleet.
     *
     * @return array<string, mixed>
     */
    private function fleetOverview(VehicleProvider $provider): array
    {
        $provider->load('vehicles.photos');
        $lowestDailyRate = $provider->lowestDailyRate();

        return [
            'type' => 'vehicle_provider',
            'name' => $provider->business_name ?? $provider->contact_name,
            ...$provider->reviewSummary(),
            'checklist' => $provider->completionChecklist(),
            'firstVehicleMissingPhotosId' => $provider->firstVehicleMissingPhotos()?->id,
            'stats' => [
                ['label' => 'Vehicles', 'value' => (string) $provider->vehicles->sum('quantity')],
                ['label' => 'Models', 'value' => (string) $provider->vehicles->count()],
                ['label' => 'From / day', 'value' => $lowestDailyRate
                    ? ($lowestDailyRate['currency'] === 'USD' ? '$' : '').number_format((float) $lowestDailyRate['amount'], 0).($lowestDailyRate['currency'] === 'CDF' ? ' FC' : '')
                    : '—'],
            ],
        ];
    }
}
