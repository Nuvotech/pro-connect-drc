import { Head, Link } from '@inertiajs/react';
import {
    Circle,
    CircleCheck,
    ExternalLink,
    Eye,
    Inbox,
    Mail,
    MapPin,
    MessageSquareText,
    Phone,
    Plus,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useCategories } from '@/hooks/use-categories';
import ApplicationDecisionDialog from '@/components/admin/application-decision-dialog';
import PageHeader from '@/components/workspace/page-header';
import {
    reviewEventLabels,
    reviewStatusLabels,
    reviewTabs,
} from '@/lib/admin-data';
import { cn } from '@/lib/utils';
import { applications as applicationsRoute } from '@/routes/admin';
import { create as createProfessional } from '@/routes/admin/professionals';
import type { ReviewApplication, ReviewDecision, ReviewTab } from '@/types';
import { t } from '@/lib/i18n';

const selectClassName =
    'h-9 cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none';

function initialsOf(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

export default function Applications({
    tab,
    selectedKey,
    applications,
    counts,
    averageDecisionHours,
}: {
    tab: ReviewTab;
    selectedKey: string | null;
    applications: ReviewApplication[];
    counts: Record<ReviewTab, number>;
    averageDecisionHours: number | null;
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [selectedApplicationKey, setSelectedApplicationKey] = useState(
        selectedKey ?? applications[0]?.key ?? null,
    );
    const [decisionDialog, setDecisionDialog] = useState<{
        isOpen: boolean;
        decision: ReviewDecision;
        sessionKey: number;
    }>({ isOpen: false, decision: 'approve', sessionKey: 0 });

    const cities = [
        ...new Set(applications.map((application) => application.city)),
    ].sort();
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredApplications = applications.filter(
        (application) =>
            (!typeFilter || application.type === typeFilter) &&
            (!cityFilter || application.city === cityFilter) &&
            (!normalizedSearch ||
                [
                    application.name,
                    application.contactName,
                    application.registryNumber ?? '',
                    application.taxId ?? '',
                    application.phone,
                ].some((value) =>
                    value.toLowerCase().includes(normalizedSearch),
                )),
    );
    const selectedApplication =
        filteredApplications.find(
            (application) => application.key === selectedApplicationKey,
        ) ?? filteredApplications[0];

    const stats = [
        { label: 'Needs review', value: counts.needs_review },
        { label: 'Changes requested', value: counts.changes_requested },
        { label: 'Approved', value: counts.approved },
        { label: 'Declined', value: counts.declined },
        {
            label: 'Avg. decision time',
            value:
                averageDecisionHours === null
                    ? '—'
                    : `${averageDecisionHours}h`,
        },
    ];

    function openDecision(decision: ReviewDecision) {
        setDecisionDialog((previous) => ({
            isOpen: true,
            decision,
            sessionKey: previous.sessionKey + 1,
        }));
    }

    return (
        <>
            <Head title={t('Listing reviews')} />

            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Listing reviews')}
                    description={t(
                        'Review listings from professionals and vehicle providers, then approve them or tell them what to fix.',
                    )}
                    actions={
                        <Link
                            href={createProfessional()}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container"
                        >
                            <Plus className="size-4" aria-hidden="true" />
                            {t('Onboard professional')}
                        </Link>
                    }
                />

                <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-zinc-200 bg-white md:grid-cols-5">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className={cn(
                                'flex flex-col gap-1 p-5',
                                index > 0 && 'md:border-l md:border-zinc-200',
                                index % 2 === 1 &&
                                    'border-l border-zinc-200 md:border-l',
                                index >= 2 &&
                                    'border-t border-zinc-200 md:border-t-0',
                            )}
                        >
                            <dt className="text-sm text-zinc-500">
                                {t(stat.label)}
                            </dt>
                            <dd className="text-2xl font-semibold tracking-tight text-zinc-900 tabular-nums">
                                {stat.value}
                            </dd>
                        </div>
                    ))}
                </dl>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 lg:flex-row lg:items-end">
                        <nav
                            aria-label={t('Application status')}
                            className="-mb-px flex gap-6 overflow-x-auto"
                        >
                            {reviewTabs.map((reviewTab) => (
                                <Link
                                    key={reviewTab.value}
                                    href={applicationsRoute({
                                        query: { status: reviewTab.value },
                                    })}
                                    preserveScroll
                                    aria-current={
                                        tab === reviewTab.value
                                            ? 'page'
                                            : undefined
                                    }
                                    className={cn(
                                        'flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm transition-colors duration-200',
                                        tab === reviewTab.value
                                            ? 'border-primary font-medium text-zinc-900'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-900',
                                    )}
                                >
                                    {t(reviewTab.label)}
                                    <span className="rounded-full bg-zinc-100 px-1.5 text-xs text-zinc-600 tabular-nums">
                                        {counts[reviewTab.value]}
                                    </span>
                                </Link>
                            ))}
                        </nav>
                        <div className="flex flex-wrap items-center gap-2 pb-3">
                            <div className="relative min-w-[200px] flex-1">
                                <Search
                                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
                                    aria-hidden="true"
                                />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    aria-label={t('Filter applications')}
                                    placeholder={t('Name, RCCM, phone…')}
                                    className="h-9 w-full rounded-lg border border-zinc-200 bg-white pr-3 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none"
                                />
                            </div>
                            <select
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(event.target.value)
                                }
                                aria-label={t('Filter by type')}
                                className={selectClassName}
                            >
                                <option value="">{t('All types')}</option>
                                <option value="professional">
                                    {t('Services')}
                                </option>
                                <option value="vehicle_provider">
                                    {t('Vehicle rental')}
                                </option>
                            </select>
                            <select
                                value={cityFilter}
                                onChange={(event) =>
                                    setCityFilter(event.target.value)
                                }
                                aria-label={t('Filter by city')}
                                className={selectClassName}
                            >
                                <option value="">{t('All cities')}</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white lg:col-span-5">
                            {filteredApplications.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
                                    <Inbox
                                        className="size-6 text-zinc-400"
                                        aria-hidden="true"
                                    />
                                    <p className="text-sm font-medium text-zinc-900">
                                        {t('Nothing here')}
                                    </p>
                                    <p className="text-sm text-zinc-500">
                                        {t(
                                            'No listings match this status and these filters.',
                                        )}
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-zinc-100">
                                    {filteredApplications.map((application) => (
                                        <li key={application.key}>
                                            <QueueItem
                                                application={application}
                                                isSelected={
                                                    application.key ===
                                                    selectedApplication?.key
                                                }
                                                onSelect={() =>
                                                    setSelectedApplicationKey(
                                                        application.key,
                                                    )
                                                }
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="lg:col-span-7">
                            {selectedApplication ? (
                                <ApplicationDetail
                                    key={selectedApplication.key}
                                    application={selectedApplication}
                                    onDecide={openDecision}
                                />
                            ) : (
                                <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center text-sm text-zinc-500">
                                    {t('Select a listing to review it.')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {selectedApplication && (
                <ApplicationDecisionDialog
                    application={selectedApplication}
                    isOpen={decisionDialog.isOpen}
                    onOpenChange={(isOpen) =>
                        setDecisionDialog((previous) => ({
                            ...previous,
                            isOpen,
                        }))
                    }
                    sessionKey={decisionDialog.sessionKey}
                    initialDecision={decisionDialog.decision}
                />
            )}
        </>
    );
}

function Avatar({ application }: { application: ReviewApplication }) {
    return application.photoUrl ? (
        <img
            src={application.photoUrl}
            alt=""
            className="size-10 shrink-0 rounded-full object-cover"
        />
    ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
            {initialsOf(application.name)}
        </span>
    );
}

function QueueItem({
    application,
    isSelected,
    onSelect,
}: {
    application: ReviewApplication;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={isSelected}
            className={cn(
                'relative flex w-full cursor-pointer items-start gap-3 px-5 py-4 text-left transition-colors duration-200',
                isSelected ? 'bg-zinc-50' : 'hover:bg-zinc-50',
            )}
        >
            {isSelected && (
                <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />
            )}
            <Avatar application={application} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-zinc-900">
                        {application.name}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-500">
                        {application.submittedAgo}
                    </span>
                </div>
                <span className="truncate text-sm text-zinc-500">
                    {application.type === 'vehicle_provider'
                        ? t('Vehicle rental')
                        : t('Services')}{' '}
                    · {application.commune}, {application.city}
                </span>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="text-zinc-500">
                        {t(reviewStatusLabels[application.reviewStatus])}
                    </span>
                    <span aria-hidden="true" className="text-zinc-300">
                        ·
                    </span>
                    {application.missingCount === 0 ? (
                        <span className="text-primary">{t('Complete')}</span>
                    ) : (
                        <span className="font-medium text-zinc-900">
                            {application.missingCount} {t('missing')}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}

function ApplicationDetail({
    application,
    onDecide,
}: {
    application: ReviewApplication;
    onDecide: (decision: ReviewDecision) => void;
}) {
    const { categoryName } = useCategories();
    const missingItems = application.checklist.filter((item) => !item.isDone);
    const latestDecision = application.reviews.find(
        (review) => review.reviewerName !== null,
    );

    return (
        <article className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
            <header className="flex flex-col gap-5 p-6">
                <div className="flex items-start gap-4">
                    <Avatar application={application} />
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                            {application.name}
                        </h2>
                        <p className="text-sm text-zinc-500">
                            {application.contactName} ·{' '}
                            {application.type === 'vehicle_provider'
                                ? t('Vehicle rental')
                                : t('Services')}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {application.categories.map((category) => (
                                <span
                                    key={category}
                                    className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
                                >
                                    {categoryName(category)}
                                </span>
                            ))}
                        </div>
                    </div>
                    {application.detailUrl && (
                        <a
                            href={application.detailUrl}
                            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900"
                        >
                            {t('Full listing')}
                            <ExternalLink
                                className="size-3.5"
                                aria-hidden="true"
                            />
                        </a>
                    )}
                </div>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                    <ContactDetail icon={MapPin} label={t('Address')}>
                        {[
                            application.address,
                            application.commune,
                            application.city,
                        ]
                            .filter(Boolean)
                            .join(', ')}
                    </ContactDetail>
                    <ContactDetail icon={Phone} label={t('Phone')}>
                        +243 {application.phone}
                    </ContactDetail>
                    {application.email && (
                        <ContactDetail icon={Mail} label={t('Email')}>
                            {application.email}
                        </ContactDetail>
                    )}
                </dl>
            </header>

            <section className="p-6">
                <div className="mb-3 flex items-baseline justify-between gap-4">
                    <h3 className="text-sm font-semibold text-zinc-900">
                        {application.isVerified
                            ? t('Verification')
                            : t('Why it isn’t verified yet')}
                    </h3>
                    <span className="text-xs text-zinc-500">
                        {t(reviewStatusLabels[application.reviewStatus])}
                        {application.submittedAt &&
                            ` · submitted ${application.submittedAt}`}
                    </span>
                </div>
                {application.isVerified ? (
                    <p className="flex items-center gap-2 text-sm text-zinc-700">
                        <CircleCheck
                            className="size-4 text-primary"
                            aria-hidden="true"
                        />
                        {t('Verified and live.')}
                    </p>
                ) : missingItems.length === 0 ? (
                    <p className="flex items-center gap-2 text-sm text-zinc-700">
                        <CircleCheck
                            className="size-4 text-primary"
                            aria-hidden="true"
                        />
                        {t(
                            'Everything required is in place — ready for a decision.',
                        )}
                    </p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {missingItems.map((item) => (
                            <li
                                key={item.key}
                                className="flex items-center gap-2 text-sm text-zinc-900"
                            >
                                <Circle
                                    className="size-4 text-zinc-300"
                                    aria-hidden="true"
                                />
                                {t(item.label)}
                            </li>
                        ))}
                    </ul>
                )}
                {latestDecision?.message && !application.isVerified && (
                    <div className="mt-4 flex gap-2.5 rounded-lg bg-zinc-50 p-3 text-sm">
                        <MessageSquareText
                            className="mt-0.5 size-4 shrink-0 text-zinc-400"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="text-xs text-zinc-500">
                                {t('Last message to the pro ·')}{' '}
                                {latestDecision.reviewerName},{' '}
                                {latestDecision.at}
                            </p>
                            <p className="mt-0.5 whitespace-pre-line text-zinc-700">
                                {latestDecision.message}
                            </p>
                        </div>
                    </div>
                )}
            </section>

            <section className="p-6">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900">
                    {t('Documents')}
                </h3>
                <ul className="flex flex-col divide-y divide-zinc-100">
                    {application.documents.map((document) => (
                        <li
                            key={document.key}
                            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                        >
                            <span className="text-sm font-medium text-zinc-900">
                                {t(document.label)}
                            </span>
                            {document.url ? (
                                <a
                                    href={document.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
                                >
                                    <Eye
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {t('View')}
                                </a>
                            ) : (
                                <span className="text-xs text-zinc-500">
                                    {t('Not provided')}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-4 text-sm">
                    <div>
                        <dt className="text-xs text-zinc-500">{t('RCCM')}</dt>
                        <dd className="font-mono text-[13px] text-zinc-900">
                            {application.registryNumber ?? '—'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-zinc-500">{t('Tax ID')}</dt>
                        <dd className="font-mono text-[13px] text-zinc-900">
                            {application.taxId ?? '—'}
                        </dd>
                    </div>
                </dl>
            </section>

            {application.type === 'professional' ? (
                <section className="p-6">
                    <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                        {t('About their services')}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-600">
                        {application.bio || t('No description yet.')}
                    </p>
                    <p className="mt-3 text-xs text-zinc-500">
                        {application.experienceYears !== null
                            ? t(':experienceYears years of experience', {
                                  experienceYears: application.experienceYears,
                              })
                            : t('Experience not given')}{' '}
                        · {application.galleryCount ?? 0} {t('work photos')}
                    </p>
                </section>
            ) : (
                <section className="p-6">
                    <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                        {t('Fleet')}
                    </h3>
                    {application.vehicles.length === 0 ? (
                        <p className="text-sm text-zinc-500">
                            {t('No vehicles listed yet.')}
                        </p>
                    ) : (
                        <ul className="flex flex-col divide-y divide-zinc-100">
                            {application.vehicles.map((vehicle) => (
                                <li
                                    key={vehicle.id}
                                    className="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
                                >
                                    <span className="min-w-0">
                                        <span className="block truncate text-zinc-900">
                                            {vehicle.name}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {categoryName(vehicle.category)} ·{' '}
                                            {vehicle.quantity} {t('units')}
                                        </span>
                                    </span>
                                    <span
                                        className={cn(
                                            'shrink-0 text-xs tabular-nums',
                                            vehicle.photoCount <
                                                vehicle.requiredPhotoCount
                                                ? 'font-medium text-zinc-900'
                                                : 'text-primary',
                                        )}
                                    >
                                        {vehicle.photoCount}/
                                        {vehicle.requiredPhotoCount}{' '}
                                        {t('photos')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}

            <section className="p-6">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900">
                    {t('Activity')}
                </h3>
                {application.reviews.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                        {t('No activity yet.')}
                    </p>
                ) : (
                    <ol className="flex flex-col gap-4">
                        {application.reviews.map((review) => (
                            <li key={review.id} className="flex gap-3">
                                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-300" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                                        <span className="text-sm font-medium text-zinc-900">
                                            {t(
                                                reviewEventLabels[review.event],
                                            ) ?? review.event}
                                            {review.reviewerName &&
                                                ` · ${review.reviewerName}`}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {review.at}
                                        </span>
                                    </div>
                                    {review.message && (
                                        <p className="mt-0.5 text-sm whitespace-pre-line text-zinc-600">
                                            {review.message}
                                        </p>
                                    )}
                                    {review.internalNote && (
                                        <p className="mt-1 text-xs text-zinc-500">
                                            {t('Internal:')}{' '}
                                            {review.internalNote}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            <footer className="flex flex-col gap-2 p-6 sm:flex-row">
                <button
                    type="button"
                    onClick={() => onDecide('approve')}
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container"
                >
                    {t('Approve')}
                </button>
                <button
                    type="button"
                    onClick={() => onDecide('request_changes')}
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50 hover:text-zinc-900"
                >
                    {t('Request changes')}
                </button>
                <button
                    type="button"
                    onClick={() => onDecide('decline')}
                    className="inline-flex h-10 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900 sm:ml-auto"
                >
                    {t('Decline')}
                </button>
            </footer>
        </article>
    );
}

function ContactDetail({
    icon: Icon,
    label,
    children,
}: {
    icon: typeof MapPin;
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="flex min-w-0 items-start gap-2.5">
            <Icon
                className="mt-0.5 size-4 shrink-0 text-zinc-400"
                aria-hidden="true"
            />
            <div className="min-w-0">
                <dt className="sr-only">{label}</dt>
                <dd className="truncate text-zinc-700">{children}</dd>
            </div>
        </div>
    );
}
