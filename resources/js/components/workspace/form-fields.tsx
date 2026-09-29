import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export const inputClassName =
    'h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none aria-[invalid=true]:border-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400';

export function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-5">
                <h2 className="text-base font-semibold text-zinc-900">
                    {title}
                </h2>
                <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {children}
            </div>
        </section>
    );
}

export function Field({
    label,
    htmlFor,
    error,
    isOptional = false,
    className,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    isOptional?: boolean;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label
                htmlFor={htmlFor}
                className="flex items-baseline justify-between gap-2 text-sm font-medium text-zinc-900"
            >
                {label}
                {isOptional && (
                    <span className="text-xs font-normal text-zinc-500">
                        {t('Optional')}
                    </span>
                )}
            </label>
            {children}
            {error && (
                <p className="text-xs font-medium text-zinc-900">{error}</p>
            )}
        </div>
    );
}

export function Checkbox({
    name,
    label,
    description,
    defaultChecked = false,
}: {
    name: string;
    label: string;
    description?: string;
    defaultChecked?: boolean;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-2.5">
            <input
                type="checkbox"
                name={name}
                value="1"
                defaultChecked={defaultChecked}
                className="mt-0.5 size-4 cursor-pointer rounded accent-primary"
            />
            <span className="flex flex-col">
                <span className="text-sm text-zinc-900">{label}</span>
                {description && (
                    <span className="text-xs text-zinc-500">{description}</span>
                )}
            </span>
        </label>
    );
}

export function FileField({
    id,
    label,
    name,
    accept,
    hint,
    icon,
    fileName,
    onFileChange,
    error,
}: {
    label: string;
    name: string;
    accept: string;
    hint: string;
    icon: ReactNode;
    /** Anchor so links can jump straight to this field. */
    id?: string;
    fileName?: string;
    onFileChange: (fileName?: string) => void;
    error?: string;
}) {
    return (
        <div id={id} className="flex scroll-mt-24 flex-col gap-1.5">
            <span className="flex items-baseline justify-between gap-2 text-sm font-medium text-zinc-900">
                {label}
                <span className="text-xs font-normal text-zinc-500">
                    {t('Optional')}
                </span>
            </span>
            <label
                className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-3 py-3 transition-colors duration-200 hover:bg-zinc-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/15',
                    error ? 'border-zinc-900' : 'border-zinc-300',
                )}
            >
                <input
                    type="file"
                    name={name}
                    accept={accept}
                    onChange={(event) =>
                        onFileChange(event.target.files?.[0]?.name)
                    }
                    className="sr-only"
                />
                <span className="text-zinc-400" aria-hidden="true">
                    {icon}
                </span>
                <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm text-zinc-900">
                        {fileName ?? t('Choose a file')}
                    </span>
                    <span className="text-xs text-zinc-500">{hint}</span>
                </span>
            </label>
            {error && (
                <p className="text-xs font-medium text-zinc-900">{error}</p>
            )}
        </div>
    );
}
