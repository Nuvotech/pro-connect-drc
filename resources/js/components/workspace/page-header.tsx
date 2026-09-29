import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * The title block at the top of a workspace page, with an optional link
 * back to the parent page and actions on the right.
 */
export default function PageHeader({
    title,
    description,
    backHref,
    backLabel,
    actions,
}: {
    title: string;
    description?: ReactNode;
    backHref?: NonNullable<InertiaLinkProps['href']>;
    backLabel?: string;
    actions?: ReactNode;
}) {
    return (
        <div>
            {backHref && (
                <Link
                    href={backHref}
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors duration-200 hover:text-zinc-900"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    {backLabel}
                </Link>
            )}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1 text-sm text-zinc-500">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex shrink-0 items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
