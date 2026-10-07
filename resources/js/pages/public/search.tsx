import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { selectClassName } from '@/components/directory/field-styles';
import InviteProLink from '@/components/directory/invite-pro-link';
import MaterialSymbol from '@/components/directory/material-symbol';
import ProfessionalCard from '@/components/directory/professional-card';
import { cn } from '@/lib/utils';
import { search } from '@/routes';
import type { Category, City, Professional, ProviderType } from '@/types';
import { useVisitorLocation } from '@/hooks/use-visitor-location';
import { t } from '@/lib/i18n';

const sortOptions = [
    { value: 'rating', label: 'Top Rated' },
    { value: 'reviews', label: 'Most Reviews' },
    { value: 'newest', label: 'Newest' },
];

const providerTypeOptions = [
    { value: null, label: 'All' },
    { value: 'individual', label: 'Independent professionals' },
    { value: 'company', label: 'Registered companies' },
] as const;

type SearchFilters = {
    q: string;
    location: string;
    categories: string[];
    rating: number;
    type: ProviderType | null;
    sort: string;
};

type PaginatedProfessionals = {
    data: Professional[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

export default function Search({
    professionals,
    filters,
    categories,
    cities,
}: {
    professionals: PaginatedProfessionals;
    filters: SearchFilters;
    categories: Category[];
    cities: City[];
}) {
    const { browsingCity } = useVisitorLocation();
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [minimumRating, setMinimumRating] = useState(filters.rating);
    const [term, setTerm] = useState(filters.q);
    const [areFiltersOpen, setAreFiltersOpen] = useState(false);
    const activeFilterCount =
        filters.categories.length +
        (filters.location ? 1 : 0) +
        (filters.rating > 0 ? 1 : 0) +
        (filters.type ? 1 : 0);
    const selectedCategories = filters.categories;
    const currentPage = professionals.current_page;
    const pageCount = professionals.last_page;
    const visibleCategories = showAllCategories
        ? categories
        : categories.filter(
              (category, index) =>
                  index < 6 || selectedCategories.includes(category.slug),
          );

    /**
     * Reload the results with some filters changed, back on the first page
     * unless a page is given.
     */
    function applyFilters(changes: Partial<SearchFilters> & { page?: number }) {
        const next = { ...filters, ...changes };

        router.get(
            search.url(),
            {
                q: next.q || undefined,
                location: next.location || (browsingCity ? 'all' : undefined),
                categories:
                    next.categories.length > 0 ? next.categories : undefined,
                rating: next.rating > 0 ? next.rating : undefined,
                type: next.type ?? undefined,
                sort: next.sort !== 'rating' ? next.sort : undefined,
                page:
                    changes.page && changes.page > 1 ? changes.page : undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function submitSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        applyFilters({ q: term.trim() });
    }

    function toggleCategory(slug: string) {
        applyFilters({
            categories: selectedCategories.includes(slug)
                ? selectedCategories.filter((selected) => selected !== slug)
                : [...selectedCategories, slug],
        });
    }

    return (
        <>
            <Head title={t('Search Professionals')} />

            <div className="flex w-full flex-grow flex-col gap-6 px-page py-6 md:flex-row md:gap-5 md:py-10">
                <form
                    onSubmit={submitSearch}
                    role="search"
                    className="flex gap-2 md:hidden"
                >
                    <SearchField value={term} onChange={setTerm} />
                    <button
                        type="button"
                        onClick={() => setAreFiltersOpen(!areFiltersOpen)}
                        aria-expanded={areFiltersOpen}
                        aria-controls="search-filters"
                        className="inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-label-md text-on-surface"
                    >
                        <MaterialSymbol name="tune" className="text-lg" />
                        <span className="sr-only sm:not-sr-only">
                            {t('Filters')}
                        </span>
                        {activeFilterCount > 0 && (
                            <span className="rounded-full bg-primary px-2 text-label-sm text-on-primary">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </form>

                <aside
                    id="search-filters"
                    className={cn(
                        'w-full space-y-6 md:block md:w-1/4',
                        areFiltersOpen ? 'block' : 'hidden',
                    )}
                >
                    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                        <h3 className="mb-4 text-headline-md text-primary">
                            {t('Filters')}
                        </h3>
                        {filters.q && (
                            <p className="mb-6 flex items-center justify-between gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-label-sm text-on-surface-variant">
                                <span>
                                    {t('Results for “')}
                                    <span className="font-semibold text-on-surface">
                                        {filters.q}
                                    </span>
                                    ”
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTerm('');
                                        applyFilters({ q: '' });
                                    }}
                                    aria-label={t('Clear search')}
                                    className="flex text-on-surface-variant hover:text-primary"
                                >
                                    <MaterialSymbol
                                        name="close"
                                        className="text-base"
                                    />
                                </button>
                            </p>
                        )}

                        <div className="mb-6">
                            <h4 className="mb-2 text-label-md text-on-surface">
                                {t('Category')}
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
                                        <span className="text-[13px] leading-5">
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
                                        ? t('Show fewer trades')
                                        : t('View all :length services', {
                                              length: categories.length,
                                          })}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label
                                htmlFor="search-city"
                                className="mb-2 block text-label-md text-on-surface"
                            >
                                {t('City')}
                            </label>
                            <div className="relative">
                                <select
                                    id="search-city"
                                    value={filters.location}
                                    onChange={(event) =>
                                        applyFilters({
                                            location: event.target.value,
                                        })
                                    }
                                    className={cn(
                                        selectClassName,
                                        'rounded-md px-3 py-2 pr-9 shadow-none',
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
                                    className="pointer-events-none absolute top-2 right-2 text-outline"
                                />
                            </div>
                        </div>

                        <fieldset className="mb-6">
                            <legend className="mb-2 text-label-md text-on-surface">
                                {t('Provider type')}
                            </legend>
                            <div className="space-y-2">
                                {providerTypeOptions.map((option) => (
                                    <label
                                        key={option.label}
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <input
                                            type="radio"
                                            name="provider-type"
                                            checked={
                                                filters.type === option.value
                                            }
                                            onChange={() =>
                                                applyFilters({
                                                    type: option.value,
                                                })
                                            }
                                            className="size-4 accent-primary"
                                        />
                                        <span className="text-[13px] leading-5">
                                            {t(option.label)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <div className="mb-6">
                            <label
                                htmlFor="search-rating"
                                className="mb-2 block text-label-md text-on-surface"
                            >
                                {t('Minimum Rating')}
                            </label>
                            <div className="flex items-center gap-2">
                                <MaterialSymbol
                                    name="star"
                                    filled
                                    className="text-rating"
                                />
                                <input
                                    id="search-rating"
                                    type="range"
                                    min={0}
                                    max={5}
                                    step={0.5}
                                    value={minimumRating}
                                    onChange={(event) =>
                                        setMinimumRating(
                                            Number(event.target.value),
                                        )
                                    }
                                    onPointerUp={() =>
                                        applyFilters({ rating: minimumRating })
                                    }
                                    onKeyUp={() =>
                                        applyFilters({ rating: minimumRating })
                                    }
                                    className="w-full accent-primary"
                                />
                                <span className="text-label-md">
                                    {minimumRating === 0
                                        ? t('Any')
                                        : `${minimumRating.toFixed(1)}+`}
                                </span>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="flex w-full flex-col gap-6 md:w-3/4">
                    <form
                        onSubmit={submitSearch}
                        role="search"
                        className="hidden gap-2 md:flex"
                    >
                        <SearchField value={term} onChange={setTerm} />
                        <button
                            type="submit"
                            className="h-12 shrink-0 cursor-pointer rounded-lg bg-primary px-6 text-label-md text-on-primary transition-colors hover:bg-primary-container"
                        >
                            {t('Search')}
                        </button>
                    </form>
                    <div className="flex flex-col justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] sm:flex-row sm:items-center">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-md text-on-surface-variant">
                            {professionals.total === 0
                                ? filters.location
                                    ? t('No professionals found in :city', {
                                          city: filters.location,
                                      })
                                    : t('No professionals found')
                                : t(
                                      filters.location
                                          ? 'Showing :from–:to of :total professionals in :city'
                                          : 'Showing :from–:to of :total professionals',
                                      {
                                          from: professionals.from ?? 0,
                                          to: professionals.to ?? 0,
                                          total: professionals.total,
                                          city: filters.location,
                                      },
                                  )}
                            {filters.location && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        applyFilters({ location: '' })
                                    }
                                    className="cursor-pointer text-label-md text-primary underline-offset-2 hover:underline"
                                >
                                    {t('See all of DRC')}
                                </button>
                            )}
                        </span>
                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="search-sort"
                                className="shrink-0 text-label-md text-on-surface"
                            >
                                {t('Sort by:')}
                            </label>
                            <div className="relative">
                                <select
                                    id="search-sort"
                                    value={filters.sort}
                                    onChange={(event) =>
                                        applyFilters({
                                            sort: event.target.value,
                                        })
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
                                            {t(option.label)}
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

                    {professionals.data.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {professionals.data.map((professional) => (
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
                                {t(
                                    'No professionals match these filters yet. Try another city or lower the minimum rating.',
                                )}
                            </p>
                            <InviteProLink />
                        </div>
                    )}

                    {pageCount > 1 && (
                        <nav
                            aria-label={t('Pagination')}
                            className="mt-6 flex items-center justify-center gap-2"
                        >
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    applyFilters({ page: currentPage - 1 })
                                }
                                aria-label={t('Previous page')}
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
                                        onClick={() =>
                                            applyFilters({ page: pageNumber })
                                        }
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
                                onClick={() =>
                                    applyFilters({ page: currentPage + 1 })
                                }
                                aria-label={t('Next page')}
                                className="flex rounded border border-outline-variant p-2 text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
                            >
                                <MaterialSymbol
                                    name="chevron_right"
                                    className="text-sm"
                                />
                            </button>
                        </nav>
                    )}
                </section>
            </div>
        </>
    );
}

function SearchField({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="relative flex-1">
            <MaterialSymbol
                name="search"
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-outline"
            />
            <input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                aria-label={t('Search professionals')}
                placeholder={t('Plumber, électricien, Gombe…')}
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pr-4 pl-12 text-body-md text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
        </div>
    );
}
