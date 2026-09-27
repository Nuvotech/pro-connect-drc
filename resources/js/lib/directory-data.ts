import type { BusinessCategory, Category, City, Professional } from '@/types';

/**
 * Placeholder directory content used by the public pages until the
 * backend provides real listings.
 */
export const categories: Category[] = [
    {
        slug: 'architects',
        name: 'Architects',
        nameFr: 'Architectes',
        icon: 'architecture',
        prosCount: 120,
        description:
            'Work with licensed architects and urban planners for residential and commercial projects across the DRC.',
        serviceTypes: ['Residential Design', 'Commercial Design', 'Permits'],
    },
    {
        slug: 'plumbers',
        name: 'Plumbers',
        nameFr: 'Plombiers',
        icon: 'plumbing',
        prosCount: 350,
        description:
            'Connect with trusted, verified plumbing professionals across the Democratic Republic of Congo. From emergency repairs to major installations, our network ensures reliable service backed by real client reviews.',
        serviceTypes: ['Emergency Repair', 'Installation', 'Maintenance'],
    },
    {
        slug: 'electricians',
        name: 'Electricians',
        nameFr: 'Électriciens',
        icon: 'electrical_services',
        prosCount: 280,
        description:
            'Certified electricians for wiring, solar integration and safe troubleshooting in homes and businesses.',
        serviceTypes: ['Emergency Repair', 'Installation', 'Solar'],
    },
    {
        slug: 'carpenters',
        name: 'Carpenters',
        nameFr: 'Charpentiers',
        icon: 'carpenter',
        prosCount: 150,
        description:
            'Skilled carpenters for custom furniture, cabinetry, roofing frames and finishing work.',
        serviceTypes: ['Custom Furniture', 'Installation', 'Repairs'],
    },
    {
        slug: 'painters',
        name: 'Painters',
        nameFr: 'Peintres',
        icon: 'format_paint',
        prosCount: 210,
        description:
            'Interior and exterior painters delivering clean, durable finishes for every surface.',
        serviceTypes: ['Interior', 'Exterior', 'Decorative'],
    },
    {
        slug: 'cleaners',
        name: 'Cleaners',
        nameFr: 'Nettoyeurs',
        icon: 'cleaning_services',
        prosCount: 400,
        description:
            'Reliable cleaning teams for homes, offices and post-construction sites.',
        serviceTypes: ['Home Cleaning', 'Office Cleaning', 'Deep Cleaning'],
    },
    {
        slug: 'movers',
        name: 'Movers',
        nameFr: 'Déménageurs',
        icon: 'local_shipping',
        prosCount: 90,
        description:
            'Professional movers for local and inter-city relocations, packing and storage.',
        serviceTypes: ['Local Moves', 'Long Distance', 'Packing'],
    },
    {
        slug: 'hvac',
        name: 'HVAC',
        nameFr: 'Climatisation',
        icon: 'hvac',
        prosCount: 110,
        description:
            'Air conditioning and ventilation specialists for installation, servicing and repairs.',
        serviceTypes: ['Installation', 'Maintenance', 'Emergency Repair'],
    },
];

export const businessCategories: BusinessCategory[] = [
    {
        slug: 'law-firms',
        name: 'Law Firms',
        nameFr: "Cabinets d'Avocats",
        icon: 'gavel',
        summary: 'Find reputable legal experts for business or personal needs.',
        specialties: 'Corporate Law, Dispute Resolution & Commercial Contracts',
    },
    {
        slug: 'accountants',
        name: 'Accountants',
        nameFr: 'Experts-Comptables',
        icon: 'account_balance_wallet',
        summary:
            'Verified professionals for financial management and auditing.',
        specialties: 'Bookkeeping, Tax Filing, Audits & Financial Reporting',
    },
    {
        slug: 'import-export',
        name: 'Import & Export',
        nameFr: 'Import & Export',
        icon: 'directions_boat',
        summary:
            'Specialized services for international trade and logistics in DRC.',
        specialties: 'Customs Clearance, Freight Forwarding & Trade Compliance',
    },
    {
        slug: 'consultancy',
        name: 'Consultancy',
        nameFr: 'Consultance',
        icon: 'insights',
        summary: 'Business advisory and strategy experts.',
        specialties: 'Strategy, Market Entry, Operations & Management',
    },
];

export const cities: City[] = [
    {
        name: 'Kinshasa',
        region: 'Capitale',
        communes: [
            'Gombe',
            'Ngaliema',
            'Limete',
            'Kintambo',
            'Bandalungwa',
            'Lingwala',
            'Mont-Ngafula',
            'Barumbu',
            'Kalamu',
            'Lemba',
            'Masina',
            "N'djili",
        ],
    },
    {
        name: 'Lubumbashi',
        region: 'Haut-Katanga',
        communes: [
            'Lubumbashi',
            'Kampemba',
            'Kenya',
            'Katuba',
            'Kamalondo',
            'Ruashi',
            'Annexe',
        ],
    },
    { name: 'Goma', region: 'Nord-Kivu', communes: ['Goma', 'Karisimbi'] },
    { name: 'Kolwezi', region: 'Lualaba', communes: ['Dilala', 'Manika'] },
    {
        name: 'Matadi',
        region: 'Kongo-Central',
        communes: ['Matadi', 'Mvuzi', 'Nzanza'],
    },
    {
        name: 'Bukavu',
        region: 'Sud-Kivu',
        communes: ['Ibanda', 'Kadutu', 'Bagira'],
    },
    {
        name: 'Kisangani',
        region: 'Tshopo',
        communes: ['Makiso', 'Kabondo', 'Tshopo', 'Mangobo'],
    },
];

