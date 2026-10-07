<?php

namespace App\Http\Controllers\Admin;

use App\Actions\LinkProAccount;
use App\Actions\SaveVehicle;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreVehicleProviderRequest;
use App\Http\Resources\FleetVehicleResource;
use App\Http\Resources\VehicleProviderResource;
use App\Models\VehicleProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VehicleProviderController extends Controller
{
    /**
     * List the vehicle providers and a summary of their fleets.
     */
    public function index(): Response
    {
        $providers = VehicleProvider::query()
            ->with(['vehicles:id,vehicle_provider_id,category_id,daily_rate,currency,quantity', 'vehicles.category:id,slug', 'city:id,name', 'commune:id,name'])
            ->latest()
            ->paginate(20)
            ->through(fn (VehicleProvider $provider) => [
                'id' => $provider->id,
                'contactName' => $provider->contact_name,
                'businessName' => $provider->business_name,
                'city' => $provider->city?->name,
                'commune' => $provider->commune?->name,
                'phone' => $provider->phone,
                'vehicleCount' => (int) $provider->vehicles->sum('quantity'),
                'categories' => $provider->vehicles->pluck('category.slug')->filter()->unique()->values(),
                'lowestDailyRate' => $provider->lowestDailyRate(),
                'isVerified' => $provider->isVerified(),
                'createdAt' => $provider->created_at?->toDateString(),
            ]);

        return Inertia::render('admin/vehicle-providers/index', [
            'providers' => $providers,
        ]);
    }

    /**
     * Show the vehicle provider onboarding form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/vehicle-providers/create');
    }

    /**
     * Show a vehicle provider with their full fleet.
     */
    public function show(VehicleProvider $vehicleProvider): Response
    {
        $vehicleProvider->load([
            'vehicles' => fn ($query) => $query->orderBy('category_id')->orderBy('make'),
            'vehicles.category',
            'vehicles.photos',
            'onboardedBy:id,name',
        ]);

        return Inertia::render('admin/vehicle-providers/show', [
            'provider' => VehicleProviderResource::make($vehicleProvider)->resolve(),
            'vehicles' => FleetVehicleResource::collection($vehicleProvider->vehicles)->resolve(),
        ]);
    }

    /**
     * Store a vehicle provider together with their fleet.
     */
    public function store(StoreVehicleProviderRequest $request, LinkProAccount $linkProAccount, SaveVehicle $saveVehicle): RedirectResponse
    {
        $provider = DB::transaction(function () use ($request, $saveVehicle) {
            $provider = new VehicleProvider($request->safe()->except([
                'identity_document',
                'business_registration',
                'is_verified',
                'vehicles',
            ]));

            $provider->placeIn($request->validated('city'), $request->validated('commune'));
            $provider->onboarded_by_id = $request->user()->id;
            $provider->storeVerificationDocuments($request);

            $provider->save();

            foreach ($request->validated('vehicles') as $vehicleData) {
                $saveVehicle->create($provider, $vehicleData);
            }

            if ($request->boolean('is_verified') && $request->user()->isAdmin()) {
                $provider->recordDecision($request->user(), 'approve', notify: false);
            } else {
                $provider->submitForReview();
            }

            return $provider;
        });

        if ($provider->email) {
            $linkProAccount($provider, $provider->email, $provider->contact_name);
        }

        if ($request->user()->isCapturer()) {
            Inertia::flash('toast', ['type' => 'success', 'message' => __(':name was sent for review.', ['name' => $provider->business_name ?? $provider->contact_name])]);

            return to_route('captures.index');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name has been onboarded with :count vehicles.', [
            'name' => $provider->business_name ?? $provider->contact_name,
            'count' => count($request->validated('vehicles')),
        ])]);

        return to_route('admin.vehicle-providers.index');
    }
}
