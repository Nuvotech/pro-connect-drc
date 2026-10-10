<?php

namespace App\Http\Resources;

use App\Models\Category;
use App\Models\ProApplication;
use App\Models\ProApplicationCustomService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A pro application as the admin sign-up queue shows it.
 *
 * @mixin ProApplication
 */
class ProApplicationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'providerType' => $this->provider_type,
            'fullName' => $this->full_name,
            'businessName' => $this->business_name,
            'email' => $this->user->email,
            'isVerified' => $this->user->hasVerifiedEmail(),
            'verificationUrl' => $this->user->hasVerifiedEmail() ? null : $this->user->verificationUrl(),
            'phone' => $this->phone,
            'isOnWhatsApp' => $this->is_on_whatsapp,
            'city' => $this->city?->name,
            'commune' => $this->commune?->name,
            'description' => $this->description,
            'status' => $this->status,
            'categories' => $this->categories
                ->map(fn (Category $category) => [
                    'slug' => $category->slug,
                    'name' => $category->name,
                    'group' => $category->group,
                ])
                ->all(),
            'customServices' => $this->customServices
                ->map(fn (ProApplicationCustomService $service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'categoryName' => $service->category?->name,
                ])
                ->all(),
            'submittedAt' => $this->created_at?->toIso8601String(),
            'decidedAt' => $this->reviewed_at?->toIso8601String(),
            'decidedBy' => $this->reviewedBy?->name,
            'decisionMessage' => $this->decision_message,
        ];
    }
}
