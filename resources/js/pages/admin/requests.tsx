import { Head, Link, router } from '@inertiajs/react';
import {
    Banknote,
    CalendarRange,
    Check,
    Download,
    Inbox,
    LoaderCircle,
    Mail,
    MapPin,
    Phone,
    Truck,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import PageHeader from '@/components/workspace/page-header';
import ReviewLinkActions from '@/components/workspace/review-link-actions';
import { formatMoney } from '@/lib/admin-data';
import { cn } from '@/lib/utils';
import { index as requestsRoute } from '@/routes/admin/requests';
import { invite as inviteRoute } from '@/routes/admin/quote-requests';
import { index as reviewsIndex } from '@/routes/admin/reviews';
import {
    attachment as attachmentRoute,
    update as updateServiceRequestRoute,
} from '@/routes/admin/service-requests';
import { dateLocale, t } from '@/lib/i18n';

type Tab = 'quotes' | 'business' | 'bookings';

type Pro = {
    id: number;
    name: string;
    city: string | null;
    slug: string | null;
};

type Customer = {
    name: string;
    email: string | null;
    phone: string;
    organization: string | null;
    channel: string;
};

type BaseRequest = {
    id: number;
    reference: string | null;
    status: string;
    createdAt: string | null;
    customer: Customer;
};

type QuoteRequestItem = BaseRequest & {
    kind: 'quote';
    category: string;
    serviceType: string;
    timing: string;
    description: string;
    location: string;
    needsSiteVisit: boolean;
    photos: string[];
    requestedProfessional: Pro | null;
    quotes: {
        id: number;
        status: string;
        amount: string | null;
        currency: string;
        professional: Pro;
        reviewUrl: string | null;
        isReviewed: boolean;
        completedAt: string | null;
    }[];
    candidates: Pro[];
};

type BusinessRequestItem = BaseRequest & {
    kind: 'business';
    category: string;
    timing: string;
    description: string;
    location: string;
    hasAttachment: boolean;
    assignedProfessionalId: number | null;
    handledBy: string | null;
    candidates: Pro[];
};

type BookingItem = BaseRequest & {
    kind: 'booking';
    vehicle: string;
    fleet: string;
    startDate: string;
    endDate: string;
    quantity: number;
    withDriver: boolean;
    pickupLocation: string | null;
    notes: string | null;
    estimatedTotal: string;
    currency: string;
    reviewUrl: string | null;
    isReviewed: boolean;
    completedAt: string | null;
};

type RequestItem = QuoteRequestItem | BusinessRequestItem | BookingItem;

const tabs: { value: Tab; label: string }[] = [
    { value: 'quotes', label: 'Quote requests' },
    { value: 'business', label: 'Business requests' },
    { value: 'bookings', label: 'Bookings' },
];

const selectClassName =
    'h-9 cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none';

function label(value: string): string {
    return t(
        value
            .replace(/_/g, ' ')
            .replace(/^\w/, (letter) => letter.toUpperCase()),
    );
}

function formatDate(value: string | null): string {
    return value
        ? new Date(value).toLocaleDateString(dateLocale(), {
              day: 'numeric',
              month: 'short',
          })
        : '—';
}

function titleOf(item: RequestItem): string {
    return item.kind === 'booking' ? item.vehicle : item.category;
}

export default function Requests({
    tab,
    status,
    selectedId,
    requests,
    counts,
    statuses,
}: {
    tab: Tab;
    status: string | null;
    selectedId: number | null;
    requests: RequestItem[];
    counts: Record<Tab, number>;
    statuses: string[];
}) {
    const [selectedRequestId, setSelectedRequestId] = useState(
        selectedId ?? requests[0]?.id ?? null,
    );
    const selectedRequest =
        requests.find((item) => item.id === selectedRequestId) ?? requests[0];

    return (
        <>
            <Head title={t('Requests')} />

            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Requests')}
                    description={t(
                        'What customers ask for. Invite pros to quote, assign firms to business requests, and follow vehicle bookings.',
                    )}
                />

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 lg:flex-row lg:items-end">
                        <nav
                            aria-label={t('Request type')}
                            className="-mb-px flex gap-6 overflow-x-auto"
                        >
                            {tabs.map((item) => (
                                <Link
                                    key={item.value}
                                    href={requestsRoute({
                                        query: { tab: item.value },
                                    })}
                                    preserveScroll
                                    aria-current={
                                        tab === item.value ? 'page' : undefined
                                    }
                                    className={cn(
                                        'flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm transition-colors duration-200',
                                        tab === item.value
                                            ? 'border-primary font-medium text-zinc-900'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-900',
                                    )}
                                >
                                    {t(item.label)}
                                    {counts[item.value] > 0 && (
                                        <span className="rounded-full bg-zinc-900 px-1.5 text-xs text-white tabular-nums">
                                            {counts[item.value]}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </nav>
                        <div className="pb-3">
                            <select
                                value={status ?? ''}
                                onChange={(event) =>
                                    router.get(
                                        requestsRoute.url(),
                                        {
                                            tab,
                                            status:
                                                event.target.value || undefined,
                                        },
                                        { preserveScroll: true },
                                    )
                                }
                                aria-label={t('Filter by status')}
                                className={selectClassName}
                            >
                                <option value="">{t('All statuses')}</option>
                                {statuses.map((option) => (
                                    <option key={option} value={option}>
                                        {label(option)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white lg:col-span-5">
                            {requests.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                                    <Inbox
                                        className="size-6 text-zinc-400"
                                        aria-hidden="true"
                                    />
                                    <p className="text-sm font-medium text-zinc-900">
                                        {t('Nothing here')}
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        {t('No requests match this filter.')}
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-zinc-100">
                                    {requests.map((item) => {
                                        const isSelected =
                                            item.id === selectedRequest?.id;

                                        return (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedRequestId(
                                                            item.id,
                                                        )
                                                    }
                                                    aria-pressed={isSelected}
                                                    className={cn(
                                                        'relative flex w-full cursor-pointer flex-col gap-1 px-5 py-4 text-left transition-colors duration-200',
                                                        isSelected
                                                            ? 'bg-zinc-50'
                                                            : 'hover:bg-zinc-50',
                                                    )}
                                                >
                                                    {isSelected && (
                                                        <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
                                                    )}
                                                    <div className="flex items-baseline justify-between gap-3">
                                                        <span className="truncate text-sm font-medium text-zinc-900">
                                                            {titleOf(item)}
                                                        </span>
                                                        <span className="shrink-0 font-mono text-xs text-zinc-500">
                                                            {item.reference}
                                                        </span>
                                                    </div>
                                                    <span className="truncate text-sm text-zinc-500">
                                                        {item.customer.name}
                                                        {item.kind !==
                                                            'booking' &&
                                                            ` · ${item.location}`}
                                                        {item.kind ===
                                                            'booking' &&
                                                            ` · ${item.fleet}`}
                                                    </span>
                                                    <span className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                                                        <StatusBadge
                                                            status={item.status}
                                                        />
                                                        {formatDate(
                                                            item.createdAt,
                                                        )}
                                                        {item.kind ===
                                                            'quote' &&
                                                            item.quotes
                                                                .length ===
                                                                0 && (
                                                                <span className="font-medium text-zinc-900">
                                                                    {t(
                                                                        '· Needs pros',
                                                                    )}
                                                                </span>
                                                            )}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        <div className="lg:col-span-7">
                            {selectedRequest ? (
                                <RequestDetail
                                    key={`${selectedRequest.kind}-${selectedRequest.id}`}
                                    item={selectedRequest}
                                />
                            ) : (
                                <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center text-sm text-zinc-500">
                                    {t('Select a request to see it.')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
            {label(status)}
        </span>
    );
}

function RequestDetail({ item }: { item: RequestItem }) {
    return (
        <article className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
            <header className="flex flex-col gap-1 p-6">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                        {titleOf(item)}
                    </h2>
                    <StatusBadge status={item.status} />
                </div>
                <p className="text-sm text-zinc-500">
                    <span className="font-mono">{item.reference}</span>{' '}
                    {t('· sent')} {formatDate(item.createdAt)}
                </p>
            </header>

            <Section title={t('Customer')}>
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <Detail icon={<Phone className="size-4" />}>
                        +243 {item.customer.phone}{' '}
                        <span className="text-xs text-zinc-500">
                            ({label(item.customer.channel)})
                        </span>
                    </Detail>
                    {item.customer.email && (
                        <Detail icon={<Mail className="size-4" />}>
                            {item.customer.email}
                        </Detail>
                    )}
                    <Detail icon={<UserRound className="size-4" />}>
                        {item.customer.name}
                        {item.customer.organization &&
                            ` · ${item.customer.organization}`}
                    </Detail>
                    {item.kind !== 'booking' && (
                        <Detail icon={<MapPin className="size-4" />}>
                            {item.location}
                        </Detail>
                    )}
                </dl>
            </Section>

            {item.kind === 'quote' && <QuoteRequestDetail item={item} />}
            {item.kind === 'business' && <BusinessRequestDetail item={item} />}
            {item.kind === 'booking' && <BookingDetail item={item} />}
        </article>
    );
}

function QuoteRequestDetail({ item }: { item: QuoteRequestItem }) {
    const invitedIds = item.quotes.map((quote) => quote.professional.id);
    const [selected, setSelected] = useState<number[]>(
        item.requestedProfessional &&
            !invitedIds.includes(item.requestedProfessional.id)
            ? [item.requestedProfessional.id]
            : [],
    );
    const [error, setError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const available = item.candidates.filter(
        (candidate) => !invitedIds.includes(candidate.id),
    );

    function toggle(id: number) {
        setSelected((previous) =>
            previous.includes(id)
                ? previous.filter((value) => value !== id)
                : [...previous, id],
        );
    }

    function invite() {
        router.post(
            inviteRoute.url(item.id),
            { professional_ids: selected },
            {
                preserveScroll: true,
                onStart: () => setIsSending(true),
                onFinish: () => setIsSending(false),
                onSuccess: () => setSelected([]),
                onError: (errors) =>
                    setError(
                        errors.professional_ids ??
                            Object.values(errors)[0] ??
                            null,
                    ),
            },
        );
    }

    return (
        <>
            <Section title={t('The job')}>
                <p className="text-sm text-zinc-500">
                    {label(item.serviceType)} · {label(item.timing)} ·{' '}
                    {item.needsSiteVisit
                        ? t('Site visit wanted')
                        : t('Remote quote')}
                </p>
                <p className="mt-2 text-sm whitespace-pre-line text-zinc-700">
                    {item.description}
                </p>
                {item.photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        {item.photos.map((photo, index) => (
                            <a
                                key={photo}
                                href={photo}
                                target="_blank"
                                rel="noreferrer"
                                className="aspect-square overflow-hidden rounded-lg bg-zinc-100"
                            >
                                <img
                                    src={photo}
                                    alt={t('Job photo :index', {
                                        index: index + 1,
                                    })}
                                    className="size-full object-cover"
                                />
                            </a>
                        ))}
                    </div>
                )}
                {item.requestedProfessional && (
                    <p className="mt-3 text-sm text-zinc-700">
                        {t('Asked for')}{' '}
                        <span className="font-medium text-zinc-900">
                            {item.requestedProfessional.name}
                        </span>
                    </p>
                )}
            </Section>

            {item.quotes.length > 0 && (
                <Section title={t('Invited pros')}>
                    <ul className="flex flex-col gap-2">
                        {item.quotes.map((quote) => (
                            <li
                                key={quote.id}
                                className="flex items-center justify-between gap-3 text-sm"
                            >
                                <span className="text-zinc-900">
                                    {quote.professional.name}
                                    <span className="text-zinc-500">
                                        {quote.professional.city &&
                                            ` · ${quote.professional.city}`}
                                    </span>
                                </span>
                                <span className="flex items-center gap-2">
                                    {quote.amount && (
                                        <span className="font-medium text-zinc-900 tabular-nums">
                                            {formatMoney(
                                                quote.amount,
                                                quote.currency,
                                            )}
                                        </span>
                                    )}
                                    <StatusBadge status={quote.status} />
                                </span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {item.quotes
                .filter((quote) => quote.completedAt)
                .map((quote) => (
                    <ReviewFollowUp
                        key={quote.id}
                        proName={quote.professional.name}
                        customer={item.customer}
                        reviewUrl={quote.reviewUrl}
                        isReviewed={quote.isReviewed}
                        completedAt={quote.completedAt}
                    />
                ))}

            <Section title={t('Invite pros to quote')}>
                {available.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                        {t('No other verified pros offer')} {item.category}{' '}
                        {t('yet.')}
                    </p>
                ) : (
                    <>
                        <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
                            {available.map((candidate) => (
                                <li key={candidate.id}>
                                    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-zinc-50">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(
                                                candidate.id,
                                            )}
                                            onChange={() =>
                                                toggle(candidate.id)
                                            }
                                            className="size-4 cursor-pointer rounded accent-primary"
                                        />
                                        <span className="flex-1 text-zinc-900">
                                            {candidate.name}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {candidate.city}
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                        {error && (
                            <p className="mt-2 text-xs font-medium text-zinc-900">
                                {error}
                            </p>
                        )}
                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={invite}
                                disabled={selected.length === 0 || isSending}
                                className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSending && (
                                    <LoaderCircle
                                        className="size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                {t('Invite')}{' '}
                                {selected.length > 0 && selected.length}{' '}
                                {selected.length === 1 ? t('pro') : t('pros')}
                            </button>
                        </div>
                    </>
                )}
            </Section>
        </>
    );
}

function BusinessRequestDetail({ item }: { item: BusinessRequestItem }) {
    const [status, setStatus] = useState(item.status);
    const [professionalId, setProfessionalId] = useState(
        item.assignedProfessionalId ? String(item.assignedProfessionalId) : '',
    );
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function save() {
        router.patch(
            updateServiceRequestRoute.url(item.id),
            {
                status,
                professional_id: professionalId || null,
            },
            {
                preserveScroll: true,
                onStart: () => setIsSaving(true),
                onFinish: () => setIsSaving(false),
                onError: (errors) => setError(Object.values(errors)[0] ?? null),
            },
        );
    }

    return (
        <>
            <Section title={t('The request')}>
                <p className="text-sm text-zinc-500">
                    {label(item.timing)}
                    {item.handledBy &&
                        t(' · handled by :handledBy', {
                            handledBy: item.handledBy,
                        })}
                </p>
                <p className="mt-2 text-sm whitespace-pre-line text-zinc-700">
                    {item.description}
                </p>
                {item.hasAttachment && (
                    <a
                        href={attachmentRoute.url(item.id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                        <Download className="size-4" aria-hidden="true" />
                        {t('Download attachment')}
                    </a>
                )}
            </Section>

            <Section title={t('Assign a firm')}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <select
                        value={professionalId}
                        onChange={(event) =>
                            setProfessionalId(event.target.value)
                        }
                        aria-label={t('Firm')}
                        className={cn(selectClassName, 'w-full')}
                    >
                        <option value="">{t('No firm yet')}</option>
                        {item.candidates.map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>
                                {candidate.name}
                                {candidate.city ? ` · ${candidate.city}` : ''}
                            </option>
                        ))}
                    </select>
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        aria-label={t('Status')}
                        className={cn(selectClassName, 'w-full')}
                    >
                        {['new', 'in_progress', 'matched', 'closed'].map(
                            (option) => (
                                <option key={option} value={option}>
                                    {label(option)}
                                </option>
                            ),
                        )}
                    </select>
                </div>
                {error && (
                    <p className="mt-2 text-xs font-medium text-zinc-900">
                        {error}
                    </p>
                )}
                <div className="mt-3 flex justify-end">
                    <button
                        type="button"
                        onClick={save}
                        disabled={isSaving}
                        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:opacity-50"
                    >
                        {isSaving ? (
                            <LoaderCircle
                                className="size-4 animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            <Check className="size-4" aria-hidden="true" />
                        )}
                        {t('Save')}
                    </button>
                </div>
            </Section>
        </>
    );
}

function BookingDetail({ item }: { item: BookingItem }) {
    return (
        <>
            <Section title={t('The booking')}>
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <Detail icon={<CalendarRange className="size-4" />}>
                        {item.startDate} → {item.endDate}
                    </Detail>
                    <Detail icon={<Truck className="size-4" />}>
                        {item.quantity} × {item.vehicle} ·{' '}
                        {item.withDriver ? t('with driver') : t('self-drive')}
                    </Detail>
                    <Detail icon={<MapPin className="size-4" />}>
                        {item.pickupLocation ?? t('No pickup location given')}
                    </Detail>
                    <Detail icon={<Banknote className="size-4" />}>
                        {formatMoney(item.estimatedTotal, item.currency)}{' '}
                        {t('estimated')}
                    </Detail>
                </dl>
                <p className="mt-3 text-sm text-zinc-500">
                    {item.fleet}{' '}
                    {t(
                        'confirms or declines this booking from their dashboard.',
                    )}
                </p>
                {item.notes && (
                    <p className="mt-2 text-sm whitespace-pre-line text-zinc-700">
                        {item.notes}
                    </p>
                )}
            </Section>
            {item.completedAt && (
                <ReviewFollowUp
                    proName={item.fleet}
                    customer={item.customer}
                    reviewUrl={item.reviewUrl}
                    isReviewed={item.isReviewed}
                    completedAt={item.completedAt}
                />
            )}
        </>
    );
}

/**
 * Once a job is done: the private review link for the admin to send the
 * customer on WhatsApp, or a note that they already reviewed.
 */
function ReviewFollowUp({
    proName,
    customer,
    reviewUrl,
    isReviewed,
    completedAt,
}: {
    proName: string;
    customer: Customer;
    reviewUrl: string | null;
    isReviewed: boolean;
    completedAt: string | null;
}) {
    return (
        <Section title={t('Review')}>
            {isReviewed ? (
                <p className="flex items-center gap-2 text-sm text-zinc-700">
                    <Check className="size-4 text-primary" aria-hidden="true" />
                    {customer.name} {t('reviewed')} {proName}.{' '}
                    <Link
                        href={reviewsIndex()}
                        className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                        {t('See reviews')}
                    </Link>
                </p>
            ) : (
                reviewUrl && (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-zinc-500">
                            {proName} {t('marked this done on')} {completedAt}.{' '}
                            {customer.email
                                ? t(
                                      'We emailed the review link. You can also send it on WhatsApp.',
                                  )
                                : t(
                                      'No email on file. Send the review link on WhatsApp.',
                                  )}
                        </p>
                        <ReviewLinkActions
                            reviewUrl={reviewUrl}
                            customerPhone={customer.phone}
                            customerName={customer.name}
                            proName={proName}
                        />
                    </div>
                )
            )}
        </Section>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="p-6">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                {title}
            </h3>
            {children}
        </section>
    );
}

function Detail({ icon, children }: { icon: ReactNode; children: ReactNode }) {
    return (
        <div className="flex items-center gap-2 text-zinc-700">
            <span
                className="flex w-4 justify-center text-zinc-400"
                aria-hidden="true"
            >
                {icon}
            </span>
            <span>{children}</span>
        </div>
    );
}
