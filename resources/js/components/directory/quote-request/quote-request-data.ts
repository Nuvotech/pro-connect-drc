import type { City } from '@/types';
import { t } from '@/lib/i18n';

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
    { value: 'emergency', icon: 'build', label: 'Emergency repair' },
    { value: 'installation', icon: 'add_circle', label: 'New installation' },
    { value: 'renovation', icon: 'home_repair_service', label: 'Renovation' },
    {
        value: 'maintenance',
        icon: 'published_with_changes',
        label: 'Maintenance',
    },
];

export const timings = [
    { value: 'urgent', label: 'Within 24h' },
    { value: '48h', label: 'Within 48h' },
    { value: 'week', label: 'This week' },
    { value: 'flexible', label: 'Flexible' },
];

export const assessments = [
    {
        value: 'in_person',
        icon: 'home_repair_service',
        label: 'Site visit',
        hint: 'A pro visits to take measurements before quoting.',
    },
    {
        value: 'remote',
        icon: 'photo_library',
        label: 'Photos & description',
        hint: 'Pros quote from your description and photos.',
    },
];

export const contactChannels = [
    { value: 'whatsapp', icon: 'chat', label: 'WhatsApp' },
    { value: 'call', icon: 'call', label: 'Call' },
    { value: 'email', icon: 'alternate_email', label: 'Email' },
];

export const quoteSteps = ['Service', 'Details', 'Location', 'Contact'];

export function emptyQuoteRequest(
    categorySlug = '',
    city?: City | null,
): QuoteRequestData {
    return {
        categorySlug,
        serviceType: 'emergency',
        description: '',
        timing: 'urgent',
        photos: [],
        city: city?.name ?? 'Kinshasa',
        commune: city ? (city.communes[0] ?? '') : 'Gombe',
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
        errors.categorySlug = 'Please choose a service.';
    }

    if (step === 1) {
        const descriptionLength = data.description.trim().length;

        if (descriptionLength < descriptionMinLength) {
            errors.description = t(
                'Please describe your project in at least :descriptionMinLength characters.',
                { descriptionMinLength },
            );
        } else if (descriptionLength > descriptionMaxLength) {
            errors.description = t(
                'Please keep your description under :descriptionMaxLength characters.',
                { descriptionMaxLength },
            );
        }
    }

    if (step === 2) {
        if (!data.city) {
            errors.city = 'Please choose a city.';
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

        const email = data.email.trim();

        if (data.contactChannel === 'email' && !email) {
            errors.email =
                'Enter your email address, or choose WhatsApp or a phone call.';
        } else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address.';
        }
    }

    return errors;
}
