import { Head } from '@inertiajs/react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useQuoteRequest } from '@/components/directory/quote-request/quote-request-provider';
import StarRating from '@/components/directory/star-rating';
import { useCategories } from '@/hooks/use-categories';
import { useCurrency } from '@/hooks/use-currency';
import type { Professional as ProfessionalData } from '@/types';
import { t } from '@/lib/i18n';

type PublicReview = {
    id: number;
    author: string;
    rating: number;
    comment: string | null;
    reply: string | null;
    date: string | null;
};

const rateUnitSuffixes = { hour: '/hr', day: '/day', job: '/job' };

const cardClassName =
    'rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_2px_8px_rgba(0,0,0,0.05)]';

export default function Professional({
    professional,
    reviews,
}: {
    professional: ProfessionalData;
    reviews: PublicReview[];
}) {
    const { openQuoteRequest } = useQuoteRequest();
    const { findCategory } = useCategories();
    const { formatPrice } = useCurrency();

    const category = findCategory(professional.categorySlug);
    const firstName = professional.name.split(' ')[0];
    const keyInfo = [
        {
            icon: 'work_history',
            label: 'Experience',
            value:
                professional.experienceYears > 0
                    ? `${professional.experienceYears} ${professional.experienceYears === 1 ? 'year' : 'years'}`
                    : 'Not stated',
            isLarge: professional.experienceYears > 0,
        },
        {
            icon: 'map',
            label: 'Service Area',
            value: professional.serviceArea,
            isLarge: false,
        },
        {
            icon: 'verified_user',
            label: 'Checked by ProConnect',
            value: 'ID & registration',
            isLarge: false,
        },
        {
            icon: 'payments',
            label: 'Starting Rate',
            value:
                professional.startingRateAmount === null
                    ? 'On request'
                    : formatPrice(
                          professional.startingRateAmount,
                          professional.startingRateCurrency,
                          professional.rateUnit
                              ? rateUnitSuffixes[professional.rateUnit]
                              : '',
                      ),
            isLarge: true,
        },
    ];
    const whatsAppUrl = `https://wa.me/${professional.phone.replace(/\D/g, '')}`;

    return (
        <>
            <Head title={`${professional.name} - ${professional.title}`} />

            <div className="relative grid w-full flex-grow grid-cols-1 gap-6 px-page py-16 md:grid-cols-12">
                <div className="flex flex-col gap-10 md:col-span-8">
                    <section
                        className={`${cardClassName} relative overflow-hidden`}
                    >
                        <div
                            className="relative h-48 w-full bg-surface-variant bg-cover bg-center"
                            style={{
                                backgroundImage: `url('${professional.cover}')`,
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <div className="relative z-10 -mt-16 flex flex-col items-start gap-6 px-6 pt-0 pb-6 sm:-mt-20 sm:flex-row">
                            <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border-4 border-surface-container-lowest bg-surface-container-high">
                                <img
                                    src={professional.photo}
                                    alt={professional.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex-grow sm:pt-24">
                                <div className="mb-1 flex items-center gap-2">
                                    <h1 className="text-headline-lg-mobile font-bold text-on-surface">
                                        {professional.name}
                                    </h1>
                                    {professional.isVerified && (
                                        <span
                                            title={t('Verified Professional')}
                                        >
                                            <MaterialSymbol
                                                name="verified"
                                                filled
                                                className="text-xl text-tertiary-container"
                                            />
                                        </span>
                                    )}
                                </div>
                                <p className="flex items-center gap-2 text-body-lg text-primary">
                                    <MaterialSymbol
                                        name={category?.icon ?? 'work'}
                                        className="text-lg"
                                    />
                                    {professional.title}
                                </p>
                                <div className="mt-3 flex flex-wrap items-center gap-4">
                                    {professional.reviewsCount > 0 ? (
                                        <div className="flex items-center gap-1">
                                            <StarRating
                                                rating={professional.rating}
                                                starClassName="text-sm"
                                            />
                                            <span className="ml-1 text-label-sm text-on-surface-variant">
                                                (
                                                {professional.rating.toFixed(1)}{' '}
                                                · {professional.reviewsCount}{' '}
                                                {professional.reviewsCount === 1
                                                    ? t('review')
                                                    : t('reviews')}
                                                )
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-label-sm text-primary">
                                            {t('New on ProConnect')}
                                        </span>
                                    )}
                                    <div className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                                        <MaterialSymbol
                                            name="location_on"
                                            className="text-sm"
                                        />
                                        {professional.commune},{' '}
                                        {professional.city}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {keyInfo.map((item) => (
                            <div
                                key={item.label}
                                className="flex flex-col items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                            >
                                <MaterialSymbol
                                    name={item.icon}
                                    className="mb-2 text-2xl text-primary"
                                />
                                <span className="text-label-sm tracking-wider text-on-surface-variant uppercase">
                                    {t(item.label)}
                                </span>
                                <span
                                    className={
                                        item.isLarge
                                            ? 'mt-1 text-headline-md font-semibold text-on-surface'
                                            : 'mt-1 text-label-md font-semibold text-primary-container'
                                    }
                                >
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </section>

                    <section className={`${cardClassName} p-6`}>
                        <h2 className="mb-4 flex items-center gap-2 text-headline-md font-bold text-on-surface">
                            <MaterialSymbol
                                name="person"
                                className="text-primary"
                            />
                            {t('About')} {firstName}
                        </h2>
                        <div className="space-y-4 text-body-md text-on-surface-variant">
                            {professional.about.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                    </section>

                    {professional.projects.length > 0 && (
                        <section className={`${cardClassName} p-6`}>
                            <h2 className="mb-4 flex items-center gap-2 text-headline-md font-bold text-on-surface">
                                <MaterialSymbol
                                    name="gallery_thumbnail"
                                    className="text-primary"
                                />
                                {t('Recent Projects')}
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {professional.projects.map((project, index) => (
                                    <a
                                        key={project}
                                        href={project}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group relative aspect-square overflow-hidden rounded-lg bg-surface-variant"
                                    >
                                        <img
                                            src={project}
                                            alt={`Project ${index + 1}`}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                            <span className="text-label-md font-semibold text-white">
                                                {t('View Details')}
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className={`${cardClassName} p-6`}>
                        <h2 className="mb-4 flex items-center gap-2 text-headline-md font-bold text-on-surface">
                            <MaterialSymbol
                                name="reviews"
                                className="text-primary"
                            />
                            {t('Client Reviews')}
                        </h2>
                        {reviews.length === 0 ? (
                            <p className="text-body-md text-on-surface-variant">
                                {t(
                                    'No reviews yet. Reviews come from clients who hired',
                                )}{' '}
                                {firstName} {t('through ProConnect.')}
                            </p>
                        ) : (
                            <ul className="divide-y divide-outline-variant">
                                {reviews.map((review) => (
                                    <li
                                        key={review.id}
                                        className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-label-md text-on-surface">
                                                {review.author}
                                            </span>
                                            <span className="text-label-sm text-on-surface-variant">
                                                {review.date}
                                            </span>
                                        </div>
                                        <StarRating rating={review.rating} />
                                        {review.comment && (
                                            <p className="text-body-md text-on-surface-variant">
                                                {review.comment}
                                            </p>
                                        )}
                                        {review.reply && (
                                            <p className="ml-4 border-l-2 border-outline-variant pl-3 text-label-sm text-on-surface-variant">
                                                <span className="font-semibold text-on-surface">
                                                    {t('Reply from')}{' '}
                                                    {firstName}:
                                                </span>{' '}
                                                {review.reply}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                <div className="relative md:col-span-4">
                    <div className="sticky top-[100px] flex flex-col gap-6">
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                            <h3 className="mb-4 text-headline-md font-bold text-on-surface">
                                {t('Contact')} {firstName}
                            </h3>
                            <button
                                type="button"
                                onClick={() =>
                                    openQuoteRequest({ professional })
                                }
                                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container px-4 py-3 text-label-md text-on-secondary-container transition-colors hover:bg-secondary-fixed-dim"
                            >
                                <MaterialSymbol name="request_quote" />
                                {t('Request a Free Quote')}
                            </button>
                            <a
                                href={`tel:${professional.phone}`}
                                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container"
                            >
                                <MaterialSymbol name="call" />
                                {t('Call Directly')}
                            </a>
                            {professional.isOnWhatsApp && (
                                <a
                                    href={whatsAppUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-3 text-label-md text-primary transition-colors hover:bg-surface-container-low"
                                >
                                    <MaterialSymbol name="chat" />
                                    {t('WhatsApp')}
                                </a>
                            )}
                            <div className="mt-4 flex items-center gap-2 border-t border-outline-variant pt-4 text-sm text-on-surface-variant">
                                <MaterialSymbol
                                    name="verified_user"
                                    className="text-sm text-primary"
                                />
                                <span>
                                    {t(
                                        'Verified by ProConnect: ID and registration checked',
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6 text-center shadow-sm">
                            <MaterialSymbol
                                name="rate_review"
                                className="mb-2 text-3xl text-secondary-container"
                            />
                            <h4 className="mb-2 text-label-md font-bold text-on-surface">
                                {t('Worked with')} {firstName}?
                            </h4>
                            <p className="text-label-sm text-on-surface-variant">
                                {t('Book')} {firstName}{' '}
                                {t(
                                    'through ProConnect and you can review the job once it is done.',
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
