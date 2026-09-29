import { Head, Link } from '@inertiajs/react';
import {
    FileText,
    Mail,
    MapPin,
    MessageCircle,
    Pencil,
    Phone,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useCategories } from '@/hooks/use-categories';
import ListingStatus from '@/components/workspace/listing-status';
import PageHeader from '@/components/workspace/page-header';
import ReviewBanner from '@/components/workspace/review-banner';
import { edit, resubmit } from '@/routes/dashboard/listing';
import { index as galleryIndex } from '@/routes/dashboard/listing/gallery';
import type { ProfessionalListing, ReviewSummary } from '@/types';
import { t } from '@/lib/i18n';

export default function ShowListing({
    listing,
    review,
}: {
    listing: ProfessionalListing;
    review: ReviewSummary;
}) {
    const { categoryName } = useCategories();
    const displayName = listing.businessName ?? listing.fullName;

    return (
        <>
            <Head title={t('My listing')} />

            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('My listing')}
                    description={t(
                        'This is how clients will see your business once it is verified.',
                    )}
                    actions={
                        <Link
                            href={edit()}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container"
                        >
                            <Pencil className="size-4" aria-hidden="true" />
                            {t('Edit listing')}
                        </Link>
                    }
                />

                <ReviewBanner review={review} resubmitHref={resubmit.url()} />

                <article className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white">
                    <header className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                        {listing.photoUrl ? (
                            <img
                                src={listing.photoUrl}
                                alt={displayName}
                                className="size-16 shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold text-zinc-500">
                                {displayName.charAt(0)}
                            </span>
                        )}
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                                {displayName}
                            </h2>
                            {listing.businessName && (
                                <p className="text-sm text-zinc-500">
                                    {listing.fullName}
                                </p>
                            )}
                            <div className="mt-1">
                                <ListingStatus
                                    isVerified={listing.isVerified}
                                    verifiedAt={listing.verifiedAt}
                                />
                            </div>
                        </div>
                    </header>

                    <Section title={t('Services')}>
                        <div className="flex flex-wrap gap-1.5">
                            {listing.categories.map((category) => (
                                <span
                                    key={category}
                                    className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700"
                                >
                                    {categoryName(category)}
                                </span>
                            ))}
                        </div>
                        {listing.bio && (
                            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                                {listing.bio}
                            </p>
                        )}
                    </Section>

                    <Section title={t('Contact')}>
                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                            <ContactLine icon={Phone}>
                                +243 {listing.phone}
                            </ContactLine>
                            {listing.isOnWhatsApp && (
                                <ContactLine icon={MessageCircle}>
                                    {t('Reachable on WhatsApp')}
                                </ContactLine>
                            )}
                            {listing.email && (
                                <ContactLine icon={Mail}>
                                    {listing.email}
                                </ContactLine>
                            )}
                            <ContactLine icon={MapPin}>
                                {[
                                    listing.address,
                                    listing.commune,
                                    listing.city,
                                ]
                                    .filter(Boolean)
                                    .join(', ')}
                            </ContactLine>
                        </div>
                    </Section>

                    <Section title={t('Verification')}>
                        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                            <Detail label={t('RCCM')}>
                                <span className="font-mono text-[13px]">
                                    {listing.registryNumber ?? '—'}
                                </span>
                            </Detail>
                            <Detail label={t('Tax ID')}>
                                <span className="font-mono text-[13px]">
                                    {listing.taxId ?? '—'}
                                </span>
                            </Detail>
                            <Detail label={t('ID document')}>
                                {listing.hasIdentityDocument ? (
                                    <span className="inline-flex items-center gap-1">
                                        <FileText
                                            className="size-3.5 text-zinc-400"
                                            aria-hidden="true"
                                        />
                                        {t('On file')}
                                    </span>
                                ) : (
                                    t('Not provided')
                                )}
                            </Detail>
                            <Detail label={t('Experience')}>
                                {listing.experienceYears !== null
                                    ? `${listing.experienceYears} years`
                                    : '—'}
                            </Detail>
                        </dl>
                    </Section>

                    <Section title={t('Work gallery')}>
                        <div className="-mt-2 mb-4 flex items-center justify-between gap-4">
                            <p className="text-sm text-zinc-500">
                                {listing.gallery.length === 0
                                    ? t(
                                          'Show clients photos of jobs you have done.',
                                      )
                                    : `${listing.gallery.length} photo${listing.gallery.length === 1 ? '' : 's'}`}
                            </p>
                            <Link
                                href={galleryIndex()}
                                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                            >
                                {t('Manage photos')}
                            </Link>
                        </div>
                        {listing.gallery.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {listing.gallery.map((url, index) => (
                                    <img
                                        key={url}
                                        src={url}
                                        alt={t('Work photo :index', {
                                            index: index + 1,
                                        })}
                                        className="aspect-[4/3] w-full rounded-lg object-cover"
                                    />
                                ))}
                            </div>
                        )}
                    </Section>
                </article>
            </div>
        </>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="p-6">
            <h3 className="mb-4 text-sm font-semibold text-zinc-900">
                {title}
            </h3>
            {children}
        </section>
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
        <p className="flex items-start gap-2.5 text-zinc-700">
            <Icon
                className="mt-0.5 size-4 shrink-0 text-zinc-400"
                aria-hidden="true"
            />
            <span className="min-w-0 break-words">{children}</span>
        </p>
    );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-baseline justify-between gap-4 sm:flex-col sm:justify-start sm:gap-0.5">
            <dt className="text-zinc-500">{label}</dt>
            <dd className="text-zinc-900">{children}</dd>
        </div>
    );
}
