import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useState } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useCurrency } from '@/hooks/use-currency';
import type { DisplayCurrency } from '@/hooks/use-currency';
import { formatMoney } from '@/lib/admin-data';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

const currencyOptions: {
    value: Exclude<DisplayCurrency, 'original'>;
    label: string;
}[] = [
    { value: 'USD', label: 'USD' },
    { value: 'CDF', label: 'FC' },
];

/**
 * "today", "yesterday" or "3 days ago".
 */
function updatedLabel(updatedAt: string): string {
    const days = Math.floor(
        (Date.now() - new Date(updatedAt).getTime()) / (24 * 60 * 60 * 1000),
    );

    if (days <= 0) {
        return t('today');
    }

    return days === 1 ? t('yesterday') : t(':days days ago', { days });
}

/**
 * Today's USD to FC rate, a switch to show every price in dollars or
 * francs, and a quick converter.
 */
export default function RateChecker() {
    const { exchangeRate, displayCurrency, setDisplayCurrency } = useCurrency();

    if (!exchangeRate) {
        return null;
    }

    const rateText = `1 USD = ${formatMoney(String(Math.round(exchangeRate.rate)), 'CDF')}`;

    return (
        <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
            <Converter rateText={rateText} />
            <span className="hidden text-outline sm:inline">
                {t('Updated')} {updatedLabel(exchangeRate.updatedAt)}
            </span>
            <div
                role="radiogroup"
                aria-label={t('Show prices in')}
                className="flex rounded-full border border-outline-variant p-0.5"
            >
                {currencyOptions.map((option) => {
                    const isSelected = displayCurrency === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() =>
                                setDisplayCurrency(
                                    isSelected ? 'original' : option.value,
                                )
                            }
                            className={cn(
                                'h-7 min-w-11 cursor-pointer rounded-full px-2.5 text-label-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                                isSelected
                                    ? 'bg-primary text-on-primary'
                                    : 'text-on-surface-variant hover:text-primary',
                            )}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function Converter({ rateText }: { rateText: string }) {
    const { exchangeRate, convert } = useCurrency();
    const [amount, setAmount] = useState('100');
    const [from, setFrom] = useState<'USD' | 'CDF'>('USD');
    const to = from === 'USD' ? 'CDF' : 'USD';
    const parsedAmount = Number(amount.replace(/[^\d.]/g, ''));
    const result = convert(parsedAmount || 0, from, to) ?? 0;

    return (
        <DialogPrimitive.Root>
            <DialogPrimitive.Trigger
                aria-label={t(':rateText. Open currency converter', {
                    rateText,
                })}
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2 font-semibold text-on-surface transition-colors duration-200 hover:bg-surface-container-low hover:text-primary"
            >
                <MaterialSymbol
                    name="currency_exchange"
                    className="hidden text-[18px] text-primary sm:inline-block"
                />
                {rateText}
            </DialogPrimitive.Trigger>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="proconnect fixed inset-0 z-50 grid place-items-center bg-on-background/60 p-4 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
                    <DialogPrimitive.Content
                        aria-describedby={undefined}
                        className="relative w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=open]:zoom-in-95"
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <DialogPrimitive.Title className="text-body-lg font-semibold text-on-surface">
                                    {t('Currency converter')}
                                </DialogPrimitive.Title>
                                <p className="text-label-sm text-on-surface-variant">
                                    {rateText} ·{' '}
                                    {exchangeRate?.source === 'manual'
                                        ? t('Set by ProConnect')
                                        : t('Auto-updated daily')}
                                </p>
                            </div>
                            <DialogPrimitive.Close
                                aria-label={t('Close')}
                                className="-mt-2 -mr-2 flex size-10 cursor-pointer items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                            >
                                <MaterialSymbol name="close" />
                            </DialogPrimitive.Close>
                        </div>

                        <label
                            htmlFor="converter-amount"
                            className="mb-1.5 block text-label-md text-on-surface"
                        >
                            {t('Amount in')}{' '}
                            {from === 'USD'
                                ? t('US dollars')
                                : t('Congolese francs')}
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                id="converter-amount"
                                type="text"
                                inputMode="decimal"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(event.target.value)
                                }
                                className="h-11 w-full min-w-0 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setFrom(to);
                                    setAmount(
                                        String(
                                            to === 'CDF'
                                                ? Math.round(result)
                                                : Math.round(result * 100) /
                                                      100,
                                        ),
                                    );
                                }}
                                aria-label={
                                    to === 'USD'
                                        ? t('Swap to US dollars')
                                        : t('Swap to Congolese francs')
                                }
                                className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-outline-variant text-primary transition-colors hover:border-primary"
                            >
                                <MaterialSymbol name="swap_horiz" />
                            </button>
                        </div>

                        <p
                            aria-live="polite"
                            className="mt-4 rounded-lg bg-surface-container-low px-4 py-3 text-headline-md text-primary"
                        >
                            {formatMoney(
                                String(
                                    to === 'CDF'
                                        ? Math.round(result)
                                        : Math.round(result * 100) / 100,
                                ),
                                to,
                            )}
                        </p>
                    </DialogPrimitive.Content>
                </DialogPrimitive.Overlay>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
