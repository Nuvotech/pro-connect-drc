<?php

namespace App\Http\Controllers;

use App\Models\Professional;
use App\Models\VehicleProvider;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * "My captures": the professionals and fleets a capturer has added, with
 * where each one is in review. Read-only.
 */
class CaptureController extends Controller
{
    /**
     * List the signed-in user's captures, newest first.
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $professionals = Professional::query()
            ->where('onboarded_by_id', $userId)
            ->with(['city:id,name', 'categories:id,name,name_fr'])
            ->get()
            ->map(fn (Professional $professional) => [
                'key' => "professional-{$professional->id}",
                'id' => $professional->id,
                'canEdit' => $professional->review_status !== Professional::REVIEW_APPROVED,
                'type' => 'professional',
                'name' => $professional->business_name ?? $professional->full_name,
                'detail' => $professional->categories->map->localizedName()->take(2)->join(', '),
                'city' => $professional->city?->name,
                'status' => $professional->review_status,
                'createdAt' => $professional->created_at,
            ]);

        $fleets = VehicleProvider::query()
            ->where('onboarded_by_id', $userId)
            ->with('city:id,name')
            ->withCount('vehicles')
            ->get()
            ->map(fn (VehicleProvider $provider) => [
                'key' => "vehicle_provider-{$provider->id}",
                'id' => $provider->id,
                'canEdit' => $provider->review_status !== VehicleProvider::REVIEW_APPROVED,
                'type' => 'vehicle_provider',
                'name' => $provider->business_name ?? $provider->contact_name,
                'detail' => trans_choice('{1} 1 vehicle|[2,*] :count vehicles', $provider->vehicles_count, ['count' => $provider->vehicles_count]),
                'city' => $provider->city?->name,
                'status' => $provider->review_status,
                'createdAt' => $provider->created_at,
            ]);

        $captures = $professionals->concat($fleets)
            ->sortByDesc('createdAt')
            ->values()
            ->map(fn (array $capture) => [...$capture, 'createdAt' => $capture['createdAt']?->isoFormat('ll')]);

        return Inertia::render('captures/index', [
            'captures' => $captures->all(),
        ]);
    }
}
