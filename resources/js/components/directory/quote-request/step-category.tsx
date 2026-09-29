import { useState } from 'react';
import FieldError from '@/components/directory/field-error';
import { inputClassName } from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import type { QuoteStepProps } from '@/components/directory/quote-request/quote-request-data';
import { useCategories } from '@/hooks/use-categories';
import { cn } from '@/lib/utils';
import { otherName, t } from '@/lib/i18n';

/**
 * Lowercase and strip accents, so "macon" finds "Maçons".
 */
function normalize(value: string): string {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export default function StepCategory({
    data,
    errors,
    setField,
}: QuoteStepProps) {
    const { categories } = useCategories();
    const [searchTerm, setSearchTerm] = useState('');
    const normalizedSearch = normalize(searchTerm);
    const serviceCategories = categories.filter(
        (category) => category.group !== 'vehicle',
    );
    const visibleCategories = serviceCategories.filter(
        (category) =>
            !normalizedSearch ||
            normalize(category.name).includes(normalizedSearch) ||
            normalize(category.nameFr).includes(normalizedSearch),
    );

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-body-lg font-semibold text-on-surface">
                {t('What do you need?')}
            </h2>

            <div className="relative">
                <MaterialSymbol
                    name="search"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-outline"
                />
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    aria-label={t('Search services')}
                    placeholder={t('Search: plumber, maçon, lawyer…')}
                    className={cn(inputClassName, 'h-11 pr-3 pl-10')}
                />
            </div>

            {visibleCategories.length === 0 ? (
                <p className="py-6 text-center text-body-md text-on-surface-variant">
                    {t('No service matches “')}
                    {searchTerm.trim()}”.
                </p>
            ) : (
                <div
                    role="radiogroup"
                    aria-label={t('Service')}
                    className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto p-0.5 sm:grid-cols-2"
                >
                    {visibleCategories.map((category) => {
                        const isSelected = data.categorySlug === category.slug;

                        return (
                            <button
                                key={category.slug}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() =>
                                    setField('categorySlug', category.slug)
                                }
                                className={cn(
                                    'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                                    isSelected
                                        ? 'border-primary bg-primary/5'
                                        : 'border-outline-variant hover:border-primary',
                                )}
                            >
                                <MaterialSymbol
                                    name={category.icon}
                                    filled={isSelected}
                                    className="shrink-0 text-[20px] text-primary"
                                />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-label-md text-on-surface">
                                        {category.name}
                                    </span>
                                    <span className="block truncate text-label-sm text-on-surface-variant">
                                        {otherName(category)}
                                    </span>
                                </span>
                                {isSelected && (
                                    <MaterialSymbol
                                        name="check_circle"
                                        filled
                                        className="shrink-0 text-[20px] text-primary"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            <FieldError message={errors.categorySlug} />
        </div>
    );
}
