import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Banknote,
    Briefcase,
    CalendarClock,
    Car,
    ClipboardList,
    FileCheck2,
    FileWarning,
    Inbox,
    Mail,
    Star,
    Tags,
    Truck,
    UserPlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import PageHeader from '@/components/workspace/page-header';
import { cn } from '@/lib/utils';
import { applications } from '@/routes/admin';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { edit as editExchangeRate } from '@/routes/admin/exchange-rate';
import { index as messagesIndex } from '@/routes/admin/messages';
import { index as professionalsIndex } from '@/routes/admin/professionals';
import { index as requestsIndex } from '@/routes/admin/requests';
import { index as reviewsIndex } from '@/routes/admin/reviews';
import { index as signUpsIndex } from '@/routes/admin/sign-ups';
import { index as vehicleProvidersIndex } from '@/routes/admin/vehicle-providers';
import { t } from '@/lib/i18n';

type Queues = {
    signUps: number;
    listings: number;
    quotes: number;
    business: number;
    bookings: number;
    reviews: number;
    messages: number;
};

type Directory = {
    professionals: number;
    fleets: number;
    vehicles: number;
    categories: number;
    missingDocuments: number;
};

type WaitingListing = {
    key: string;
    type: 'professional' | 'vehicle_provider';
    name: string;
    city: string | null;
    submittedAgo: string | null;
};

type RequestTab = 'quotes' | 'business' | 'bookings';

type LatestRequest = {
    id: number;
    tab: RequestTab;
    reference: string | null;
    title: string;
    customer: string;
    createdAgo: string | null;
};

type Tile = {
    label: string;
    hint: string;
    icon: LucideIcon;
    href: string;
    value: string;
    /** Draws the eye: something is waiting here. */
    isWaiting?: boolean;
};

const requestKindLabels: Record<RequestTab, string> = {
    quotes: 'Quote request',
    business: 'Business request',
    bookings: 'Booking',
};

const focusClassName =
    'focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none';

