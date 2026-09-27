import type { ReactNode } from 'react';
import { QuoteRequestProvider } from '@/components/directory/quote-request/quote-request-provider';
import SiteFooter from '@/components/directory/site-footer';
import SiteHeader from '@/components/directory/site-header';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <QuoteRequestProvider>
            <div className="proconnect flex min-h-screen flex-col bg-background text-on-background">
                <SiteHeader />
                <main className="flex flex-1 flex-col">{children}</main>
                <SiteFooter />
            </div>
        </QuoteRequestProvider>
    );
}
