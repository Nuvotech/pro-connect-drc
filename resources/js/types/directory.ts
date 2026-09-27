export type Category = {
    slug: string;
    name: string;
    nameFr: string;
    icon: string;
    prosCount: number;
    description: string;
    serviceTypes: string[];
};

export type BusinessCategory = {
    slug: string;
    name: string;
    nameFr: string;
    icon: string;
    summary: string;
    specialties: string;
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
    experienceYears: number;
    serviceArea: string;
    startingRate: string;
    phone: string;
    about: string[];
    projects: string[];
};

export type City = {
    name: string;
    region: string;
    communes: string[];
};
