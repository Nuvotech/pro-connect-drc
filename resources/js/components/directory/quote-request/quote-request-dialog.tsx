import { Link, router } from '@inertiajs/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import MaterialSymbol from '@/components/directory/material-symbol';
import {
    contactChannels,
    emptyQuoteRequest,
    quoteSteps,
    validateQuoteStep,
} from '@/components/directory/quote-request/quote-request-data';
import type {
    QuoteRequestData,
    QuoteRequestErrors,
} from '@/components/directory/quote-request/quote-request-data';
import StepCategory from '@/components/directory/quote-request/step-category';
import StepContact from '@/components/directory/quote-request/step-contact';
import StepLocation from '@/components/directory/quote-request/step-location';
import StepProjectDetails from '@/components/directory/quote-request/step-project-details';
import { useCategories } from '@/hooks/use-categories';
import { useVisitorLocation } from '@/hooks/use-visitor-location';
import { cn } from '@/lib/utils';
import { show as showCategory } from '@/routes/categories';
import { store as storeQuoteRequest } from '@/routes/quote-requests';
import type { Professional } from '@/types';
import { t } from '@/lib/i18n';

type QuoteRequestDialogProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    sessionKey: number;
    categorySlug?: string;
    professional?: Professional;
};

export default function QuoteRequestDialog({
    isOpen,
    onOpenChange,
    sessionKey,
    categorySlug,
    professional,
}: QuoteRequestDialogProps) {
    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="proconnect fixed inset-0 z-50 grid place-items-center bg-on-background/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:p-4">
                    <DialogPrimitive.Content
                        aria-describedby={undefined}
                        className="relative flex h-dvh w-full flex-col overflow-hidden bg-surface-container-lowest shadow-xl duration-200 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-95 sm:h-auto sm:max-h-[min(40rem,calc(100dvh-2rem))] sm:max-w-xl sm:rounded-2xl"
                    >
                        <QuoteRequestFlow
                            key={sessionKey}
                            initialCategorySlug={categorySlug}
                            professional={professional}
                            onClose={() => onOpenChange(false)}
                        />
                    </DialogPrimitive.Content>
                </DialogPrimitive.Overlay>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

type QuoteRequestFlowProps = {
    initialCategorySlug?: string;
    professional?: Professional;
    onClose: () => void;
};

function QuoteRequestFlow({
    initialCategorySlug,
    professional,
    onClose,
}: QuoteRequestFlowProps) {
    const body = useRef<HTMLDivElement>(null);
    const { city: visitorCity } = useVisitorLocation();
    const [step, setStep] = useState(0);
    const [reference, setReference] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<QuoteRequestErrors>({});
    const [data, setData] = useState<QuoteRequestData>(() =>
        emptyQuoteRequest(
            initialCategorySlug ?? professional?.categorySlug ?? '',
            visitorCity,
        ),
    );
    const photosRef = useRef(data.photos);

    useEffect(() => {
        photosRef.current = data.photos;
    }, [data.photos]);

    useEffect(() => {
        return () => {
            photosRef.current.forEach((photo) =>
                URL.revokeObjectURL(photo.previewUrl),
            );
        };
    }, []);

    const isLastStep = step === quoteSteps.length - 1;

    function setField<TKey extends keyof QuoteRequestData>(
        key: TKey,
        value: QuoteRequestData[TKey],
    ) {
        setData((previous) => ({ ...previous, [key]: value }));
        setErrors((previous) => ({ ...previous, [key]: undefined }));
    }

    function goToStep(nextStep: number) {
        setStep(nextStep);
        body.current?.scrollTo({ top: 0 });
    }

    function submitStep(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const stepErrors = validateQuoteStep(step, data);
        setErrors(stepErrors);

        if (Object.keys(stepErrors).length > 0) {
            return;
        }

        if (isLastStep) {
            submitRequest();

            return;
        }

        goToStep(step + 1);
    }

    /**
     * Send the request, then show the reference, or jump back to the first
     * step with a problem.
     */
    function submitRequest() {
        router.post(
            storeQuoteRequest.url(),
            {
                category: data.categorySlug,
                professional: professional?.slug,
                service_type: data.serviceType,
                description: data.description,
                timing: data.timing,
                city: data.city,
                commune: data.commune,
                address: data.address,
                assessment: data.assessment,
                full_name: data.fullName,
                phone: data.phone,
                email: data.email,
                contact_channel: data.contactChannel,
                photos: data.photos.map((photo) => photo.file),
            },
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onStart: () => setIsSubmitting(true),
                onFinish: () => setIsSubmitting(false),
                onFlash: (flash) => {
                    setReference(
                        (flash as { reference?: string }).reference ?? '',
                    );
                },
                onError: (serverErrors) => {
                    const fieldSteps: [
                        keyof QuoteRequestErrors,
                        string,
                        number,
                    ][] = [
                        ['categorySlug', 'category', 0],
                        ['serviceType', 'service_type', 1],
                        ['description', 'description', 1],
                        ['timing', 'timing', 1],
                        ['photos', 'photos', 1],
                        ['city', 'city', 2],
                        ['commune', 'commune', 2],
                        ['address', 'address', 2],
                        ['assessment', 'assessment', 2],
                        ['fullName', 'full_name', 3],
                        ['phone', 'phone', 3],
                        ['email', 'email', 3],
                        ['contactChannel', 'contact_channel', 3],
                    ];
                    const mapped: QuoteRequestErrors = {};
                    let firstStep = quoteSteps.length - 1;

                    for (const [field, serverKey, fieldStep] of fieldSteps) {
                        const message =
                            serverErrors[serverKey] ??
                            Object.entries(serverErrors).find(([key]) =>
                                key.startsWith(`${serverKey}.`),
                            )?.[1];

                        if (message) {
                            mapped[field] = message;
                            firstStep = Math.min(firstStep, fieldStep);
                        }
                    }

                    setErrors(mapped);
                    goToStep(firstStep);
                },
            },
        );
    }

    if (reference !== null) {
        return (
            <QuoteRequestSuccess
                reference={reference}
                data={data}
                onClose={onClose}
            />
        );
    }

    const stepProps = { data, errors, setField };

    return (
        <form
            onSubmit={submitStep}
            noValidate
            className="flex min-h-0 flex-1 flex-col"
        >
            <header className="flex flex-col gap-3 px-5 pt-5 pb-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                    <DialogPrimitive.Title className="text-headline-md text-on-surface">
                        {t('Get free quotes')}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Close
                        aria-label={t('Close')}
                        className="-mr-2 flex size-10 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-low hover:text-primary"
                    >
                        <MaterialSymbol name="close" />
                    </DialogPrimitive.Close>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-label-sm text-on-surface-variant">
                        {t('Step')} {step + 1} {t('of')} {quoteSteps.length} ·{' '}
                        <span className="text-on-surface">
                            {t(quoteSteps[step])}
                        </span>
                    </p>
                    <div
                        role="progressbar"
                        aria-valuemin={1}
                        aria-valuemax={quoteSteps.length}
                        aria-valuenow={step + 1}
                        aria-label={t('Quote request progress')}
                        className="grid grid-cols-4 gap-1.5"
                    >
                        {quoteSteps.map((label, index) => (
                            <span
                                key={label}
                                className={cn(
                                    'h-1 rounded-full transition-colors duration-300',
                                    index <= step
                                        ? 'bg-primary'
                                        : 'bg-surface-variant',
                                )}
                            />
                        ))}
                    </div>
                </div>
                {professional && (
                    <p className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                        <img
                            src={professional.photo}
                            alt=""
                            className="size-6 rounded-full object-cover"
                        />
                        {t('For')}{' '}
                        <span className="font-semibold text-on-surface">
                            {professional.name}
                        </span>
                    </p>
                )}
            </header>

            <div
                ref={body}
                className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6"
            >
                {step === 0 && <StepCategory {...stepProps} />}
                {step === 1 && <StepProjectDetails {...stepProps} />}
                {step === 2 && <StepLocation {...stepProps} />}
                {step === 3 && <StepContact {...stepProps} />}
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-outline-variant px-5 py-3 sm:px-6">
                {step > 0 ? (
                    <button
                        type="button"
                        onClick={() => goToStep(step - 1)}
                        className="flex h-11 cursor-pointer items-center gap-1 rounded-lg px-3 text-label-md text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-low hover:text-primary"
                    >
                        <MaterialSymbol
                            name="arrow_back"
                            className="text-[18px]"
                        />
                        {t('Back')}
                    </button>
                ) : (
                    <span />
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-11 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-6 text-label-md text-on-primary transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLastStep
                        ? isSubmitting
                            ? t('Sending…')
                            : t('Send request')
                        : t('Continue')}
                    {!isSubmitting && (
                        <MaterialSymbol
                            name={isLastStep ? 'send' : 'arrow_forward'}
                            className="text-[18px]"
                        />
                    )}
                </button>
            </footer>
        </form>
    );
}

type QuoteRequestSuccessProps = {
    reference: string;
    data: QuoteRequestData;
    onClose: () => void;
};

function QuoteRequestSuccess({
    reference,
    data,
    onClose,
}: QuoteRequestSuccessProps) {
    const { findCategory } = useCategories();
    const category = findCategory(data.categorySlug);
    const channel = contactChannels.find(
        ({ value }) => value === data.contactChannel,
    );

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
            <MaterialSymbol
                name="check_circle"
                filled
                className="text-[56px] text-primary"
            />
            <div className="flex max-w-sm flex-col items-center gap-2">
                <DialogPrimitive.Title className="text-headline-md text-on-surface">
                    {t('Request sent')}
                </DialogPrimitive.Title>
                {reference && (
                    <span className="rounded-md bg-surface-container-low px-2.5 py-1 font-mono text-label-md text-on-surface">
                        {reference}
                    </span>
                )}
                <p className="text-body-md text-on-surface-variant">
                    {t("We'll match you with verified pros in")} {data.commune},{' '}
                    {data.city}
                    {t(". They'll contact you by")}{' '}
                    {channel?.label.toLowerCase() === 'call'
                        ? t('phone')
                        : channel?.label}
                    .
                </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row-reverse">
                <button
                    type="button"
                    onClick={onClose}
                    className="h-11 cursor-pointer rounded-lg bg-primary px-8 text-label-md text-on-primary transition-opacity hover:opacity-90"
                >
                    {t('Done')}
                </button>
                {category && (
                    <Link
                        href={showCategory(category.slug)}
                        onClick={onClose}
                        className="flex h-11 items-center justify-center rounded-lg px-5 text-label-md text-primary transition-colors hover:bg-surface-container-low"
                    >
                        {t('Browse')} {category.name}
                    </Link>
                )}
            </div>
        </div>
    );
}
