export type Category = {
    slug: string;
    name: string;
    nameFr: string;
    nameEn?: string;
    icon: string;
    prosCount: number;
    description: string;
    serviceTypes: string[];
};

export type BusinessCategory = {
    slug: string;
    name: string;
    nameFr: string;
    nameEn?: string;
    icon: string;
    summary: string;
    specialties: string;
};

export type VehicleRentalCategory = {
    slug: string;
    name: string;
    tagline: string;
    icon: string;
    summary: string;
    isPremium: boolean;
};

export type Professional = {
    slug: string;
    name: string;
    title: string;
    categorySlug: string;
    serviceTypes: string[];
    photo: string;
    cover: string;
    commune: string;
    city: string;
    rating: number;
    reviewsCount: number;
    summary: string;
    tags: string[];
    isVerified: boolean;
    isCompany: boolean;
    experienceYears: number;
    serviceArea: string;
    startingRate: string;
    startingRateAmount: number | null;
    startingRateCurrency: string;
    rateUnit: 'hour' | 'day' | 'job' | null;
    phone: string;
    isOnWhatsApp?: boolean;
    about: string[];
    projects: string[];
};

/**
 * How many Congolese francs one US dollar buys.
 */
export type ExchangeRate = {
    rate: number;
    updatedAt: string;
    source: 'api' | 'manual';
};

export type City = {
    name: string;
    region: string;
    latitude: number | null;
    longitude: number | null;
    communes: string[];
};
