import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import QuoteRequestDialog from '@/components/directory/quote-request/quote-request-dialog';
import type { Professional } from '@/types';

type QuoteRequestOptions = {
    categorySlug?: string;
    professional?: Professional;
};

type QuoteRequestContextValue = {
    openQuoteRequest: (options?: QuoteRequestOptions) => void;
};

const QuoteRequestContext = createContext<QuoteRequestContextValue | null>(
    null,
);

export function QuoteRequestProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [sessionKey, setSessionKey] = useState(0);
    const [options, setOptions] = useState<QuoteRequestOptions>({});

    function openQuoteRequest(nextOptions: QuoteRequestOptions = {}) {
        setOptions(nextOptions);
        setSessionKey((previous) => previous + 1);
        setIsOpen(true);
    }

    return (
        <QuoteRequestContext.Provider value={{ openQuoteRequest }}>
            {children}
            <QuoteRequestDialog
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                sessionKey={sessionKey}
                categorySlug={options.categorySlug}
                professional={options.professional}
            />
        </QuoteRequestContext.Provider>
    );
}

export function useQuoteRequest(): QuoteRequestContextValue {
    const context = useContext(QuoteRequestContext);

    if (!context) {
        throw new Error(
            'useQuoteRequest must be used within a QuoteRequestProvider.',
        );
    }

    return context;
}
