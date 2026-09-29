import { Head, Link } from '@inertiajs/react';
import {
    Mail,
    MapPin,
    MessageCircle,
    Pencil,
    Phone,
    Plus,
    Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import FleetGrid from '@/components/workspace/fleet-grid';
import ListingStatus from '@/components/workspace/listing-status';
import PageHeader from '@/components/workspace/page-header';
import ReviewBanner from '@/components/workspace/review-banner';
import { formatMoney } from '@/lib/admin-data';
import { edit as editFleet, resubmit } from '@/routes/dashboard/fleet';
import {
    create as createVehicle,
    destroy as destroyVehicle,
    edit as editVehicle,
} from '@/routes/dashboard/vehicles';
import type {
    FleetVehicle,
    ReviewSummary,
    VehicleProviderDetail,
} from '@/types';
import { t } from '@/lib/i18n';

export default function ShowFleet({
    provider,
    vehicles,
    review,
}: {
    provider: VehicleProviderDetail;
    vehicles: FleetVehicle[];
    review: ReviewSummary;
}) {
    const totalUnits = vehicles.reduce(
        (total, vehicle) => total + vehicle.quantity,
        0,
    );

    return (
        <>
            <Head title={t('Fleet & vehicles')} />

            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={provider.businessName ?? provider.contactName}
                    description={
                        <ListingStatus
                            isVerified={provider.isVerified}
                            verifiedAt={provider.verifiedAt}
                        />
                    }
                    actions={
                        <Link
                            href={editFleet()}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50 hover:text-zinc-900"
                        >
                            <Pencil className="size-4" aria-hidden="true" />
                            {t('Edit details')}
                        </Link>
                    }
                />

                <ReviewBanner review={review} resubmitHref={resubmit.url()} />

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
                        <section className="flex flex-col gap-3 p-5 text-sm">
                            <h2 className="font-semibold text-zinc-900">
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
                    </aside>

                    <div className="lg:col-span-2">
                        <FleetGrid
                            vehicles={vehicles}
                            emptyMessage={t('You have no vehicles yet.')}
                            action={
                                <Link
                                    href={createVehicle()}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container"
                                >
                                    <Plus
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {t('Add vehicle')}
                                </Link>
                            }
                            vehicleActions={(vehicle) => (
                                <>
                                    <Link
                                        href={destroyVehicle(vehicle.id)}
                                        as="button"
                                        onBefore={() =>
                                            confirm(
                                                t(
                                                    'Remove the :make :model from your fleet?',
                                                    {
                                                        make: vehicle.make,
                                                        model: vehicle.model,
                                                    },
                                                ),
                                            )
                                        }
                                        className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
                                    >
                                        <Trash2
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        {t('Remove')}
                                    </Link>
                                    <Link
                                        href={editVehicle(vehicle.id)}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container"
                                    >
                                        <Pencil
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        {t('Edit vehicle')}
                                    </Link>
                                </>
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
        <p className="flex items-start gap-2.5 text-zinc-700">
            <Icon
                className="mt-0.5 size-4 shrink-0 text-zinc-400"
                aria-hidden="true"
            />
            <span className="min-w-0 break-words">{children}</span>
        </p>
    );
}
