import { router } from '@inertiajs/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import FieldError from '@/components/directory/field-error';
import {
    inputClassName,
    invalidClassName,
    selectClassName,
} from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useCurrency } from '@/hooks/use-currency';
import { useCities } from '@/hooks/use-categories';
import { cn } from '@/lib/utils';
import { store as storeBooking } from '@/routes/fleets/bookings';
import type { FleetVehicle } from '@/types';
import { t } from '@/lib/i18n';

type BookingErrors = Partial<Record<string, string>>;

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

function daysBetween(start: string, end: string): number {
    if (!start || !end) {
        return 0;
    }

    const milliseconds = new Date(end).getTime() - new Date(start).getTime();

    return Math.max(0, Math.round(milliseconds / 86_400_000) + 1);
}

/**
 * A customer's request to hire one vehicle from a fleet's public page.
 */
export default function VehicleBookingDialog({
    fleetSlug,
    fleetName,
    vehicle,
    onClose,
}: {
    fleetSlug: string;
    fleetName: string;
    vehicle: FleetVehicle | null;
    onClose: () => void;
}) {
    return (
        <DialogPrimitive.Root
            open={vehicle !== null}
            onOpenChange={(isOpen) => !isOpen && onClose()}
        >
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="proconnect fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:items-center sm:p-6">
                    <DialogPrimitive.Content className="flex max-h-dvh w-full max-w-xl flex-col overflow-hidden bg-surface-container-lowest shadow-xl sm:max-h-[92vh] sm:rounded-2xl">
                        {vehicle && (
                            <BookingForm
                                key={vehicle.id}
                                fleetSlug={fleetSlug}
                                fleetName={fleetName}
                                vehicle={vehicle}
                                onClose={onClose}
                            />
                        )}
                    </DialogPrimitive.Content>
                </DialogPrimitive.Overlay>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

function BookingForm({
    fleetSlug,
    fleetName,
    vehicle,
    onClose,
}: {
    fleetSlug: string;
    fleetName: string;
    vehicle: FleetVehicle;
    onClose: () => void;
}) {
    const { formatPrice } = useCurrency();
    const { cities } = useCities();
    const [data, setData] = useState({
        startDate: today(),
        endDate: today(),
        quantity: 1,
        withDriver: vehicle.driverOption === 'with_driver',
        pickupLocation: '',
        notes: '',
        fullName: '',
        phone: '',
        email: '',
        city: 'Kinshasa',
    });
    const [errors, setErrors] = useState<BookingErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reference, setReference] = useState<string | null>(null);
    const days = daysBetween(data.startDate, data.endDate);
    const estimatedTotal = Number(vehicle.dailyRate) * days * data.quantity;

    function setField<TKey extends keyof typeof data>(
        key: TKey,
        value: (typeof data)[TKey],
    ) {
        setData((previous) => ({ ...previous, [key]: value }));
        setErrors((previous) => ({ ...previous, [key]: undefined }));
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.post(
            storeBooking.url(fleetSlug),
            {
                vehicle_id: vehicle.id,
                start_date: data.startDate,
                end_date: data.endDate,
                quantity: data.quantity,
                with_driver: data.withDriver ? 1 : 0,
                pickup_location: data.pickupLocation,
                notes: data.notes,
                full_name: data.fullName,
                phone: data.phone,
                email: data.email,
                city: data.city,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setIsSubmitting(true),
                onFinish: () => setIsSubmitting(false),
                onFlash: (flash) =>
                    setReference(
                        (flash as { reference?: string }).reference ?? null,
                    ),
                onError: (serverErrors) =>
                    setErrors({
                        startDate: serverErrors.start_date,
                        endDate: serverErrors.end_date,
                        quantity: serverErrors.quantity,
                        withDriver: serverErrors.with_driver,
                        fullName: serverErrors.full_name,
                        phone: serverErrors.phone,
                        email: serverErrors.email,
                        vehicle: serverErrors.vehicle_id,
                    }),
            },
        );
    }

    if (reference) {
        return (
            <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <DialogPrimitive.Title className="sr-only">
                    {t('Booking request sent')}
                </DialogPrimitive.Title>
                <span className="flex size-16 items-center justify-center rounded-full bg-primary-fixed text-primary">
                    <MaterialSymbol
                        name="check_circle"
                        filled
                        className="text-4xl"
                    />
                </span>
                <h2 className="text-headline-md text-on-surface">
                    {t('Request sent to')} {fleetName}
                </h2>
                <p className="max-w-sm text-body-md text-on-surface-variant">
                    {t('Your reference is')}{' '}
                    <span className="font-semibold text-on-surface">
                        {reference}
                    </span>
                    {t(
                        '. The fleet will confirm availability and contact you on +243',
                    )}{' '}
                    {data.phone}.
                </p>
                <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 rounded-lg bg-primary px-6 py-3 text-label-md text-on-primary hover:bg-primary-container"
                >
                    {t('Done')}
                </button>
            </div>
        );
    }

    return (
        <form
            onSubmit={submit}
            noValidate
            className="flex min-h-0 flex-1 flex-col"
        >
            <header className="flex items-start justify-between gap-4 border-b border-outline-variant px-6 py-5">
                <div>
                    <DialogPrimitive.Title className="text-headline-md text-on-surface">
                        {t('Request')} {vehicle.make} {vehicle.model}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="text-label-sm text-on-surface-variant">
                        {formatPrice(vehicle.dailyRate, vehicle.currency)}{' '}
                        {t('per day ·')} {fleetName}
                    </DialogPrimitive.Description>
                </div>
                <DialogPrimitive.Close
                    aria-label={t('Close')}
                    className="flex text-on-surface-variant hover:text-primary"
                >
                    <MaterialSymbol name="close" />
                </DialogPrimitive.Close>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
                <BookingField
                    label={t('Start date')}
                    htmlFor="start_date"
                    error={errors.startDate}
                >
                    <input
                        id="start_date"
                        type="date"
                        min={today()}
                        value={data.startDate}
                        onChange={(event) =>
                            setField('startDate', event.target.value)
                        }
                        className={cn(
                            inputClassName,
                            'px-3 py-2',
                            errors.startDate && invalidClassName,
                        )}
                    />
                </BookingField>
                <BookingField
                    label={t('Return date')}
                    htmlFor="end_date"
                    error={errors.endDate}
                >
                    <input
                        id="end_date"
                        type="date"
                        min={data.startDate || today()}
                        value={data.endDate}
                        onChange={(event) =>
                            setField('endDate', event.target.value)
                        }
                        className={cn(
                            inputClassName,
                            'px-3 py-2',
                            errors.endDate && invalidClassName,
                        )}
                    />
                </BookingField>
                {vehicle.quantity > 1 && (
                    <BookingField
                        label={`Units (up to ${vehicle.quantity})`}
                        htmlFor="quantity"
                        error={errors.quantity}
                    >
                        <input
                            id="quantity"
                            type="number"
                            min={1}
                            max={vehicle.quantity}
                            value={data.quantity}
                            onChange={(event) =>
                                setField(
                                    'quantity',
                                    Math.max(1, Number(event.target.value)),
                                )
                            }
                            className={cn(inputClassName, 'px-3 py-2')}
                        />
                    </BookingField>
                )}
                {vehicle.driverOption === 'both' && (
                    <BookingField
                        label={t('Driver')}
                        htmlFor="with_driver"
                        error={errors.withDriver}
                    >
                        <select
                            id="with_driver"
                            value={data.withDriver ? '1' : '0'}
                            onChange={(event) =>
                                setField(
                                    'withDriver',
                                    event.target.value === '1',
                                )
                            }
                            className={cn(selectClassName, 'px-3 py-2')}
                        >
                            <option value="0">{t('Self-drive')}</option>
                            <option value="1">{t('With a driver')}</option>
                        </select>
                    </BookingField>
                )}
                <BookingField
                    label={t('Pickup location')}
                    htmlFor="pickup_location"
                    className="sm:col-span-2"
                >
                    <input
                        id="pickup_location"
                        value={data.pickupLocation}
                        onChange={(event) =>
                            setField('pickupLocation', event.target.value)
                        }
                        placeholder={t(
                            'Where should the vehicle be delivered or collected?',
                        )}
                        className={cn(inputClassName, 'px-3 py-2')}
                    />
                </BookingField>
                <BookingField
                    label={t('Your name')}
                    htmlFor="booking_name"
                    error={errors.fullName}
                >
                    <input
                        id="booking_name"
                        autoComplete="name"
                        value={data.fullName}
                        onChange={(event) =>
                            setField('fullName', event.target.value)
                        }
                        className={cn(
                            inputClassName,
                            'px-3 py-2',
                            errors.fullName && invalidClassName,
                        )}
                    />
                </BookingField>
                <BookingField
                    label={t('Phone (+243)')}
                    htmlFor="booking_phone"
                    error={errors.phone}
                >
                    <input
                        id="booking_phone"
                        type="tel"
                        autoComplete="tel-national"
                        value={data.phone}
                        onChange={(event) =>
                            setField('phone', event.target.value)
                        }
                        placeholder="81 234 5678"
                        className={cn(
                            inputClassName,
                            'px-3 py-2',
                            errors.phone && invalidClassName,
                        )}
                    />
                </BookingField>
                <BookingField
                    label={t('Email (optional)')}
                    htmlFor="booking_email"
                    error={errors.email}
                >
                    <input
                        id="booking_email"
                        type="email"
                        autoComplete="email"
                        value={data.email}
                        onChange={(event) =>
                            setField('email', event.target.value)
                        }
                        className={cn(inputClassName, 'px-3 py-2')}
                    />
                </BookingField>
                <BookingField label={t('Your city')} htmlFor="booking_city">
                    <select
                        id="booking_city"
                        value={data.city}
                        onChange={(event) =>
                            setField('city', event.target.value)
                        }
                        className={cn(selectClassName, 'px-3 py-2')}
                    >
                        {cities.map((city) => (
                            <option key={city.name} value={city.name}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </BookingField>
                <BookingField
                    label={t('Notes (optional)')}
                    htmlFor="booking_notes"
                    className="sm:col-span-2"
                >
                    <textarea
                        id="booking_notes"
                        rows={2}
                        value={data.notes}
                        onChange={(event) =>
                            setField('notes', event.target.value)
                        }
                        className={cn(inputClassName, 'resize-none px-3 py-2')}
                    />
                </BookingField>
                {errors.vehicle && (
                    <div className="sm:col-span-2">
                        <FieldError message={errors.vehicle} />
                    </div>
                )}
            </div>

            <footer className="flex flex-col gap-3 border-t border-outline-variant px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-label-sm text-on-surface-variant">
                    {days > 0 ? (
                        <>
                            {t('Estimated')}{' '}
                            <span className="font-semibold text-on-surface">
                                {formatPrice(
                                    String(estimatedTotal),
                                    vehicle.currency,
                                )}
                            </span>{' '}
                            {t('for')} {days}{' '}
                            {days === 1 ? t('day') : t('days')}
                        </>
                    ) : (
                        t('Choose your dates')
                    )}
                </p>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container disabled:opacity-60"
                >
                    {isSubmitting ? t('Sending…') : t('Send booking request')}
                </button>
            </footer>
        </form>
    );
}

function BookingField({
    label,
    htmlFor,
    error,
    className,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <label
                htmlFor={htmlFor}
                className="text-label-sm text-on-surface-variant"
            >
                {label}
            </label>
            {children}
            <FieldError message={error} />
        </div>
    );
}
