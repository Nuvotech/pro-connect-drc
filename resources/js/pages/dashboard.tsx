import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronDown,
    Circle,
    CircleCheck,
    CircleX,
    ClipboardList,
    Hourglass,
    Star,
    Store,
    Truck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import ListingStatus from '@/components/workspace/listing-status';
import PageHeader from '@/components/workspace/page-header';
import ReviewBanner from '@/components/workspace/review-banner';
import {
    create as fleetCreate,
    edit as fleetEdit,
    resubmit as fleetResubmit,
    show as fleetShow,
} from '@/routes/dashboard/fleet';
import {
    create as listingCreate,
    edit as listingEdit,
    resubmit as listingResubmit,
    show as listingShow,
} from '@/routes/dashboard/listing';
import { index as bookingsIndex } from '@/routes/dashboard/bookings';
import { index as galleryIndex } from '@/routes/dashboard/listing/gallery';
import { index as quotesIndex } from '@/routes/dashboard/quotes';
import {
    create as vehicleCreate,
    edit as vehicleEdit,
} from '@/routes/dashboard/vehicles';
import type { DashboardApplication, DashboardOverview } from '@/types';
import { t } from '@/lib/i18n';

export default function Dashboard({
    application,
    overviews,
    setup,
}: {
    application: DashboardApplication | null;
    overviews: DashboardOverview[];
    setup: { services: boolean; vehicles: boolean };
}) {
    const { auth } = usePage().props;
    const firstName = auth.user.name.split(' ')[0];
    const isApproved = auth.pro?.isApproved ?? false;

    return (
        <>
            <Head title={t('Dashboard')} />

            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={`Welcome, ${firstName}`}
                    description={
                        !isApproved
                            ? t('Thanks for applying to join ProConnect.')
                            : overviews.length > 0
                              ? t("Here's how your listings are doing.")
                              : t(
                                    'Set up your listing so clients can find you.',
                                )
                    }
                />

                {!isApproved ? (
                    <ApplicationStatus application={application} />
                ) : (
                    <>
                        {overviews.map((overview) => (
                            <div
                                key={overview.type}
                                className="flex flex-col gap-4"
                            >
                                <ReviewBanner
                                    review={overview}
                                    resubmitHref={
                                        overview.type === 'vehicle_provider'
                                            ? fleetResubmit.url()
                                            : listingResubmit.url()
                                    }
                                />
                                <ListingOverview overview={overview} />
                            </div>
                        ))}

                        {(setup.services || setup.vehicles) && (
                            <ListingSetup setup={setup} />
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {auth.pro?.listings.professional ? (
                                <InboxPanel
                                    icon={ClipboardList}
                                    title={t('Quote requests')}
                                    count={auth.pro.openQuoteCount}
                                    emptyMessage={t(
                                        'Jobs our team matches you with will appear here.',
                                    )}
                                    countMessage="waiting for your price"
                                    href={quotesIndex.url()}
                                />
                            ) : auth.pro?.listings.vehicleProvider ? (
                                <InboxPanel
                                    icon={ClipboardList}
                                    title={t('Bookings')}
                                    count={auth.pro.pendingBookingCount}
                                    emptyMessage={t(
                                        'Booking requests from your fleet page will appear here.',
                                    )}
                                    countMessage="waiting for your answer"
                                    href={bookingsIndex.url()}
                                />
                            ) : (
                                <EmptyPanel
                                    icon={ClipboardList}
                                    title={t('Quote requests')}
                                    message="Requests from clients will appear here."
                                />
                            )}
                            <EmptyPanel
                                icon={Star}
                                title={t('Reviews')}
                                message="Client reviews of your work will appear here."
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

/**
 * Where the pro's join application stands while the dashboard is locked.
 */
function ApplicationStatus({
    application,
}: {
    application: DashboardApplication | null;
}) {
    const isDeclined = application?.status === 'declined';
    const Icon = isDeclined ? CircleX : Hourglass;

    return (
        <section className="rounded-xl border border-zinc-200 bg-white">
            <div className="flex items-start gap-4 p-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                    <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-zinc-900">
                        {isDeclined
                            ? t('Your application was not approved')
                            : t('Your application is being reviewed')}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        {isDeclined
                            ? t('Our team could not approve your application.')
                            : t(
                                  "We check every new pro before they can set up a listing. You'll get an email as soon as you're approved, usually within 1–2 working days.",
                              )}
                    </p>
                    {isDeclined && application?.decisionMessage && (
                        <blockquote className="mt-3 border-l-2 border-zinc-200 pl-3 text-sm whitespace-pre-line text-zinc-700">
                            {application.decisionMessage}
                        </blockquote>
                    )}
                </div>
            </div>
            {application && application.services.length > 0 && (
                <div className="border-t border-zinc-100 px-6 py-4">
                    <p className="text-xs font-medium text-zinc-500">
                        {t('You applied for')}
                        {application.submittedAt &&
                            ` on ${application.submittedAt}`}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                        {application.services.map((service) => (
                            <li
                                key={service}
                                className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
                            >
                                {service}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}

/**
 * Where the pro goes to complete a checklist item, jumping straight to the
 * field when it lives on an edit form.
 */
function checklistHref(
    overview: DashboardOverview,
    key: string,
): string | null {
    if (overview.type === 'professional') {
        return key === 'gallery'
            ? galleryIndex.url()
            : `${listingEdit.url()}#${key}`;
    }

    if (key === 'vehicles') {
        return vehicleCreate.url();
    }

    if (key === 'vehicle_photos') {
        return overview.firstVehicleMissingPhotosId
            ? vehicleEdit.url(overview.firstVehicleMissingPhotosId)
            : fleetShow.url();
    }

    return `${fleetEdit.url()}#${key}`;
}

function ListingOverview({ overview }: { overview: DashboardOverview }) {
    const doneCount = overview.checklist.filter((item) => item.isDone).length;
    const listingHref =
        overview.type === 'vehicle_provider' ? fleetShow() : listingShow();

    const isChecklistComplete = doneCount === overview.checklist.length;
    const checklist = (
        <ul className="flex flex-col divide-y divide-zinc-100">
            {overview.checklist.map((item) => {
                const href = item.isDone
                    ? null
                    : checklistHref(overview, item.key);

                return (
                    <li key={item.key}>
                        {href ? (
                            <Link
                                href={href}
                                className="group flex items-center gap-2.5 py-2.5 text-sm first:pt-0"
                            >
                                <Circle
                                    className="size-4 shrink-0 text-zinc-300"
                                    aria-hidden="true"
                                />
                                <span className="flex-1 text-zinc-900">
                                    {t(item.label)}
                                    <span className="sr-only">
                                        {' '}
                                        {t('(to do)')}
                                    </span>
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                                    {t('Complete')}
                                    <ArrowRight
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                </span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2.5 py-2.5 text-sm">
                                <CircleCheck
                                    className="size-4 shrink-0 text-primary"
                                    aria-hidden="true"
                                />
                                <span className="text-zinc-500">
                                    {t(item.label)}
                                    <span className="sr-only">
                                        {' '}
                                        {t('(done)')}
                                    </span>
                                </span>
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );

    return (
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-zinc-100 p-6 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-base font-semibold text-zinc-900">
                        {overview.name}
                    </h2>
                    <div className="mt-1">
                        <ListingStatus isVerified={overview.isVerified} />
                    </div>
                </div>
                <Link
                    href={listingHref}
                    className="inline-flex h-9 items-center gap-2 self-start rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50 hover:text-zinc-900 sm:self-auto"
                >
                    {overview.type === 'vehicle_provider'
                        ? t('Manage fleet')
                        : t('Manage listing')}
                    <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
            </div>

            <dl className="grid grid-cols-3 divide-x divide-zinc-100 border-b border-zinc-100">
                {overview.stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col gap-0.5 p-5">
                        <dt className="text-xs text-zinc-500">
                            {t(stat.label)}
                        </dt>
                        <dd className="text-xl font-semibold text-zinc-900 tabular-nums">
                            {stat.value}
                        </dd>
                    </div>
                ))}
            </dl>

            {isChecklistComplete ? (
                <Collapsible>
                    <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left transition-colors duration-200 hover:bg-zinc-50">
                        <span className="flex items-center gap-2.5">
                            <CircleCheck
                                className="size-4 shrink-0 text-primary"
                                aria-hidden="true"
                            />
                            <span className="text-sm font-semibold text-zinc-900">
                                {t('Listing complete')}
                            </span>
                            <span className="text-xs text-zinc-500 tabular-nums">
                                {doneCount} {t('of')}{' '}
                                {overview.checklist.length} {t('done')}
                            </span>
                        </span>
                        <ChevronDown
                            className="size-4 text-zinc-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
                            aria-hidden="true"
                        />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-6 pb-4">
                        {checklist}
                    </CollapsibleContent>
                </Collapsible>
            ) : (
                <div className="p-6">
                    <div className="mb-4 flex items-baseline justify-between gap-4">
                        <h3 className="text-sm font-semibold text-zinc-900">
                            {t('Complete your listing')}
                        </h3>
                        <span className="text-xs text-zinc-500 tabular-nums">
                            {doneCount} {t('of')} {overview.checklist.length}{' '}
                            {t('done')}
                        </span>
                    </div>
                    {checklist}
                </div>
            )}
        </section>
    );
}

/**
 * The listings an approved pro can still create, based on what they
 * applied to offer.
 */
function ListingSetup({
    setup,
}: {
    setup: { services: boolean; vehicles: boolean };
}) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-base font-semibold text-zinc-900">
                {t("You're approved. Set up your listing")}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
                {t(
                    'Add your details, documents and photos. Our team verifies each listing before clients can see it.',
                )}
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {setup.services && (
                    <SetupOption
                        href={listingCreate.url()}
                        icon={Store}
                        title={t('Set up your service listing')}
                        description={t(
                            'Your services, experience, rates, ID document and photos of your work.',
                        )}
                    />
                )}
                {setup.vehicles && (
                    <SetupOption
                        href={fleetCreate.url()}
                        icon={Truck}
                        title={t('Set up your fleet')}
                        description={t(
                            'Your business details and each vehicle you rent out, with its photos.',
                        )}
                    />
                )}
            </div>
        </section>
    );
}

function SetupOption({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: string;
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group flex items-start gap-3 rounded-lg border border-zinc-200 p-4 transition-colors duration-200 hover:border-zinc-300 hover:bg-zinc-50"
        >
            <Icon
                className="mt-0.5 size-5 shrink-0 text-zinc-400 group-hover:text-primary"
                aria-hidden="true"
            />
            <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-zinc-900">
                    {title}
                </span>
                <span className="text-sm text-zinc-500">{description}</span>
            </span>
        </Link>
    );
}

function EmptyPanel({
    icon: Icon,
    title,
    message,
}: {
    icon: LucideIcon;
    title: string;
    message: string;
}) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
            <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Icon className="size-6 text-zinc-400" aria-hidden="true" />
                <p className="text-sm text-zinc-500">{message}</p>
            </div>
        </section>
    );
}

function InboxPanel({
    icon: Icon,
    title,
    count,
    emptyMessage,
    countMessage,
    href,
}: {
    icon: LucideIcon;
    title: string;
    count: number;
    emptyMessage: string;
    countMessage: string;
    href: string;
}) {
    return (
        <section className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
                <Link
                    href={href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                    {t('Open')}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
                <Icon className="size-6 text-zinc-400" aria-hidden="true" />
                {count > 0 ? (
                    <p className="text-sm text-zinc-700">
                        <span className="text-2xl font-semibold text-zinc-900 tabular-nums">
                            {count}
                        </span>{' '}
                        {countMessage}
                    </p>
                ) : (
                    <p className="text-sm text-zinc-500">{emptyMessage}</p>
                )}
            </div>
        </section>
    );
}
