import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import FieldError from '@/components/directory/field-error';
import {
    inputClassName,
    invalidClassName,
    selectClassName,
} from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import ChoiceChips from '@/components/directory/quote-request/choice-chips';
import { contactChannels } from '@/components/directory/quote-request/quote-request-data';
import { useCities } from '@/hooks/use-categories';
import { useVisitorLocation } from '@/hooks/use-visitor-location';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { store as storeServiceRequest } from '@/routes/service-request';
import type { BusinessCategory } from '@/types';
import { otherName, t } from '@/lib/i18n';

const steps = ['Service', 'Request', 'Your details'];

const timelines = [
    { value: 'urgent', label: 'Within 48h' },
    { value: 'this_week', label: 'This week' },
    { value: 'flexible', label: 'Flexible' },
];

const descriptionMinLength = 10;

const descriptionMaxLength = 2000;

type ServiceRequestField =
    | 'category'
    | 'description'
    | 'timeline'
    | 'attachment'
    | 'fullName'
    | 'organization'
    | 'email'
    | 'phone'
    | 'province'
    | 'contactChannel';

type ServiceRequestErrors = Partial<Record<ServiceRequestField, string>>;

/**
 * Which step each field lives on, and its name on the server.
 */
const fieldSteps: [ServiceRequestField, string, number][] = [
    ['category', 'category', 0],
    ['description', 'description', 1],
    ['timeline', 'timeline', 1],
    ['attachment', 'attachment', 1],
    ['fullName', 'full_name', 2],
    ['organization', 'organization', 2],
    ['email', 'email', 2],
    ['phone', 'phone', 2],
    ['province', 'province', 2],
    ['contactChannel', 'contact_channel', 2],
];

/**
 * Lowercase and strip accents, so "comptable" finds "Comptables".
 */
