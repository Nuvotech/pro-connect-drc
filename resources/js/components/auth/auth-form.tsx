import { Link } from '@inertiajs/react';
import { useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export const authInputClassName =
    'h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 aria-invalid:border-error';

/**
 * A labelled field with its error underneath. `aside` sits to the right of
 * the label, e.g. a "Forgot password?" link.
 */
export function AuthField({
    id,
    label,
    error,
    aside,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    aside?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={id} className="text-label-md text-on-surface">
                    {label}
                </label>
                {aside}
            </div>
            {children}
            {error && (
                <p role="alert" className="text-label-sm text-error">
                    {t(error)}
                </p>
            )}
        </div>
    );
}

export function AuthInput({ className, ...props }: ComponentProps<'input'>) {
    return <input className={cn(authInputClassName, className)} {...props} />;
}

/**
 * A password input with a show/hide toggle.
 */
export function AuthPasswordInput({
    className,
    ...props
}: Omit<ComponentProps<'input'>, 'type'>) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative">
            <input
                type={isVisible ? 'text' : 'password'}
                className={cn(authInputClassName, 'pr-11', className)}
                {...props}
            />
            <button
                type="button"
                onClick={() => setIsVisible((visible) => !visible)}
                aria-label={isVisible ? t('Hide password') : t('Show password')}
                className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-lg text-on-surface-variant transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
                <MaterialSymbol
                    name={isVisible ? 'visibility_off' : 'visibility'}
                    className="text-[20px]"
                />
            </button>
        </div>
    );
}

export function AuthSubmit({
    processing,
    children,
    className,
    ...props
}: ComponentProps<'button'> & { processing?: boolean }) {
    return (
        <button
            type="submit"
            disabled={processing}
            className={cn(
                'flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 text-label-md text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60',
                className,
            )}
            {...props}
        >
            {processing && (
                <MaterialSymbol
                    name="progress_activity"
                    className="animate-spin text-[18px]"
                />
            )}
            {children}
        </button>
    );
}

export function AuthLink({ className, ...props }: ComponentProps<typeof Link>) {
    return (
        <Link
            className={cn(
                'font-semibold text-primary underline-offset-2 hover:underline',
                className,
            )}
            {...props}
        />
    );
}

/**
 * A green notice, e.g. "We have emailed your password reset link."
 */
export function AuthStatus({ children }: { children?: ReactNode }) {
    if (!children) {
        return null;
    }

    return (
        <p
            role="status"
            className="mb-4 rounded-lg bg-primary/5 px-3 py-2.5 text-center text-label-md text-primary"
        >
            {children}
        </p>
    );
}

/**
 * A thin line with a word in the middle, e.g. "or".
 */
export function AuthDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
            <span className="h-px flex-1 bg-outline-variant" />
            {label}
            <span className="h-px flex-1 bg-outline-variant" />
        </div>
    );
}
