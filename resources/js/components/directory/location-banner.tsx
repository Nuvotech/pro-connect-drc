import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useState } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import { useCities } from '@/hooks/use-categories';
import { useVisitorLocation } from '@/hooks/use-visitor-location';
import { t } from '@/lib/i18n';

const dismissedKey = 'proconnect.location-banner-dismissed';

function wasDismissed(): boolean {
    try {
        return sessionStorage.getItem(dismissedKey) === '1';
    } catch {
        return false;
    }
}

const steps = [
    'Tap the lock or settings icon next to the web address.',
    'Open Location (or Site settings → Location) and choose Allow.',
    'Come back here. We will find your city automatically.',
];

/**
 * Asks visitors who have blocked location to turn it on, or to pick their
 * city by hand instead.
 */
export default function LocationBanner() {
    const { status, chooseCity } = useVisitorLocation();
    const { cities } = useCities();
    const [isDismissed, setIsDismissed] = useState(wasDismissed);

    if (status !== 'denied' || isDismissed) {
        return null;
    }

    function dismiss() {
        try {
            sessionStorage.setItem(dismissedKey, '1');
        } catch {
            // Without storage the banner just returns on the next page.
        }

        setIsDismissed(true);
    }

    return (
        <div
            role="region"
            aria-label={t('Location')}
            className="border-b border-outline-variant bg-surface-container-low"
        >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-page py-2">
                <p className="flex min-w-0 flex-1 items-center gap-2 text-label-md text-on-surface">
                    <MaterialSymbol
                        name="location_off"
                        className="shrink-0 text-[20px] text-primary"
                    />
                    {t('Turn on location to see pros near you.')}
                </p>
                <div className="flex items-center gap-2">
                    <DialogPrimitive.Root>
                        <DialogPrimitive.Trigger className="h-9 cursor-pointer rounded-lg px-3 text-label-sm text-primary transition-colors hover:bg-surface-container">
                            {t('How to turn it on')}
                        </DialogPrimitive.Trigger>
                        <DialogPrimitive.Portal>
                            <DialogPrimitive.Overlay className="proconnect fixed inset-0 z-50 grid place-items-center bg-on-background/60 p-4 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
                                <DialogPrimitive.Content
                                    aria-describedby={undefined}
                                    className="relative w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=open]:zoom-in-95"
                                >
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <DialogPrimitive.Title className="text-body-lg font-semibold text-on-surface">
                                            {t('Turn on location')}
                                        </DialogPrimitive.Title>
                                        <DialogPrimitive.Close
                                            aria-label={t('Close')}
                                            className="-mt-2 -mr-2 flex size-10 cursor-pointer items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                                        >
                                            <MaterialSymbol name="close" />
                                        </DialogPrimitive.Close>
                                    </div>
                                    <ol className="flex flex-col gap-3">
                                        {steps.map((step, index) => (
                                            <li
                                                key={step}
                                                className="flex gap-3 text-body-md text-on-surface-variant"
                                            >
                                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-label-sm text-primary">
                                                    {index + 1}
                                                </span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                    <DialogPrimitive.Close className="mt-6 h-11 w-full cursor-pointer rounded-lg bg-primary text-label-md text-on-primary transition-opacity hover:opacity-90">
                                        {t('Got it')}
                                    </DialogPrimitive.Close>
                                </DialogPrimitive.Content>
                            </DialogPrimitive.Overlay>
                        </DialogPrimitive.Portal>
                    </DialogPrimitive.Root>
                    <div className="relative flex items-center">
                        <select
                            value=""
                            onChange={(event) => chooseCity(event.target.value)}
                            aria-label={t('Choose your city')}
                            className="h-9 cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest pr-8 pl-3 text-label-sm text-on-surface outline-none focus:border-primary"
                        >
                            <option value="" disabled>
                                {t('Choose city')}
                            </option>
                            {cities.map((city) => (
                                <option key={city.name} value={city.name}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                        <MaterialSymbol
                            name="expand_more"
                            className="pointer-events-none absolute right-2 text-[18px] text-outline"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={dismiss}
                        aria-label={t('Dismiss location message')}
                        className="flex size-10 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                    >
                        <MaterialSymbol name="close" className="text-[20px]" />
                    </button>
                </div>
            </div>
        </div>
    );
}