function normalize(value: string): string {
    return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export default function ServiceRequest({
    businessCategories,
}: {
    businessCategories: BusinessCategory[];
}) {
    const { url } = usePage();
    const requestedSlug = new URL(url, 'http://localhost').searchParams.get(
        'category',
    );
    const requestedCategory = businessCategories.find(
        (option) => option.slug === requestedSlug,
    );
    const { cities } = useCities();
    const body = useRef<HTMLDivElement>(null);

    const [step, setStep] = useState(requestedCategory ? 1 : 0);
    const [categorySlug, setCategorySlug] = useState(
        requestedCategory?.slug ?? '',
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [description, setDescription] = useState('');
    const [timeline, setTimeline] = useState('flexible');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [fullName, setFullName] = useState('');
    const [organization, setOrganization] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const { city: visitorCity } = useVisitorLocation();
    const [chosenProvince, setProvince] = useState<string | null>(null);
    const province = chosenProvince ?? visitorCity?.name ?? 'Kinshasa';
    const [contactChannel, setContactChannel] = useState('email');
    const [errors, setErrors] = useState<ServiceRequestErrors>({});
    const [reference, setReference] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const category = businessCategories.find(
        (option) => option.slug === categorySlug,
    );
    const normalizedSearch = normalize(searchTerm);
    const visibleCategories = businessCategories.filter(
        (option) =>
            !normalizedSearch ||
            normalize(option.name).includes(normalizedSearch) ||
            normalize(option.nameFr).includes(normalizedSearch),
    );
    const isLastStep = step === steps.length - 1;
    const descriptionLength = description.trim().length;

    function clearError(field: ServiceRequestField) {
        setErrors((previous) => ({ ...previous, [field]: undefined }));
    }

    function goToStep(nextStep: number) {
        setStep(nextStep);
        body.current?.scrollTo({ top: 0 });
    }

    function validateStep(): ServiceRequestErrors {
        const stepErrors: ServiceRequestErrors = {};

        if (step === 0 && !category) {
            stepErrors.category = 'Please choose a service.';
        }

        if (step === 1) {
            if (descriptionLength < descriptionMinLength) {
                stepErrors.description =
                    'Please briefly describe your request.';
            } else if (descriptionLength > descriptionMaxLength) {
                stepErrors.description = t(
                    'Please keep it under :descriptionMaxLength characters.',
                    { descriptionMaxLength },
                );
            }
        }

        if (step === 2) {
            if (!fullName.trim()) {
                stepErrors.fullName = 'Please enter your full name.';
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
                stepErrors.email = 'Please enter a valid email address.';
            }

            if (phone.replace(/\D/g, '').length < 9) {
                stepErrors.phone = 'Enter a phone number of at least 9 digits.';
            }
        }

        return stepErrors;
    }

    function submitStep(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const stepErrors = validateStep();
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
            storeServiceRequest.url(),
            {
                category: categorySlug,
                description,
                timeline,
                attachment,
                full_name: fullName,
                organization: organization || undefined,
                email,
                phone,
                province,
                contact_channel: contactChannel,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onStart: () => setIsSubmitting(true),
                onFinish: () => setIsSubmitting(false),
                onFlash: (flash) =>
                    setReference(
                        (flash as { reference?: string }).reference ?? '',
                    ),
                onError: (serverErrors) => {
                    const mapped: ServiceRequestErrors = {};
                    let firstStep = steps.length - 1;

                    for (const [field, serverKey, fieldStep] of fieldSteps) {
                        if (serverErrors[serverKey]) {
                            mapped[field] = serverErrors[serverKey];
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
            <>
                <Head title={t('Request sent')} />
                <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 rounded-2xl border border-outline-variant bg-surface-container-lowest px-6 py-12 text-center shadow-sm">
                    <MaterialSymbol
                        name="check_circle"
                        filled
                        className="text-[56px] text-primary"
                    />
                    <div className="flex max-w-sm flex-col items-center gap-2">
                        <h1 className="text-headline-md text-on-surface">
                            {t('Request sent')}
                        </h1>
                        {reference && (
                            <span className="rounded-md bg-surface-container-low px-2.5 py-1 font-mono text-label-md text-on-surface">
                                {reference}
                            </span>
                        )}
                        <p className="text-body-md text-on-surface-variant">
                            {t("We'll match you with a verified")}{' '}
                            {category?.name.toLowerCase() ?? t('professional')}{' '}
                            {t('expert and reply to')} {email}.
                        </p>
                    </div>
                    <Link
                        href={home()}
                        className="flex h-11 items-center rounded-lg bg-primary px-8 text-label-md text-on-primary transition-opacity hover:opacity-90"
                    >
                        {t('Back to home')}
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={t('Request Professional Services')} />

            <form
                onSubmit={submitStep}
                noValidate
                className="mx-auto flex max-h-[min(42rem,calc(100dvh-7rem))] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm"
            >
                <header className="flex flex-col gap-3 px-5 pt-5 pb-4 sm:px-6">
                    <h1 className="text-headline-md text-on-surface">
                        {t('Request a business service')}
                    </h1>
                    <div className="flex flex-col gap-2">
                        <p className="text-label-sm text-on-surface-variant">
                            {t('Step')} {step + 1} {t('of')} {steps.length} ·{' '}
                            <span className="text-on-surface">
                                {t(steps[step])}
                            </span>
                        </p>
                        <div
                            role="progressbar"
                            aria-valuemin={1}
                            aria-valuemax={steps.length}
                            aria-valuenow={step + 1}
                            aria-label={t('Request progress')}
                            className="grid grid-cols-3 gap-1.5"
                        >
                            {steps.map((label, index) => (
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
                    {step > 0 && category && (
                        <p className="flex items-center gap-2 text-label-sm text-on-surface-variant">
                            <MaterialSymbol
                                name={category.icon}
                                className="text-[18px] text-primary"
                            />
                            <span className="font-semibold text-on-surface">
                                {category.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => goToStep(0)}
                                className="cursor-pointer text-primary underline-offset-2 hover:underline"
                            >
                                {t('Change')}
                            </button>
                        </p>
                    )}
                </header>

                <div
                    ref={body}
                    className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6"
                >
                    {step === 0 && (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-body-lg font-semibold text-on-surface">
                                {t('Which service do you need?')}
                            </h2>
                            <div className="relative">
                                <MaterialSymbol
                                    name="search"
                                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-outline"
                                />
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                    aria-label={t('Search services')}
                                    placeholder={t(
                                        'Search: lawyer, accountant, customs…',
                                    )}
                                    className={cn(
                                        inputClassName,
                                        'h-11 pr-3 pl-10',
                                    )}
                                />
                            </div>
                            {visibleCategories.length === 0 ? (
                                <p className="py-6 text-center text-body-md text-on-surface-variant">
                                    {t('No service matches “')}
                                    {searchTerm.trim()}”.
                                </p>
                            ) : (
                                <div
                                    role="radiogroup"
                                    aria-label={t('Service')}
                                    className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto p-0.5 sm:grid-cols-2"
                                >
                                    {visibleCategories.map((option) => {
                                        const isSelected =
                                            option.slug === categorySlug;

                                        return (
                                            <button
                                                key={option.slug}
                                                type="button"
                                                role="radio"
                                                aria-checked={isSelected}
                                                onClick={() => {
                                                    setCategorySlug(
                                                        option.slug,
                                                    );
                                                    clearError('category');
                                                }}
                                                className={cn(
                                                    'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                                                    isSelected
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-outline-variant hover:border-primary',
                                                )}
                                            >
                                                <MaterialSymbol
                                                    name={option.icon}
                                                    filled={isSelected}
                                                    className="shrink-0 text-[20px] text-primary"
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-label-md text-on-surface">
                                                        {option.name}
                                                    </span>
                                                    <span className="block truncate text-label-sm text-on-surface-variant">
                                                        {otherName(option)}
                                                    </span>
                                                </span>
                                                {isSelected && (
                                                    <MaterialSymbol
                                                        name="check_circle"
                                                        filled
                                                        className="shrink-0 text-[20px] text-primary"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            <FieldError message={errors.category} />
                        </div>
                    )}

                    {step === 1 && (
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="request-description"
                                    className="text-label-md text-on-surface"
                                >
                                    {t('What do you need help with?')}
                                </label>
                                <textarea
                                    id="request-description"
                                    rows={4}
                                    value={description}
                                    onChange={(event) => {
                                        setDescription(event.target.value);
                                        clearError('description');
                                    }}
                                    aria-invalid={Boolean(errors.description)}
                                    placeholder={t(
                                        'e.g. Review a supply contract before signing, register a new company…',
                                    )}
                                    className={cn(
                                        inputClassName,
                                        'resize-none px-3 py-2.5',
                                        errors.description && invalidClassName,
                                    )}
                                />
                                <div className="flex items-start justify-between gap-3">
                                    <FieldError message={errors.description} />
                                    <span className="ml-auto shrink-0 text-label-sm text-on-surface-variant">
                                        {t('Kept confidential')}
                                    </span>
                                </div>
                            </div>

                            <ChoiceChips
                                name="request-timeline"
                                label={t('When do you need it?')}
                                options={timelines}
                                value={timeline}
                                onChange={setTimeline}
                                className="grid-cols-3"
                            />

                            <div className="flex flex-col gap-1.5">
                                <span className="text-label-md text-on-surface">
                                    {t('Supporting document')}{' '}
                                    <span className="font-normal text-on-surface-variant">
                                        {t('(optional)')}
                                    </span>
                                </span>
                                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-outline-variant px-3 text-label-sm text-primary transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary hover:border-primary">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(event) => {
                                            setAttachment(
                                                event.target.files?.[0] ?? null,
                                            );
                                            clearError('attachment');
                                        }}
                                        className="sr-only"
                                    />
                                    <MaterialSymbol
                                        name="attach_file"
                                        className="text-[20px]"
                                    />
                                    <span className="truncate">
                                        {attachment
                                            ? attachment.name
                                            : t(
                                                  'Attach a brief — PDF, JPG or PNG, up to 10 MB',
                                              )}
                                    </span>
                                </label>
                                <FieldError message={errors.attachment} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor="request-full-name"
                                        className="text-label-md text-on-surface"
                                    >
                                        {t('Full name')}
                                    </label>
                                    <input
                                        id="request-full-name"
                                        type="text"
                                        autoComplete="name"
                                        value={fullName}
                                        onChange={(event) => {
                                            setFullName(event.target.value);
                                            clearError('fullName');
                                        }}
                                        aria-invalid={Boolean(errors.fullName)}
                                        placeholder={t('e.g. Jean Kalala')}
                                        className={cn(
                                            inputClassName,
                                            'h-11 px-3',
                                            errors.fullName && invalidClassName,
                                        )}
                                    />
                                    <FieldError message={errors.fullName} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor="request-organization"
                                        className="text-label-md text-on-surface"
                                    >
                                        {t('Company')}{' '}
                                        <span className="font-normal text-on-surface-variant">
                                            {t('(optional)')}
                                        </span>
                                    </label>
                                    <input
                                        id="request-organization"
                                        type="text"
                                        autoComplete="organization"
                                        value={organization}
                                        onChange={(event) => {
                                            setOrganization(event.target.value);
                                            clearError('organization');
                                        }}
                                        aria-invalid={Boolean(
                                            errors.organization,
                                        )}
                                        className={cn(
                                            inputClassName,
                                            'h-11 px-3',
                                            errors.organization &&
                                                invalidClassName,
                                        )}
                                    />
                                    <FieldError message={errors.organization} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor="request-email"
                                        className="text-label-md text-on-surface"
                                    >
                                        {t('Email')}
                                    </label>
                                    <input
                                        id="request-email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                            clearError('email');
                                        }}
                                        aria-invalid={Boolean(errors.email)}
                                        placeholder={t('you@company.cd')}
                                        className={cn(
                                            inputClassName,
                                            'h-11 px-3',
                                            errors.email && invalidClassName,
                                        )}
                                    />
                                    <FieldError message={errors.email} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor="request-phone"
                                        className="text-label-md text-on-surface"
                                    >
                                        {t('Phone')}
                                    </label>
                                    <div
                                        className={cn(
                                            'flex h-11 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30',
                                            errors.phone && 'border-error',
                                        )}
                                    >
                                        <span className="flex shrink-0 items-center border-r border-outline-variant bg-surface-container-low px-3 text-label-md text-on-surface select-none">
                                            +243
                                        </span>
                                        <input
                                            id="request-phone"
                                            type="tel"
                                            autoComplete="tel-national"
                                            value={phone}
                                            onChange={(event) => {
                                                setPhone(event.target.value);
                                                clearError('phone');
                                            }}
                                            aria-invalid={Boolean(errors.phone)}
                                            placeholder="81 234 5678"
                                            className="w-full min-w-0 bg-transparent px-3 text-body-md text-on-surface outline-none placeholder:text-outline"
                                        />
                                    </div>
                                    <FieldError message={errors.phone} />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="request-province"
                                    className="text-label-md text-on-surface"
                                >
                                    {t('City')}
                                </label>
                                <div className="relative flex items-center">
                                    <select
                                        id="request-province"
                                        value={province}
                                        onChange={(event) => {
                                            setProvince(event.target.value);
                                            clearError('province');
                                        }}
                                        aria-invalid={Boolean(errors.province)}
                                        className={cn(
                                            selectClassName,
                                            'h-11 pr-9 pl-3',
                                            errors.province && invalidClassName,
                                        )}
                                    >
                                        {cities.map((city) => (
                                            <option
                                                key={city.name}
                                                value={city.name}
                                            >
                                                {city.name}
                                            </option>
                                        ))}
                                        <option value="other">
                                            {t('Another province')}
                                        </option>
                                    </select>
                                    <MaterialSymbol
                                        name="expand_more"
                                        className="pointer-events-none absolute right-2.5 text-[20px] text-outline"
                                    />
                                </div>
                                <FieldError message={errors.province} />
                            </div>

                            <ChoiceChips
                                name="request-contact-channel"
                                label={t('Preferred contact')}
                                options={contactChannels}
                                value={contactChannel}
                                onChange={setContactChannel}
                                className="grid-cols-3"
                            />
                            <FieldError message={errors.contactChannel} />

                            <p className="text-label-sm text-on-surface-variant">
                                {t(
                                    'Free, with no obligation. Your request is only shared with the experts we match you with.',
                                )}
                            </p>
                        </div>
                    )}
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
        </>
    );
}
