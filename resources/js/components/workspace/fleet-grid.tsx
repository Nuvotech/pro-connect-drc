import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Truck, X } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useCategories } from '@/hooks/use-categories';
import {
    driverOptions,
    formatMoney,
    fuelTypeOptions,
    optionLabel,
    transmissionOptions,
    vehiclePhotoAngles,
} from '@/lib/admin-data';
import { cn } from '@/lib/utils';
import type { FleetVehicle } from '@/types';
import { t } from '@/lib/i18n';

function vehicleTitle(vehicle: FleetVehicle): string {
    return `${vehicle.make} ${vehicle.model}`;
}

function capacityOf(vehicle: FleetVehicle): string | null {
    const parts = [
        vehicle.seats ? `${vehicle.seats} seats` : null,
        vehicle.payloadTonnes ? `${Number(vehicle.payloadTonnes)} t` : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' · ') : null;
}

/**
 * A provider's fleet: filter chips by vehicle type, a grid of vehicle
 * cards and a pop-up with each vehicle's photos and full details.
 */
export default function FleetGrid({
    vehicles,
    emptyMessage,
    action,
    vehicleActions,
}: {
    vehicles: FleetVehicle[];
    emptyMessage: string;
    action?: ReactNode;
    /** Buttons shown in a vehicle's pop-up, such as Edit or Remove. */
    vehicleActions?: (vehicle: FleetVehicle) => ReactNode;
}) {
    const { categoryName } = useCategories();
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [openVehicleId, setOpenVehicleId] = useState<number | null>(null);

    const vehicleTypes = [
        ...new Set(vehicles.map((vehicle) => vehicle.category)),
    ];
    const visibleVehicles = typeFilter
        ? vehicles.filter((vehicle) => vehicle.category === typeFilter)
        : vehicles;
    const openVehicle =
        vehicles.find((vehicle) => vehicle.id === openVehicleId) ?? null;

    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h2 className="text-base font-semibold text-zinc-900">
                    {t('Fleet')}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                    {vehicleTypes.length > 1 && (
                        <div
                            role="group"
                            aria-label={t('Filter by vehicle type')}
                            className="flex flex-wrap gap-1.5"
                        >
                            <FilterChip
                                isActive={typeFilter === null}
                                onClick={() => setTypeFilter(null)}
                            >
                                {t('All')}
                            </FilterChip>
                            {vehicleTypes.map((type) => (
                                <FilterChip
                                    key={type}
                                    isActive={typeFilter === type}
                                    onClick={() => setTypeFilter(type)}
                                >
                                    {categoryName(type)}
                                </FilterChip>
                            ))}
                        </div>
                    )}
                    {action}
                </div>
            </div>

            {vehicles.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                    <Truck
                        className="size-6 text-zinc-400"
                        aria-hidden="true"
                    />
                    <p className="text-sm text-zinc-500">{emptyMessage}</p>
                </div>
            ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {visibleVehicles.map((vehicle) => (
                        <li key={vehicle.id}>
                            <VehicleCard
                                vehicle={vehicle}
                                onOpen={() => setOpenVehicleId(vehicle.id)}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <VehicleDialog
                vehicle={openVehicle}
                onClose={() => setOpenVehicleId(null)}
                actions={openVehicle && vehicleActions?.(openVehicle)}
            />
        </section>
    );
}

function FilterChip({
    isActive,
    onClick,
    children,
}: {
    isActive: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={isActive}
            className={cn(
                'cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200',
                isActive
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900',
            )}
        >
            {children}
        </button>
    );
}

function VehiclePhoto({
    vehicle,
    className,
}: {
    vehicle: FleetVehicle;
    className?: string;
}) {
    const coverPhoto = vehicle.photos[0];

    if (coverPhoto) {
        return (
            <img
                src={coverPhoto.url}
                alt={`${vehicleTitle(vehicle)}, ${optionLabel(vehiclePhotoAngles, coverPhoto.angle).toLowerCase()}`}
                className={cn('object-cover', className)}
            />
        );
    }

    return (
        <div
            className={cn(
                'flex items-center justify-center bg-zinc-100 text-zinc-400',
                className,
            )}
        >
            <Truck className="size-8" aria-hidden="true" />
        </div>
    );
}

function PhotoGallery({ vehicle }: { vehicle: FleetVehicle }) {
    const [activeAngle, setActiveAngle] = useState(vehicle.photos[0].angle);
    const activePhoto =
        vehicle.photos.find((photo) => photo.angle === activeAngle) ??
        vehicle.photos[0];

    return (
        <div className="flex flex-col gap-3">
            <figure className="flex flex-col gap-2">
                <img
                    src={activePhoto.url}
                    alt={`${vehicleTitle(vehicle)}, ${optionLabel(vehiclePhotoAngles, activePhoto.angle).toLowerCase()}`}
                    className="aspect-[16/9] w-full rounded-xl bg-zinc-100 object-cover"
                />
                <figcaption className="text-xs text-zinc-500">
                    {optionLabel(vehiclePhotoAngles, activePhoto.angle)}
                </figcaption>
            </figure>
            <div
                role="group"
                aria-label={t('Vehicle photos')}
                className="grid grid-cols-3 gap-2 sm:grid-cols-6"
            >
                {vehicle.photos.map((photo) => {
                    const label = optionLabel(vehiclePhotoAngles, photo.angle);
                    const isActive = photo.angle === activePhoto.angle;

                    return (
                        <button
                            key={photo.angle}
                            type="button"
                            onClick={() => setActiveAngle(photo.angle)}
                            aria-label={`Show ${label.toLowerCase()} photo`}
                            aria-pressed={isActive}
                            className={cn(
                                'cursor-pointer overflow-hidden rounded-lg ring-offset-2 transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none',
                                isActive
                                    ? 'ring-2 ring-primary'
                                    : 'opacity-70 hover:opacity-100',
                            )}
                        >
                            <img
                                src={photo.url}
                                alt=""
                                className="aspect-[4/3] w-full object-cover"
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function VehicleCard({
    vehicle,
    onOpen,
}: {
    vehicle: FleetVehicle;
    onOpen: () => void;
}) {
    const { categoryName } = useCategories();
    const capacity = capacityOf(vehicle);

    return (
        <button
            type="button"
            onClick={onOpen}
            className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white text-left transition-colors duration-200 hover:border-zinc-300 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
        >
            <VehiclePhoto vehicle={vehicle} className="aspect-[16/9] w-full" />
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                            {vehicleTitle(vehicle)}
                        </p>
                        <p className="text-xs text-zinc-500">
                            {categoryName(vehicle.category)} · {vehicle.year}
                        </p>
                    </div>
                    <p className="shrink-0 text-right">
                        <span className="block text-sm font-semibold text-zinc-900 tabular-nums">
                            {formatMoney(vehicle.dailyRate, vehicle.currency)}
                        </span>
                        <span className="text-xs text-zinc-500">
                            {t('per day')}
                        </span>
                    </p>
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                    {vehicle.registrationNumber && (
                        <>
                            <span className="font-mono">
                                {vehicle.registrationNumber}
                            </span>
                            <span aria-hidden="true">·</span>
                        </>
                    )}
                    <span>
                        {optionLabel(driverOptions, vehicle.driverOption)}
                    </span>
                    {capacity && (
                        <>
                            <span aria-hidden="true">·</span>
                            <span>{capacity}</span>
                        </>
                    )}
                    {vehicle.quantity > 1 && (
                        <>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-zinc-900">
                                ×{vehicle.quantity} {t('units')}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </button>
    );
}

function VehicleDialog({
    vehicle,
    onClose,
    actions,
}: {
    vehicle: FleetVehicle | null;
    onClose: () => void;
    actions?: ReactNode;
}) {
    return (
        <DialogPrimitive.Root
            open={vehicle !== null}
            onOpenChange={(isOpen) => !isOpen && onClose()}
        >
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="proconnect fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:p-6">
                    <DialogPrimitive.Content
                        aria-describedby={undefined}
                        className="flex h-dvh w-full max-w-2xl flex-col overflow-hidden bg-white shadow-xl duration-200 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-95 sm:h-auto sm:max-h-[90vh] sm:rounded-2xl"
                    >
                        {vehicle && (
                            <VehicleDetails
                                vehicle={vehicle}
                                actions={actions}
                            />
                        )}
                    </DialogPrimitive.Content>
                </DialogPrimitive.Overlay>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

function VehicleDetails({
    vehicle,
    actions,
}: {
    vehicle: FleetVehicle;
    actions?: ReactNode;
}) {
    const { categoryName } = useCategories();
    const isPublic = vehicle.registrationNumber === null;
    const specs: [string, ReactNode][] = [
        ['Type', categoryName(vehicle.category)],
        ['Year', vehicle.year],
        ...(isPublic
            ? []
            : ([
                  [
                      'Number plate',
                      <span key="plate" className="font-mono text-[13px]">
                          {vehicle.registrationNumber}
                      </span>,
                  ],
              ] as [string, ReactNode][])),
        [
            'Transmission',
            optionLabel(transmissionOptions, vehicle.transmission),
        ],
        ['Fuel', optionLabel(fuelTypeOptions, vehicle.fuelType)],
        ['Seats', vehicle.seats ?? '—'],
        [
            'Payload',
            vehicle.payloadTonnes
                ? `${Number(vehicle.payloadTonnes)} tonnes`
                : '—',
        ],
        ['Units in fleet', vehicle.quantity],
    ];
    const terms: [string, ReactNode][] = [
        ['Daily rate', formatMoney(vehicle.dailyRate, vehicle.currency)],
        [
            'Deposit',
            vehicle.deposit
                ? formatMoney(vehicle.deposit, vehicle.currency)
                : '—',
        ],
        ['Hire option', optionLabel(driverOptions, vehicle.driverOption)],
        [
            'Minimum rental',
            `${vehicle.minimumRentalDays} ${vehicle.minimumRentalDays === 1 ? 'day' : 'days'}`,
        ],
    ];

    if (!isPublic) {
        terms.push([
            'Insurance',
            vehicle.insuranceExpiresOn ? (
                <span
                    key="insurance"
                    className={cn(
                        vehicle.isInsuranceExpired &&
                            'font-medium text-zinc-900 underline decoration-dotted',
                    )}
                >
                    {vehicle.isInsuranceExpired
                        ? `Expired ${vehicle.insuranceExpiresOn}`
                        : t('Valid until :insuranceExpiresOn', {
                              insuranceExpiresOn: vehicle.insuranceExpiresOn,
                          })}
                </span>
            ) : (
                'Not provided'
            ),
        ]);
    }

    return (
        <>
            <div className="flex shrink-0 items-start justify-between gap-6 border-b border-zinc-200 px-6 py-5">
                <div className="min-w-0">
                    <DialogPrimitive.Title className="text-lg font-semibold tracking-tight text-zinc-900">
                        {vehicleTitle(vehicle)}
                    </DialogPrimitive.Title>
                    <p className="mt-0.5 text-sm text-zinc-500">
                        {categoryName(vehicle.category)} · {vehicle.year}
                    </p>
                </div>
                <DialogPrimitive.Close
                    aria-label={t('Close')}
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-700"
                >
                    <X className="size-4" />
                </DialogPrimitive.Close>
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto p-6">
                {vehicle.photos.length > 0 ? (
                    <PhotoGallery key={vehicle.id} vehicle={vehicle} />
                ) : (
                    <VehiclePhoto
                        vehicle={vehicle}
                        className="aspect-[16/9] w-full rounded-xl"
                    />
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <DetailList title={t('Specifications')} items={specs} />
                    <DetailList title={t('Rental terms')} items={terms} />
                </div>

                {vehicle.notes && (
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-zinc-900">
                            {t('Notes')}
                        </h3>
                        <p className="text-sm leading-relaxed text-zinc-600">
                            {vehicle.notes}
                        </p>
                    </section>
                )}
            </div>

            {actions && (
                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-zinc-200 px-6 py-4">
                    {actions}
                </div>
            )}
        </>
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
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">
                {title}
            </h3>
            <dl className="flex flex-col divide-y divide-zinc-100 text-sm">
                {items.map(([label, value]) => (
                    <div
                        key={label}
                        className="flex items-baseline justify-between gap-4 py-2 first:pt-0"
                    >
                        <dt className="text-zinc-500">{label}</dt>
                        <dd className="text-right text-zinc-900 tabular-nums">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
