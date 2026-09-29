<?php

namespace App\Http\Controllers\Admin;

use App\Actions\LinkProAccount;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProfessionalRequest;
use App\Models\Professional;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfessionalController extends Controller
{
    /**
     * List the professionals onboarded onto the platform.
     */
    public function index(): Response
    {
        $professionals = Professional::query()
            ->with(['categories:id,slug', 'city:id,name', 'commune:id,name'])
            ->latest()
            ->paginate(20)
            ->through(fn (Professional $professional) => [
                'id' => $professional->id,
                'fullName' => $professional->full_name,
                'businessName' => $professional->business_name,
                'categories' => $professional->categorySlugs(),
                'city' => $professional->city?->name,
                'commune' => $professional->commune?->name,
                'phone' => $professional->phone,
                'photoUrl' => $professional->photo_path
                    ? Storage::disk('public')->url($professional->photo_path)
                    : null,
                'isVerified' => $professional->isVerified(),
                'createdAt' => $professional->created_at?->toDateString(),
            ]);

        return Inertia::render('admin/professionals/index', [
            'professionals' => $professionals,
        ]);
    }

    /**
     * Show everything on file for a professional.
     */
    public function show(Professional $professional): Response
    {
        $professional->load(['categories', 'city', 'commune', 'photos', 'onboardedBy:id,name', 'user:id,email']);

        $unit = ['hour' => '/hr', 'day' => '/day', 'job' => '/job'][$professional->rate_unit] ?? '';
        $documentUrl = fn (string $document, ?string $path) => $path
            ? route('admin.listings.documents.show', ['type' => 'professional', 'id' => $professional->id, 'document' => $document])
            : null;

        return Inertia::render('admin/professionals/show', [
            'professional' => [
                'id' => $professional->id,
                'fullName' => $professional->full_name,
                'businessName' => $professional->business_name,
                'headline' => $professional->headline,
                'bio' => $professional->bio,
                'services' => $professional->categories->pluck('name')->all(),
                'phone' => $professional->phone,
                'isOnWhatsApp' => $professional->is_on_whatsapp,
                'email' => $professional->email,
                'accountEmail' => $professional->user?->email,
                'address' => $professional->address,
                'city' => $professional->city?->name,
                'commune' => $professional->commune?->name,
                'serviceArea' => $professional->service_area,
                'startingRate' => $professional->starting_rate === null
                    ? null
                    : ($professional->currency === 'CDF'
                        ? number_format((float) $professional->starting_rate).' FC'.$unit
                        : '$'.number_format((float) $professional->starting_rate).$unit),
                'experienceYears' => $professional->experience_years,
                'registryNumber' => $professional->registry_number,
                'taxId' => $professional->tax_id,
                'preferredLanguage' => $professional->preferred_language,
                'photoUrl' => $professional->photo_path ? Storage::disk('public')->url($professional->photo_path) : null,
                'gallery' => $professional->photos->map(fn ($photo) => Storage::disk('public')->url($photo->path))->all(),
                'identityDocumentUrl' => $documentUrl('identity-document', $professional->identity_document_path),
                'businessRegistrationUrl' => $documentUrl('business-registration', $professional->business_registration_path),
                'isVerified' => $professional->isVerified(),
                'verifiedAt' => $professional->verified_at?->isoFormat('ll'),
                'rating' => (float) ($professional->rating_average ?? 0),
                'reviewsCount' => (int) $professional->reviews_count,
                'quotesCount' => $professional->quotes()->count(),
                'publicUrl' => $professional->isVerified() && $professional->slug
                    ? route('professionals.show', $professional->slug)
                    : null,
                'createdAt' => $professional->created_at?->isoFormat('ll'),
                'onboardedBy' => $professional->onboardedBy?->name,
            ],
        ]);
    }

    /**
     * Show the manual onboarding form.
     */
    public function create(): Response
    {
        return Inertia::render('admin/professionals/create');
    }

    /**
     * Store a manually onboarded professional.
     */
    public function store(StoreProfessionalRequest $request, LinkProAccount $linkProAccount): RedirectResponse
    {
        $professional = new Professional($request->safe()->except([
            'photo',
            'identity_document',
            'is_verified',
        ]));

        $professional->placeIn($request->validated('city'), $request->validated('commune'));
        $professional->onboarded_by_id = $request->user()->id;

        if ($request->hasFile('photo')) {
            $professional->photo_path = $request->file('photo')->store('professionals/photos', 'public');
        }

        if ($request->hasFile('identity_document')) {
            $professional->identity_document_path = $request->file('identity_document')->store('professionals/documents', 'local');
        }

        $professional->save();
        $professional->syncCategories($request->validated('categories'));

        if ($request->boolean('is_verified')) {
            $professional->recordDecision($request->user(), 'approve', notify: false);
        } else {
            $professional->submitForReview();
        }

        if ($professional->email) {
            $linkProAccount($professional, $professional->email, $professional->full_name);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':name has been onboarded.', ['name' => $professional->full_name])]);

        return to_route('admin.professionals.index');
    }
}
