import { Link } from '@inertiajs/react';
import LanguageSwitch from '@/components/language-switch';
import { t } from '@/lib/i18n';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

/**
 * A calm, centred card for sign-in and account pages, with the ProConnect
 * logo on top and the language switch in the corner.
 */
export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="proconnect flex min-h-svh flex-col bg-surface-container-low text-on-surface">
            <div className="flex justify-end px-4 pt-4 sm:px-6">
                <LanguageSwitch />
            </div>

            <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-sm">
                    <Link
                        href={home()}
                        className="mx-auto mb-8 flex w-fit rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                    >
                        <img
                            src="/images/logos/proconnect.png"
                            alt="ProConnect RDC"
                            className="h-10 w-auto"
                        />
                    </Link>

                    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm sm:p-8">
                        {(title || description) && (
                            <div className="mb-6 flex flex-col gap-1.5 text-center">
                                {title && (
                                    <h1 className="text-headline-md text-on-surface">
                                        {t(title)}
                                    </h1>
                                )}
                                {description && (
                                    <p className="text-body-md text-on-surface-variant">
                                        {t(description)}
                                    </p>
                                )}
                            </div>
                        )}
                        {children}
                    </div>

                    <p className="mt-6 text-center">
                        <Link
                            href={home()}
                            className="text-label-sm text-on-surface-variant transition-colors hover:text-primary"
                        >
                            {t('Back to home')}
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
