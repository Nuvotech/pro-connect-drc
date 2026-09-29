import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CircleCheck,
    Clock,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Star,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { applications } from '@/routes/admin';
import { index as professionalsIndex } from '@/routes/admin/professionals';
import { t } from '@/lib/i18n';

type ProfessionalDetail = {
    id: number;
    fullName: string;
    businessName: string | null;
    headline: string | null;
    bio: string | null;
    services: string[];
    phone: string;
    isOnWhatsApp: boolean;
    email: string | null;
    accountEmail: string | null;
    address: string | null;
    city: string | null;
    commune: string | null;
    serviceArea: string | null;
    startingRate: string | null;
    experienceYears: number | null;
    registryNumber: string | null;
    taxId: string | null;
    preferredLanguage: string;
    photoUrl: string | null;
    gallery: string[];
    identityDocumentUrl: string | null;
    businessRegistrationUrl: string | null;
    isVerified: boolean;
    verifiedAt: string | null;
    rating: number;
    reviewsCount: number;
    quotesCount: number;
    publicUrl: string | null;
    createdAt: string | null;
    onboardedBy: string | null;
};

function initialsOf(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

export default function ShowProfessional({
    professional,
}: {
    professional: ProfessionalDetail;
}) {
    const displayName = professional.businessName ?? professional.fullName;

    return (
        <>
            <Head title={displayName} />

            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
                <div>
                    <Link
                        href={professionalsIndex()}
                        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors duration-200 hover:text-zinc-900"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        {t('Professionals')}
                    </Link>
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div className="flex items-center gap-4">
                            {professional.photoUrl ? (
                                <img
                                    src={professional.photoUrl}
                                    alt=""
                                    className="size-14 shrink-0 rounded-full object-cover"
                                />
                            ) : (
                                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-base font-semibold text-zinc-600">
                                    {initialsOf(professional.fullName)}
                                </span>
                            )}
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                                    {displayName}
                                </h1>
                                <p className="mt-1 text-sm text-zinc-500">
                                    {professional.businessName &&
                                        `${professional.fullName} · `}
                                    {professional.headline ??
                                        professional.services[0] ??
                                        t('Professional')}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {professional.isVerified ? (
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                                    <CircleCheck
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {t('Verified')}
                                    {professional.verifiedAt &&
                                        ` · ${professional.verifiedAt}`}
                                </span>
                            ) : (
                                <>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500">
                                        <Clock
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        {t('Pending verification')}
                                    </span>
                                    <Link
                                        href={applications({
                                            query: {
                                                listing: `professional-${professional.id}`,
                                            },
                                        })}
                                        className="inline-flex h-9 cursor-pointer items-center rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container"
                                    >
                                        {t('Review listing')}
                                    </Link>
                                </>
                            )}
                            {professional.publicUrl && (
                                <a
                                    href={professional.publicUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors duration-200 hover:bg-zinc-50"
                                >
                                    {t('Public profile')}
                                    <ExternalLink
                                        className="size-3.5"
                                        aria-hidden="true"
                                    />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                    <aside className="flex flex-col divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white lg:sticky lg:top-24">
                        <dl className="grid grid-cols-3 divide-x divide-zinc-100">
                            <Stat
                                label={t('Rating')}
                                value={
                                    professional.reviewsCount > 0 ? (
                                        <span className="inline-flex items-center gap-1">
                                            <Star
                                                className="size-4 fill-zinc-900"
                                                aria-hidden="true"
                                            />
                                            {professional.rating.toFixed(1)}
                                        </span>
                                    ) : (
                                        '—'
                                    )
                                }
                            />
                            <Stat
                                label={t('Reviews')}
                                value={professional.reviewsCount}
                            />
                            <Stat
                                label={t('Quotes')}
                                value={professional.quotesCount}
                            />
                        </dl>

                        <section className="flex flex-col gap-3 p-5">
                            <h2 className="text-sm font-semibold text-zinc-900">
                                {t('Contact')}
                            </h2>
                            <ContactLine icon={Phone}>
                                +243 {professional.phone}
                            </ContactLine>
                            {professional.isOnWhatsApp && (
                                <ContactLine icon={MessageCircle}>
                                    {t('Reachable on WhatsApp')}
                                </ContactLine>
                            )}
                            {professional.email && (
                                <ContactLine icon={Mail}>
                                    {professional.email}
                                </ContactLine>
                            )}
                            <ContactLine icon={MapPin}>
                                {[
                                    professional.address,
                                    professional.commune,
                                    professional.city,
                                ]
                                    .filter(Boolean)
                                    .join(', ') || '—'}
                            </ContactLine>
                        </section>

                        <section className="p-5">
                            <h2 className="mb-3 text-sm font-semibold text-zinc-900">
                                {t('Registration')}
                            </h2>
                            <dl className="flex flex-col gap-2.5 text-sm">
                                <DetailRow label={t('RCCM')}>
                                    <span className="font-mono text-[13px]">
                                        {professional.registryNumber ?? '—'}
                                    </span>
                                </DetailRow>
                                <DetailRow label={t('Tax ID')}>
                                    <span className="font-mono text-[13px]">
                                        {professional.taxId ?? '—'}
                                    </span>
                                </DetailRow>
                                <DetailRow label={t('ID document')}>
                                    <DocumentLink
                                        url={professional.identityDocumentUrl}
                                    />
                                </DetailRow>
                                <DetailRow label={t('Business registration')}>
                                    <DocumentLink
                                        url={
                                            professional.businessRegistrationUrl
                                        }
                                    />
                                </DetailRow>
                                <DetailRow label={t('Account')}>
                                    {professional.accountEmail ??
                                        t('Not linked')}
                                </DetailRow>
                                <DetailRow label={t('Language')}>
                                    {professional.preferredLanguage === 'fr'
                                        ? t('Français')
                                        : t('English')}
                                </DetailRow>
                                <DetailRow label={t('Added')}>
                                    {professional.createdAt}
                                    {professional.onboardedBy &&
                                        ` by ${professional.onboardedBy}`}
                                </DetailRow>
                            </dl>
                        </section>
                    </aside>

                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <section className="rounded-xl border border-zinc-200 bg-white p-6">
                            <h2 className="text-sm font-semibold text-zinc-900">
                                {t('Services')}
                            </h2>
                            {professional.services.length > 0 ? (
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {professional.services.map((service) => (
                                        <li
                                            key={service}
                                            className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
                                        >
                                            {service}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mt-2 text-sm text-zinc-500">
                                    {t('No services chosen yet.')}
                                </p>
                            )}
                            <dl className="mt-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                                <Fact label={t('Starting rate')}>
                                    {professional.startingRate ??
                                        t('On request')}
                                </Fact>
                                <Fact label={t('Experience')}>
                                    {professional.experienceYears
                                        ? `${professional.experienceYears} ${professional.experienceYears === 1 ? 'year' : 'years'}`
                                        : t('Not stated')}
                                </Fact>
                                <Fact label={t('Service area')}>
                                    {professional.serviceArea ??
                                        professional.city ??
                                        '—'}
                                </Fact>
                            </dl>
                        </section>

                        <section className="rounded-xl border border-zinc-200 bg-white p-6">
                            <h2 className="text-sm font-semibold text-zinc-900">
                                {t('About')}
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-zinc-700">
                                {professional.bio ?? t('No description yet.')}
                            </p>
                        </section>

                        <section className="rounded-xl border border-zinc-200 bg-white p-6">
                            <h2 className="text-sm font-semibold text-zinc-900">
                                {t('Work photos')}
                            </h2>
                            {professional.gallery.length > 0 ? (
                                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {professional.gallery.map(
                                        (photo, index) => (
                                            <a
                                                key={photo}
                                                href={photo}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="aspect-square overflow-hidden rounded-lg bg-zinc-100"
                                            >
                                                <img
                                                    src={photo}
                                                    alt={t(
                                                        'Work photo :index',
                                                        { index: index + 1 },
                                                    )}
                                                    className="size-full object-cover"
                                                />
                                            </a>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-zinc-500">
                                    {t('No work photos yet.')}
                                </p>
                            )}
                        </section>
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
        <p className="flex items-start gap-2.5 text-sm text-zinc-700">
            <Icon
                className="mt-0.5 size-4 shrink-0 text-zinc-400"
                aria-hidden="true"
            />
            <span className="min-w-0 break-words">{children}</span>
        </p>
    );
}

function DetailRow({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="flex items-baseline justify-between gap-4">
            <dt className="text-zinc-500">{label}</dt>
            <dd className="min-w-0 text-right break-words text-zinc-900">
                {children}
            </dd>
        </div>
    );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <dt className="text-xs text-zinc-500">{label}</dt>
            <dd className="mt-0.5 text-zinc-900">{children}</dd>
        </div>
    );
}

function DocumentLink({ url }: { url: string | null }) {
    if (!url) {
        return <>{t('Not provided')}</>;
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
        >
            <FileText className="size-3.5" aria-hidden="true" />
            {t('View')}
        </a>
    );
}
