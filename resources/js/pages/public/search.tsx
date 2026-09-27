import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { selectClassName } from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import ProfessionalCard from '@/components/directory/professional-card';
import { categories, cities, professionals } from '@/lib/directory-data';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

const resultsPerPage = 10;

const sortOptions = [
    { value: 'rating', label: 'Top Rated' },
    { value: 'reviews', label: 'Most Reviews' },
    { value: 'newest', label: 'Newest' },
];

function matchesText(value: string, term: string): boolean {
    return value.toLowerCase().includes(term.toLowerCase());
}

function categoryMatchingTerm(term: string): Category | undefined {
    if (!term) {
        return undefined;
    }

    return categories.find(
        (category) =>
            matchesText(category.name, term) ||
            matchesText(category.nameFr, term) ||
            matchesText(term, category.name.replace(/s$/, '')),
    );
}

export default function Search() {
    const { url } = usePage();
    const queryParameters = new URL(url, 'http://localhost').searchParams;
    const initialTerm = queryParameters.get('q')?.trim() ?? '';
    const initialLocation = queryParameters.get('location')?.trim() ?? '';
    const initialCategory = categoryMatchingTerm(initialTerm);

    const searchTerm = initialCategory ? '' : initialTerm;
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        initialCategory ? [initialCategory.slug] : [],
    );
    const [city, setCity] = useState(
        cities.find((option) => matchesText(initialLocation, option.name))
            ?.name ?? '',
    );
    const [minimumRating, setMinimumRating] = useState(4);
    const [sortBy, setSortBy] = useState('rating');
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [page, setPage] = useState(1);

    const filteredProfessionals = professionals
        .filter(
            (professional) =>
                selectedCategories.length === 0 ||
                selectedCategories.includes(professional.categorySlug),
        )
        .filter((professional) => !city || professional.city === city)
        .filter((professional) => professional.rating >= minimumRating)
        .filter(
            (professional) =>
                !searchTerm ||
                [
                    professional.name,
                    professional.title,
                    professional.summary,
                ].some((value) => matchesText(value, searchTerm)),
        );

    const sortedProfessionals = [...filteredProfessionals].sort(
        (first, second) => {
            if (sortBy === 'reviews') {
                return second.reviewsCount - first.reviewsCount;
            }

            if (sortBy === 'newest') {
                return (
                    professionals.indexOf(second) - professionals.indexOf(first)
                );
            }

            return second.rating - first.rating;
        },
    );

    const pageCount = Math.max(
        1,
        Math.ceil(sortedProfessionals.length / resultsPerPage),
    );
    const currentPage = Math.min(page, pageCount);
    const firstResult = (currentPage - 1) * resultsPerPage;
    const pageResults = sortedProfessionals.slice(
        firstResult,
        firstResult + resultsPerPage,
    );
    const visibleCategories = showAllCategories
        ? categories
        : categories.filter(
              (category, index) =>
                  index < 3 || selectedCategories.includes(category.slug),
          );

    function toggleCategory(slug: string) {
        setPage(1);
        setSelectedCategories((previous) =>
            previous.includes(slug)
                ? previous.filter((selected) => selected !== slug)
                : [...previous, slug],
        );
    }

    return (
        <>
            <Head title="Search Professionals" />

            <div className="flex w-full flex-grow flex-col gap-6 px-page py-6 md:flex-row md:gap-5 md:py-10">
                <aside className="w-full space-y-6 md:w-1/4">
                    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                        <h3 className="mb-4 text-headline-md text-primary">
                            Filters
                        </h3>
                        {searchTerm && (
                            <p className="mb-6 rounded-lg bg-surface-container-low px-4 py-2 text-label-sm text-on-surface-variant">
                                Results for “
                                <span className="font-semibold text-on-surface">
                                    {searchTerm}
                                </span>
                                ”
                            </p>
                        )}

                        <div className="mb-6">
                            <h4 className="mb-2 text-label-md text-on-surface">
                                Category
                            </h4>
                            <div className="space-y-2">
                                {visibleCategories.map((category) => (
                                    <label
                                        key={category.slug}
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(
                                                category.slug,
                                            )}
                                            onChange={() =>
                                                toggleCategory(category.slug)
                                            }
                                            className="size-4 rounded accent-primary"
                                        />
                                        <span className="text-body-md">
                                            {category.name}
                                        </span>
                                    </label>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAllCategories(!showAllCategories)
                                    }
                                    className="mt-2 text-label-sm text-primary hover:underline"
                                >
                                    {showAllCategories
                                        ? 'Show fewer trades'
                                        : `View all ${categories.length} trades`}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label
                                htmlFor="search-city"
                                className="mb-2 block text-label-md text-on-surface"
                            >
                                City
                            </label>
                            <div className="relative">
                                <select
                                    id="search-city"
                                    value={city}
                                    onChange={(event) => {
                                        setPage(1);
                                        setCity(event.target.value);
                                    }}
                                    className={cn(
                                        selectClassName,
                                        'rounded-md px-3 py-2 pr-9 shadow-none',
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
                                    className="pointer-events-none absolute top-2 right-2 text-outline"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label
                                htmlFor="search-rating"
                                className="mb-2 block text-label-md text-on-surface"
                            >
                                Minimum Rating
                            </label>
                            <div className="flex items-center gap-2">
                                <MaterialSymbol
                                    name="star"
                                    filled
                                    className="text-secondary-container"
                                />
                                <input
                                    id="search-rating"
                                    type="range"
                                    min={1}
                                    max={5}
                                    step={0.5}
                                    value={minimumRating}
                                    onChange={(event) => {
                                        setPage(1);
                                        setMinimumRating(
                                            Number(event.target.value),
                                        );
                                    }}
                                    className="w-full accent-primary"
                                />
                                <span className="text-label-md">
                                    {minimumRating.toFixed(1)}+
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="flex w-full flex-col gap-6 md:w-3/4">
                    <div className="flex flex-col justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center">
                        <span className="text-body-md text-on-surface-variant">
                            {sortedProfessionals.length === 0
                                ? 'No professionals found'
                                : `Showing ${firstResult + 1}-${firstResult + pageResults.length} of ${sortedProfessionals.length} professionals`}
                        </span>
                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="search-sort"
                                className="shrink-0 text-label-md text-on-surface"
                            >
                                Sort by:
                            </label>
                            <div className="relative">
                                <select
                                    id="search-sort"
                                    value={sortBy}
                                    onChange={(event) =>
                                        setSortBy(event.target.value)
                                    }
                                    className={cn(
                                        selectClassName,
                                        'rounded-md py-2 pr-9 pl-3 shadow-none',
                                    )}
                                >
                                    {sortOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <MaterialSymbol
                                    name="expand_more"
                                    className="pointer-events-none absolute top-2 right-2 text-outline"
                                />
                            </div>
                        </div>
                    </div>

                    {pageResults.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {pageResults.map((professional) => (
                                <ProfessionalCard
                                    key={professional.slug}
                                    professional={professional}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-16 text-center">
                            <MaterialSymbol
                                name="person_search"
                                className="text-4xl text-outline"
                            />
                            <p className="text-body-md text-on-surface-variant">
                                No professionals match these filters yet. Try
                                another city or lower the minimum rating.
                            </p>
                        </div>
                    )}

                    <nav
                        aria-label="Pagination"
                        className="mt-6 flex items-center justify-center gap-2"
                    >
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setPage(currentPage - 1)}
                            aria-label="Previous page"
                            className="flex rounded border border-outline-variant p-2 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
                        >
                            <MaterialSymbol
                                name="chevron_left"
                                className="text-sm"
                            />
                        </button>
                        {Array.from({ length: pageCount }, (_, index) => {
                            const pageNumber = index + 1;

                            return (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    onClick={() => setPage(pageNumber)}
                                    aria-current={
                                        pageNumber === currentPage
                                            ? 'page'
                                            : undefined
                                    }
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded text-label-sm',
                                        pageNumber === currentPage
                                            ? 'bg-primary text-on-primary'
                                            : 'text-on-surface hover:bg-surface-container-low',
                                    )}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            disabled={currentPage === pageCount}
                            onClick={() => setPage(currentPage + 1)}
                            aria-label="Next page"
                            className="flex rounded border border-outline-variant p-2 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
                        >
                            <MaterialSymbol
                                name="chevron_right"
                                className="text-sm"
                            />
                        </button>
                    </nav>
                </section>
            </div>
        </>
    );
}
