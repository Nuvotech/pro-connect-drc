<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

/**
 * The cities and communes the directory serves. Mirrors `cities` in
 * `resources/js/lib/directory-data.ts`, which the forms still use.
 */
class CitySeeder extends Seeder
{
    /**
     * @var array<string, array{region: string, latitude: float, longitude: float, communes: list<string>}>
     */
    private const CITIES = [
        'Kinshasa' => [
            'region' => 'Capitale',
            'latitude' => -4.3217,
            'longitude' => 15.3126,
            'communes' => ['Gombe', 'Ngaliema', 'Limete', 'Kintambo', 'Bandalungwa', 'Lingwala', 'Mont-Ngafula', 'Barumbu', 'Kalamu', 'Lemba', 'Masina', "N'djili"],
        ],
        'Lubumbashi' => [
            'region' => 'Haut-Katanga',
            'latitude' => -11.6609,
            'longitude' => 27.4794,
            'communes' => ['Lubumbashi', 'Kampemba', 'Kenya', 'Katuba', 'Kamalondo', 'Ruashi', 'Annexe'],
        ],
        'Goma' => ['region' => 'Nord-Kivu', 'latitude' => -1.6792, 'longitude' => 29.2228, 'communes' => ['Goma', 'Karisimbi']],
        'Kolwezi' => ['region' => 'Lualaba', 'latitude' => -10.7148, 'longitude' => 25.4667, 'communes' => ['Dilala', 'Manika']],
        'Matadi' => ['region' => 'Kongo-Central', 'latitude' => -5.8167, 'longitude' => 13.4500, 'communes' => ['Matadi', 'Mvuzi', 'Nzanza']],
        'Bukavu' => ['region' => 'Sud-Kivu', 'latitude' => -2.5083, 'longitude' => 28.8608, 'communes' => ['Ibanda', 'Kadutu', 'Bagira']],
        'Kisangani' => ['region' => 'Tshopo', 'latitude' => 0.5153, 'longitude' => 25.1910, 'communes' => ['Makiso', 'Kabondo', 'Tshopo', 'Mangobo']],
    ];

    /**
     * Seed the cities and their communes. Safe to run more than once.
     */
    public function run(): void
    {
        $sortOrder = 0;

        foreach (self::CITIES as $name => $details) {
            $city = City::updateOrCreate(
                ['name' => $name],
                [
                    'region' => $details['region'],
                    'latitude' => $details['latitude'],
                    'longitude' => $details['longitude'],
                    'sort_order' => $sortOrder++,
                ],
            );

            foreach ($details['communes'] as $commune) {
                $city->communes()->firstOrCreate(['name' => $commune]);
            }
        }
    }
}