export default function AdminDashboard({
    queues,
    directory,
    waitingListings,
    latestRequests,
}: {
    queues: Queues;
    directory: Directory;
    waitingListings: WaitingListing[];
    latestRequests: LatestRequest[];
}) {
    const { auth, exchangeRate } = usePage().props;
    const firstName = auth.user.name.split(' ')[0];

    const queueTiles: Tile[] = [
        {
            label: 'Sign-ups',
            hint: 'People asking to join as pros',
            icon: UserPlus,
            href: signUpsIndex.url(),
            value: String(queues.signUps),
            isWaiting: queues.signUps > 0,
        },
        {
            label: 'Listing reviews',
            hint: 'Listings waiting for a decision',
            icon: FileCheck2,
            href: applications.url(),
            value: String(queues.listings),
            isWaiting: queues.listings > 0,
        },
        {
            label: 'Quote requests',
            hint: 'Open, with no pro invited yet',
            icon: ClipboardList,
            href: requestsIndex.url({
                query: { tab: 'quotes', status: 'open' },
            }),
            value: String(queues.quotes),
            isWaiting: queues.quotes > 0,
        },
        {
            label: 'Business requests',
            hint: 'New, not picked up yet',
            icon: Briefcase,
            href: requestsIndex.url({
                query: { tab: 'business', status: 'new' },
            }),
            value: String(queues.business),
            isWaiting: queues.business > 0,
        },
        {
            label: 'Bookings',
            hint: 'Waiting for the fleet to answer',
            icon: CalendarClock,
            href: requestsIndex.url({
                query: { tab: 'bookings', status: 'requested' },
            }),
            value: String(queues.bookings),
            isWaiting: queues.bookings > 0,
        },
        {
            label: 'Reviews & ratings',
            hint: 'Client reviews to approve',
            icon: Star,
            href: reviewsIndex.url(),
            value: String(queues.reviews),
            isWaiting: queues.reviews > 0,
        },
        {
            label: 'Messages',
            hint: 'Unread contact messages',
            icon: Mail,
            href: messagesIndex.url(),
            value: String(queues.messages),
            isWaiting: queues.messages > 0,
        },
    ];

    const directoryTiles: Tile[] = [
        {
            label: 'Live professionals',
            hint: 'Visible to clients',
            icon: BadgeCheck,
            href: professionalsIndex.url(),
            value: String(directory.professionals),
        },
        {
            label: 'Live fleets',
            hint: 'Vehicle rental providers',
            icon: Truck,
            href: vehicleProvidersIndex.url(),
            value: String(directory.fleets),
        },
        {
            label: 'Vehicles for hire',
            hint: 'Across all live fleets',
            icon: Car,
            href: vehicleProvidersIndex.url(),
            value: String(directory.vehicles),
        },
        {
            label: 'Live without the badge',
            hint: 'Approved, documents still missing',
            icon: FileWarning,
            href: applications.url({ query: { status: 'approved' } }),
            value: String(directory.missingDocuments),
            isWaiting: directory.missingDocuments > 0,
        },
        {
            label: 'Active categories',
            hint: 'Services clients can browse',
            icon: Tags,
            href: categoriesIndex.url(),
            value: String(directory.categories),
        },
        {
            label: 'Exchange rate',
            hint: exchangeRate
                ? exchangeRate.source === 'manual'
                    ? 'Francs per dollar, set by the team'
                    : 'Francs per dollar, fetched automatically'
                : 'No rate yet. Set one',
            icon: Banknote,
            href: editExchangeRate.url(),
            value: exchangeRate
                ? `${Math.round(exchangeRate.rate).toLocaleString('en-US')} FC`
                : '—',
        },
    ];

    const waitingCount = queueTiles.filter((tile) => tile.isWaiting).length;

    return (
        <>
            <Head title={t('Overview')} />

            <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Welcome, :name', { name: firstName })}
                    description={
                        waitingCount > 0
                            ? t(
                                  'Here is what is waiting for the team and how the directory is doing.',
                              )
                            : t(
                                  'Every queue is clear. Here is how the directory is doing.',
                              )
                    }
                />

                <section
                    aria-labelledby="needs-attention"
                    className="flex flex-col gap-4"
                >
                    <h2
                        id="needs-attention"
                        className="text-base font-semibold text-zinc-900"
                    >
                        {t('Needs attention')}
                    </h2>
                    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                        {queueTiles.map((tile) => (
                            <li key={tile.label}>
                                <StatTile tile={tile} />
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ListPanel
                        title={t('Waiting longest for review')}
                        href={applications.url()}
                        linkLabel={t('Open the review queue')}
                        emptyMessage={t('No listings are waiting for review.')}
                        isEmpty={waitingListings.length === 0}
                    >
                        {waitingListings.map((listing) => (
                            <ListRow
                                key={listing.key}
                                href={applications.url({
                                    query: { listing: listing.key },
                                })}
                                title={listing.name}
                                meta={[
                                    listing.type === 'vehicle_provider'
                                        ? t('Vehicle rental')
                                        : t('Services'),
                                    listing.city,
                                ]}
                                aside={listing.submittedAgo}
                            />
                        ))}
                    </ListPanel>

                    <ListPanel
                        title={t('Latest customer requests')}
                        href={requestsIndex.url()}
                        linkLabel={t('Open all requests')}
                        emptyMessage={t(
                            'Requests from clients will appear here.',
                        )}
                        isEmpty={latestRequests.length === 0}
                    >
                        {latestRequests.map((request) => (
                            <ListRow
                                key={`${request.tab}-${request.id}`}
                                href={requestsIndex.url({
                                    query: {
                                        tab: request.tab,
                                        request: request.id,
                                    },
                                })}
                                title={request.title}
                                meta={[
                                    t(requestKindLabels[request.tab]),
                                    request.customer,
                                    request.reference,
                                ]}
                                aside={request.createdAgo}
                            />
                        ))}
                    </ListPanel>
                </div>

                <section
                    aria-labelledby="directory"
                    className="flex flex-col gap-4"
                >
                    <h2
                        id="directory"
                        className="text-base font-semibold text-zinc-900"
                    >
                        {t('The directory today')}
                    </h2>
                    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {directoryTiles.map((tile) => (
                            <li key={tile.label}>
                                <StatTile tile={tile} />
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </>
    );
}

/**
 * One figure, linking to the page that lists what it counts.
 */
function StatTile({ tile }: { tile: Tile }) {
    const Icon = tile.icon;

    return (
        <Link
            href={tile.href}
            className={cn(
                'group flex h-full flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-colors duration-200 hover:border-zinc-300 hover:bg-zinc-50 sm:p-5',
                focusClassName,
            )}
        >
            <span className="flex items-center justify-between gap-2">
                <Icon
                    className={cn(
                        'size-5 shrink-0',
                        tile.isWaiting ? 'text-primary' : 'text-zinc-400',
                    )}
                    aria-hidden="true"
                />
                <ArrowRight
                    className="size-4 shrink-0 text-zinc-300 transition-colors duration-200 group-hover:text-zinc-600"
                    aria-hidden="true"
                />
            </span>
            <span className="flex flex-col gap-0.5">
                <span
                    className={cn(
                        'text-2xl font-semibold tracking-tight tabular-nums',
                        tile.isWaiting === false
                            ? 'text-zinc-400'
                            : 'text-zinc-900',
                    )}
                >
                    {tile.value}
                </span>
                <span className="text-sm font-medium text-zinc-900">
                    {t(tile.label)}
                </span>
                <span className="text-xs text-zinc-500">{t(tile.hint)}</span>
            </span>
        </Link>
    );
}

/**
 * A short list of records with a link to the full page behind it.
 */
function ListPanel({
    title,
    href,
    linkLabel,
    emptyMessage,
    isEmpty,
    children,
}: {
    title: string;
    href: string;
    linkLabel: string;
    emptyMessage: string;
    isEmpty: boolean;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
                <Link
                    href={href}
                    className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded text-sm font-medium text-primary hover:underline',
                        focusClassName,
                    )}
                >
                    {linkLabel}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
            </div>
            {isEmpty ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-12 text-center">
                    <Inbox
                        className="size-6 text-zinc-400"
                        aria-hidden="true"
                    />
                    <p className="text-sm text-zinc-500">{emptyMessage}</p>
                </div>
            ) : (
                <ul className="flex flex-col divide-y divide-zinc-100">
                    {children}
                </ul>
            )}
        </section>
    );
}

function ListRow({
    href,
    title,
    meta,
    aside,
}: {
    href: string;
    title: string;
    meta: (string | null)[];
    aside: string | null;
}) {
    return (
        <li>
            <Link
                href={href}
                className={cn(
                    'flex min-h-14 items-center justify-between gap-4 px-5 py-3 transition-colors duration-200 hover:bg-zinc-50',
                    focusClassName,
                )}
            >
                <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-zinc-900">
                        {title}
                    </span>
                    <span className="truncate text-xs text-zinc-500">
                        {meta.filter(Boolean).join(' · ')}
                    </span>
                </span>
                {aside && (
                    <span className="shrink-0 text-xs text-zinc-500">
                        {aside}
                    </span>
                )}
            </Link>
        </li>
    );
}
