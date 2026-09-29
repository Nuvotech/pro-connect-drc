import type { ReviewDecision, ReviewStatus, ReviewTab } from '@/types';
import { t } from '@/lib/i18n';

export const reviewTabs: { value: ReviewTab; label: string }[] = [
    { value: 'needs_review', label: 'Needs review' },
    { value: 'changes_requested', label: 'Changes requested' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
];

export const reviewStatusLabels: Record<ReviewStatus, string> = {
    pending: 'Awaiting review',
    resubmitted: 'Resubmitted',
    changes_requested: 'Changes requested',
    approved: 'Approved',
    declined: 'Declined',
};

export const reviewEventLabels: Record<string, string> = {
    submitted: 'Submitted for review',
    resubmitted: 'Resubmitted for review',
    key_details_changed: 'Key details changed',
    approved: 'Approved',
    changes_requested: 'Changes requested',
    declined: 'Declined',
};

export const decisionOptions: {
    value: ReviewDecision;
    label: string;
    description: string;
}[] = [
    {
        value: 'approve',
        label: 'Approve',
        description: 'Verify and publish the listing',
    },
    {
        value: 'request_changes',
        label: 'Request changes',
        description: 'Tell the pro what to fix',
    },
    {
        value: 'decline',
        label: 'Decline',
        description: 'Reject, with a reason',
    },
];

/** Common reasons an admin can drop into the message to the pro. */
export const reviewReasons = [
    'The ID document is missing, expired or unreadable.',
    'The RCCM number is missing or could not be verified.',
    'Please add a clear profile photo.',
    'Please describe your services in more detail.',
    'Please add photos of your work.',
    'Some vehicles are missing required photos.',
    'Your location is outside the areas we currently serve.',
];

export const reviewQuickTags = [
    'Registry checked',
    'ID verified',
    'Called the pro',
    'Photos checked',
];

export const transmissionOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automatic' },
];

export const fuelTypeOptions = [
    { value: 'diesel', label: 'Diesel' },
    { value: 'petrol', label: 'Petrol' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'electric', label: 'Electric' },
];

export const driverOptions = [
    { value: 'self_drive', label: 'Self-drive' },
    { value: 'with_driver', label: 'With driver' },
    { value: 'both', label: 'Either' },
];

export const currencyOptions = ['USD', 'CDF'];

export function optionLabel(
    options: { value: string; label: string }[],
    value: string,
): string {
    const label = options.find((option) => option.value === value)?.label;

    return label ? t(label) : value;
}

export function formatMoney(amount: string, currency: string): string {
    const formatted = Number(amount).toLocaleString('en-US', {
        maximumFractionDigits: 2,
    });

    return currency === 'USD' ? `$${formatted}` : `${formatted} FC`;
}

export const vehiclePhotoAngles = [
    { value: 'front', label: 'Front' },
    { value: 'rear', label: 'Back' },
    { value: 'left', label: 'Left side' },
    { value: 'right', label: 'Right side' },
    { value: 'interior', label: 'Interior' },
    { value: 'engine', label: 'Engine (bonnet open)' },
];
