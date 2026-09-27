import { Link } from '@inertiajs/react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useQuoteRequest } from '@/components/directory/quote-request/quote-request-provider';
import { findCategory } from '@/lib/directory-data';
import { show as showProfessional } from '@/routes/professionals';
import type { Professional } from '@/types';

type ProfessionalCardProps = {
    professional: Professional;
    actionLabel?: string;
};

export default function ProfessionalCard({
    professional,
    actionLabel = 'Contact',
}: ProfessionalCardProps) {
    const { openQuoteRequest } = useQuoteRequest();
    const category = findCategory(professional.categorySlug);

    return (
        <article className="group flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300 hover:border-primary-fixed-dim hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <div className="flex items-start gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-outline-variant">
                    <img
                        src={professional.photo}
                        alt={professional.name}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-1">
                        <h3 className="truncate text-headline-md leading-tight text-on-surface transition-colors group-hover:text-primary">
                            {professional.name}
                        </h3>
                        {professional.isVerified && (
                            <MaterialSymbol
                                name="verified"
                                filled
                                className="text-sm text-tertiary-container"
                            />
                        )}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-on-surface-variant">
                        <MaterialSymbol
                            name={category?.icon ?? 'work'}
                            className="text-sm"
                        />
                        <span className="text-label-md">
                            {professional.title}
                        </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                        <MaterialSymbol
                            name="star"
                            filled
                            className="text-[16px] text-secondary-container"
                        />
                        <span className="text-label-sm font-bold text-on-surface">
                            {professional.rating.toFixed(1)}
                        </span>
                        <span className="text-label-sm text-on-surface-variant">
                            ({professional.reviewsCount} reviews) •{' '}
                            {professional.commune}, {professional.city}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex-grow">
                <div className="mb-2 flex flex-wrap gap-2">
                    {professional.tags.map((tag) => (
                        <span
                            key={tag}
                            className="rounded bg-surface-container-high px-2 py-1 text-label-sm text-on-surface"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
                <p className="line-clamp-2 text-body-md text-on-surface-variant">
                    {professional.summary}
                </p>
            </div>
            <div className="mt-auto flex gap-4 border-t border-outline-variant pt-4">
                <Link
                    href={showProfessional(professional.slug)}
                    className="flex-1 rounded-lg border border-primary bg-surface-container-lowest py-2 text-center text-label-md text-primary transition-colors hover:bg-surface-container-low"
                >
                    View Profile
                </Link>
                <button
                    type="button"
                    onClick={() => openQuoteRequest({ professional })}
                    className="flex-1 rounded-lg bg-secondary-container py-2 text-label-md text-on-secondary-container shadow-sm transition-colors hover:bg-secondary-fixed-dim"
                >
                    {actionLabel}
                </button>
            </div>
        </article>
    );
}
