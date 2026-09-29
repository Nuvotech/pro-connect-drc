<?php

namespace App\Http\Resources;

use App\Actions\SendReviewInvitation;
use App\Models\Customer;
use App\Models\Professional;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\QuoteRequestPhoto;
use App\Models\ServiceRequest;
use App\Models\VehicleBooking;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * A quote request, business request or booking as the admin requests
 * list shows it.
 *
 * @property QuoteRequest|ServiceRequest|VehicleBooking $resource
 */
class AdminCustomerRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $item = $this->resource;

        $shared = [
            'id' => $item->id,
            'reference' => $item->reference,
            'status' => $item->status,
            'createdAt' => $item->created_at?->toIso8601String(),
            'customer' => $this->customer($item->customer),
        ];

        return match (true) {
            $item instanceof QuoteRequest => [
                ...$shared,
                'kind' => 'quote',
                'category' => $item->category->name,
                'serviceType' => $item->service_type,
                'timing' => $item->timing,
                'description' => $item->description,
                'location' => trim(implode(', ', array_filter([$item->address, $item->commune?->name, $item->city?->name])), ', '),
                'needsSiteVisit' => $item->needs_site_visit,
                'photos' => $item->photos->map(fn (QuoteRequestPhoto $photo) => Storage::disk('public')->url($photo->path))->all(),
                'requestedProfessional' => $item->requestedProfessional ? $this->professional($item->requestedProfessional) : null,
                'quotes' => $item->quotes->map(fn (Quote $quote) => [
                    'id' => $quote->id,
                    'status' => $quote->status,
                    'amount' => $quote->amount,
                    'currency' => $quote->currency,
                    'professional' => $this->professional($quote->professional),
                    ...$this->reviewFollowUp($quote, $quote->status === Quote::STATUS_COMPLETED, $quote->completed_at),
                ])->all(),
                'candidates' => $this->candidates()
                    ->map(fn (Professional $professional) => $this->professional($professional))
                    ->values()
                    ->all(),
            ],
            $item instanceof ServiceRequest => [
                ...$shared,
                'kind' => 'business',
                'category' => $item->category->name,
                'timing' => $item->timeline,
                'description' => $item->description,
                'location' => $item->city?->name ?? 'Other province',
                'hasAttachment' => $item->attachment_path !== null,
                'assignedProfessionalId' => $item->professional_id,
                'handledBy' => $item->handledBy?->name,
                'candidates' => $this->candidates()
                    ->map(fn (Professional $professional) => $this->professional($professional))
                    ->values()
                    ->all(),
            ],
            default => [
                ...$shared,
                'kind' => 'booking',
                'vehicle' => $item->vehicle ? "{$item->vehicle->make} {$item->vehicle->model}" : 'Removed vehicle',
                'fleet' => $item->vehicleProvider->business_name ?? $item->vehicleProvider->contact_name,
                'startDate' => $item->start_date->toDateString(),
                'endDate' => $item->end_date->toDateString(),
                'quantity' => $item->quantity,
                'withDriver' => $item->with_driver,
                'pickupLocation' => $item->pickup_location,
                'notes' => $item->notes,
                'estimatedTotal' => $item->estimated_total,
                'currency' => $item->currency,
                ...$this->reviewFollowUp($item, $item->status === VehicleBooking::STATUS_COMPLETED, $item->updated_at),
            ],
        };
    }

    /**
     * The review link the admin can send once a job or hire is finished.
     *
     * @return array{reviewUrl: string|null, isReviewed: bool, completedAt: string|null}
     */
    private function reviewFollowUp(Quote|VehicleBooking $job, bool $isFinished, ?CarbonInterface $finishedAt): array
    {
        $isReviewed = $job->relationLoaded('review') ? $job->review !== null : $job->review()->exists();

        return [
            'reviewUrl' => $isFinished && ! $isReviewed ? SendReviewInvitation::url($job) : null,
            'isReviewed' => $isReviewed,
            'completedAt' => $isFinished ? $finishedAt?->isoFormat('ll') : null,
        ];
    }

    /**
     * The pros the admin may pick from, attached by the controller.
     *
     * @return Collection<int, Professional>
     */
    private function candidates(): Collection
    {
        return $this->resource->relationLoaded('candidates') ? $this->resource->getRelation('candidates') : collect();
    }

    /**
     * @return array{name: string, email: string|null, phone: string, organization: string|null, channel: string}
     */
    private function customer(Customer $customer): array
    {
        return [
            'name' => $customer->full_name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'organization' => $customer->organization,
            'channel' => $customer->preferred_contact_channel,
        ];
    }

    /**
     * @return array{id: int, name: string, city: string|null, slug: string|null}
     */
    private function professional(Professional $professional): array
    {
        return [
            'id' => $professional->id,
            'name' => $professional->business_name ?? $professional->full_name,
            'city' => $professional->city?->name,
            'slug' => $professional->slug,
        ];
    }
}
