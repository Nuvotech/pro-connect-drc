<?php

namespace Database\Seeders;

use App\Models\Professional;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

/**
 * Service professionals: the plumber account waiting for review, the
 * approved sample pros shown on the public pages, and a few business firms.
 */
class ProfessionalSeeder extends Seeder
{
    /**
     * Business firms that business service requests can be matched with.
     *
     * @var list<array<string, mixed>>
     */
    private const FIRMS = [
        ['full_name' => 'Maître Sylvie Ilunga', 'business_name' => 'Ilunga & Associés', 'headline' => 'Corporate & Commercial Law', 'category' => 'law-firms', 'commune' => 'Gombe', 'experience_years' => 18, 'registry_number' => 'CD/KIN/RCCM/09-B-01287'],
        ['full_name' => 'Patrice Lukusa', 'business_name' => 'Lukusa Audit & Conseil', 'headline' => 'Chartered Accountants', 'category' => 'accountants', 'commune' => 'Gombe', 'experience_years' => 14, 'registry_number' => 'CD/KIN/RCCM/12-B-04410'],
        ['full_name' => 'Didier Kalala', 'business_name' => 'Congo Trade Logistics', 'headline' => 'Customs Clearance & Freight Forwarding', 'category' => 'import-export', 'commune' => 'Limete', 'experience_years' => 11, 'registry_number' => 'CD/KIN/RCCM/14-B-06652'],
    ];

    /**
     * Seed the professionals.
     */
    public function run(): void
    {
        $this->seedPlumber();
        $this->seedSamplePros();
        $this->seedFirms();
    }

    /**
     * Jean-Pierre Kabongo's listing, which has just been sent for review.
     */
    private function seedPlumber(): void
    {
        $professional = new Professional([
            'full_name' => 'Jean-Pierre Kabongo',
            'business_name' => 'Kabongo Plomberie & Sanitaire',
            'headline' => 'Residential & Commercial Plumber',
            'phone' => '81 402 7719',
            'is_on_whatsapp' => true,
            'email' => 'jp.kabongo@plomberie-kabongo.example',
            'address' => '27 Avenue Colonel Mondjiba',
            'service_area' => 'Kinshasa',
            'starting_rate' => 25,
            'rate_unit' => 'hour',
            'experience_years' => 9,
            'registry_number' => 'CD/KIN/RCCM/17-A-03318',
            'tax_id' => '01-17-K33180P',
            'bio' => 'Residential and commercial plumbing across Kinshasa: leak repairs, water heaters, pumps and tanks, bathroom and kitchen installations. Emergency call-outs available.',
            'preferred_language' => 'fr',
        ]);
        $professional->placeIn('Kinshasa', 'Ngaliema');
        $professional->user()->associate(User::where('email', AccountSeeder::PLUMBER_EMAIL)->sole());
        $professional->save();
        $professional->syncCategories(['plumbers']);
        $professional->submitForReview();
    }

    /**
     * The approved pros from `directory-data.ts`, with their photos.
     */
    private function seedSamplePros(): void
    {
        $pros = json_decode(File::get(database_path('seeders/data/professionals.json')), true);

        foreach ($pros as $pro) {
            $professional = new Professional([
                'full_name' => $pro['full_name'],
                'headline' => $pro['headline'],
                'phone' => $pro['phone'],
                'is_on_whatsapp' => true,
                'email' => $pro['slug'].'@pros.proconnect.example',
                'service_area' => $pro['service_area'],
                'starting_rate' => $pro['starting_rate'],
                'rate_unit' => $pro['rate_unit'],
                'experience_years' => $pro['experience_years'],
                'bio' => $pro['bio'],
                'preferred_language' => 'fr',
            ]);
            $professional->slug = $pro['slug'];
            $professional->placeIn($pro['city'], $pro['commune']);
            $professional->photo_path = $this->copyImage($pro['photo'], 'professionals/photos');
            $professional->forceFill(['verified_at' => now(), 'review_status' => Professional::REVIEW_APPROVED, 'submitted_at' => now()->subWeeks(6)]);
            $professional->save();
            $professional->syncCategories([$pro['category']]);

            foreach ($pro['projects'] as $position => $image) {
                $professional->photos()->create([
                    'path' => $this->copyImage($image, "professionals/{$professional->id}/gallery"),
                    'position' => $position,
                ]);
            }
        }
    }

    /**
     * Approved business firms.
     */
    private function seedFirms(): void
    {
        foreach (self::FIRMS as $firm) {
            $professional = new Professional([
                ...collect($firm)->except(['category', 'commune'])->all(),
                'phone' => '99'.fake()->numerify('#######'),
                'is_on_whatsapp' => true,
                'email' => str($firm['business_name'])->slug().'@firms.proconnect.example',
                'service_area' => 'Kinshasa & national',
                'bio' => "{$firm['business_name']} advises local and international companies operating in the DRC.",
                'preferred_language' => 'fr',
            ]);
            $professional->placeIn('Kinshasa', $firm['commune']);
            $professional->forceFill(['verified_at' => now(), 'review_status' => Professional::REVIEW_APPROVED, 'submitted_at' => now()->subWeeks(4)]);
            $professional->save();
            $professional->syncCategories([$firm['category']]);
        }
    }

    /**
     * Copy an image from `public/images/directory` onto the public disk.
     */
    private function copyImage(string $file, string $directory): string
    {
        $path = "{$directory}/{$file}";
        Storage::disk('public')->put($path, File::get(public_path("images/directory/{$file}")));

        return $path;
    }
}
