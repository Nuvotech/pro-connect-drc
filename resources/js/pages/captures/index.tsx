import { Head, Link } from '@inertiajs/react';
import {
    ClipboardList,
    Eye,
    Pencil,
    Store,
    Truck,
    UserPlus,
} from 'lucide-react';
import PageHeader from '@/components/workspace/page-header';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { create as createProfessional } from '@/routes/admin/professionals';
import { create as createVehicleProvider } from '@/routes/admin/vehicle-providers';
import { show as showFleet } from '@/routes/captures/fleets';
import { show as showProfessional } from '@/routes/captures/professionals';

type Capture = {
    key: string;
    id: number;
    canEdit: boolean;
    type: 'professional' | 'vehicle_provider';
    name: string;
    detail: string;
    city: string | null;
    status: string;
    createdAt: string | null;
};

const statusLabels: Record<string, string> = {
    pending: 'Waiting for review',
    resubmitted: 'Waiting for review',
    changes_requested: 'Changes requested',
    approved: 'Verified',
    declined: 'Declined',
};

const statusStyles: Record<string, string> = {
    approved: 'bg-primary/10 text-primary',
    changes_requested: 'bg-amber-50 text-amber-800',
    declined: 'bg-zinc-100 text-zinc-500',
};

export default function Captures({ captures }: { captures: Capture[] }) {
    return (
        <>
            <Head title={t('My captures')} />

            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('My captures')}
                    description={t(
                        'The professionals and fleets you added. Our team checks each one before it goes live.',
                    )}
                />

                <div className="flex flex-wrap gap-2">
                    <Link
                        href={createProfessional()}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container"
                    >
                        <UserPlus className="size-4" aria-hidden="true" />
                        {t('Add a professional')}
                    </Link>
                    <Link
                        href={createVehicleProvider()}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50"
                    >
                        <Truck className="size-4" aria-hidden="true" />
                        {t('Add a fleet')}
                    </Link>
                </div>

                {captures.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
                        <ClipboardList
                            className="size-6 text-zinc-400"
                            aria-hidden="true"
                        />
                        <p className="text-sm font-medium text-zinc-900">
                            {t('Nothing captured yet')}
                        </p>
                        <p className="text-sm text-zinc-500">
                            {t(
                                'Professionals and fleets you add will appear here.',
                            )}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
                        {captures.map((capture) => (
                            <li key={capture.key}>
                                <Link
                                    href={
                                        capture.type === 'professional'
                                            ? showProfessional(capture.id)
                                            : showFleet(capture.id)
                                    }
                                    className="flex flex-col gap-2 px-5 py-4 transition-colors duration-200 hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                                            {capture.type === 'professional' ? (
                                                <Store
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <Truck
                                                    className="size-4"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-zinc-900">
                                                {capture.name}
                                            </p>
                                            <p className="truncate text-xs text-zinc-500">
                                                {[
                                                    capture.type ===
                                                    'professional'
                                                        ? t('Professional')
                                                        : t('Fleet'),
                                                    capture.detail,
                                                    capture.city,
                                                    capture.createdAt,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ')}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={cn(
                                            'self-start rounded-full px-2.5 py-1 text-xs font-medium sm:ml-auto sm:self-auto',
                                            statusStyles[capture.status] ??
                                                'bg-zinc-100 text-zinc-700',
                                        )}
                                    >
                                        {t(
                                            statusLabels[capture.status] ??
                                                capture.status,
                                        )}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs font-medium text-zinc-500 sm:ml-3">
                                        {capture.canEdit ? (
                                            <Pencil
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Eye
                                                className="size-3.5"
                                                aria-hidden="true"
                                            />
                                        )}
                                        {capture.canEdit
                                            ? t('Edit')
                                            : t('View')}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
