import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useQuoteRequest } from '@/components/directory/quote-request/quote-request-provider';
import { index as vehiclesIndex } from '@/routes/vehicles';
import { t } from '@/lib/i18n';

type FinishedJob = {
    proName: string;
    reviewUrl: string;
    isReviewed: boolean;
};

type AccountQuoteRequest = {
    reference: string | null;
    category: string;
    status: string;
    createdAt: string | null;
    finishedJobs: FinishedJob[];
};

type AccountBooking = {
    reference: string | null;
    vehicle: string;
    fleet: string;
    dates: string;
    status: string;
    reviewUrl: string | null;
    isReviewed: boolean;
};

const quoteStatusLabels: Record<string, string> = {
    open: 'Finding pros',
    quoted: 'Quotes received',
    accepted: 'Pro chosen',
    completed: 'Done',
    cancelled: 'Cancelled',
    expired: 'Expired',
};

const bookingStatusLabels: Record<string, string> = {
    requested: 'Waiting for the fleet',
    confirmed: 'Confirmed',
    declined: 'Declined',
    cancelled: 'Cancelled',
    completed: 'Completed',
};

export default function Account({
    customerName,
    quoteRequests,
    bookings,
}: {
    customerName: string;
    quoteRequests: AccountQuoteRequest[];
    bookings: AccountBooking[];
}) {
    const { openQuoteRequest } = useQuoteRequest();

    return (
        <>
            <Head title={t('My account')} />

            <div className="flex w-full flex-col gap-8 px-page py-10">
                <div>
                    <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">
                        {t('Hello,')} {customerName.split(' ')[0]}
                    </h1>
                    <p className="mt-1 text-body-md text-on-surface-variant">
                        {t(
                            'Your requests and hires. Review a pro once the work is done.',
                        )}
                    </p>
                </div>

                <Section title={t('Quote requests')}>
                    {quoteRequests.length === 0 ? (
                        <EmptyState
                            text="You haven't asked for quotes yet."
                            action={
                                <button
                                    type="button"
                                    onClick={() => openQuoteRequest()}
                                    className="cursor-pointer text-label-md text-primary hover:underline"
                                >
                                    {t('Get free quotes')}
                                </button>
                            }
                        />
                    ) : (
                        quoteRequests.map((request) => (
                            <Row
                                key={request.reference}
                                title={request.category}
                                meta={`${request.reference} · ${request.createdAt}`}
                                status={
                                    t(quoteStatusLabels[request.status]) ??
                                    request.status
                                }
                            >
                                {request.finishedJobs.map((job) => (
                                    <ReviewAction
                                        key={job.reviewUrl}
                                        proName={job.proName}
                                        reviewUrl={job.reviewUrl}
                                        isReviewed={job.isReviewed}
                                    />
                                ))}
                            </Row>
                        ))
                    )}
                </Section>

                <Section title={t('Vehicle hires')}>
                    {bookings.length === 0 ? (
                        <EmptyState
                            text="You haven't hired a vehicle yet."
                            action={
                                <Link
                                    href={vehiclesIndex()}
                                    className="text-label-md text-primary hover:underline"
                                >
                                    {t('Browse vehicles')}
                                </Link>
                            }
                        />
                    ) : (
                        bookings.map((booking) => (
                            <Row
                                key={booking.reference}
                                title={`${booking.vehicle} · ${booking.fleet}`}
                                meta={`${booking.reference} · ${booking.dates}`}
                                status={
                                    t(bookingStatusLabels[booking.status]) ??
                                    booking.status
                                }
                            >
                                {booking.reviewUrl && (
                                    <ReviewAction
                                        proName={booking.fleet}
                                        reviewUrl={booking.reviewUrl}
                                        isReviewed={booking.isReviewed}
                                    />
                                )}
                            </Row>
                        ))
                    )}
                </Section>
            </div>
        </>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-label-md tracking-wide text-on-surface-variant uppercase">
                {title}
            </h2>
            <div className="divide-y divide-outline-variant rounded-xl border border-outline-variant bg-surface-container-lowest">
                {children}
            </div>
        </section>
    );
}

function Row({
    title,
    meta,
    status,
    children,
}: {
    title: string;
    meta: string;
    status: string;
    children?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-label-md text-on-surface">
                    {title}
                    <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-label-sm text-on-surface-variant">
                        {status}
                    </span>
                </p>
                <p className="mt-0.5 font-mono text-label-sm text-outline">
                    {meta}
                </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">{children}</div>
        </div>
    );
}

function ReviewAction({ proName, reviewUrl, isReviewed }: FinishedJob) {
    if (isReviewed) {
        return (
            <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                <MaterialSymbol
                    name="check_circle"
                    filled
                    className="text-[18px] text-primary"
                />
                {t('You reviewed')} {proName}
            </span>
        );
    }

    return (
        <Link
            href={reviewUrl}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-label-md text-on-primary transition-opacity hover:opacity-90"
        >
            <MaterialSymbol name="star" className="text-[18px]" />
            {t('Review')} {proName}
        </Link>
    );
}

function EmptyState({ text, action }: { text: string; action: ReactNode }) {
    return (
        <div className="flex flex-col items-center gap-1 p-8 text-center">
            <p className="text-body-md text-on-surface-variant">{text}</p>
            {action}
        </div>
    );
}
