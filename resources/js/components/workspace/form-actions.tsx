import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { t } from '@/lib/i18n';

/**
 * Cancel and submit buttons at the foot of a workspace form, with upload
 * progress when files are being sent.
 */
export default function FormActions({
    cancelHref,
    submitLabel,
    processing,
    progress,
}: {
    cancelHref: NonNullable<InertiaLinkProps['href']>;
    submitLabel: string;
    processing: boolean;
    progress?: number;
}) {
    return (
        <div className="flex items-center justify-end gap-2">
            {progress !== undefined && (
                <span className="mr-auto text-xs text-zinc-500 tabular-nums">
                    {t('Uploading…')} {progress}%
                </span>
            )}
            <Link
                href={cancelHref}
                className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
            >
                {t('Cancel')}
            </Link>
            <button
                type="submit"
                disabled={processing}
                className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            >
                {processing ? t('Saving…') : submitLabel}
            </button>
        </div>
    );
}
