<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\ProApplication;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * People who applied through the join form: two waiting for review (one
 * with a service we don't list yet) and one approved who hasn't built a
 * listing. Every account's password is `password`.
 */
class ProApplicationSeeder extends Seeder
{
    /**
     * @var list<array{name: string, email: string, business_name: string|null, phone: string, city: string, commune: string, categories: list<string>, custom_services: list<string>, description: string|null, approved: bool}>
     */
    private const APPLICANTS = [
        [
            'name' => 'Josué Mwamba',
            'email' => 'josue.mwamba@example.com',
            'business_name' => null,
            'phone' => '81 330 7742',
            'city' => 'Kinshasa',
            'commune' => 'Lemba',
            'categories' => ['plumbers', 'electricians'],
            'custom_services' => [],
            'description' => 'Plumbing and electrical repairs for homes in Lemba, Limete and Matete. 6 years of experience.',
            'approved' => false,
        ],
        [
            'name' => 'Rachel Kanku',
            'email' => 'rachel@kanku-energie.example',
            'business_name' => 'Kanku Énergie & Transport',
            'phone' => '99 815 2260',
            'city' => 'Lubumbashi',
            'commune' => 'Kenya',
            'categories' => ['pick-ups-4x4s'],
            'custom_services' => ['Groupe électrogène rental'],
            'description' => 'We rent generators (20–200 kVA) and pick-ups to mining contractors around Lubumbashi.',
            'approved' => false,
        ],
        [
            'name' => 'Benjamin Lokwa',
            'email' => 'benjamin.lokwa@example.com',
            'business_name' => 'Lokwa Peinture',
            'phone' => '82 604 1193',
            'city' => 'Kinshasa',
            'commune' => 'Bandalungwa',
            'categories' => ['painters'],
            'custom_services' => [],
            'description' => null,
            'approved' => true,
        ],
    ];

    /**
     * Seed the applications.
     */
    public function run(): void
    {
        $admin = User::where('email', AccountSeeder::ADMIN_EMAIL)->sole();

        foreach (self::APPLICANTS as $index => $applicant) {
            $user = User::factory()->create([
                'name' => $applicant['name'],
                'email' => $applicant['email'],
                'password' => AccountSeeder::PASSWORD,
                'role' => User::ROLE_PRO,
            ]);

            $application = new ProApplication([
                'full_name' => $applicant['name'],
                'business_name' => $applicant['business_name'],
                'phone' => $applicant['phone'],
                'is_on_whatsapp' => true,
                'description' => $applicant['description'],
            ]);
            $application->placeIn($applicant['city'], $applicant['commune']);
            $application->user()->associate($user);
            $application->created_at = now()->subDays(3 - $index);
            $application->save();

            $application->categories()->sync(Category::idsForSlugs($applicant['categories']));

            foreach ($applicant['custom_services'] as $service) {
                $application->customServices()->create(['name' => $service]);
            }

            if ($applicant['approved']) {
                $application->load(['customServices', 'user'])->approve($admin, []);
            }
        }
    }
}
