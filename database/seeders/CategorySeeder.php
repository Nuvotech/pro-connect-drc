<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

/**
 * Trades, business services and vehicle types. Mirrors `categories`,
 * `businessCategories` and `vehicleRentalCategories` in
 * `resources/js/lib/directory-data.ts`; the slugs must stay identical.
 */
class CategorySeeder extends Seeder
{
    /**
     * @var array<string, list<array<string, string>>>
     */
    private const CATEGORIES = [
        Category::GROUP_TRADE => [
            ['slug' => 'architects', 'name' => 'Architects', 'name_fr' => 'Architectes', 'icon' => 'architecture', 'summary' => 'Residential Design, Commercial Design, Permits', 'description' => 'Work with licensed architects and urban planners for residential and commercial projects across the DRC.'],
            ['slug' => 'plumbers', 'name' => 'Plumbers', 'name_fr' => 'Plombiers', 'icon' => 'plumbing', 'summary' => 'Emergency Repair, Installation, Maintenance', 'description' => 'Connect with trusted, verified plumbing professionals across the Democratic Republic of Congo. From emergency repairs to major installations, our network ensures reliable service backed by real client reviews.'],
            ['slug' => 'electricians', 'name' => 'Electricians', 'name_fr' => 'Électriciens', 'icon' => 'electrical_services', 'summary' => 'Emergency Repair, Installation, Solar', 'description' => 'Certified electricians for wiring, solar integration and safe troubleshooting in homes and businesses.'],
            ['slug' => 'carpenters', 'name' => 'Carpenters', 'name_fr' => 'Charpentiers', 'icon' => 'carpenter', 'summary' => 'Custom Furniture, Installation, Repairs', 'description' => 'Skilled carpenters for custom furniture, cabinetry, roofing frames and finishing work.'],
            ['slug' => 'painters', 'name' => 'Painters', 'name_fr' => 'Peintres', 'icon' => 'format_paint', 'summary' => 'Interior, Exterior, Decorative', 'description' => 'Interior and exterior painters delivering clean, durable finishes for every surface.'],
            ['slug' => 'cleaners', 'name' => 'Cleaners', 'name_fr' => 'Nettoyeurs', 'icon' => 'cleaning_services', 'summary' => 'Home Cleaning, Office Cleaning, Deep Cleaning', 'description' => 'Reliable cleaning teams for homes, offices and post-construction sites.'],
            ['slug' => 'movers', 'name' => 'Movers', 'name_fr' => 'Déménageurs', 'icon' => 'local_shipping', 'summary' => 'Local Moves, Long Distance, Packing', 'description' => 'Professional movers for local and inter-city relocations, packing and storage.'],
            ['slug' => 'hvac', 'name' => 'HVAC', 'name_fr' => 'Climatisation', 'icon' => 'hvac', 'summary' => 'Installation, Maintenance, Emergency Repair', 'description' => 'Air conditioning and ventilation specialists for installation, servicing and repairs.'],
            ['slug' => 'masons', 'name' => 'Masons', 'name_fr' => 'Maçons', 'icon' => 'foundation', 'summary' => 'Foundations, block walls, fences, concrete slabs'],
            ['slug' => 'tilers', 'name' => 'Tilers', 'name_fr' => 'Carreleurs', 'icon' => 'grid_view', 'summary' => 'Floor and wall tiling, terrazzo, finishing'],
            ['slug' => 'roofers', 'name' => 'Roofers', 'name_fr' => 'Couvreurs', 'icon' => 'roofing', 'summary' => 'Iron-sheet roofs, leaks, gutters, ceilings'],
            ['slug' => 'plasterers', 'name' => 'Plasterers', 'name_fr' => 'Plâtriers', 'icon' => 'format_paint', 'summary' => 'Plastering, rendering, false ceilings'],
            ['slug' => 'welders', 'name' => 'Welders & metalworkers', 'name_fr' => 'Soudeurs & ferronniers', 'icon' => 'hardware', 'summary' => 'Gates, burglar bars, metal frames, repairs'],
            ['slug' => 'glaziers', 'name' => 'Glaziers & aluminium joinery', 'name_fr' => 'Vitriers & menuiserie aluminium', 'icon' => 'window', 'summary' => 'Windows, glass doors, aluminium frames'],
            ['slug' => 'locksmiths', 'name' => 'Locksmiths', 'name_fr' => 'Serruriers', 'icon' => 'key', 'summary' => 'Locks, keys, safes and emergency openings'],
            ['slug' => 'civil-engineers', 'name' => 'Civil engineers', 'name_fr' => 'Ingénieurs en génie civil', 'icon' => 'engineering', 'summary' => 'Structural design, site supervision, building studies'],
            ['slug' => 'surveyors', 'name' => 'Surveyors', 'name_fr' => 'Géomètres', 'icon' => 'straighten', 'summary' => 'Land surveys, plot boundaries, topography'],
            ['slug' => 'interior-designers', 'name' => 'Interior designers', 'name_fr' => "Décorateurs d'intérieur", 'icon' => 'chair', 'summary' => 'Interior layout, furnishing and decoration'],
            ['slug' => 'upholsterers', 'name' => 'Upholsterers', 'name_fr' => 'Tapissiers', 'icon' => 'weekend', 'summary' => 'Sofas, chairs, car seats and curtains'],
            ['slug' => 'borehole-drilling', 'name' => 'Borehole drilling & water pumps', 'name_fr' => 'Forage & pompes à eau', 'icon' => 'water_drop', 'summary' => 'Boreholes, pumps, water tanks and towers'],
            ['slug' => 'solar-installers', 'name' => 'Solar installers', 'name_fr' => 'Installateurs solaires', 'icon' => 'solar_power', 'summary' => 'Solar panels, inverters and batteries'],
            ['slug' => 'generator-technicians', 'name' => 'Generator technicians', 'name_fr' => 'Techniciens groupes électrogènes', 'icon' => 'bolt', 'summary' => 'Generator servicing, repairs and installation'],
            ['slug' => 'refrigeration-technicians', 'name' => 'Refrigeration technicians', 'name_fr' => 'Frigoristes', 'icon' => 'ac_unit', 'summary' => 'Fridges, freezers and cold rooms'],
            ['slug' => 'auto-mechanics', 'name' => 'Auto mechanics', 'name_fr' => 'Mécaniciens auto', 'icon' => 'car_repair', 'summary' => 'Engine, brakes, suspension and diagnostics'],
            ['slug' => 'motorcycle-mechanics', 'name' => 'Motorcycle mechanics', 'name_fr' => 'Mécaniciens moto', 'icon' => 'two_wheeler', 'summary' => 'Motorbike and moto-taxi servicing'],
            ['slug' => 'appliance-repair', 'name' => 'Appliance repair', 'name_fr' => 'Réparation électroménager', 'icon' => 'kitchen', 'summary' => 'Washing machines, cookers, TVs and more'],
            ['slug' => 'phone-repair', 'name' => 'Phone repair', 'name_fr' => 'Réparation de téléphones', 'icon' => 'smartphone', 'summary' => 'Screens, batteries, charging ports'],
            ['slug' => 'computer-repair', 'name' => 'Computer repair', 'name_fr' => 'Informatique & dépannage', 'icon' => 'computer', 'summary' => 'Laptops, desktops, printers and networks'],
            ['slug' => 'cctv-installers', 'name' => 'CCTV & alarm installers', 'name_fr' => 'Vidéosurveillance & alarmes', 'icon' => 'videocam', 'summary' => 'Cameras, alarms, access control'],
            ['slug' => 'satellite-installers', 'name' => 'Satellite TV installers', 'name_fr' => 'Installateurs de paraboles', 'icon' => 'satellite_alt', 'summary' => 'Dishes, decoders and TV installation'],
            ['slug' => 'gardeners', 'name' => 'Gardeners & landscapers', 'name_fr' => 'Jardiniers & paysagistes', 'icon' => 'yard', 'summary' => 'Garden care, lawns, trees and landscaping'],
            ['slug' => 'pest-control', 'name' => 'Pest control & fumigation', 'name_fr' => 'Désinsectisation & dératisation', 'icon' => 'pest_control', 'summary' => 'Mosquitoes, cockroaches, rats and termites'],
            ['slug' => 'laundry', 'name' => 'Laundry & dry cleaning', 'name_fr' => 'Pressing & blanchisserie', 'icon' => 'local_laundry_service', 'summary' => 'Washing, ironing and dry cleaning'],
            ['slug' => 'domestic-workers', 'name' => 'Domestic workers & nannies', 'name_fr' => 'Ménagères & nounous', 'icon' => 'family_restroom', 'summary' => 'Housekeeping, cooking and childcare'],
            ['slug' => 'tailors', 'name' => 'Tailors & seamstresses', 'name_fr' => 'Tailleurs & couturières', 'icon' => 'checkroom', 'summary' => 'Made-to-measure clothes, pagne, alterations'],
            ['slug' => 'hairdressers', 'name' => 'Hairdressers & barbers', 'name_fr' => 'Coiffeurs & barbiers', 'icon' => 'content_cut', 'summary' => 'Haircuts, braids, extensions, home visits'],
            ['slug' => 'beauticians', 'name' => 'Beauticians', 'name_fr' => 'Esthéticiennes', 'icon' => 'face', 'summary' => 'Make-up, nails, skincare'],
            ['slug' => 'private-tutors', 'name' => 'Private tutors', 'name_fr' => 'Répétiteurs', 'icon' => 'school', 'summary' => 'Home tutoring, exam preparation, languages'],
            ['slug' => 'waste-collection', 'name' => 'Waste collection', 'name_fr' => 'Ramassage des déchets', 'icon' => 'delete', 'summary' => 'Household and site waste removal'],
            ['slug' => 'caterers', 'name' => 'Caterers', 'name_fr' => 'Traiteurs', 'icon' => 'restaurant', 'summary' => 'Weddings, events and office catering'],
            ['slug' => 'photographers', 'name' => 'Photographers & videographers', 'name_fr' => 'Photographes & vidéastes', 'icon' => 'photo_camera', 'summary' => 'Weddings, events, portraits and drone shots'],
            ['slug' => 'event-decorators', 'name' => 'Event decorators', 'name_fr' => 'Décoration événementielle', 'icon' => 'celebration', 'summary' => 'Weddings, parties, tents and lighting'],
        ],
        Category::GROUP_BUSINESS => [
            ['slug' => 'law-firms', 'name' => 'Law Firms', 'name_fr' => "Cabinets d'Avocats", 'icon' => 'gavel', 'summary' => 'Find reputable legal experts for business or personal needs.', 'description' => 'Corporate Law, Dispute Resolution & Commercial Contracts'],
            ['slug' => 'accountants', 'name' => 'Accountants', 'name_fr' => 'Experts-Comptables', 'icon' => 'account_balance_wallet', 'summary' => 'Verified professionals for financial management and auditing.', 'description' => 'Bookkeeping, Tax Filing, Audits & Financial Reporting'],
            ['slug' => 'import-export', 'name' => 'Import & Export', 'name_fr' => 'Import & Export', 'icon' => 'directions_boat', 'summary' => 'Specialized services for international trade and logistics in DRC.', 'description' => 'Customs Clearance, Freight Forwarding & Trade Compliance'],
            ['slug' => 'consultancy', 'name' => 'Consultancy', 'name_fr' => 'Consultance', 'icon' => 'insights', 'summary' => 'Business advisory and strategy experts.', 'description' => 'Strategy, Market Entry, Operations & Management'],
            ['slug' => 'notaries', 'name' => 'Notaries', 'name_fr' => 'Notaires', 'icon' => 'history_edu', 'summary' => 'Deeds, property transfers and certified documents.'],
            ['slug' => 'tax-advisers', 'name' => 'Tax advisers', 'name_fr' => 'Conseillers fiscaux', 'icon' => 'receipt_long', 'summary' => 'DGI filings, tax planning and disputes.'],
            ['slug' => 'customs-agents', 'name' => 'Customs agents', 'name_fr' => 'Déclarants en douane', 'icon' => 'inventory_2', 'summary' => 'DGDA declarations and clearance at ports and borders.'],
            ['slug' => 'logistics', 'name' => 'Logistics & freight forwarding', 'name_fr' => 'Transit & logistique', 'icon' => 'local_shipping', 'summary' => 'Freight, warehousing and delivery across the DRC.'],
            ['slug' => 'company-registration', 'name' => 'Company registration services', 'name_fr' => "Création d'entreprise", 'icon' => 'domain_add', 'summary' => 'RCCM, Id. Nat and Guichet Unique formalities.'],
            ['slug' => 'recruitment', 'name' => 'HR & recruitment', 'name_fr' => 'Recrutement & RH', 'icon' => 'groups', 'summary' => 'Hiring, payroll and staff outsourcing.'],
            ['slug' => 'security-companies', 'name' => 'Security companies', 'name_fr' => 'Sociétés de gardiennage', 'icon' => 'security', 'summary' => 'Guards, patrols and site security.'],
            ['slug' => 'insurance-brokers', 'name' => 'Insurance brokers', 'name_fr' => 'Courtiers en assurance', 'icon' => 'shield', 'summary' => 'Vehicle, property, health and business cover.'],
            ['slug' => 'real-estate-agents', 'name' => 'Real estate agents', 'name_fr' => 'Agences immobilières', 'icon' => 'real_estate_agent', 'summary' => 'Buying, selling and renting property.'],
            ['slug' => 'property-management', 'name' => 'Property management', 'name_fr' => 'Gestion immobilière', 'icon' => 'apartment', 'summary' => 'Rent collection, tenants and maintenance.'],
            ['slug' => 'it-services', 'name' => 'IT services & software', 'name_fr' => 'Services informatiques', 'icon' => 'dns', 'summary' => 'Networks, software, hosting and IT support.'],
            ['slug' => 'digital-marketing', 'name' => 'Digital marketing & web design', 'name_fr' => 'Marketing digital & sites web', 'icon' => 'campaign', 'summary' => 'Websites, social media and online advertising.'],
            ['slug' => 'printing', 'name' => 'Printing & branding', 'name_fr' => 'Imprimerie & signalétique', 'icon' => 'print', 'summary' => 'Printing, banners, signage and branded goods.'],
            ['slug' => 'translation', 'name' => 'Translation & interpreting', 'name_fr' => 'Traduction & interprétariat', 'icon' => 'translate', 'summary' => 'French, English, Lingala, Swahili and more.'],
            ['slug' => 'engineering-offices', 'name' => 'Engineering & design offices', 'name_fr' => "Bureaux d'études", 'icon' => 'design_services', 'summary' => 'Technical studies, plans and project management.'],
            ['slug' => 'mining-services', 'name' => 'Mining services', 'name_fr' => 'Services miniers', 'icon' => 'landscape', 'summary' => 'Exploration support, permits and mine services.'],
            ['slug' => 'environmental-consulting', 'name' => 'Environmental & HSE consulting', 'name_fr' => 'Études environnementales & HSE', 'icon' => 'eco', 'summary' => 'Impact studies, ACE approvals and safety.'],
            ['slug' => 'professional-training', 'name' => 'Professional training', 'name_fr' => 'Formation professionnelle', 'icon' => 'school', 'summary' => 'Staff training, workshops and certification.'],
            ['slug' => 'event-management', 'name' => 'Event management', 'name_fr' => "Organisation d'événements", 'icon' => 'event', 'summary' => 'Conferences, launches and corporate events.'],
            ['slug' => 'travel-agencies', 'name' => 'Travel agencies', 'name_fr' => 'Agences de voyage', 'icon' => 'flight', 'summary' => 'Flights, visas, hotels and group travel.'],
        ],
        Category::GROUP_VEHICLE => [
            ['slug' => 'heavy-trucks-freight', 'name' => 'Heavy Trucks & Freight', 'name_fr' => 'Poids lourds & fret', 'icon' => 'rv_hookup', 'tagline' => 'Commercial Haulage & Logistics', 'summary' => 'Tippers, semi-trailers & flatbeds'],
            ['slug' => 'pick-ups-4x4s', 'name' => 'Pick-ups & 4x4s', 'name_fr' => 'Pick-ups & 4x4', 'icon' => 'directions_car', 'tagline' => 'All-Terrain & Utility Pick-ups', 'summary' => 'Double cab, rugged terrain & field missions'],
            ['slug' => 'minibuses-buses', 'name' => 'Minibuses & Buses', 'name_fr' => 'Minibus & bus', 'icon' => 'directions_bus', 'tagline' => 'Passenger & Staff Shuttles', 'summary' => '15 to 30 seats, staff & passenger shuttles'],
            ['slug' => 'vans-light-cargo', 'name' => 'Vans & Light Cargo', 'name_fr' => 'Fourgons & utilitaires', 'icon' => 'local_shipping', 'tagline' => 'Vans & Urban Logistics', 'summary' => 'Urban deliveries & moving services'],
            ['slug' => 'plant-forklifts-machinery', 'name' => 'Plant, Forklifts & Machinery', 'name_fr' => 'Engins, chariots & machines', 'icon' => 'forklift', 'tagline' => 'Heavy Site Machinery', 'summary' => 'Telehandlers & construction site equipment'],
            ['slug' => 'chauffeur-driven-vip', 'name' => 'Chauffeur-Driven & VIP', 'name_fr' => 'Avec chauffeur & VIP', 'icon' => 'shield_person', 'tagline' => 'Executive Escort & Security', 'summary' => 'Luxury sedans & secure executive SUVs'],
        ],
    ];

    /**
     * The services most in demand in the DRC, in the order the home page
     * shows them until real search counts take over.
     *
     * @var list<string>
     */
    private const FEATURED = [
        'electricians',
        'plumbers',
        'masons',
        'auto-mechanics',
        'solar-installers',
        'generator-technicians',
        'carpenters',
        'phone-repair',
    ];

    /**
     * Seed every category. Safe to run more than once.
     */
    public function run(): void
    {
        foreach (self::CATEGORIES as $group => $categories) {
            foreach ($categories as $sortOrder => $category) {
                Category::updateOrCreate(
                    ['slug' => $category['slug']],
                    [
                        ...$category,
                        'group' => $group,
                        'sort_order' => $sortOrder,
                        'featured_rank' => ($rank = array_search($category['slug'], self::FEATURED, true)) === false ? null : $rank + 1,
                        'is_active' => true,
                    ],
                );
            }
        }
    }
}
