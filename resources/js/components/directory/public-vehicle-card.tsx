import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useCurrency } from '@/hooks/use-currency';
import { driverOptions, optionLabel } from '@/lib/admin-data';
import type { FleetVehicle } from '@/types';
import { t } from '@/lib/i18n';

const cardClassName =
    'group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest text-left transition-shadow duration-200 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none';

/**
 * Seats and payload in one short line, such as "15 seats · 3 t".
 */
export function vehicleCapacity(vehicle: FleetVehicle): string | null {
    const parts = [
        vehicle.seats ? `${vehicle.seats} seats` : null,
        vehicle.payloadTonnes ? `${Number(vehicle.payloadTonnes)} t` : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' · ') : null;
}

/**
 * A vehicle as the public site shows it: photo, name, hire terms and the
 * daily rate. Opens a page (`href`) or a pop-up (`onOpen`).
 */
export default function PublicVehicleCard({
    vehicle,
    href,
    onOpen,
    footer,
}: {
    vehicle: FleetVehicle;
    href?: string;
    onOpen?: () => void;
    /** Extra line at the bottom, such as the fleet's name. */
    footer?: ReactNode;
}) {
    const { formatPrice } = useCurrency();
    const capacity = vehicleCapacity(vehicle);
    const content = (
        <>
            <div className="aspect-[4/3] w-full overflow-hidden bg-surface-variant">
                {vehicle.photos[0] ? (
                    <img
                        src={vehicle.photos[0].url}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <span className="flex size-full items-center justify-center text-outline">
                        <MaterialSymbol
                            name="directions_car"
                            className="text-5xl"
                        />
                    </span>
                )}
            </div>
            <span className="flex flex-1 flex-col gap-1.5 p-4">
                <span className="truncate text-base font-semibold text-on-surface">
                    {vehicle.make} {vehicle.model}
                </span>
                <span className="text-label-sm text-on-surface-variant">
                    {vehicle.year} ·{' '}
                    {optionLabel(driverOptions, vehicle.driverOption)}
                    {capacity && ` · ${capacity}`}
                </span>
                <span className="mt-1 flex items-baseline justify-between gap-2 text-on-surface">
                    <span>
                        <span className="text-lg font-semibold">
                            {formatPrice(vehicle.dailyRate, vehicle.currency)}
                        </span>
                        <span className="text-label-sm text-on-surface-variant">
                            {' '}
                            {t('/ day')}
                        </span>
                    </span>
                    {vehicle.quantity > 1 && (
                        <span className="text-label-sm text-on-surface-variant">
                            {vehicle.quantity} {t('available')}
                        </span>
                    )}
                </span>
                {footer && (
                    <span className="mt-auto flex items-center gap-1 border-t border-outline-variant/60 pt-3 text-label-sm text-on-surface-variant">
                        {footer}
                    </span>
                )}
            </span>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={cardClassName}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={onOpen}
            aria-haspopup="dialog"
            className={cardClassName}
        >
            {content}
        </button>
    );
}
