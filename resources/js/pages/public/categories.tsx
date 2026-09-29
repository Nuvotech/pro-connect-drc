import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useQuoteRequest } from '@/components/directory/quote-request/quote-request-provider';
import { show as showCategory } from '@/routes/categories';
import type { Category } from '@/types';
import { otherName, t } from '@/lib/i18n';

/**
 * Lowercase and strip accents, so "macon" finds "Maçons".
 */
function normalize(value: string): string {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export default function Categories({
    trades,
    businessServices,
}: {
    trades: Category[];
    businessServices: Category[];
}) {
    const { openQuoteRequest } = useQuoteRequest();
    const [searchTerm, setSearchTerm] = useState('');
    const query = normalize(searchTerm);
    const matches = (category: Category) =>
        !query ||
        normalize(category.name).includes(query) ||
        normalize(category.nameFr).includes(query);
    const groups = [
        {
            title: 'Trades & home services',
            titleFr: 'Métiers',
            items: trades.filter(matches),
        },
        {
            title: 'Business services',
            titleFr: 'Services aux entreprises',
            items: businessServices.filter(matches),
        },
    ].filter((group) => group.items.length > 0);

    return (
        <>
            <Head title={t('All services')} />

            <header className="border-b border-outline-variant bg-surface-container-low px-page py-10 md:py-12">
                <h1 className="text-headline-lg text-on-surface md:text-display-lg">
                    {t('All services')}
                    <span className="mt-1 block text-headline-md font-normal text-on-surface-variant">
                        {t('Tous les services')}
                    </span>
                </h1>
                <div className="relative mt-6 max-w-xl">
                    <MaterialSymbol
                        name="search"
                        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-outline"
                    />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        aria-label={t('Search services')}
                        placeholder={t('Search: plumber, maçon, notaire…')}
                        className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pr-4 pl-12 text-body-md text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                </div>
            </header>

            <div className="flex w-full flex-col gap-12 px-page py-10">
                {groups.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-12 text-center">
                        <MaterialSymbol
                            name="search_off"
                            className="text-4xl text-outline"
                        />
                        <p className="text-body-md text-on-surface-variant">
                            {t('No service matches “')}
                            {searchTerm.trim()}”.
                        </p>
                        <button
                            type="button"
                            onClick={() => openQuoteRequest()}
                            className="rounded-lg bg-primary px-5 py-3 text-label-md text-on-primary hover:bg-primary-container"
                        >
                            {t('Describe what you need')}
                        </button>
                    </div>
                ) : (
                    groups.map((group) => (
                        <section key={group.title}>
                            <h2 className="mb-5 text-headline-md text-on-surface">
                                {t(group.title)}{' '}
                                <span className="text-body-md font-normal text-on-surface-variant">
                                    / {group.titleFr}
                                </span>
                            </h2>
                            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {group.items.map((category) => (
                                    <li key={category.slug}>
                                        <Link
                                            href={showCategory(category.slug)}
                                            className="group flex h-full items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 transition-colors duration-200 hover:border-primary hover:bg-surface-container-low"
                                        >
                                            <MaterialSymbol
                                                name={category.icon}
                                                className="shrink-0 text-[28px] text-primary"
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-label-md text-on-surface">
                                                    {category.name}
                                                </span>
                                                <span className="block truncate text-label-sm text-on-surface-variant">
                                                    {otherName(category)}
                                                    {category.prosCount > 0 &&
                                                        ` · ${category.prosCount} verified`}
                                                </span>
                                            </span>
                                            <MaterialSymbol
                                                name="chevron_right"
                                                className="shrink-0 text-outline transition-colors group-hover:text-primary"
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))
                )}
            </div>
        </>
    );
}
