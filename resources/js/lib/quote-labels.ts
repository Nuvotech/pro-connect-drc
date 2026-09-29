/**
 * A quote invitation as the pro inbox lists it, and the labels it uses.
 */
export type QuoteSummary = {
    id: number;
    status:
        | 'invited'
        | 'viewed'
        | 'quoted'
        | 'declined'
        | 'accepted'
        | 'rejected'
        | 'completed';
    amount: string | null;
    currency: string;
    reference: string | null;
    category: string;
    serviceType: string;
    timing: string;
    location: string;
    excerpt: string;
    invitedAt: string | null;
};

export const quoteStatusLabels: Record<QuoteSummary['status'], string> = {
    invited: 'New',
    viewed: 'Waiting for your price',
    quoted: 'Price sent',
    declined: 'Declined',
    accepted: 'Accepted by client',
    rejected: 'Client chose another pro',
    completed: 'Job done',
};

export const timingLabels: Record<string, string> = {
    urgent: 'Urgent (24h)',
    '48h': 'Within 48 hours',
    week: 'This week',
    flexible: 'Flexible',
};