const images = '/images/directory';

export const professionals: Professional[] = [
    {
        slug: 'jean-pierre-kamba',
        name: 'Jean-Pierre Kamba',
        title: 'Master Architect & Urban Planner',
        categorySlug: 'architects',
        serviceTypes: ['Residential Design', 'Commercial Design', 'Permits'],
        photo: `${images}/pro-jean-pierre.jpg`,
        cover: `${images}/profile-cover.jpg`,
        commune: 'Gombe',
        city: 'Kinshasa',
        rating: 4.8,
        reviewsCount: 42,
        summary:
            'Sustainable residential and commercial architecture harmonising modern aesthetics with local climate.',
        tags: ['Residential', 'Commercial'],
        isVerified: true,
        experienceYears: 12,
        serviceArea: 'Kinshasa & Region',
        startingRate: '$150/hr',
        phone: '+243812345678',
        about: [
            'With over a decade of experience designing residential and commercial spaces across the Democratic Republic of the Congo, I specialize in sustainable architecture that harmonizes modern aesthetics with local climatic conditions. My firm is dedicated to delivering high-quality, reliable structural designs that stand the test of time.',
            "I believe in transparent communication, strict adherence to safety standards, and working closely with clients to bring their vision to life while respecting budget and timeline constraints. Whether it's a modern family home in Gombe or a commercial complex in Limete, my team ensures excellence at every phase.",
        ],
        projects: [
            `${images}/project-villa.jpg`,
            `${images}/project-office.jpg`,
            `${images}/project-staircase.jpg`,
        ],
    },
    {
        slug: 'jean-paul-k',
        name: 'Jean-Paul K.',
        title: 'Master Plumber',
        categorySlug: 'plumbers',
        serviceTypes: ['Emergency Repair', 'Installation'],
        photo: `${images}/pro-jean-paul.jpg`,
        cover: `${images}/profile-cover.jpg`,
        commune: 'Limete',
        city: 'Kinshasa',
        rating: 4.6,
        reviewsCount: 48,
        summary:
            'Experienced plumber serving Kinshasa for over 10 years. Fast and reliable service.',
        tags: ['Dépannage', 'Installation'],
        isVerified: true,
        experienceYears: 10,
        serviceArea: 'Kinshasa',
        startingRate: '$25/hr',
        phone: '+243812345601',
        about: [
            'Experienced plumber serving Kinshasa for over 10 years. Fast and reliable service for leaks, blockages and new installations.',
        ],
        projects: [],
    },
    {
        slug: 'marie-t',
        name: 'Marie T.',
        title: 'Electrician',
        categorySlug: 'electricians',
        serviceTypes: ['Installation', 'Emergency Repair'],
        photo: `${images}/pro-marie-t.jpg`,
        cover: `${images}/profile-cover.jpg`,
        commune: 'Ngaliema',
        city: 'Kinshasa',
        rating: 5,
        reviewsCount: 92,
        summary:
            'Specializing in residential wiring and smart home installations. Fully certified.',
        tags: ['Wiring', 'Smart Home'],
        isVerified: true,
        experienceYears: 8,
        serviceArea: 'Kinshasa',
        startingRate: '$30/hr',
        phone: '+243812345602',
        about: [
            'Specializing in residential wiring and smart home installations. Fully certified and insured for residential and light commercial work.',
        ],
        projects: [],
    },
    {
        slug: 'david-m',
        name: 'David M.',
        title: 'Carpenter',
        categorySlug: 'carpenters',
        serviceTypes: ['Custom Furniture', 'Repairs'],
        photo: `${images}/pro-david-m.jpg`,
        cover: `${images}/profile-cover.jpg`,
        commune: 'Kintambo',
        city: 'Kinshasa',
        rating: 4,
        reviewsCount: 24,
        summary:
            'Custom furniture and cabinetry. High attention to detail and quality finishes.',
        tags: ['Furniture', 'Cabinetry'],
        isVerified: false,
        experienceYears: 6,
        serviceArea: 'Kinshasa',
        startingRate: '$20/hr',
        phone: '+243812345603',
        about: [
            'Custom furniture and cabinetry with high attention to detail and quality finishes.',
        ],
        projects: [],
    },
    {
        slug: 'jean-claude-t',
        name: 'Jean-Claude T.',
        title: 'Master Plumber',
        categorySlug: 'plumbers',
        serviceTypes: ['Emergency Repair', 'Installation', 'Maintenance'],
        photo: `${images}/pro-jean-claude.jpg`,
        cover: `${images}/profile-cover.jpg`,
        commune: 'Gombe',
        city: 'Kinshasa',
        rating: 4.9,
        reviewsCount: 128,
        summary:
            'Experienced in residential and commercial plumbing installations, leak repairs, and modernizing water systems with 10+ years in the Gombe area.',
        tags: ['Commercial', 'Leak Repair'],
        isVerified: true,
        experienceYears: 11,
        serviceArea: 'Kinshasa',
        startingRate: '$30/hr',
        phone: '+243812345604',
        about: [
            'Experienced in residential and commercial plumbing installations, leak repairs, and modernizing water systems with 10+ years in the Gombe area.',
        ],
        projects: [],
    },
    {
        slug: 'marie-k',
        name: 'Marie K.',
        title: 'Certified Electrician',
        categorySlug: 'electricians',
        serviceTypes: ['Solar', 'Installation'],
        photo: `${images}/pro-marie-k.jpg`,
        cover: `${images}/profile-cover.jpg`,
        commune: 'Kampemba',
        city: 'Lubumbashi',
        rating: 4.7,
        reviewsCount: 84,
        summary:
            'Specializing in smart home wiring, solar panel integration, and safe electrical troubleshooting for modern DRC homes.',
        tags: ['Solar', 'Smart Home'],
        isVerified: true,
        experienceYears: 9,
        serviceArea: 'Lubumbashi',
        startingRate: '$28/hr',
        phone: '+243812345605',
        about: [
            'Specializing in smart home wiring, solar panel integration, and safe electrical troubleshooting for modern DRC homes.',
        ],
        projects: [],
    },
    {
        slug: 'jean-marc-t',
        name: 'Jean-Marc T.',
        title: 'Plumber',
        categorySlug: 'plumbers',
        serviceTypes: ['Emergency Repair', 'Installation'],
        photo: `${images}/pro-jean-marc.jpg`,
        cover: `${images}/profile-cover.jpg`,
        commune: 'Gombe',
        city: 'Kinshasa',
        rating: 4.9,
        reviewsCount: 124,
        summary:
            "Spécialiste en plomberie résidentielle et commerciale. Plus de 10 ans d'expérience dans les installations complexes et urgences.",
        tags: ['Dépannage', 'Installation'],
        isVerified: true,
        experienceYears: 10,
        serviceArea: 'Kinshasa',
        startingRate: '$25/hr',
        phone: '+243812345606',
        about: [
            "Spécialiste en plomberie résidentielle et commerciale. Plus de 10 ans d'expérience dans les installations complexes et urgences.",
        ],
        projects: [],
    },
    {
        slug: 'aline-m',
        name: 'Aline M.',
        title: 'Plumber',
        categorySlug: 'plumbers',
        serviceTypes: ['Maintenance', 'Emergency Repair'],
        photo: `${images}/pro-aline.jpg`,
        cover: `${images}/profile-cover.jpg`,
        commune: 'Lubumbashi',
        city: 'Lubumbashi',
        rating: 4.7,
        reviewsCount: 89,
        summary:
            "Expertise en systèmes de pompage d'eau et entretien préventif. Intervention rapide garantie dans tout Lubumbashi.",
        tags: ['Pompes à Eau', 'Maintenance'],
        isVerified: true,
        experienceYears: 12,
        serviceArea: 'Lubumbashi',
        startingRate: '$22/hr',
        phone: '+243812345607',
        about: [
            "Expertise en systèmes de pompage d'eau et entretien préventif. Intervention rapide garantie dans tout Lubumbashi.",
        ],
        projects: [],
    },
    {
        slug: 'proaqua-services',
        name: 'ProAqua Services',
        title: 'Plumbing Contractor',
        categorySlug: 'plumbers',
        serviceTypes: ['Installation', 'Maintenance'],
        photo: `${images}/pro-proaqua.jpg`,
        cover: `${images}/profile-cover.jpg`,
        commune: 'Karisimbi',
        city: 'Goma',
        rating: 4.8,
        reviewsCount: 210,
        summary:
            "Une équipe de professionnels dédiée aux grands projets et à l'installation de systèmes de chauffage d'eau solaires.",
        tags: ['Commercial', 'Chauffe-eau'],
        isVerified: true,
        experienceYears: 15,
        serviceArea: 'Goma & Nord-Kivu',
        startingRate: '$40/hr',
        phone: '+243812345608',
        about: [
            "Une équipe de professionnels dédiée aux grands projets et à l'installation de systèmes de chauffage d'eau solaires.",
        ],
        projects: [],
    },
];

export const topRatedProfessionalSlugs = ['jean-paul-k', 'marie-t', 'david-m'];

export function findCategory(slug: string | null | undefined) {
    return categories.find((category) => category.slug === slug);
}

export function findBusinessCategory(slug: string | null | undefined) {
    return businessCategories.find((category) => category.slug === slug);
}

export function findProfessional(slug: string | null | undefined) {
    return professionals.find((professional) => professional.slug === slug);
}

export function findCity(name: string | null | undefined) {
    return cities.find((city) => city.name === name);
}
