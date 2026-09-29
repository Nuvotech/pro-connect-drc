<?php

namespace App\Actions;

use App\Models\Category;
use App\Models\Vehicle;
use App\Models\VehicleProvider;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Saves a vehicle and its required photos, one per angle.
 */
class SaveVehicle
{
    /**
     * Add a vehicle, with all of its photos, to a provider's fleet.
     *
     * @param  array<string, mixed>  $data  Validated vehicle fields, including `photos` keyed by angle.
     */
    public function create(VehicleProvider $provider, array $data): Vehicle
    {
        $vehicle = $provider->vehicles()->create($this->details($data));

        $this->storePhotos($vehicle, $data['photos'] ?? []);

        return $vehicle;
    }

    /**
     * Update a vehicle's details and replace any photos that were uploaded.
     *
     * @param  array<string, mixed>  $data  Validated vehicle fields; `photos` holds only the replaced angles.
     */
    public function update(Vehicle $vehicle, array $data): Vehicle
    {
        $vehicle->update($this->details($data));

        $this->storePhotos($vehicle, $data['photos'] ?? []);

        return $vehicle;
    }

    /**
     * The vehicle's own fields, with defaults for the optional counts.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function details(array $data): array
    {
        $categoryId = Category::query()->where('slug', $data['category'])->value('id');
        unset($data['photos'], $data['category']);

        return [
            ...$data,
            'category_id' => $categoryId,
            'minimum_rental_days' => $data['minimum_rental_days'] ?? 1,
            'quantity' => $data['quantity'] ?? 1,
        ];
    }

    /**
     * Store each uploaded photo, replacing the previous one for its angle.
     *
     * @param  array<string, UploadedFile>  $photos
     */
    private function storePhotos(Vehicle $vehicle, array $photos): void
    {
        foreach ($photos as $angle => $photo) {
            $existing = $vehicle->photos()->where('angle', $angle)->first();
            $path = $photo->store("vehicles/{$vehicle->id}", 'public');

            if ($existing) {
                Storage::disk('public')->delete($existing->path);
                $existing->update(['path' => $path]);

                continue;
            }

            $vehicle->photos()->create(['angle' => $angle, 'path' => $path]);
        }
    }
}
