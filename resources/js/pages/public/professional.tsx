import { Head, Link } from '@inertiajs/react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useQuoteRequest } from '@/components/directory/quote-request/quote-request-provider';
import StarRating from '@/components/directory/star-rating';
import { findCategory, findProfessional } from '@/lib/directory-data';
import { search } from '@/routes';

const cardClassName =
    'rounded-xl border border-outline-variant bg-surface-container-lowest shadow-[0_2px_8px_rgba(0,0,0,0.05)]';

export default function Professional({ slug }: { slug: string }) {
    const professional = findProfessional(slug);
    const { openQuoteRequest } = useQuoteRequest();

    if (!professional) {
        return (
            <>
                <Head title="Professional not found" />
                <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
                    <MaterialSymbol
                        name="person_off"
                        className="text-5xl text-outline"
                    />
                    <h1 className="text-headline-lg text-on-surface">
                        Professional not found
                    </h1>
                    <Link
                        href={search()}
                        className="rounded-lg bg-primary px-6 py-2 text-label-md text-on-primary"
                    >
                        Search professionals
                    </Link>
                </div>
            </>
        );
    }

    const category = findCategory(professional.categorySlug);
    const firstName = professional.name.split(' ')[0];
    const keyInfo = [
        {
            icon: 'work_history',
            label: 'Experience',
            value: `${professional.experienceYears} Yrs`,
            isLarge: true,
        },
        {
            icon: 'map',
            label: 'Service Area',
            value: professional.serviceArea,
            isLarge: false,
        },
        {
            icon: 'event_available',
            label: 'Availability',
            value: 'Accepting Clients',
            isLarge: false,
        },
        {
            icon: 'payments',
            label: 'Starting Rate',
            value: professional.startingRate,
            isLarge: true,
        },
    ];

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
                                        <span title="Verified Professional">
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
                                    <div className="flex items-center gap-1">
                                        <StarRating
                                            rating={professional.rating}
                                            starClassName="text-sm"
                                        />
                                        <span className="ml-1 text-label-sm text-on-surface-variant">
                                            ({professional.rating.toFixed(1)} -{' '}
                                            {professional.reviewsCount} Reviews)
                                        </span>
                                    </div>
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
                                    {item.label}
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
                            About {firstName}
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
                                Recent Projects
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
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                            <span className="text-label-md font-semibold text-white">
                                                View Details
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="relative md:col-span-4">
                    <div className="sticky top-[100px] flex flex-col gap-6">
                        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                            <h3 className="mb-4 text-headline-md font-bold text-on-surface">
                                Contact {firstName}
                            </h3>
                            <button
                                type="button"
                                onClick={() =>
                                    openQuoteRequest({ professional })
                                }
                                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-secondary-container px-4 py-3 text-label-md text-on-secondary-container transition-colors hover:bg-secondary-fixed-dim"
                            >
                                <MaterialSymbol name="request_quote" />
                                Request a Free Quote
                            </button>
                            <a
                                href={`tel:${professional.phone}`}
                                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container"
                            >
                                <MaterialSymbol name="call" />
                                Call Directly
                            </a>
                            <div className="mt-4 flex items-center gap-2 border-t border-outline-variant pt-4 text-sm text-on-surface-variant">
                                <MaterialSymbol
                                    name="security"
                                    className="text-sm text-primary"
                                />
                                <span>Payments secured by ProConnect</span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-outline-variant bg-surface-container-low p-6 text-center shadow-sm">
                            <MaterialSymbol
                                name="rate_review"
                                className="mb-2 text-3xl text-secondary-container"
                            />
                            <h4 className="mb-2 text-label-md font-bold text-on-surface">
                                Worked with {firstName}?
                            </h4>
                            <p className="mb-4 text-label-sm text-on-surface-variant">
                                Help the community by sharing your experience.
                            </p>
                            <button
                                type="button"
                                className="w-full rounded-lg border border-primary bg-surface-container-lowest px-4 py-2 text-label-md text-primary transition-colors hover:bg-surface-bright"
                            >
                                Leave a Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
