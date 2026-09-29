import { Head, Link, router } from '@inertiajs/react';
import {
    Inbox,
    LoaderCircle,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Search,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import PageHeader from '@/components/workspace/page-header';
import { cn } from '@/lib/utils';
import {
    approve as approveRoute,
    decline as declineRoute,
    index as signUpsRoute,
} from '@/routes/admin/sign-ups';
import type {
    CategoryGroup,
    CategoryOptionGroup,
    ProApplicationDetail,
    ProApplicationStatus,
} from '@/types';
import { dateLocale, t } from '@/lib/i18n';

const statusTabs: { value: ProApplicationStatus; label: string }[] = [
    { value: 'pending', label: 'Waiting' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
];

const groupLabels: Record<CategoryGroup, string> = {
    trade: 'Trades',
    business: 'Business services',
    vehicle: 'Vehicle & equipment rental',
};

const fieldClassName =
    'h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none';

type Resolution =
    | { mode: 'match'; categorySlug: string }
    | { mode: 'new'; name: string; group: CategoryGroup };

function formatDate(value: string | null): string {
    return value
        ? new Date(value).toLocaleDateString(dateLocale(), {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : '—';
}

function initialsOf(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

export default function SignUps({
    status,
    selectedId,
    applications,
    counts,
    categoryGroups,
}: {
    status: ProApplicationStatus;
    selectedId: number | null;
    applications: ProApplicationDetail[];
    counts: Record<ProApplicationStatus, number>;
    categoryGroups: CategoryOptionGroup[];
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApplicationId, setSelectedApplicationId] = useState(
        selectedId ?? applications[0]?.id ?? null,
    );

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredApplications = applications.filter(
        (application) =>
            !normalizedSearch ||
            [
                application.fullName,
                application.businessName ?? '',
                application.email,
                application.phone,
                ...application.categories.map((category) => category.name),
                ...application.customServices.map((service) => service.name),
            ].some((value) => value.toLowerCase().includes(normalizedSearch)),
    );
    const selectedApplication =
        filteredApplications.find(
            (application) => application.id === selectedApplicationId,
        ) ?? filteredApplications[0];

    return (
        <>
            <Head title={t('Sign-ups')} />

            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Sign-ups')}
                    description={t(
                        'People asking to join as pros. Approving someone unlocks their dashboard so they can build their listing.',
                    )}
                />

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 lg:flex-row lg:items-end">
                        <nav
                            aria-label={t('Sign-up status')}
                            className="-mb-px flex gap-6 overflow-x-auto"
                        >
                            {statusTabs.map((tab) => (
                                <Link
                                    key={tab.value}
                                    href={signUpsRoute({
                                        query: { status: tab.value },
                                    })}
                                    preserveScroll
                                    aria-current={
                                        status === tab.value
                                            ? 'page'
                                            : undefined
                                    }
                                    className={cn(
                                        'flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm transition-colors duration-200',
                                        status === tab.value
                                            ? 'border-primary font-medium text-zinc-900'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-900',
                                    )}
                                >
                                    {t(tab.label)}
                                    <span className="rounded-full bg-zinc-100 px-1.5 text-xs text-zinc-600 tabular-nums">
                                        {counts[tab.value]}
                                    </span>
                                </Link>
                            ))}
                        </nav>
                        <div className="relative pb-3 lg:w-72">
                            <Search
                                className="pointer-events-none absolute top-[calc(50%-6px)] left-3 size-4 -translate-y-1/2 text-zinc-400"
                                aria-hidden="true"
                            />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                aria-label={t('Filter sign-ups')}
                                placeholder={t('Name, email, service…')}
                                className={cn(fieldClassName, 'pl-9')}
                            />
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
                                            'No sign-ups match this status and search.',
                                        )}
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-zinc-100">
                                    {filteredApplications.map((application) => (
                                        <li key={application.id}>
                                            <QueueItem
                                                application={application}
                                                isSelected={
                                                    application.id ===
                                                    selectedApplication?.id
                                                }
                                                onSelect={() =>
                                                    setSelectedApplicationId(
                                                        application.id,
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
                                    key={selectedApplication.id}
                                    application={selectedApplication}
                                    categoryGroups={categoryGroups}
                                />
                            ) : (
                                <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center text-sm text-zinc-500">
                                    {t('Select a sign-up to review it.')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function QueueItem({
    application,
    isSelected,
    onSelect,
}: {
    application: ProApplicationDetail;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const services = [
        ...application.categories.map((category) => category.name),
        ...application.customServices.map((service) => service.name),
    ];

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
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                {initialsOf(application.fullName)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-zinc-900">
                        {application.businessName ?? application.fullName}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-500">
                        {formatDate(application.submittedAt)}
                    </span>
                </div>
                <span className="truncate text-sm text-zinc-500">
                    {services.join(', ')}
                </span>
                {application.customServices.length > 0 &&
                    application.status === 'pending' && (
                        <span className="mt-1 text-xs font-medium text-zinc-900">
                            {application.customServices.length} {t('typed-in')}{' '}
                            {application.customServices.length === 1
                                ? t('service')
                                : t('services')}{' '}
                            {t('to sort')}
                        </span>
                    )}
            </div>
        </button>
    );
}

function ApplicationDetail({
    application,
    categoryGroups,
}: {
    application: ProApplicationDetail;
    categoryGroups: CategoryOptionGroup[];
}) {
    const isPending = application.status === 'pending';
    const [resolutions, setResolutions] = useState<Record<number, Resolution>>(
        () =>
            Object.fromEntries(
                application.customServices.map((service) => [
                    service.id,
                    {
                        mode: 'new',
                        name: service.name,
                        group: 'trade',
                    } satisfies Resolution,
                ]),
            ),
    );
    const [isDeclining, setIsDeclining] = useState(false);
    const [declineMessage, setDeclineMessage] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState<'approve' | 'decline' | null>(
        null,
    );

    const groupedCategories = (
        ['trade', 'business', 'vehicle'] as CategoryGroup[]
    )
        .map((group) => ({
            group,
            names: application.categories
                .filter((category) => category.group === group)
                .map((category) => category.name),
        }))
        .filter((entry) => entry.names.length > 0);

    function approve() {
        router.post(
            approveRoute.url(application.id),
            {
                custom_services: Object.fromEntries(
                    Object.entries(resolutions).map(([id, resolution]) => [
                        id,
                        resolution.mode === 'match'
                            ? { category_slug: resolution.categorySlug }
                            : {
                                  new_category: {
                                      name: resolution.name,
                                      group: resolution.group,
                                  },
                              },
                    ]),
                ),
            },
            {
                preserveScroll: true,
                onStart: () => setProcessing('approve'),
                onFinish: () => setProcessing(null),
                onError: setErrors,
            },
        );
    }

    function decline() {
        router.post(
            declineRoute.url(application.id),
            { message: declineMessage },
            {
                preserveScroll: true,
                onStart: () => setProcessing('decline'),
                onFinish: () => setProcessing(null),
                onError: setErrors,
            },
        );
    }

    return (
        <article className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
            <header className="flex items-start gap-4 p-6">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
                    {initialsOf(application.fullName)}
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                        {application.businessName ?? application.fullName}
                    </h2>
                    <p className="text-sm text-zinc-500">
                        {application.businessName &&
                            `${application.fullName} · `}
                        {t('Applied')} {formatDate(application.submittedAt)}
                    </p>
                </div>
            </header>

            <Section title={t('Contact')}>
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <ContactItem icon={<Mail className="size-4" />}>
                        {application.email}
                    </ContactItem>
                    <ContactItem icon={<Phone className="size-4" />}>
                        +243 {application.phone}
                        {application.isOnWhatsApp && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs text-zinc-500">
                                <MessageCircle
                                    className="size-3.5"
                                    aria-hidden="true"
                                />
                                {t('WhatsApp')}
                            </span>
                        )}
                    </ContactItem>
                    <ContactItem icon={<MapPin className="size-4" />}>
                        {application.commune}, {application.city}
                    </ContactItem>
                </dl>
            </Section>

            <Section title={t('Wants to offer')}>
                <div className="flex flex-col gap-4">
                    {groupedCategories.map((entry) => (
                        <div key={entry.group}>
                            <p className="text-xs font-medium text-zinc-500">
                                {t(groupLabels[entry.group])}
                            </p>
                            <ul className="mt-1.5 flex flex-wrap gap-1.5">
                                {entry.names.map((name) => (
                                    <li
                                        key={name}
                                        className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
                                    >
                                        {name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {application.customServices.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-zinc-500">
                                {t('Typed in by the applicant')}
                            </p>
                            <ul className="mt-2 flex flex-col gap-3">
                                {application.customServices.map((service) =>
                                    isPending ? (
                                        <CustomServiceResolver
                                            key={service.id}
                                            name={service.name}
                                            resolution={resolutions[service.id]}
                                            categoryGroups={categoryGroups}
                                            error={
                                                errors[
                                                    `custom_services.${service.id}`
                                                ] ??
                                                errors[
                                                    `custom_services.${service.id}.new_category.name`
                                                ]
                                            }
                                            onChange={(resolution) =>
                                                setResolutions((previous) => ({
                                                    ...previous,
                                                    [service.id]: resolution,
                                                }))
                                            }
                                        />
                                    ) : (
                                        <li
                                            key={service.id}
                                            className="text-sm text-zinc-700"
                                        >
                                            “{service.name}”
                                            {service.categoryName && (
                                                <span className="text-zinc-500">
                                                    {' '}
                                                    → {service.categoryName}
                                                </span>
                                            )}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    )}

                    {application.description && (
                        <div>
                            <p className="text-xs font-medium text-zinc-500">
                                {t('In their words')}
                            </p>
                            <p className="mt-1 text-sm whitespace-pre-line text-zinc-700">
                                {application.description}
                            </p>
                        </div>
                    )}
                </div>
            </Section>

            {isPending ? (
                <div className="flex flex-col gap-4 p-6">
                    {errors.application && (
                        <p className="text-sm font-medium text-zinc-900">
                            {errors.application}
                        </p>
                    )}
                    {isDeclining ? (
                        <div className="flex flex-col gap-3">
                            <label
                                htmlFor="decline-message"
                                className="text-sm font-medium text-zinc-900"
                            >
                                {t("Why can't they join?")}
                            </label>
                            <textarea
                                id="decline-message"
                                rows={3}
                                value={declineMessage}
                                onChange={(event) =>
                                    setDeclineMessage(event.target.value)
                                }
                                placeholder={t(
                                    'The applicant will see this message.',
                                )}
                                aria-invalid={Boolean(errors.message)}
                                className={cn(
                                    fieldClassName,
                                    'h-auto resize-none py-2',
                                )}
                            />
                            {errors.message && (
                                <p className="text-xs font-medium text-zinc-900">
                                    {t(errors.message)}
                                </p>
                            )}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsDeclining(false)}
                                    className="inline-flex h-9 cursor-pointer items-center rounded-lg px-3.5 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={decline}
                                    disabled={processing !== null}
                                    className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-zinc-800 disabled:opacity-60"
                                >
                                    {processing === 'decline' && (
                                        <LoaderCircle
                                            className="size-4 animate-spin"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {t('Decline application')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setIsDeclining(true)}
                                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50"
                            >
                                {t('Decline')}
                            </button>
                            <button
                                type="button"
                                onClick={approve}
                                disabled={processing !== null}
                                className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:opacity-60"
                            >
                                {processing === 'approve' && (
                                    <LoaderCircle
                                        className="size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                {t('Approve and unlock dashboard')}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <Section title={t('Decision')}>
                    <p className="text-sm text-zinc-700">
                        {application.status === 'approved'
                            ? t('Approved')
                            : t('Declined')}
                        {application.decidedBy &&
                            ` by ${application.decidedBy}`}{' '}
                        {t('on')} {formatDate(application.decidedAt)}
                    </p>
                    {application.decisionMessage && (
                        <blockquote className="mt-2 border-l-2 border-zinc-200 pl-3 text-sm whitespace-pre-line text-zinc-600">
                            {application.decisionMessage}
                        </blockquote>
                    )}
                </Section>
            )}
        </article>
    );
}

/**
 * Lets the admin match a typed-in service to an existing category or add
 * it as a new one.
 */
function CustomServiceResolver({
    name,
    resolution,
    categoryGroups,
    error,
    onChange,
}: {
    name: string;
    resolution: Resolution;
    categoryGroups: CategoryOptionGroup[];
    error?: string;
    onChange: (resolution: Resolution) => void;
}) {
    return (
        <li className="rounded-lg border border-zinc-200 p-3">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <p className="text-sm font-medium text-zinc-900">“{name}”</p>
                <div
                    role="radiogroup"
                    aria-label={t('How to handle :name', { name })}
                    className="inline-flex w-fit rounded-lg border border-zinc-200 p-0.5"
                >
                    {(
                        [
                            ['new', 'Add as new'],
                            ['match', 'Match existing'],
                        ] as const
                    ).map(([mode, label]) => (
                        <button
                            key={mode}
                            type="button"
                            role="radio"
                            aria-checked={resolution.mode === mode}
                            onClick={() =>
                                onChange(
                                    mode === 'match'
                                        ? { mode, categorySlug: '' }
                                        : { mode, name, group: 'trade' },
                                )
                            }
                            className={cn(
                                'h-7 cursor-pointer rounded-md px-2.5 text-xs font-medium transition-colors duration-200',
                                resolution.mode === mode
                                    ? 'bg-zinc-900 text-white'
                                    : 'text-zinc-600 hover:text-zinc-900',
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {resolution.mode === 'match' ? (
                    <select
                        value={resolution.categorySlug}
                        onChange={(event) =>
                            onChange({
                                mode: 'match',
                                categorySlug: event.target.value,
                            })
                        }
                        aria-label={t('Category for :name', { name })}
                        className={cn(
                            fieldClassName,
                            'cursor-pointer sm:col-span-2',
                        )}
                    >
                        <option value="" disabled>
                            {t('Choose a category')}
                        </option>
                        {categoryGroups.map((group) => (
                            <optgroup key={group.group} label={group.label}>
                                {group.options.map((option) => (
                                    <option
                                        key={option.slug}
                                        value={option.slug}
                                    >
                                        {option.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                ) : (
                    <>
                        <input
                            value={resolution.name}
                            onChange={(event) =>
                                onChange({
                                    ...resolution,
                                    name: event.target.value,
                                })
                            }
                            aria-label={t('New category name for :name', {
                                name,
                            })}
                            className={fieldClassName}
                        />
                        <select
                            value={resolution.group}
                            onChange={(event) =>
                                onChange({
                                    ...resolution,
                                    group: event.target.value as CategoryGroup,
                                })
                            }
                            aria-label={t('Group for :name', { name })}
                            className={cn(fieldClassName, 'cursor-pointer')}
                        >
                            {(Object.keys(groupLabels) as CategoryGroup[]).map(
                                (group) => (
                                    <option key={group} value={group}>
                                        {t(groupLabels[group])}
                                    </option>
                                ),
                            )}
                        </select>
                    </>
                )}
            </div>
            {error && (
                <p className="mt-2 text-xs font-medium text-zinc-900">
                    {error}
                </p>
            )}
        </li>
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

function ContactItem({
    icon,
    children,
}: {
    icon: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="flex items-center gap-2 text-zinc-700">
            <span className="text-zinc-400" aria-hidden="true">
                {icon}
            </span>
            {children}
        </div>
    );
}
