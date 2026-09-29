import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { selectClassName } from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import ProfessionalCard from '@/components/directory/professional-card';
import { useQuoteRequest } from '@/components/directory/quote-request/quote-request-provider';
import { cn } from '@/lib/utils';
import type { Category as CategoryData, City, Professional } from '@/types';
import { t } from '@/lib/i18n';

const defaultMinimumRating = 0;

export default function Category({
    category,
    professionals,
    cities,
    visitorCity,
}: {
    category: CategoryData;
    professionals: Professional[];
    cities: City[];
    visitorCity: string | null;
}) {
    const { openQuoteRequest } = useQuoteRequest();
    const [city, setCity] = useState(() =>
        visitorCity &&
        professionals.some((professional) => professional.city === visitorCity)
            ? visitorCity
            : '',
    );
    const [minimumRating, setMinimumRating] = useState(defaultMinimumRating);

    const results = professionals
        .filter((professional) => !city || professional.city === city)
        .filter((professional) => professional.rating >= minimumRating);

    function clearFilters() {
        setCity('');
        setMinimumRating(0);
    }

    return (
        <>
            <Head title={category.name} />

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
                            {category.name}
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
                        {t('Get Free Quotes')}
                    </button>
                </div>
            </header>

            <div className="grid w-full flex-grow grid-cols-1 items-start gap-6 px-page py-10 lg:grid-cols-12">
                <aside className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] lg:sticky lg:top-[100px] lg:col-span-3">
                    <h2 className="mb-4 border-b border-outline-variant pb-2 text-headline-md text-on-surface">
                        {t('Filters')}
                    </h2>

                    <div className="mb-6">
                        <label
                            htmlFor="category-city"
                            className="mb-2 block text-label-md text-on-surface"
                        >
                            {t('Location')}
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
                                <option value="">{t('All Cities')}</option>
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
                        <label
                            htmlFor="category-rating"
                            className="mb-2 block text-label-md text-on-surface"
                        >
                            {t('Rating')}
                        </label>
                        <div className="flex items-center gap-2">
                            <MaterialSymbol
                                name="star"
                                filled
                                className="text-secondary-container"
                            />
                            <span className="text-body-md text-on-surface">
                                {minimumRating === 0
                                    ? t('Any rating')
                                    : `${minimumRating.toFixed(1)} & up`}
                            </span>
                        </div>
                        <input
                            id="category-rating"
                            type="range"
                            min={0}
                            max={5}
                            step={0.5}
                            value={minimumRating}
                            onChange={(event) =>
                                setMinimumRating(Number(event.target.value))
                            }
                            className="mt-2 w-full accent-primary"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 w-full rounded-lg border-2 border-primary bg-surface py-2 text-label-md text-primary transition-colors hover:bg-surface-container-low"
                    >
                        {t('Clear Filters')}
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
                                {t('No')} {category.name.toLowerCase()}{' '}
                                {t(
                                    "match these filters yet. Request free quotes and we'll match you with available pros near you.",
                                )}
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
                                {t('Get Free Quotes')}
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
