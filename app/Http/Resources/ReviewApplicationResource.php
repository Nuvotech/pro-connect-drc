<?php

namespace App\Http\Resources;

use App\Models\ListingReview;
use App\Models\Professional;
use App\Models\Vehicle;
use App\Models\VehiclePhoto;
use App\Models\VehicleProvider;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * A listing as the admin review queue shows it: who it is, what's missing,
 * the documents to check and the review history.
 *
 * @mixin Professional|VehicleProvider
 */
class ReviewApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isProfessional = $this->resource instanceof Professional;
        $type = $this->resource->getMorphClass();
        $checklist = $this->resource->completionChecklist();

        return [
            'key' => "{$type}-{$this->id}",
            'type' => $type,
            'id' => $this->id,
            'providerType' => $this->provider_type,
            'name' => $this->business_name ?? ($isProfessional ? $this->full_name : $this->contact_name),
            'contactName' => $isProfessional ? $this->full_name : $this->contact_name,
            'categories' => $isProfessional
                ? $this->categorySlugs()->all()
                : $this->vehicles->pluck('category.slug')->filter()->unique()->values()->all(),
            'phone' => $this->phone,
            'email' => $this->email,
            'city' => $this->city?->name,
            'commune' => $this->commune?->name,
            'address' => $this->address,
            'photoUrl' => $isProfessional && $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null,
            'bio' => $isProfessional ? $this->bio : null,
            'experienceYears' => $isProfessional ? $this->experience_years : null,
            'registryNumber' => $this->registry_number,
            'taxId' => $this->tax_id,
            'reviewStatus' => $this->review_status,
            'isVerified' => $this->isVerified(),
            'submittedAt' => $this->submitted_at?->format('M j, Y · H:i'),
            'submittedAgo' => $this->submitted_at?->diffForHumans(),
            'checklist' => $checklist,
            'missingCount' => collect($checklist)->where('isDone', false)->count(),
            'missingCompanyDetails' => $this->resource->missingCompanyDetails(),
            'documents' => $this->documents($type),
            'galleryCount' => $isProfessional ? $this->photos->count() : null,
            'vehicles' => $isProfessional ? [] : $this->vehicles->map(fn (Vehicle $vehicle) => [
                'id' => $vehicle->id,
                'name' => "{$vehicle->make} {$vehicle->model}",
                'category' => $vehicle->category?->slug,
                'quantity' => $vehicle->quantity,
                'photoCount' => $vehicle->photos->count(),
                'requiredPhotoCount' => count(VehiclePhoto::ANGLES),
            ])->all(),
            'detailUrl' => $isProfessional ? null : route('admin.vehicle-providers.show', $this->id),
            'reviews' => $this->reviews->map(fn (ListingReview $review) => [
                'id' => $review->id,
                'event' => $review->event,
                'message' => $review->message,
                'internalNote' => $review->internal_note,
                'reviewerName' => $review->reviewer?->name,
                'at' => $review->created_at?->format('M j, Y · H:i'),
            ])->all(),
        ];
    }

    /**
     * The private documents on file, with admin-only links to open them.
     *
     * @return list<array{key: string, label: string, isOnFile: bool, url: string|null}>
     */
    private function documents(string $type): array
    {
        $documents = [
            ['identity-document', 'ID document', $this->identity_document_path],
            ['business-registration', 'Business registration', $this->business_registration_path],
        ];

        return array_map(fn (array $document) => [
            'key' => $document[0],
            'label' => $document[1],
            'isOnFile' => $document[2] !== null,
            'url' => $document[2] !== null
                ? route('admin.listings.documents.show', ['type' => $type, 'id' => $this->id, 'document' => $document[0]])
                : null,
        ], $documents);
    }
}
