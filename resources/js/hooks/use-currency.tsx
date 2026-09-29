import { usePage } from '@inertiajs/react';
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import { formatMoney } from '@/lib/admin-data';
import type { ExchangeRate } from '@/types';

/**
 * `original` shows each price in the currency its pro chose.
 */
export type DisplayCurrency = 'original' | 'USD' | 'CDF';

type CurrencyContextValue = {
    displayCurrency: DisplayCurrency;
    setDisplayCurrency: (currency: DisplayCurrency) => void;
    exchangeRate: ExchangeRate | null;
    convert: (amount: number, from: string, to: string) => number | null;
    formatPrice: (
        amount: string | number,
        currency: string,
        suffix?: string,
    ) => string;
};

const storageKey = 'proconnect.display-currency';

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStoredCurrency(): DisplayCurrency {
    try {
        const stored = localStorage.getItem(storageKey);

        return stored === 'USD' || stored === 'CDF' ? stored : 'original';
    } catch {
        return 'original';
    }
}

/**
 * Round a converted amount the way people quote it: whole dollars (cents
 * below $10) and francs to the nearest hundred.
 */
function roundConverted(amount: number, currency: string): number {
    if (currency === 'CDF') {
        return Math.round(amount / 100) * 100;
    }

    return amount < 10 ? Math.round(amount * 100) / 100 : Math.round(amount);
}

/**
 * Lets visitors read every public price in dollars or francs, using the
 * exchange rate shared by the server.
 */
export function CurrencyProvider({ children }: { children: ReactNode }) {
    const { exchangeRate } = usePage().props;
    const [displayCurrency, setStoredCurrency] =
        useState<DisplayCurrency>(readStoredCurrency);

    const setDisplayCurrency = useCallback((currency: DisplayCurrency) => {
        setStoredCurrency(currency);

        try {
            localStorage.setItem(storageKey, currency);
        } catch {
            // Without storage the choice lasts until the next full load.
        }
    }, []);

    const convert = useCallback(
        (amount: number, from: string, to: string): number | null => {
            if (from === to) {
                return amount;
            }

            if (!exchangeRate) {
                return null;
            }

            return from === 'USD'
                ? amount * exchangeRate.rate
                : amount / exchangeRate.rate;
        },
        [exchangeRate],
    );

    const formatPrice = useCallback(
        (amount: string | number, currency: string, suffix = '') => {
            const target =
                displayCurrency === 'original' ? currency : displayCurrency;
            const converted = convert(Number(amount), currency, target);

            if (target === currency || converted === null) {
                return `${formatMoney(String(amount), currency)}${suffix}`;
            }

            return `≈ ${formatMoney(String(roundConverted(converted, target)), target)}${suffix}`;
        },
        [convert, displayCurrency],
    );

    const value = useMemo(
        () => ({
            displayCurrency,
            setDisplayCurrency,
            exchangeRate: exchangeRate ?? null,
            convert,
            formatPrice,
        }),
        [
            displayCurrency,
            setDisplayCurrency,
            exchangeRate,
            convert,
            formatPrice,
        ],
    );

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}

/**
 * Price formatting in the visitor's chosen currency. Outside the public
 * layouts it falls back to each price's own currency.
 */
export function useCurrency(): CurrencyContextValue {
    const context = useContext(CurrencyContext);

    return (
        context ?? {
            displayCurrency: 'original',
            setDisplayCurrency: () => {},
            exchangeRate: null,
            convert: (amount, from, to) => (from === to ? amount : null),
            formatPrice: (amount, currency, suffix = '') =>
                `${formatMoney(String(amount), currency)}${suffix}`,
        }
    );
}
