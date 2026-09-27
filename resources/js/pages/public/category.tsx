import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { selectClassName } from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import ProfessionalCard from '@/components/directory/professional-card';
import { useQuoteRequest } from '@/components/directory/quote-request/quote-request-provider';
import { cities, findCategory, professionals } from '@/lib/directory-data';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

const defaultMinimumRating = 4;

export default function Category({ slug }: { slug: string }) {
    const category = findCategory(slug);
    const { openQuoteRequest } = useQuoteRequest();
    const [city, setCity] = useState('');
    const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(
        [],
    );
    const [minimumRating, setMinimumRating] = useState(defaultMinimumRating);
    const [isVerifiedOnly, setIsVerifiedOnly] = useState(true);

    if (!category) {
        return (
            <>
                <Head title="Category not found" />
                <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
                    <MaterialSymbol
                        name="search_off"
                        className="text-5xl text-outline"
                    />
                    <h1 className="text-headline-lg text-on-surface">
                        Category not found
                    </h1>
                    <Link
                        href={`${home.url()}#categories`}
                        className="rounded-lg bg-primary px-6 py-2 text-label-md text-on-primary"
                    >
                        Browse all categories
                    </Link>
                </div>
            </>
        );
    }

    const results = professionals
        .filter((professional) => professional.categorySlug === category.slug)
        .filter((professional) => !city || professional.city === city)
        .filter(
            (professional) =>
                selectedServiceTypes.length === 0 ||
                selectedServiceTypes.some((serviceType) =>
                    professional.serviceTypes.includes(serviceType),
                ),
        )
        .filter((professional) => professional.rating >= minimumRating)
        .filter((professional) => !isVerifiedOnly || professional.isVerified);

    function toggleServiceType(serviceType: string) {
        setSelectedServiceTypes((previous) =>
            previous.includes(serviceType)
                ? previous.filter((selected) => selected !== serviceType)
                : [...previous, serviceType],
        );
    }

    function clearFilters() {
        setCity('');
        setSelectedServiceTypes([]);
        setMinimumRating(1);
        setIsVerifiedOnly(false);
    }

    return (
        <>
            <Head title={`${category.nameFr} / ${category.name}`} />

            <header className="border-b border-outline-variant bg-surface-container-low px-page py-16">
                <div className="flex flex-col items-center gap-6 md:flex-row">
                    <div className="flex flex-shrink-0 rounded-2xl bg-primary-container p-6 text-on-primary-container shadow-sm">
                        <MaterialSymbol
                            name={category.icon}
                            className="text-[64px]"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="mb-2 text-headline-lg text-on-surface md:text-display-lg">
                            {category.nameFr} / {category.name}
                        </h1>
                        <p className="max-w-2xl text-body-lg text-on-surface-variant">
                            {category.description}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() =>
                            openQuoteRequest({ categorySlug: category.slug })
                        }
                        className="flex shrink-0 items-center gap-2 rounded-lg bg-secondary-container px-6 py-4 text-label-md font-bold text-on-secondary-container shadow-sm transition-colors hover:bg-secondary-fixed-dim md:ml-auto"
                    >
                        <MaterialSymbol name="request_quote" />
                        Get Free Quotes
                    </button>
                </div>
            </header>

            <div className="grid w-full flex-grow grid-cols-1 items-start gap-6 px-page py-10 lg:grid-cols-12">
                <aside className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] lg:sticky lg:top-[100px] lg:col-span-3">
                    <h2 className="mb-4 border-b border-outline-variant pb-2 text-headline-md text-on-surface">
                        Filters
                    </h2>

                    <div className="mb-6">
                        <label
                            htmlFor="category-city"
                            className="mb-2 block text-label-md text-on-surface"
                        >
                            Location
                        </label>
                        <div className="relative">
                            <select
                                id="category-city"
                                value={city}
                                onChange={(event) =>
                                    setCity(event.target.value)
                                }
                                className={cn(
                                    selectClassName,
                                    'bg-surface px-3 py-2 pr-10 shadow-none',
                                )}
                            >
                                <option value="">All Cities</option>
                                {cities.map((option) => (
                                    <option
                                        key={option.name}
                                        value={option.name}
                                    >
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                            <MaterialSymbol
                                name="expand_more"
                                className="pointer-events-none absolute top-2.5 right-3 text-outline"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <span className="mb-2 block text-label-md text-on-surface">
                            Service Type
                        </span>
                        <div className="flex flex-col gap-2">
                            {category.serviceTypes.map((serviceType) => (
                                <label
                                    key={serviceType}
                                    className="flex cursor-pointer items-center gap-2"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedServiceTypes.includes(
                                            serviceType,
                                        )}
                                        onChange={() =>
                                            toggleServiceType(serviceType)
                                        }
                                        className="size-4 rounded accent-primary"
                                    />
                                    <span className="text-body-md text-on-surface-variant">
                                        {serviceType}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="category-rating"
                            className="mb-2 block text-label-md text-on-surface"
                        >
                            Rating
                        </label>
                        <div className="flex items-center gap-2">
                            <MaterialSymbol
                                name="star"
                                filled
                                className="text-secondary-container"
                            />
                            <span className="text-body-md text-on-surface">
                                {minimumRating.toFixed(1)} &amp; Up
                            </span>
                        </div>
                        <input
                            id="category-rating"
                            type="range"
                            min={1}
                            max={5}
                            step={0.5}
                            value={minimumRating}
                            onChange={(event) =>
                                setMinimumRating(Number(event.target.value))
                            }
                            className="mt-2 w-full accent-primary"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-3 transition-colors hover:border-primary">
                            <input
                                type="checkbox"
                                checked={isVerifiedOnly}
                                onChange={() =>
                                    setIsVerifiedOnly(!isVerifiedOnly)
                                }
                                className="size-5 rounded accent-primary"
                            />
                            <span className="flex-grow text-label-md text-on-surface">
                                Verified Pros Only
                            </span>
                            <MaterialSymbol
                                name="verified"
                                filled
                                className="text-tertiary-container"
                            />
                        </label>
                    </div>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 w-full rounded-lg border-2 border-primary bg-surface py-2 text-label-md text-primary transition-colors hover:bg-surface-container-low"
                    >
                        Clear Filters
                    </button>
                </aside>

                <section className="lg:col-span-9">
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {results.map((professional) => (
                                <ProfessionalCard
                                    key={professional.slug}
                                    professional={professional}
                                    actionLabel="Book Now"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-16 text-center">
                            <MaterialSymbol
                                name="person_search"
                                className="text-4xl text-outline"
                            />
                            <p className="max-w-md text-body-md text-on-surface-variant">
                                No {category.name.toLowerCase()} match these
                                filters yet. Request free quotes and we'll match
                                you with available pros near you.
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    openQuoteRequest({
                                        categorySlug: category.slug,
                                    })
                                }
                                className="rounded-lg bg-primary px-6 py-2 text-label-md text-on-primary transition-opacity hover:opacity-90"
                            >
                                Get Free Quotes
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
