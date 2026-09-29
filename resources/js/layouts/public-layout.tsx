import type { ReactNode } from 'react';
import LocationBanner from '@/components/directory/location-banner';
import { QuoteRequestProvider } from '@/components/directory/quote-request/quote-request-provider';
import SiteFooter from '@/components/directory/site-footer';
import SiteHeader from '@/components/directory/site-header';
import { CurrencyProvider } from '@/hooks/use-currency';
import { VisitorLocationProvider } from '@/hooks/use-visitor-location';

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <VisitorLocationProvider>
            <CurrencyProvider>
                <QuoteRequestProvider>
                    <div className="proconnect flex min-h-screen flex-col bg-background text-on-background">
                        <SiteHeader />
                        <LocationBanner />
                        <main className="flex flex-1 flex-col">{children}</main>
                        <SiteFooter />
                    </div>
                </QuoteRequestProvider>
            </CurrencyProvider>
        </VisitorLocationProvider>
    );
}
