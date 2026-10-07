import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import CategoryCombobox from '@/components/workspace/category-combobox';
import { Field, inputClassName } from '@/components/workspace/form-fields';
import ProviderTypeField from '@/components/workspace/provider-type-field';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { store as registerPro } from '@/routes/become-a-pro';
import type { CategoryOptionGroup, ProviderType } from '@/types';
import { t } from '@/lib/i18n';

type CityOption = {
    name: string;
    region: string;
    communes: string[];
};

type ApplicationData = {
    providerType: ProviderType | null;
    fullName: string;
    businessName: string;
    email: string;
    phone: string;
    isOnWhatsApp: boolean;
    city: string;
    commune: string;
    categories: string[];
    customServices: string[];
    description: string;
    password: string;
    passwordConfirmation: string;
};

type ApplicationErrors = Partial<
    Record<keyof ApplicationData | 'services', string>
>;

const serverFields: Record<string, keyof ApplicationErrors> = {
    provider_type: 'providerType',
    full_name: 'fullName',
    business_name: 'businessName',
    email: 'email',
    phone: 'phone',
    city: 'city',
    commune: 'commune',
    categories: 'services',
    custom_services: 'services',
    description: 'description',
    password: 'password',
};

const steps = [
    {
        title: 'About you',
        description: 'How clients and our team can reach you.',
    },
    { title: 'Your services', description: 'What you offer on ProConnect.' },
    { title: 'Account', description: 'A password to follow your application.' },
] as const;

/**
 * The wizard step each field lives on, so a server error jumps back to it.
 */
const fieldSteps: Record<keyof ApplicationErrors, number> = {
    providerType: 0,
    fullName: 0,
    businessName: 0,
    email: 0,
    phone: 0,
    isOnWhatsApp: 0,
    city: 0,
    commune: 0,
    services: 1,
    categories: 1,
    customServices: 1,
    description: 1,
    password: 2,
    passwordConfirmation: 2,
};

function validateStep(
    step: number,
    data: ApplicationData,
    maxCustomServices: number,
): ApplicationErrors {
    const errors: ApplicationErrors = {};

    if (step === 0) {
        Object.assign(errors, validateContact(data));
    }

    if (step === 1) {
        if (data.categories.length === 0 && data.customServices.length === 0) {
            errors.services = 'Choose at least one service, or add your own.';
        } else if (data.customServices.length > maxCustomServices) {
            errors.services = t(
                'You can add up to :maxCustomServices services of your own.',
                { maxCustomServices },
            );
        }
    }

    if (step === 2) {
        if (data.password.length < 8) {
            errors.password = 'Use at least 8 characters.';
        }

        if (data.password !== data.passwordConfirmation) {
            errors.passwordConfirmation = 'The passwords do not match.';
        }
    }

    return errors;
}

