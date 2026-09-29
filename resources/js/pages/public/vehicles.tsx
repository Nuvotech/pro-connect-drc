import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { selectClassName } from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import PublicVehicleCard from '@/components/directory/public-vehicle-card';
import { useVisitorLocation } from '@/hooks/use-visitor-location';
import { cn } from '@/lib/utils';
import { show as showFleet } from '@/routes/fleets';
import { index as vehiclesIndex } from '@/routes/vehicles';
import type { FleetVehicle } from '@/types';
import { t } from '@/lib/i18n';

type PublicVehicle = FleetVehicle & {
    fleet: { slug: string; name: string; city: string | null };
};

type VehicleFilters = {
    types: string[];
    city: string;
    driver: string;
    currency: string;
    sort: string;
};

type PaginatedVehicles = {
    data: PublicVehicle[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

type VehicleType = { slug: string; name: string; icon: string; count: number };

const sortOptions = [
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
    { value: 'newest', label: 'Newest' },
];

const driverFilters = [
    { value: '', label: 'Any' },
    { value: 'self_drive', label: 'Self-drive' },
    { value: 'with_driver', label: 'With driver' },
];

export default function Vehicles({
    vehicles,
    filters,
    types,
    cities,
    currencies,
}: {
    vehicles: PaginatedVehicles;
    filters: VehicleFilters;
    types: VehicleType[];
    cities: string[];
    currencies: string[];
}) {
    const { browsingCity } = useVisitorLocation();
    const [areFiltersOpen, setAreFiltersOpen] = useState(false);
    const activeFilterCount =
        filters.types.length +
        (filters.city ? 1 : 0) +
        (filters.driver ? 1 : 0) +
        (filters.currency ? 1 : 0);
    const pageCount = vehicles.last_page;

    /**
     * Reload the list with some filters changed, back on the first page
     * unless a page is given.
     */
    function applyFilters(
        changes: Partial<VehicleFilters> & { page?: number },
    ) {
        const next = { ...filters, ...changes };

        router.get(
            vehiclesIndex.url(),
            {
                types: next.types.length > 0 ? next.types : undefined,
                city: next.city || (browsingCity ? 'all' : undefined),
                driver: next.driver || undefined,
                currency: next.currency || undefined,
                sort: next.sort !== 'price_asc' ? next.sort : undefined,
                page:
                    changes.page && changes.page > 1 ? changes.page : undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function toggleType(slug: string) {
        applyFilters({
            types: filters.types.includes(slug)
                ? filters.types.filter((type) => type !== slug)
                : [...filters.types, slug],
        });
    }

    function clearFilters() {
        applyFilters({ types: [], city: '', driver: '', currency: '' });
    }

    return (
        <>
            <Head title={t('Vehicle & equipment rental')} />

            <header className="border-b border-outline-variant bg-surface-container-low px-page py-10 md:py-12">
                <h1 className="text-headline-lg text-on-surface md:text-display-lg">
                    {t('Vehicle & Equipment Rental')}
                </h1>
                <p className="mt-2 max-w-2xl text-body-lg text-on-surface-variant">
                    {t(
                        'Trucks, pick-ups, buses, vans and machinery from verified fleets across the DRC.',
                    )}
                </p>
            </header>

            <div className="flex w-full flex-col gap-6 px-page py-6 md:py-10 lg:flex-row lg:items-start lg:gap-8">
                <div className="flex items-center justify-between gap-3 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setAreFiltersOpen(!areFiltersOpen)}
                        aria-expanded={areFiltersOpen}
                        aria-controls="vehicle-filters"
                        className="inline-flex h-11 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-label-md text-on-surface"
                    >
                        <MaterialSymbol name="tune" className="text-lg" />
                        {t('Filters')}
                        {activeFilterCount > 0 && (
                            <span className="rounded-full bg-primary px-2 text-label-sm text-on-primary">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    <SortSelect
                        value={filters.sort}
                        onChange={(sort) => applyFilters({ sort })}
                    />
                </div>

                <aside
                    id="vehicle-filters"
                    className={cn(
                        'w-full shrink-0 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 lg:sticky lg:top-24 lg:block lg:w-64',
                        areFiltersOpen ? 'block' : 'hidden',
                    )}
                >
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-label-md font-semibold text-on-surface">
                            {t('Filters')}
                        </h2>
                        {activeFilterCount > 0 && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="text-label-sm text-primary hover:underline"
                            >
                                {t('Clear all')}
                            </button>
                        )}
                    </div>

                    <FilterGroup title={t('Vehicle type')}>
                        <ul className="flex flex-col gap-1">
                            {types.map((type) => (
                                <li key={type.slug}>
                                    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-container-low">
                                        <input
                                            type="checkbox"
                                            checked={filters.types.includes(
                                                type.slug,
                                            )}
                                            onChange={() =>
                                                toggleType(type.slug)
                                            }
                                            className="size-4 rounded accent-primary"
                                        />
                                        <span className="flex-1 text-[13px] leading-5 text-on-surface">
                                            {type.name}
                                        </span>
                                        <span className="text-[13px] leading-5 text-on-surface-variant tabular-nums">
                                            {type.count}
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </FilterGroup>

                    <FilterGroup title={t('City')} htmlFor="vehicle-city">
                        <div className="relative">
                            <select
                                id="vehicle-city"
                                value={filters.city}
                                onChange={(event) =>
                                    applyFilters({ city: event.target.value })
                                }
                                className={cn(
                                    selectClassName,
                                    'px-3 py-2.5 pr-9 shadow-none',
                                )}
                            >
                                <option value="">{t('All cities')}</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                            <MaterialSymbol
                                name="expand_more"
                                className="pointer-events-none absolute top-2.5 right-2 text-outline"
                            />
                        </div>
                    </FilterGroup>

                    <FilterGroup title={t('Driver')}>
                        <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface-container-low p-1">
                            {driverFilters.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() =>
                                        applyFilters({ driver: option.value })
                                    }
                                    aria-pressed={
                                        filters.driver === option.value
                                    }
                                    className={cn(
                                        'rounded-md px-2 py-2 text-label-sm transition-colors',
                                        filters.driver === option.value
                                            ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                                            : 'text-on-surface-variant hover:text-on-surface',
                                    )}
                                >
                                    {t(option.label)}
                                </button>
                            ))}
                        </div>
                    </FilterGroup>

                    <FilterGroup title={t('Price in')} isLast>
                        <div className="flex gap-2">
                            {['', ...currencies].map((currency) => (
                                <button
                                    key={currency || 'any'}
                                    type="button"
                                    onClick={() => applyFilters({ currency })}
                                    aria-pressed={filters.currency === currency}
                                    className={cn(
                                        'flex-1 rounded-lg border px-3 py-2 text-label-sm transition-colors',
                                        filters.currency === currency
                                            ? 'border-primary bg-primary text-on-primary'
                                            : 'border-outline-variant text-on-surface-variant hover:border-primary',
                                    )}
                                >
                                    {currency || t('Any')}
                                </button>
                            ))}
                        </div>
                    </FilterGroup>
                </aside>

                <section className="flex min-w-0 flex-1 flex-col gap-6">
                    <div className="flex items-center justify-between gap-4">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-md text-on-surface-variant">
                            {vehicles.total === 0
                                ? filters.city
                                    ? t('No vehicles found in :city', {
                                          city: filters.city,
                                      })
                                    : t('No vehicles found')
                                : t(
                                      filters.city
                                          ? 'Showing :from–:to of :total vehicles in :city'
                                          : 'Showing :from–:to of :total vehicles',
                                      {
                                          from: vehicles.from ?? 0,
                                          to: vehicles.to ?? 0,
                                          total: vehicles.total,
                                          city: filters.city,
                                      },
                                  )}
                            {filters.city && (
                                <button
                                    type="button"
                                    onClick={() => applyFilters({ city: '' })}
                                    className="cursor-pointer text-label-md text-primary underline-offset-2 hover:underline"
                                >
                                    {t('See all of DRC')}
                                </button>
                            )}
                        </p>
                        <div className="hidden lg:block">
                            <SortSelect
                                value={filters.sort}
                                onChange={(sort) => applyFilters({ sort })}
                            />
                        </div>
                    </div>

                    {vehicles.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-12 text-center">
                            <MaterialSymbol
                                name="no_transfer"
                                className="text-4xl text-outline"
                            />
                            <p className="text-body-md text-on-surface-variant">
                                {t('No vehicles match these filters.')}
                            </p>
                            {activeFilterCount > 0 && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-label-md text-primary hover:underline"
                                >
                                    {t('Clear filters')}
                                </button>
                            )}
                        </div>
                    ) : (
                        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {vehicles.data.map((vehicle) => (
                                <li key={vehicle.id}>
                                    <PublicVehicleCard
                                        vehicle={vehicle}
                                        href={showFleet.url(
                                            vehicle.fleet.slug,
                                            {
                                                query: { vehicle: vehicle.id },
                                            },
                                        )}
                                        footer={
                                            <>
                                                <MaterialSymbol
                                                    name="verified"
                                                    filled
                                                    className="text-base text-primary"
                                                />
                                                <span className="truncate">
                                                    {vehicle.fleet.name}
                                                    {vehicle.fleet.city &&
                                                        ` · ${vehicle.fleet.city}`}
                                                </span>
                                            </>
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    )}

                    {pageCount > 1 && (
                        <nav
                            aria-label={t('Pagination')}
                            className="mt-4 flex flex-wrap items-center justify-center gap-2"
                        >
                            <PageButton
                                label={t('Previous page')}
                                disabled={vehicles.current_page === 1}
                                onClick={() =>
                                    applyFilters({
                                        page: vehicles.current_page - 1,
                                    })
                                }
                            >
                                <MaterialSymbol
                                    name="chevron_left"
                                    className="text-sm"
                                />
                            </PageButton>
                            {Array.from({ length: pageCount }, (_, index) => {
                                const pageNumber = index + 1;
                                const isCurrent =
                                    pageNumber === vehicles.current_page;

                                return (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() =>
                                            applyFilters({ page: pageNumber })
                                        }
                                        aria-current={
                                            isCurrent ? 'page' : undefined
                                        }
                                        className={cn(
                                            'flex size-10 items-center justify-center rounded-lg text-label-sm',
                                            isCurrent
                                                ? 'bg-primary text-on-primary'
                                                : 'text-on-surface hover:bg-surface-container-low',
                                        )}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                            <PageButton
                                label={t('Next page')}
                                disabled={vehicles.current_page === pageCount}
                                onClick={() =>
                                    applyFilters({
                                        page: vehicles.current_page + 1,
                                    })
                                }
                            >
                                <MaterialSymbol
                                    name="chevron_right"
                                    className="text-sm"
                                />
                            </PageButton>
                        </nav>
                    )}
                </section>
            </div>
        </>
    );
}

function FilterGroup({
    title,
    htmlFor,
    isLast = false,
    children,
}: {
    title: string;
    htmlFor?: string;
    isLast?: boolean;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'flex flex-col gap-2',
                !isLast && 'mb-5 border-b border-outline-variant/60 pb-5',
            )}
        >
            {htmlFor ? (
                <label
                    htmlFor={htmlFor}
                    className="text-label-sm font-semibold text-on-surface-variant uppercase"
                >
                    {title}
                </label>
            ) : (
                <span className="text-label-sm font-semibold text-on-surface-variant uppercase">
                    {title}
                </span>
            )}
            {children}
        </div>
    );
}

function SortSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                aria-label={t('Sort vehicles')}
                className={cn(
                    selectClassName,
                    'h-11 rounded-lg py-2 pr-9 pl-3 shadow-none',
                )}
            >
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {t(option.label)}
                    </option>
                ))}
            </select>
            <MaterialSymbol
                name="expand_more"
                className="pointer-events-none absolute top-3 right-2 text-outline"
            />
        </div>
    );
}

function PageButton({
    label,
    disabled,
    onClick,
    children,
}: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className="flex size-10 items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
        >
            {children}
        </button>
    );
}
