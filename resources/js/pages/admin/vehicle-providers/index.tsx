import { Head, Link } from '@inertiajs/react';
import { CircleCheck, Clock, Plus, Truck } from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { formatMoney } from '@/lib/admin-data';
import { create, show } from '@/routes/admin/vehicle-providers';
import type { Paginated, VehicleProviderSummary } from '@/types';
import { t } from '@/lib/i18n';

export default function VehicleProvidersIndex({
    providers,
}: {
    providers: Paginated<VehicleProviderSummary>;
}) {
    const { categoryName } = useCategories();
    return (
        <>
            <Head title={t('Fleet & vehicles')} />

            <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                            {t('Fleet & vehicles')}
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            {t(
                                'Owners and companies renting out vehicles and equipment.',
                            )}
                        </p>
                    </div>
                    <Link
                        href={create()}
                        className="inline-flex h-9 items-center gap-2 self-start rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container sm:self-auto"
                    >
                        <Plus className="size-4" aria-hidden="true" />
                        {t('Onboard vehicle provider')}
                    </Link>
                </div>

                {providers.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                        <Truck
                            className="size-6 text-zinc-400"
                            aria-hidden="true"
                        />
                        <div>
                            <p className="text-sm font-medium text-zinc-900">
                                {t('No vehicle providers yet')}
                            </p>
                            <p className="mt-1 text-sm text-zinc-500">
                                {t(
                                    'Onboard an owner with their fleet to see them here.',
                                )}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="border-b border-zinc-200 text-xs text-zinc-500">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">
                                            {t('Provider')}
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            {t('Vehicle types')}
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            {t('Vehicles')}
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            {t('From / day')}
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            {t('Status')}
                                        </th>
                                        <th className="px-5 py-3 text-right font-medium">
                                            {t('Added')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {providers.data.map((provider) => {
                                        const typeNames =
                                            provider.categories.map(
                                                categoryName,
                                            );

                                        return (
                                            <tr
                                                key={provider.id}
                                                className="transition-colors duration-200 hover:bg-zinc-50"
                                            >
                                                <td className="px-5 py-3.5">
                                                    <Link
                                                        href={show(provider.id)}
                                                        className="font-medium text-zinc-900 underline-offset-2 hover:underline"
                                                    >
                                                        {provider.businessName ??
                                                            provider.contactName}
                                                    </Link>
                                                    <p className="text-xs text-zinc-500">
                                                        {provider.businessName &&
                                                            `${provider.contactName} · `}
                                                        {provider.commune},{' '}
                                                        {provider.city}
                                                    </p>
                                                </td>
                                                <td
                                                    className="max-w-xs px-5 py-3.5 text-zinc-700"
                                                    title={typeNames.join(', ')}
                                                >
                                                    {typeNames
                                                        .slice(0, 2)
                                                        .join(', ')}
                                                    {typeNames.length > 2 && (
                                                        <span className="text-zinc-500">
                                                            {' '}
                                                            +
                                                            {typeNames.length -
                                                                2}{' '}
                                                            {t('more')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-right text-zinc-700 tabular-nums">
                                                    {provider.vehicleCount}
                                                </td>
                                                <td className="px-5 py-3.5 text-right text-zinc-700 tabular-nums">
                                                    {provider.lowestDailyRate
                                                        ? formatMoney(
                                                              provider
                                                                  .lowestDailyRate
                                                                  .amount,
                                                              provider
                                                                  .lowestDailyRate
                                                                  .currency,
                                                          )
                                                        : '—'}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {provider.isVerified ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                                                            <CircleCheck
                                                                className="size-3.5"
                                                                aria-hidden="true"
                                                            />
                                                            {t('Verified')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500">
                                                            <Clock
                                                                className="size-3.5"
                                                                aria-hidden="true"
                                                            />
                                                            {t('Pending')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-right text-zinc-500 tabular-nums">
                                                    {provider.createdAt}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {providers.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3 text-sm">
                                <span className="text-zinc-500 tabular-nums">
                                    {providers.from}–{providers.to} {t('of')}{' '}
                                    {providers.total}
                                </span>
                                <div className="flex gap-2">
                                    {providers.prev_page_url && (
                                        <Link
                                            href={providers.prev_page_url}
                                            className="inline-flex h-8 items-center rounded-lg border border-zinc-200 px-3 font-medium text-zinc-700 hover:bg-zinc-50"
                                        >
                                            {t('Previous')}
                                        </Link>
                                    )}
                                    {providers.next_page_url && (
                                        <Link
                                            href={providers.next_page_url}
                                            className="inline-flex h-8 items-center rounded-lg border border-zinc-200 px-3 font-medium text-zinc-700 hover:bg-zinc-50"
                                        >
                                            {t('Next')}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
