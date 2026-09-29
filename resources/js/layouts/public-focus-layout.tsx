import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import LocationBanner from '@/components/directory/location-banner';
import LanguageSwitch from '@/components/language-switch';
import MaterialSymbol from '@/components/directory/material-symbol';
import { VisitorLocationProvider } from '@/hooks/use-visitor-location';
import { home } from '@/routes';
import { t } from '@/lib/i18n';

/**
 * Distraction-free layout for linear request flows: brand and close only.
 */
export default function PublicFocusLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <VisitorLocationProvider>
            <div className="proconnect flex min-h-screen flex-col bg-surface text-on-surface">
                <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-outline-variant bg-surface px-page py-3 shadow-sm">
                    <Link href={home()} className="flex shrink-0 items-center">
                        <img
                            src="/images/logos/proconnect.png"
                            alt={t('ProConnect RDC')}
                            className="h-8 w-auto md:h-9"
                        />
                    </Link>
                    <div className="flex items-center gap-3">
                        <LanguageSwitch />
                        <Link
                            href={home()}
                            aria-label={t('Close and return home')}
                            className="flex items-center text-on-surface-variant transition-colors duration-200 hover:text-primary"
                        >
                            <MaterialSymbol name="close" />
                        </Link>
                    </div>
                </header>
                <LocationBanner />
                <main className="flex flex-grow items-center justify-center px-4 py-4 md:py-6">
                    {children}
                </main>
            </div>
        </VisitorLocationProvider>
    );
}
