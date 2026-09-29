import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CircleCheck,
    Clock,
    FileText,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
} from 'lucide-react';
import type { ReactNode } from 'react';
import FleetGrid from '@/components/workspace/fleet-grid';
import { formatMoney } from '@/lib/admin-data';
import { applications } from '@/routes/admin';
import { index as vehicleProvidersIndex } from '@/routes/admin/vehicle-providers';
import type { FleetVehicle, VehicleProviderDetail } from '@/types';
import { t } from '@/lib/i18n';

export default function ShowVehicleProvider({
    provider,
    vehicles,
}: {
    provider: VehicleProviderDetail;
    vehicles: FleetVehicle[];
}) {
    const totalUnits = vehicles.reduce(
        (total, vehicle) => total + vehicle.quantity,
        0,
    );
    const displayName = provider.businessName ?? provider.contactName;

    return (
        <>
            <Head title={displayName} />

            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
                <div>
                    <Link
                        href={vehicleProvidersIndex()}
                        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors duration-200 hover:text-zinc-900"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        {t('Fleet & vehicles')}
                    </Link>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                                {displayName}
                            </h1>
                            <p className="mt-1 text-sm text-zinc-500">
                                {provider.businessName &&
                                    `${provider.contactName} · `}
                                {provider.commune}, {provider.city}
                            </p>
                        </div>
                        {provider.isVerified ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                                <CircleCheck
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                {t('Verified')}
                                {provider.verifiedAt &&
                                    ` · ${provider.verifiedAt}`}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-4">
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500">
                                    <Clock
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {t('Pending verification')}
                                </span>
                                <Link
                                    href={applications({
                                        query: {
                                            listing: `vehicle_provider-${provider.id}`,
                                        },
                                    })}
                                    className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container"
                                >
                                    {t('Review listing')}
                                </Link>
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                    <aside className="flex flex-col divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white lg:sticky lg:top-24">
                        <dl className="grid grid-cols-3 divide-x divide-zinc-100">
                            <Stat label={t('Vehicles')} value={totalUnits} />
                            <Stat label={t('Models')} value={vehicles.length} />
                            <Stat
                                label={t('From / day')}
                                value={
                                    provider.lowestDailyRate
                                        ? formatMoney(
                                              provider.lowestDailyRate.amount,
                                              provider.lowestDailyRate.currency,
                                          )
                                        : '—'
                                }
                            />
                        </dl>

                        <section className="flex flex-col gap-3 p-5">
                            <h2 className="text-sm font-semibold text-zinc-900">
                                {t('Contact')}
                            </h2>
                            <ContactLine icon={Phone}>
                                +243 {provider.phone}
                            </ContactLine>
                            {provider.isOnWhatsApp && (
                                <ContactLine icon={MessageCircle}>
                                    {t('Reachable on WhatsApp')}
                                </ContactLine>
                            )}
                            {provider.email && (
                                <ContactLine icon={Mail}>
                                    {provider.email}
                                </ContactLine>
                            )}
                            <ContactLine icon={MapPin}>
                                {[
                                    provider.address,
                                    provider.commune,
                                    provider.city,
                                ]
                                    .filter(Boolean)
                                    .join(', ')}
                            </ContactLine>
                        </section>

                        <section className="p-5">
                            <h2 className="mb-3 text-sm font-semibold text-zinc-900">
                                {t('Registration')}
                            </h2>
                            <dl className="flex flex-col gap-2.5 text-sm">
                                <DetailRow label={t('RCCM')}>
                                    <span className="font-mono text-[13px]">
                                        {provider.registryNumber ?? '—'}
                                    </span>
                                </DetailRow>
                                <DetailRow label={t('Tax ID')}>
                                    <span className="font-mono text-[13px]">
                                        {provider.taxId ?? '—'}
                                    </span>
                                </DetailRow>
                                <DetailRow label={t('Owner ID')}>
                                    {provider.hasIdentityDocument ? (
                                        <span className="inline-flex items-center gap-1">
                                            <FileText
                                                className="size-3.5 text-zinc-400"
                                                aria-hidden="true"
                                            />
                                            {t('On file')}
                                        </span>
                                    ) : (
                                        t('Not provided')
                                    )}
                                </DetailRow>
                                <DetailRow label={t('Language')}>
                                    {provider.preferredLanguage === 'fr'
                                        ? t('Français')
                                        : t('English')}
                                </DetailRow>
                                <DetailRow label={t('Onboarded')}>
                                    {provider.createdAt}
                                    {provider.onboardedBy &&
                                        ` by ${provider.onboardedBy}`}
                                </DetailRow>
                            </dl>
                        </section>
                    </aside>

                    <div className="lg:col-span-2">
                        <FleetGrid
                            vehicles={vehicles}
                            emptyMessage={t(
                                'This provider has no vehicles yet.',
                            )}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5 p-4">
            <dt className="text-xs text-zinc-500">{label}</dt>
            <dd className="text-lg font-semibold text-zinc-900 tabular-nums">
                {value}
            </dd>
        </div>
    );
}

function ContactLine({
    icon: Icon,
    children,
}: {
    icon: typeof Phone;
    children: ReactNode;
}) {
    return (
        <p className="flex items-start gap-2.5 text-sm text-zinc-700">
            <Icon
                className="mt-0.5 size-4 shrink-0 text-zinc-400"
                aria-hidden="true"
            />
            <span className="min-w-0 break-words">{children}</span>
        </p>
    );
}

function DetailRow({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="flex items-baseline justify-between gap-4">
            <dt className="text-zinc-500">{label}</dt>
            <dd className="text-right text-zinc-900">{children}</dd>
        </div>
    );
}
