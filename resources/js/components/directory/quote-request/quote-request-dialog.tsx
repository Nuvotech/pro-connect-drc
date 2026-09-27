import { Link } from '@inertiajs/react';
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
import { findCategory } from '@/lib/directory-data';
import { show as showCategory } from '@/routes/categories';
import type { Professional } from '@/types';

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
    const scrollContainer = useRef<HTMLDivElement>(null);

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    ref={scrollContainer}
                    className="proconnect fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-on-background/60 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:p-4 md:p-12"
                >
                    <DialogPrimitive.Content
                        aria-describedby={undefined}
                        className="relative flex min-h-dvh w-full max-w-4xl flex-col overflow-hidden bg-surface-container-lowest shadow-xl duration-200 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-95 sm:min-h-0 sm:rounded-2xl"
                    >
                        <QuoteRequestFlow
                            key={sessionKey}
                            initialCategorySlug={categorySlug}
                            professional={professional}
                            onClose={() => onOpenChange(false)}
                            onStepChange={() =>
                                scrollContainer.current?.scrollTo({ top: 0 })
                            }
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
    onStepChange: () => void;
};

function QuoteRequestFlow({
    initialCategorySlug,
    professional,
    onClose,
    onStepChange,
}: QuoteRequestFlowProps) {
    const [step, setStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<QuoteRequestErrors>({});
    const [data, setData] = useState<QuoteRequestData>(() =>
        emptyQuoteRequest(
            initialCategorySlug ?? professional?.categorySlug ?? '',
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

    const currentStep = quoteSteps[step];
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
        onStepChange();
    }

    function submitStep(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const stepErrors = validateQuoteStep(step, data);
        setErrors(stepErrors);

        if (Object.keys(stepErrors).length > 0) {
            return;
        }

        if (isLastStep) {
            setIsSubmitted(true);
            onStepChange();

            return;
        }

        goToStep(step + 1);
    }

    if (isSubmitted) {
        return (
            <QuoteRequestSuccess
                data={data}
                professional={professional}
                onClose={onClose}
            />
        );
    }

    const stepProps = { data, errors, setField };

    return (
        <form onSubmit={submitStep} noValidate className="flex flex-1 flex-col">
            <div className="flex flex-col gap-4 bg-surface-container-low px-6 pt-6 pb-6 md:px-10 md:pt-8">
                <div className="flex items-center justify-between gap-4">
                    <DialogPrimitive.Title className="text-headline-md font-bold text-primary">
                        ProConnect RDC
                        <span className="sr-only"> — Get a Quote</span>
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Close
                        className="flex items-center text-on-surface-variant transition-colors duration-200 hover:text-primary"
                        aria-label="Close"
                    >
                        <MaterialSymbol name="close" />
                    </DialogPrimitive.Close>
                </div>
                <div className="flex flex-col justify-between gap-2 text-on-surface-variant sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-label-md text-on-primary">
                            {step + 1}
                        </span>
                        <span className="text-label-md font-semibold tracking-wider text-on-surface uppercase">
                            Step {step + 1} of {quoteSteps.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MaterialSymbol
                            name={currentStep.icon}
                            filled
                            className="text-body-md text-primary"
                        />
                        <span className="text-label-md font-medium text-primary">
                            {currentStep.label} •{' '}
                            <span className="font-normal text-on-surface-variant">
                                {currentStep.labelFr}
                            </span>
                        </span>
                    </div>
                </div>
                <div
                    role="progressbar"
                    aria-valuemin={1}
                    aria-valuemax={quoteSteps.length}
                    aria-valuenow={step + 1}
                    aria-label="Quote request progress"
                    className="flex h-2 w-full overflow-hidden rounded-full bg-surface-variant"
                >
                    <div
                        className="h-full rounded-full bg-primary-container transition-all duration-500 ease-out"
                        style={{
                            width: `${((step + 1) / quoteSteps.length) * 100}%`,
                        }}
                    />
                </div>
                {professional && (
                    <div className="flex items-center gap-3 rounded-lg bg-surface-container-lowest p-3 shadow-sm">
                        <img
                            src={professional.photo}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover"
                        />
                        <p className="text-label-sm text-on-surface-variant">
                            Requesting a quote from{' '}
                            <span className="font-semibold text-on-surface">
                                {professional.name}
                            </span>{' '}
                            — {professional.title}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex-1 p-6 md:p-10">
                {step === 0 && <StepCategory {...stepProps} />}
                {step === 1 && <StepProjectDetails {...stepProps} />}
                {step === 2 && <StepLocation {...stepProps} />}
                {step === 3 && (
                    <StepContact {...stepProps} professional={professional} />
                )}
            </div>

            <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-outline-variant px-6 py-6 sm:flex-row md:px-10">
                {step > 0 ? (
                    <button
                        type="button"
                        onClick={() => goToStep(step - 1)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container-low px-6 py-3.5 text-label-md text-primary shadow-xs transition-colors duration-200 hover:bg-surface-container sm:w-auto"
                    >
                        <MaterialSymbol name="arrow_back" className="text-lg" />
                        <span>Back / Précédent</span>
                    </button>
                ) : (
                    <span className="hidden sm:block" />
                )}
                <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-8 py-3.5 text-label-md text-on-primary shadow-md transition-all duration-200 hover:bg-primary hover:shadow-lg active:scale-[0.99] sm:w-auto"
                >
                    {isLastStep ? (
                        <>
                            <span>
                                Submit Request &amp; Get Quotes / Envoyer la
                                demande
                            </span>
                            <MaterialSymbol
                                name="send"
                                filled
                                className="text-lg"
                            />
                        </>
                    ) : (
                        <>
                            <span>Next Step / Étape suivante</span>
                            <MaterialSymbol
                                name="arrow_forward"
                                className="text-lg"
                            />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

type QuoteRequestSuccessProps = {
    data: QuoteRequestData;
    professional?: Professional;
    onClose: () => void;
};

function QuoteRequestSuccess({
    data,
    professional,
    onClose,
}: QuoteRequestSuccessProps) {
    const category = findCategory(data.categorySlug);
    const channel = contactChannels.find(
        ({ value }) => value === data.contactChannel,
    );

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center md:px-10">
            <DialogPrimitive.Title className="sr-only">
                Quote request sent
            </DialogPrimitive.Title>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed text-primary">
                <MaterialSymbol
                    name="check_circle"
                    filled
                    className="text-5xl"
                />
            </div>
            <div className="flex max-w-lg flex-col gap-2">
                <h2 className="text-headline-lg-mobile text-primary md:text-headline-lg">
                    Request sent! / Demande envoyée
                </h2>
                <p className="text-body-md text-on-surface-variant">
                    {professional
                        ? `${professional.name} and up to 2 other verified pros`
                        : 'Up to 3 verified pros'}{' '}
                    in {data.commune}, {data.city} will contact you via{' '}
                    <span className="font-semibold text-on-surface">
                        {channel?.label}
                    </span>{' '}
                    within 24 hours.
                    <span className="mt-1 block text-label-sm text-outline">
                        Vous recevrez vos devis gratuits sous 24 heures.
                    </span>
                </p>
            </div>
            <div className="flex w-full flex-col-reverse items-center justify-center gap-4 sm:w-auto sm:flex-row">
                {category && (
                    <Link
                        href={showCategory(category.slug)}
                        onClick={onClose}
                        className="w-full rounded-lg border border-primary bg-surface-container-lowest px-6 py-3 text-label-md text-primary transition-colors hover:bg-surface-container-low sm:w-auto"
                    >
                        Browse {category.name}
                    </Link>
                )}
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-lg bg-primary-container px-8 py-3 text-label-md text-on-primary shadow-md transition-all hover:bg-primary sm:w-auto"
                >
                    Done / Terminé
                </button>
            </div>
        </div>
    );
}
