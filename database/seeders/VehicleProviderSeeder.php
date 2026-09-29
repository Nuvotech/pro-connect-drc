<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleProvider;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

/**
 * Vehicle providers: Kongo Fleet with its full photographed fleet, and a
 * smaller provider still waiting for review.
 */
class VehicleProviderSeeder extends Seeder
{
    /**
     * Seed the vehicle providers.
     */
    public function run(): void
    {
        $this->seedKongoFleet();
        $this->seedPendingProvider();
    }

    /**
     * Kongo Fleet Services, from `data/kongo-fleet.json` and the photos in
     * `images/vehicles`.
     */
    private function seedKongoFleet(): void
    {
        $data = json_decode(File::get(database_path('seeders/data/kongo-fleet.json')), true);
        $admin = User::where('email', AccountSeeder::ADMIN_EMAIL)->sole();

        $provider = new VehicleProvider(collect($data['provider'])->except(['city', 'commune'])->all());
        $provider->placeIn($data['provider']['city'], $data['provider']['commune']);
        $provider->user()->associate(User::where('email', AccountSeeder::FLEET_OWNER_EMAIL)->sole());
        $provider->onboarded_by_id = $admin->id;
        $provider->save();

        foreach ($data['vehicles'] as $vehicleData) {
            $vehicle = $provider->vehicles()->create([
                ...collect($vehicleData)->except(['category', 'photos'])->all(),
                'category_id' => Category::where('slug', $vehicleData['category'])->value('id'),
            ]);

            foreach ($vehicleData['photos'] as $angle => $file) {
                $path = "vehicles/{$vehicle->id}/{$file}";
                Storage::disk('public')->put($path, File::get(database_path("seeders/images/vehicles/{$file}")));
                $vehicle->photos()->create(['angle' => $angle, 'path' => $path]);
            }
        }

        $provider->recordDecision($admin, 'approve', notify: false);
    }

    /**
     * A new provider whose vehicles don't have photos yet.
     */
    private function seedPendingProvider(): void
    {
        $provider = VehicleProvider::factory()
            ->locatedIn('Lubumbashi', 'Kampemba')
            ->create([
                'contact_name' => 'Héritier Mwamba',
                'business_name' => 'Katanga Engins & Transport',
                'phone' => '97 310 4482',
                'email' => 'contact@katanga-engins.example',
                'registry_number' => 'CD/LSH/RCCM/19-B-02214',
                'preferred_language' => 'fr',
            ]);

        Vehicle::factory()->for($provider, 'provider')->create([
            'category_id' => Category::where('slug', 'plant-forklifts-machinery')->value('id'),
            'make' => 'Caterpillar',
            'model' => '320D Excavator',
            'year' => 2016,
            'seats' => 1,
            'driver_option' => 'with_driver',
            'daily_rate' => 480,
        ]);

        Vehicle::factory()->for($provider, 'provider')->create([
            'category_id' => Category::where('slug', 'heavy-trucks-freight')->value('id'),
            'make' => 'Howo',
            'model' => 'Sinotruk 371 Tipper',
            'year' => 2019,
            'seats' => 2,
            'payload_tonnes' => 25,
            'driver_option' => 'with_driver',
            'daily_rate' => 320,
        ]);

        $provider->submitForReview();
    }
}
