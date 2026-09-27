import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { home } from '@/routes';

/**
 * Distraction-free layout for linear request flows: brand and close only.
 */
export default function PublicFocusLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="proconnect flex min-h-screen flex-col bg-surface text-on-surface">
            <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-outline-variant bg-surface px-page py-4 shadow-sm">
                <Link
                    href={home()}
                    className="text-headline-md font-bold text-primary md:text-headline-lg"
                >
                    ProConnect RDC
                </Link>
                <Link
                    href={home()}
                    aria-label="Close and return home"
                    className="flex items-center text-on-surface-variant transition-colors duration-200 hover:text-primary"
                >
                    <MaterialSymbol name="close" />
                </Link>
            </header>
            <main className="flex flex-grow items-center justify-center p-4 md:p-12">
                {children}
            </main>
        </div>
    );
}