function validateContact(data: ApplicationData): ApplicationErrors {
    const errors: ApplicationErrors = {};

    if (!data.providerType) {
        errors.providerType = t(
            'Choose whether you work for yourself or for a company.',
        );
    }

    if (!data.fullName.trim()) {
        errors.fullName = 'Please enter your full name.';
    }

    if (data.providerType === 'company' && !data.businessName.trim()) {
        errors.businessName = t('Enter your company name.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.email = 'Please enter a valid email address.';
    }

    if (data.phone.replace(/\D/g, '').length < 9) {
        errors.phone = 'Enter a phone number of at least 9 digits.';
    }

    if (!data.city) {
        errors.city = 'Please choose your city.';
    }

    if (!data.commune) {
        errors.commune = 'Please choose your commune.';
    }

    return errors;
}

export default function BecomeAPro({
    categoryGroups,
    cities,
    maxCustomServices,
}: {
    categoryGroups: CategoryOptionGroup[];
    cities: CityOption[];
    maxCustomServices: number;
}) {
    const [data, setData] = useState<ApplicationData>({
        providerType: null,
        fullName: '',
        businessName: '',
        email: '',
        phone: '',
        isOnWhatsApp: true,
        city: '',
        commune: '',
        categories: [],
        customServices: [],
        description: '',
        password: '',
        passwordConfirmation: '',
    });
    const [errors, setErrors] = useState<ApplicationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(0);
    const isLastStep = step === steps.length - 1;
    const communes =
        cities.find((city) => city.name === data.city)?.communes ?? [];

    function setField<TKey extends keyof ApplicationData>(
        key: TKey,
        value: ApplicationData[TKey],
    ) {
        setData((previous) => ({ ...previous, [key]: value }));
        setErrors((previous) => ({ ...previous, [key]: undefined }));
    }

    function setServices(
        categories: string[],
        customServices: string[] = data.customServices,
    ) {
        setData((previous) => ({ ...previous, categories, customServices }));
        setErrors((previous) => ({ ...previous, services: undefined }));
    }

    function goToStep(nextStep: number) {
        setStep(nextStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const stepErrors = validateStep(step, data, maxCustomServices);
        setErrors(stepErrors);

        if (Object.keys(stepErrors).length > 0) {
            return;
        }

        if (!isLastStep) {
            goToStep(step + 1);

            return;
        }

        router.post(
            registerPro.url(),
            {
                provider_type: data.providerType,
                full_name: data.fullName,
                business_name: data.businessName,
                email: data.email,
                phone: data.phone,
                is_on_whatsapp: data.isOnWhatsApp ? 1 : 0,
                city: data.city,
                commune: data.commune,
                categories: data.categories,
                custom_services: data.customServices,
                description: data.description,
                password: data.password,
                password_confirmation: data.passwordConfirmation,
            },
            {
                onStart: () => setIsSubmitting(true),
                onFinish: () => setIsSubmitting(false),
                onError: (serverErrors) => {
                    const mapped: ApplicationErrors = {};

                    for (const [key, message] of Object.entries(serverErrors)) {
                        const field = serverFields[key.split('.')[0]];

                        if (field) {
                            mapped[field] ??= message;
                        }
                    }

                    setErrors(mapped);
                    goToStep(
                        Math.min(
                            ...Object.keys(mapped).map(
                                (field) =>
                                    fieldSteps[
                                        field as keyof ApplicationErrors
                                    ],
                            ),
                            steps.length - 1,
                        ),
                    );
                },
            },
        );
    }

    return (
        <>
            <Head title={t('Join ProConnect')} />

            <div className="w-full">
                <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
                    <header className="text-center">
                        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
                            {t('Join ProConnect')}
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500">
                            {t(
                                'Free to apply. We review every application within 1–2 working days.',
                            )}
                        </p>
                    </header>

                    <StepIndicator current={step} />

                    <form
                        onSubmit={submit}
                        noValidate
                        className="rounded-2xl border border-zinc-200 bg-white"
                    >
                        {step === 0 && (
                            <FormPart
                                number={1}
                                title={t('About you')}
                                description={t(
                                    'How clients and our team can reach you.',
                                )}
                            >
                                <ProviderTypeField
                                    variant="applicant"
                                    value={data.providerType}
                                    onChange={(providerType) =>
                                        setField('providerType', providerType)
                                    }
                                    error={errors.providerType}
                                />
                                <Field
                                    label={
                                        data.providerType === 'company'
                                            ? t('Your full name')
                                            : t('Full name')
                                    }
                                    htmlFor="fullName"
                                    error={errors.fullName}
                                >
                                    <input
                                        id="fullName"
                                        autoComplete="name"
                                        value={data.fullName}
                                        onChange={(event) =>
                                            setField(
                                                'fullName',
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(errors.fullName)}
                                        placeholder={t('Jean Dupont')}
                                        className={inputClassName}
                                    />
                                </Field>
                                <Field
                                    label={
                                        data.providerType === 'company'
                                            ? t('Company name')
                                            : t('Trade name')
                                    }
                                    htmlFor="businessName"
                                    error={errors.businessName}
                                    isOptional={data.providerType !== 'company'}
                                >
                                    <input
                                        id="businessName"
                                        autoComplete="organization"
                                        value={data.businessName}
                                        onChange={(event) =>
                                            setField(
                                                'businessName',
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(
                                            errors.businessName,
                                        )}
                                        placeholder={
                                            data.providerType === 'company'
                                                ? t('Dupont Plomberie SARL')
                                                : t("Jean's Plumbing")
                                        }
                                        className={inputClassName}
                                    />
                                </Field>
                                <Field
                                    label={t('Email')}
                                    htmlFor="email"
                                    error={errors.email}
                                >
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(event) =>
                                            setField(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(errors.email)}
                                        placeholder={t(
                                            'jean.dupont@example.com',
                                        )}
                                        className={inputClassName}
                                    />
                                </Field>
                                <Field
                                    label={t('Phone')}
                                    htmlFor="phone"
                                    error={errors.phone}
                                >
                                    <div className="flex">
                                        <span className="flex h-10 items-center rounded-l-lg border border-r-0 border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 select-none">
                                            +243
                                        </span>
                                        <input
                                            id="phone"
                                            type="tel"
                                            autoComplete="tel-national"
                                            value={data.phone}
                                            onChange={(event) =>
                                                setField(
                                                    'phone',
                                                    event.target.value,
                                                )
                                            }
                                            aria-invalid={Boolean(errors.phone)}
                                            placeholder="81 234 5678"
                                            className={cn(
                                                inputClassName,
                                                'rounded-l-none',
                                            )}
                                        />
                                    </div>
                                    <label className="mt-1 flex cursor-pointer items-center gap-2 text-sm text-zinc-600">
                                        <input
                                            type="checkbox"
                                            checked={data.isOnWhatsApp}
                                            onChange={(event) =>
                                                setField(
                                                    'isOnWhatsApp',
                                                    event.target.checked,
                                                )
                                            }
                                            className="size-4 cursor-pointer rounded accent-primary"
                                        />
                                        {t('Also on WhatsApp')}
                                    </label>
                                </Field>
                                <Field
                                    label={t('City')}
                                    htmlFor="city"
                                    error={errors.city}
                                >
                                    <select
                                        id="city"
                                        value={data.city}
                                        onChange={(event) => {
                                            setField(
                                                'city',
                                                event.target.value,
                                            );
                                            setField('commune', '');
                                        }}
                                        aria-invalid={Boolean(errors.city)}
                                        className={cn(
                                            inputClassName,
                                            'cursor-pointer',
                                        )}
                                    >
                                        <option value="" disabled>
                                            {t('Select a city')}
                                        </option>
                                        {cities.map((city) => (
                                            <option
                                                key={city.name}
                                                value={city.name}
                                            >
                                                {city.name} · {city.region}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field
                                    label={t('Commune')}
                                    htmlFor="commune"
                                    error={errors.commune}
                                >
                                    <select
                                        id="commune"
                                        value={data.commune}
                                        onChange={(event) =>
                                            setField(
                                                'commune',
                                                event.target.value,
                                            )
                                        }
                                        disabled={!data.city}
                                        aria-invalid={Boolean(errors.commune)}
                                        className={cn(
                                            inputClassName,
                                            'cursor-pointer',
                                        )}
                                    >
                                        <option value="" disabled>
                                            {data.city
                                                ? t('Select a commune')
                                                : t('Choose a city first')}
                                        </option>
                                        {communes.map((commune) => (
                                            <option
                                                key={commune}
                                                value={commune}
                                            >
                                                {commune}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </FormPart>
                        )}

                        {step === 1 && (
                            <FormPart
                                number={2}
                                title={t('What do you offer?')}
                                description={t(
                                    'Pick everything that applies: services, business services or vehicles for hire.',
                                )}
                            >
                                <div
                                    id="services"
                                    className="flex scroll-mt-28 flex-col gap-1.5 sm:col-span-2"
                                >
                                    <label
                                        htmlFor="services-search"
                                        className="text-sm font-medium text-zinc-900"
                                    >
                                        {t('Your services')}
                                    </label>
                                    <CategoryCombobox
                                        id="services-search"
                                        groups={categoryGroups}
                                        selected={data.categories}
                                        onChange={(categories) =>
                                            setServices(categories)
                                        }
                                        custom={{
                                            values: data.customServices,
                                            max: maxCustomServices,
                                            onChange: (customServices) =>
                                                setServices(
                                                    data.categories,
                                                    customServices,
                                                ),
                                        }}
                                        placeholder={t(
                                            'Search in English or French, e.g. plumber, maçon, notaire…',
                                        )}
                                        isInvalid={Boolean(errors.services)}
                                    />
                                    <p className="text-xs text-zinc-500">
                                        {t("Can't find it? Type it and choose")}{' '}
                                        <span className="font-medium text-zinc-700">
                                            {t('Add')}
                                        </span>
                                        {t(
                                            '. Our team adds it to the list when we review your application.',
                                        )}
                                    </p>
                                    {errors.services && (
                                        <p
                                            role="alert"
                                            className="text-xs font-medium text-zinc-900"
                                        >
                                            {errors.services}
                                        </p>
                                    )}
                                </div>
                                <Field
                                    label={t('Anything else we should know?')}
                                    htmlFor="description"
                                    error={errors.description}
                                    isOptional
                                    className="sm:col-span-2"
                                >
                                    <textarea
                                        id="description"
                                        rows={2}
                                        maxLength={1000}
                                        value={data.description}
                                        onChange={(event) =>
                                            setField(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        placeholder={t(
                                            'For example: 10 years fixing leaks and installing water heaters across Kinshasa.',
                                        )}
                                        className={cn(
                                            inputClassName,
                                            'h-auto resize-none py-2.5 leading-relaxed',
                                        )}
                                    />
                                </Field>
                            </FormPart>
                        )}

                        {step === 2 && (
                            <FormPart
                                number={3}
                                title={t('Create your account')}
                                description={t(
                                    "You'll use it to follow your application and, once approved, build your listing.",
                                )}
                            >
                                <Field
                                    label={t('Password')}
                                    htmlFor="password"
                                    error={errors.password}
                                >
                                    <input
                                        id="password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={data.password}
                                        onChange={(event) =>
                                            setField(
                                                'password',
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(errors.password)}
                                        className={inputClassName}
                                    />
                                </Field>
                                <Field
                                    label={t('Confirm password')}
                                    htmlFor="passwordConfirmation"
                                    error={errors.passwordConfirmation}
                                >
                                    <input
                                        id="passwordConfirmation"
                                        type="password"
                                        autoComplete="new-password"
                                        value={data.passwordConfirmation}
                                        onChange={(event) =>
                                            setField(
                                                'passwordConfirmation',
                                                event.target.value,
                                            )
                                        }
                                        aria-invalid={Boolean(
                                            errors.passwordConfirmation,
                                        )}
                                        className={inputClassName}
                                    />
                                </Field>
                            </FormPart>
                        )}

                        <footer className="flex items-center justify-between gap-3 border-t border-zinc-100 px-5 py-3 sm:px-6">
                            {step > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => goToStep(step - 1)}
                                    className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
                                >
                                    <ArrowLeft
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    {t('Back')}
                                </button>
                            ) : (
                                <p className="text-sm text-zinc-500">
                                    {t('Have an account?')}{' '}
                                    <Link
                                        href={login()}
                                        className="font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                        {t('Log in')}
                                    </Link>
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting && (
                                    <LoaderCircle
                                        className="size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                {isLastStep
                                    ? isSubmitting
                                        ? t('Sending application…')
                                        : t('Send application')
                                    : t('Continue')}
                                {!isLastStep && (
                                    <ArrowRight
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                )}
                            </button>
                        </footer>
                    </form>
                </div>
            </div>
        </>
    );
}

function FormPart({
    number,
    title,
    description,
    children,
}: {
    number: number;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section
            aria-labelledby={`step-${number}-title`}
            className="px-5 py-4 sm:px-6"
        >
            <div className="mb-4">
                <h2
                    id={`step-${number}-title`}
                    className="text-base font-semibold text-zinc-900"
                >
                    {title}
                </h2>
                <p className="text-sm text-zinc-500">{description}</p>
            </div>
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                {children}
            </div>
        </section>
    );
}

/**
 * Three numbered steps joined by a line: done steps show a tick, the
 * current one is filled in.
 */
function StepIndicator({ current }: { current: number }) {
    return (
        <nav aria-label={t('Application progress')}>
            <ol className="flex items-start">
                {steps.map((item, index) => {
                    const isDone = index < current;
                    const isCurrent = index === current;

                    return (
                        <li
                            key={item.title}
                            aria-current={isCurrent ? 'step' : undefined}
                            className="relative flex flex-1 flex-col items-center gap-2 text-center"
                        >
                            {index > 0 && (
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2',
                                        index <= current
                                            ? 'bg-primary'
                                            : 'bg-zinc-200',
                                    )}
                                />
                            )}
                            <span
                                className={cn(
                                    'relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-sm font-semibold tabular-nums transition-colors duration-200',
                                    isDone &&
                                        'border-primary bg-primary text-white',
                                    isCurrent &&
                                        'border-primary bg-white text-primary',
                                    !isDone &&
                                        !isCurrent &&
                                        'border-zinc-200 bg-white text-zinc-400',
                                )}
                            >
                                {isDone ? (
                                    <Check
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    index + 1
                                )}
                            </span>
                            <span
                                className={cn(
                                    'text-xs font-medium sm:text-sm',
                                    isCurrent || isDone
                                        ? 'text-zinc-900'
                                        : 'text-zinc-400',
                                )}
                            >
                                <span className="sr-only">
                                    {t('Step :current of :total:', {
                                        current: index + 1,
                                        total: steps.length,
                                    })}{' '}
                                </span>
                                {t(item.title)}
                                {isDone && (
                                    <span className="sr-only">
                                        {' '}
                                        {t('(done)')}
                                    </span>
                                )}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
