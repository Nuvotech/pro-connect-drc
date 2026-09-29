import type { UrlMethodPair } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { AuthDivider } from '@/components/auth/auth-form';
import MaterialSymbol from '@/components/directory/material-symbol';
import { t } from '@/lib/i18n';

type Props = {
    routes?: {
        options: UrlMethodPair;
        submit: UrlMethodPair;
    };
    label?: string;
    loadingLabel?: string;
    separator?: string;
};

/**
 * "Sign in with a passkey", shown only in browsers that support passkeys,
 * with an "or" line before the email form.
 */
export default function PasskeyVerify({
    routes,
    label,
    loadingLabel,
    separator,
}: Props = {}) {
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
        ...(routes && {
            routes: {
                options: routes.options.url,
                submit: routes.submit.url,
            },
        }),
        onSuccess: (response) => {
            router.visit(response.redirect ?? '/dashboard');
        },
    });

    if (!isSupported) {
        return null;
    }

    return (
        <div className="mb-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={verify}
                    disabled={isLoading}
                    className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-6 text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <MaterialSymbol
                        name={isLoading ? 'progress_activity' : 'passkey'}
                        className={
                            isLoading
                                ? 'animate-spin text-[18px]'
                                : 'text-[20px]'
                        }
                    />
                    {isLoading
                        ? (loadingLabel ?? t('Authenticating...'))
                        : (label ?? t('Sign in with a passkey'))}
                </button>
                {error && (
                    <p
                        role="alert"
                        className="text-center text-label-sm text-error"
                    >
                        {t(error)}
                    </p>
                )}
            </div>

            <AuthDivider label={separator ?? t('Or continue with email')} />
        </div>
    );
}
