import { Head } from '@inertiajs/react';
import { useState } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useCurrency } from '@/hooks/use-currency';
import StarRating from '@/components/directory/star-rating';
import PublicFleetGrid from '@/components/directory/public-fleet-grid';
import VehicleBookingDialog from '@/components/directory/vehicle-booking-dialog';
import type { FleetVehicle } from '@/types';
import { t } from '@/lib/i18n';

type PublicFleet = {
    slug: string;
    name: string;
    city: string | null;
    commune: string | null;
    phone: string;
    isOnWhatsApp: boolean;
    rating: number;
    reviewsCount: number;
    vehicleCount: number;
    lowestDailyRate: { amount: string; currency: string } | null;
};

export default function Fleet({
    fleet,
    vehicles,
    selectedVehicleId,
}: {
    fleet: PublicFleet;
    vehicles: FleetVehicle[];
    selectedVehicleId: number | null;
}) {
    const { formatPrice } = useCurrency();
    const [bookingVehicle, setBookingVehicle] = useState<FleetVehicle | null>(
        null,
    );

    return (
        <>
            <Head title={t(':name · Vehicle rental', { name: fleet.name })} />

            <header className="border-b border-outline-variant bg-surface-container-low px-page py-12">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="flex items-center gap-1 text-label-sm text-primary">
                            <MaterialSymbol
                                name="verified"
                                filled
                                className="text-base"
                            />
                            {t('Verified fleet')}
                        </p>
                        <h1 className="mt-1 text-headline-lg text-on-surface md:text-display-lg">
                            {fleet.name}
                        </h1>
                        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-md text-on-surface-variant">
                            {fleet.city && (
                                <span className="flex items-center gap-1">
                                    <MaterialSymbol
                                        name="location_on"
                                        className="text-base"
                                    />
                                    {fleet.commune
                                        ? `${fleet.commune}, ${fleet.city}`
                                        : fleet.city}
                                </span>
                            )}
                            <span>
                                {fleet.vehicleCount}{' '}
                                {fleet.vehicleCount === 1
                                    ? t('vehicle')
                                    : t('vehicles')}
                            </span>
                            {fleet.lowestDailyRate && (
                                <span>
                                    {t('From')}{' '}
                                    {formatPrice(
                                        fleet.lowestDailyRate.amount,
                                        fleet.lowestDailyRate.currency,
                                    )}{' '}
                                    {t('/ day')}
                                </span>
                            )}
                            {fleet.reviewsCount > 0 && (
                                <span className="flex items-center gap-1">
                                    <StarRating rating={fleet.rating} />(
                                    {fleet.reviewsCount})
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href={`tel:${fleet.phone}`}
                            className="flex items-center gap-2 rounded-lg border border-primary px-5 py-3 text-label-md text-primary transition-colors hover:bg-primary hover:text-on-primary"
                        >
                            <MaterialSymbol name="call" className="text-lg" />
                            {t('Call')}
                        </a>
                        {fleet.isOnWhatsApp && (
                            <a
                                href={`https://wa.me/${fleet.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container"
                            >
                                <MaterialSymbol
                                    name="chat"
                                    className="text-lg"
                                />
                                {t('WhatsApp')}
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <section className="w-full px-page py-10">
                <PublicFleetGrid
                    vehicles={vehicles}
                    initialOpenVehicleId={selectedVehicleId}
                    onRequest={setBookingVehicle}
                />
            </section>

            <VehicleBookingDialog
                fleetSlug={fleet.slug}
                fleetName={fleet.name}
                vehicle={bookingVehicle}
                onClose={() => setBookingVehicle(null)}
            />
        </>
    );
}
