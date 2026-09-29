import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useState } from 'react';
import type { ReactNode } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useCurrency } from '@/hooks/use-currency';
import PublicVehicleCard from '@/components/directory/public-vehicle-card';
import { useCategories } from '@/hooks/use-categories';
import {
    driverOptions,
    fuelTypeOptions,
    optionLabel,
    transmissionOptions,
    vehiclePhotoAngles,
} from '@/lib/admin-data';
import { cn } from '@/lib/utils';
import type { FleetVehicle } from '@/types';
import { t } from '@/lib/i18n';

const driverFilters = [
    { value: '', label: 'Any' },
    { value: 'self_drive', label: 'Self-drive' },
    { value: 'with_driver', label: 'With driver' },
];

/**
 * Whether a vehicle can be hired the way the customer wants.
 */
function matchesDriver(vehicle: FleetVehicle, driver: string): boolean {
    return (
        !driver ||
        vehicle.driverOption === driver ||
        vehicle.driverOption === 'both'
    );
}

/**
 * A fleet's vehicles on its public page: filters on the left (behind a
 * button on phones), a grid of cards, and a pop-up with each vehicle's
 * photos, details and a request button.
 */
export default function PublicFleetGrid({
    vehicles,
    initialOpenVehicleId = null,
    onRequest,
}: {
    vehicles: FleetVehicle[];
    /** Open this vehicle's details straight away, e.g. from a link. */
    initialOpenVehicleId?: number | null;
    onRequest: (vehicle: FleetVehicle) => void;
}) {
    const { categoryName } = useCategories();
    const [types, setTypes] = useState<string[]>([]);
    const [driver, setDriver] = useState('');
    const [areFiltersOpen, setAreFiltersOpen] = useState(false);
    const [openVehicleId, setOpenVehicleId] = useState<number | null>(
        initialOpenVehicleId,
    );

    const vehicleTypes = [
        ...new Set(vehicles.map((vehicle) => vehicle.category)),
    ].map((type) => ({
        slug: type,
        name: categoryName(type),
        count: vehicles.filter((vehicle) => vehicle.category === type).length,
    }));
    const visibleVehicles = vehicles.filter(
        (vehicle) =>
            (types.length === 0 || types.includes(vehicle.category)) &&
            matchesDriver(vehicle, driver),
    );
    const activeFilterCount = types.length + (driver ? 1 : 0);
    const openVehicle =
        vehicles.find((vehicle) => vehicle.id === openVehicleId) ?? null;

    function toggleType(slug: string) {
        setTypes((previous) =>
            previous.includes(slug)
                ? previous.filter((type) => type !== slug)
                : [...previous, slug],
        );
    }

    function clearFilters() {
        setTypes([]);
        setDriver('');
    }

    if (vehicles.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-12 text-center">
                <MaterialSymbol
                    name="no_transfer"
                    className="text-4xl text-outline"
                />
                <p className="text-body-md text-on-surface-variant">
                    {t('This fleet has no vehicles listed yet.')}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <div className="flex items-center justify-between gap-3 lg:hidden">
                <button
                    type="button"
                    onClick={() => setAreFiltersOpen(!areFiltersOpen)}
                    aria-expanded={areFiltersOpen}
                    aria-controls="fleet-filters"
                    className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-label-md text-on-surface"
                >
                    <MaterialSymbol name="tune" className="text-lg" />
                    {t('Filters')}
                    {activeFilterCount > 0 && (
                        <span className="rounded-full bg-primary px-2 text-label-sm text-on-primary">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
                <p className="text-label-sm text-on-surface-variant">
                    {visibleVehicles.length} {t('of')} {vehicles.length}{' '}
                    {t('vehicles')}
                </p>
            </div>

            <aside
                id="fleet-filters"
                aria-label={t("Filter this fleet's vehicles")}
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
                            className="cursor-pointer text-label-sm text-primary hover:underline"
                        >
                            {t('Clear all')}
                        </button>
                    )}
                </div>

                <FilterGroup title={t('Vehicle type')}>
                    <ul className="flex flex-col gap-1">
                        {vehicleTypes.map((type) => (
                            <li key={type.slug}>
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-container-low">
                                    <input
                                        type="checkbox"
                                        checked={types.includes(type.slug)}
                                        onChange={() => toggleType(type.slug)}
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

                <FilterGroup title={t('Driver')} isLast>
                    <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface-container-low p-1">
                        {driverFilters.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setDriver(option.value)}
                                aria-pressed={driver === option.value}
                                className={cn(
                                    'cursor-pointer rounded-md px-2 py-2 text-label-sm transition-colors',
                                    driver === option.value
                                        ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                                        : 'text-on-surface-variant hover:text-on-surface',
                                )}
                            >
                                {t(option.label)}
                            </button>
                        ))}
                    </div>
                </FilterGroup>
            </aside>

            <section
                aria-labelledby="fleet-heading"
                className="flex min-w-0 flex-1 flex-col gap-6"
            >
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
                    <div>
                        <h2
                            id="fleet-heading"
                            className="text-headline-md text-on-surface"
                        >
                            {t('Vehicles for hire')}
                        </h2>
                        <p className="mt-1 text-body-md text-on-surface-variant">
                            {t(
                                'Choose a vehicle to see its photos and request it.',
                            )}
                        </p>
                    </div>
                    <p className="hidden text-label-sm text-on-surface-variant lg:block">
                        {visibleVehicles.length} {t('of')} {vehicles.length}{' '}
                        {t('vehicles')}
                    </p>
                </div>

                {visibleVehicles.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-12 text-center">
                        <p className="text-body-md text-on-surface-variant">
                            {t('No vehicles match these filters.')}
                        </p>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="cursor-pointer text-label-md text-primary hover:underline"
                        >
                            {t('Clear filters')}
                        </button>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {visibleVehicles.map((vehicle) => (
                            <li key={vehicle.id}>
                                <PublicVehicleCard
                                    vehicle={vehicle}
                                    onOpen={() => setOpenVehicleId(vehicle.id)}
                                    footer={
                                        <>
                                            <MaterialSymbol
                                                name="category"
                                                className="text-base"
                                            />
                                            {categoryName(vehicle.category)}
                                        </>
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <DialogPrimitive.Root
                open={openVehicle !== null}
                onOpenChange={(isOpen) => !isOpen && setOpenVehicleId(null)}
            >
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="proconnect fixed inset-0 z-50 flex items-end justify-center bg-black/40 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:items-center sm:p-6">
                        <DialogPrimitive.Content
                            aria-describedby={undefined}
                            className="flex max-h-dvh w-full max-w-3xl flex-col overflow-hidden bg-surface-container-lowest shadow-xl duration-200 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-95 sm:max-h-[92vh] sm:rounded-2xl"
                        >
                            {openVehicle && (
                                <VehicleDetails
                                    vehicle={openVehicle}
                                    onRequest={() => {
                                        setOpenVehicleId(null);
                                        onRequest(openVehicle);
                                    }}
                                />
                            )}
                        </DialogPrimitive.Content>
                    </DialogPrimitive.Overlay>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
        </div>
    );
}

function FilterGroup({
    title,
    isLast = false,
    children,
}: {
    title: string;
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
            <span className="text-label-sm font-semibold text-on-surface-variant uppercase">
                {title}
            </span>
            {children}
        </div>
    );
}

function VehicleDetails({
    vehicle,
    onRequest,
}: {
    vehicle: FleetVehicle;
    onRequest: () => void;
}) {
    const { formatPrice } = useCurrency();
    const { categoryName } = useCategories();
    const title = `${vehicle.make} ${vehicle.model}`;
    const specs: [string, ReactNode][] = [
        ['Type', categoryName(vehicle.category)],
        ['Year', vehicle.year],
        [
            'Transmission',
            optionLabel(transmissionOptions, vehicle.transmission),
        ],
        ['Fuel', optionLabel(fuelTypeOptions, vehicle.fuelType)],
        ...(vehicle.seats
            ? [['Seats', vehicle.seats] as [string, ReactNode]]
            : []),
        ...(vehicle.payloadTonnes
            ? [
                  ['Payload', `${Number(vehicle.payloadTonnes)} tonnes`] as [
                      string,
                      ReactNode,
                  ],
              ]
            : []),
        [
            'Available',
            `${vehicle.quantity} ${vehicle.quantity === 1 ? 'unit' : 'units'}`,
        ],
    ];
    const terms: [string, ReactNode][] = [
        ['Daily rate', formatPrice(vehicle.dailyRate, vehicle.currency)],
        ...(vehicle.deposit
            ? [
                  [
                      'Deposit',
                      formatPrice(vehicle.deposit, vehicle.currency),
                  ] as [string, ReactNode],
              ]
            : []),
        ['Driver', optionLabel(driverOptions, vehicle.driverOption)],
        [
            'Minimum rental',
            `${vehicle.minimumRentalDays} ${vehicle.minimumRentalDays === 1 ? 'day' : 'days'}`,
        ],
    ];

    return (
        <>
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-outline-variant px-6 py-5">
                <div className="min-w-0">
                    <DialogPrimitive.Title className="text-headline-md text-on-surface">
                        {title}
                    </DialogPrimitive.Title>
                    <p className="mt-0.5 text-body-md text-on-surface-variant">
                        {categoryName(vehicle.category)} · {vehicle.year}
                    </p>
                </div>
                <DialogPrimitive.Close
                    aria-label={t('Close')}
                    className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary"
                >
                    <MaterialSymbol name="close" />
                </DialogPrimitive.Close>
            </header>

            <div className="flex min-h-0 flex-col gap-6 overflow-y-auto p-6">
                {vehicle.photos.length > 0 ? (
                    <PhotoGallery
                        key={vehicle.id}
                        vehicle={vehicle}
                        title={title}
                    />
                ) : (
                    <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl bg-surface-variant text-outline">
                        <MaterialSymbol
                            name="directions_car"
                            className="text-6xl"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <DetailList title={t('Specifications')} items={specs} />
                    <DetailList title={t('Rental terms')} items={terms} />
                </div>

                {vehicle.notes && (
                    <section>
                        <h3 className="mb-2 text-label-md text-on-surface">
                            {t('Notes from the fleet')}
                        </h3>
                        <p className="text-body-md text-on-surface-variant">
                            {vehicle.notes}
                        </p>
                    </section>
                )}
            </div>

            <footer className="flex shrink-0 flex-col gap-3 border-t border-outline-variant px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-on-surface">
                    <span className="text-lg font-semibold">
                        {formatPrice(vehicle.dailyRate, vehicle.currency)}
                    </span>
                    <span className="text-label-sm text-on-surface-variant">
                        {' '}
                        {t('/ day')}
                    </span>
                </p>
                <button
                    type="button"
                    onClick={onRequest}
                    className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 text-label-md text-on-primary transition-colors hover:bg-primary-container"
                >
                    {t('Request this vehicle')}
                    <MaterialSymbol name="arrow_forward" className="text-lg" />
                </button>
            </footer>
        </>
    );
}

function PhotoGallery({
    vehicle,
    title,
}: {
    vehicle: FleetVehicle;
    title: string;
}) {
    const [activeAngle, setActiveAngle] = useState(vehicle.photos[0].angle);
    const activePhoto =
        vehicle.photos.find((photo) => photo.angle === activeAngle) ??
        vehicle.photos[0];
    const activeLabel = optionLabel(vehiclePhotoAngles, activePhoto.angle);

    return (
        <div className="flex flex-col gap-3">
            <figure className="relative overflow-hidden rounded-xl bg-surface-variant">
                <img
                    src={activePhoto.url}
                    alt={`${title}, ${activeLabel.toLowerCase()}`}
                    className="aspect-[16/9] w-full object-cover"
                />
                <figcaption className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-label-sm text-white">
                    {activeLabel}
                </figcaption>
            </figure>
            {vehicle.photos.length > 1 && (
                <div
                    role="group"
                    aria-label={t('Vehicle photos')}
                    className="grid grid-cols-6 gap-2"
                >
                    {vehicle.photos.map((photo) => {
                        const label = optionLabel(
                            vehiclePhotoAngles,
                            photo.angle,
                        );
                        const isActive = photo.angle === activePhoto.angle;

                        return (
                            <button
                                key={photo.angle}
                                type="button"
                                onClick={() => setActiveAngle(photo.angle)}
                                aria-label={`Show ${label.toLowerCase()} photo`}
                                aria-pressed={isActive}
                                className={cn(
                                    'cursor-pointer overflow-hidden rounded-lg ring-offset-2 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                                    isActive
                                        ? 'ring-2 ring-primary'
                                        : 'opacity-60 hover:opacity-100',
                                )}
                            >
                                <img
                                    src={photo.url}
                                    alt=""
                                    loading="lazy"
                                    className="aspect-square w-full object-cover"
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function DetailList({
    title,
    items,
}: {
    title: string;
    items: [string, ReactNode][];
}) {
    return (
        <section>
            <h3 className="mb-2 text-label-md text-on-surface">{title}</h3>
            <dl className="flex flex-col divide-y divide-outline-variant/60">
                {items.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-baseline justify-between gap-4 py-2.5"
                    >
                        <dt className="text-label-sm text-on-surface-variant">
                            {label}
                        </dt>
                        <dd className="text-right text-label-md text-on-surface tabular-nums">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
