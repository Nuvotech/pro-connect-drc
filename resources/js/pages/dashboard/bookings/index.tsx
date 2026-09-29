import { Head, router } from '@inertiajs/react';
import { CalendarRange, Inbox, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/workspace/page-header';
import { formatMoney } from '@/lib/admin-data';
import { update as updateBooking } from '@/routes/dashboard/bookings';
import { t } from '@/lib/i18n';

type Booking = {
    id: number;
    reference: string | null;
    status: 'requested' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
    vehicle: string;
    startDate: string;
    endDate: string;
    days: number;
    quantity: number;
    withDriver: boolean;
    pickupLocation: string | null;
    notes: string | null;
    estimatedTotal: string;
    currency: string;
    customer: { name: string; phone: string; email: string | null };
    requestedAt: string | null;
};

const statusLabels: Record<Booking['status'], string> = {
    requested: 'Waiting for you',
    confirmed: 'Confirmed',
    declined: 'Declined',
    cancelled: 'Cancelled',
    completed: 'Completed',
};

export default function BookingsIndex({ bookings }: { bookings: Booking[] }) {
    const [processingId, setProcessingId] = useState<number | null>(null);

    function respond(
        booking: Booking,
        status: 'confirmed' | 'declined' | 'completed',
    ) {
        router.patch(
            updateBooking.url(booking.id),
            { status },
            {
                preserveScroll: true,
                onStart: () => setProcessingId(booking.id),
                onFinish: () => setProcessingId(null),
            },
        );
    }

    return (
        <>
            <Head title={t('Bookings')} />

            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Bookings')}
                    description={t(
                        "Clients asking to hire your vehicles. Confirm to let them know it's available.",
                    )}
                />

                {bookings.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                        <Inbox
                            className="size-6 text-zinc-400"
                            aria-hidden="true"
                        />
                        <p className="text-sm font-medium text-zinc-900">
                            {t('No booking requests yet')}
                        </p>
                        <p className="text-sm text-zinc-500">
                            {t(
                                'Requests from your public fleet page will appear here.',
                            )}
                        </p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {bookings.map((booking) => (
                            <li
                                key={booking.id}
                                className="rounded-xl border border-zinc-200 bg-white p-5"
                            >
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                    <div className="min-w-0">
                                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-zinc-900">
                                            {booking.quantity > 1 &&
                                                `${booking.quantity} × `}
                                            {booking.vehicle}
                                            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-normal text-zinc-700">
                                                {t(
                                                    statusLabels[
                                                        booking.status
                                                    ],
                                                )}
                                            </span>
                                        </p>
                                        <p className="mt-1 font-mono text-xs text-zinc-500">
                                            {booking.reference}{' '}
                                            {t('· requested')}{' '}
                                            {booking.requestedAt}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-right">
                                        <span className="block text-sm font-semibold text-zinc-900 tabular-nums">
                                            {formatMoney(
                                                booking.estimatedTotal,
                                                booking.currency,
                                            )}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {t('estimated')}
                                        </span>
                                    </p>
                                </div>

                                <dl className="mt-4 grid grid-cols-1 gap-2.5 text-sm text-zinc-700 sm:grid-cols-2">
                                    <div className="flex items-center gap-2">
                                        <CalendarRange
                                            className="size-4 text-zinc-400"
                                            aria-hidden="true"
                                        />
                                        {booking.startDate} → {booking.endDate}{' '}
                                        ({booking.days}{' '}
                                        {booking.days === 1
                                            ? t('day')
                                            : t('days')}
                                        ,{' '}
                                        {booking.withDriver
                                            ? t('with driver')
                                            : t('self-drive')}
                                        )
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone
                                            className="size-4 text-zinc-400"
                                            aria-hidden="true"
                                        />
                                        <a
                                            href={`tel:+243${booking.customer.phone.replace(/\D/g, '')}`}
                                            className="hover:underline"
                                        >
                                            +243 {booking.customer.phone}
                                        </a>{' '}
                                        · {booking.customer.name}
                                    </div>
                                    {booking.pickupLocation && (
                                        <div className="flex items-center gap-2">
                                            <MapPin
                                                className="size-4 text-zinc-400"
                                                aria-hidden="true"
                                            />
                                            {booking.pickupLocation}
                                        </div>
                                    )}
                                    {booking.customer.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail
                                                className="size-4 text-zinc-400"
                                                aria-hidden="true"
                                            />
                                            {booking.customer.email}
                                        </div>
                                    )}
                                </dl>
                                {booking.notes && (
                                    <p className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm whitespace-pre-line text-zinc-700">
                                        {booking.notes}
                                    </p>
                                )}

                                {booking.status === 'requested' && (
                                    <div className="mt-4 flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                respond(booking, 'declined')
                                            }
                                            disabled={
                                                processingId === booking.id
                                            }
                                            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50 disabled:opacity-60"
                                        >
                                            {t('Decline')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                respond(booking, 'confirmed')
                                            }
                                            disabled={
                                                processingId === booking.id
                                            }
                                            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:opacity-60"
                                        >
                                            {t('Confirm booking')}
                                        </button>
                                    </div>
                                )}

                                {booking.status === 'confirmed' && (
                                    <div className="mt-4 flex flex-col gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm text-zinc-500">
                                            {t(
                                                'Vehicle back? Mark the hire completed.',
                                            )}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                respond(booking, 'completed')
                                            }
                                            disabled={
                                                processingId === booking.id
                                            }
                                            className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-900 transition-colors duration-200 hover:bg-zinc-50 disabled:opacity-60"
                                        >
                                            {t('Mark hire completed')}
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
