export type QuotePhoto = {
    id: string;
    file: File;
    previewUrl: string;
};

export type QuoteRequestData = {
    categorySlug: string;
    serviceType: string;
    description: string;
    timing: string;
    photos: QuotePhoto[];
    city: string;
    commune: string;
    address: string;
    assessment: string;
    fullName: string;
    phone: string;
    email: string;
    contactChannel: string;
};

export type QuoteRequestErrors = Partial<
    Record<keyof QuoteRequestData, string>
>;

export type QuoteStepProps = {
    data: QuoteRequestData;
    errors: QuoteRequestErrors;
    setField: <TKey extends keyof QuoteRequestData>(
        key: TKey,
        value: QuoteRequestData[TKey],
    ) => void;
};

export const descriptionMinLength = 30;

export const descriptionMaxLength = 500;

export const maxPhotos = 3;

export const maxPhotoBytes = 10 * 1024 * 1024;

export const serviceTypes = [
    {
        value: 'emergency',
        icon: 'build',
        label: 'Dépannage Urgent',
        caption: 'Emergency Repair',
    },
    {
        value: 'installation',
        icon: 'add_circle',
        label: 'Nouvelle Installation',
        caption: 'New Installation',
    },
    {
        value: 'renovation',
        icon: 'home_repair_service',
        label: 'Rénovation',
        caption: 'Renovation',
    },
    {
        value: 'maintenance',
        icon: 'published_with_changes',
        label: 'Maintenance',
        caption: 'Inspection Check',
    },
];

export const timings = [
    { value: 'urgent', icon: null, label: 'Urgent (24h)' },
    { value: '48h', icon: 'timer', label: 'Sous 48 heures' },
    { value: 'week', icon: 'date_range', label: 'Cette semaine' },
    { value: 'flexible', icon: 'event_upcoming', label: 'Flexible (2-4 sem.)' },
];

export const contactChannels = [
    { value: 'whatsapp', icon: 'chat', label: 'WhatsApp' },
    { value: 'call', icon: 'call', label: 'Phone Call' },
    { value: 'email', icon: 'alternate_email', label: 'Email' },
];

export const quoteSteps = [
    { label: 'Category', labelFr: 'Métier', icon: 'category' },
    {
        label: 'Project Details',
        labelFr: 'Détails du Projet',
        icon: 'assignment',
    },
    {
        label: 'Location & Site Visit',
        labelFr: 'Localisation',
        icon: 'location_on',
    },
    {
        label: 'Contact & Compare Quotes',
        labelFr: 'Coordonnées',
        icon: 'contact_phone',
    },
];

export function emptyQuoteRequest(categorySlug = ''): QuoteRequestData {
    return {
        categorySlug,
        serviceType: 'emergency',
        description: '',
        timing: 'urgent',
        photos: [],
        city: 'Kinshasa',
        commune: 'Gombe',
        address: '',
        assessment: 'in_person',
        fullName: '',
        phone: '',
        email: '',
        contactChannel: 'whatsapp',
    };
}

/**
 * Validate the fields that belong to a single step of the quote flow.
 */
export function validateQuoteStep(
    step: number,
    data: QuoteRequestData,
): QuoteRequestErrors {
    const errors: QuoteRequestErrors = {};

    if (step === 0 && !data.categorySlug) {
        errors.categorySlug =
            'Please choose a service category / Choisissez un métier.';
    }

    if (step === 1) {
        const descriptionLength = data.description.trim().length;

        if (descriptionLength < descriptionMinLength) {
            errors.description = `Please describe your project in at least ${descriptionMinLength} characters.`;
        } else if (descriptionLength > descriptionMaxLength) {
            errors.description = `Please keep your description under ${descriptionMaxLength} characters.`;
        }
    }

    if (step === 2) {
        if (!data.city) {
            errors.city = 'Please choose a city / Choisissez une ville.';
        }

        if (!data.commune) {
            errors.commune = 'Please choose a commune.';
        }
    }

    if (step === 3) {
        if (!data.fullName.trim()) {
            errors.fullName = 'Please enter your full name.';
        }

        if (data.phone.replace(/\D/g, '').length < 9) {
            errors.phone = 'Please enter a valid 9-digit phone number.';
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
            errors.email = 'Please enter a valid email address.';
        }
    }

    return errors;
}
