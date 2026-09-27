import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import FieldError from '@/components/directory/field-error';
import { invalidClassName } from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import { businessCategories, findBusinessCategory } from '@/lib/directory-data';
import { cn } from '@/lib/utils';
import { home } from '@/routes';

const timelines = [
    { value: 'urgent', icon: 'bolt', label: 'Urgent (24–48h)' },
    {
        value: 'this_week',
        icon: 'date_range',
        label: 'This Week / Cette semaine',
    },
    { value: 'flexible', icon: 'schedule', label: 'Flexible' },
];

const provinces = [
    { value: 'kinshasa', label: 'Kinshasa' },
    { value: 'lubumbashi', label: 'Lubumbashi' },
    { value: 'kolwezi', label: 'Kolwezi' },
    { value: 'goma', label: 'Goma' },
    { value: 'other', label: 'Other / Autre province' },
];

const fieldClassName =
    'w-full rounded-lg border border-transparent bg-surface-container-low px-3.5 py-2.5 text-body-md text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary focus:bg-surface-container';

type ServiceRequestErrors = Partial<
    Record<'description' | 'fullName' | 'email' | 'phone', string>
>;

export default function ServiceRequest() {
    const { url } = usePage();
    const requestedCategory = findBusinessCategory(
        new URL(url, 'http://localhost').searchParams.get('category'),
    );

    const [categorySlug, setCategorySlug] = useState(
        requestedCategory?.slug ?? businessCategories[0].slug,
    );
    const [isChoosingCategory, setIsChoosingCategory] = useState(false);
    const [description, setDescription] = useState('');
    const [timeline, setTimeline] = useState('urgent');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [province, setProvince] = useState('kinshasa');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [errors, setErrors] = useState<ServiceRequestErrors>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const category =
        findBusinessCategory(categorySlug) ?? businessCategories[0];

    function submitRequest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const nextErrors: ServiceRequestErrors = {};

        if (description.trim().length < 10) {
            nextErrors.description = 'Please briefly describe your request.';
        }

        if (!fullName.trim()) {
            nextErrors.fullName = 'Please enter your name.';
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            nextErrors.email = 'Please enter a valid email address.';
        }

        if (phone.replace(/\D/g, '').length < 9) {
            nextErrors.phone = 'Please enter a valid phone number.';
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length === 0) {
            setIsSubmitted(true);
        }
    }

    if (isSubmitted) {
        return (
            <>
                <Head title="Request sent" />
                <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-xl bg-surface-container-lowest p-8 text-center shadow-sm">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-fixed text-primary">
                        <MaterialSymbol
                            name="check_circle"
                            filled
                            className="text-5xl"
                        />
                    </div>
                    <h1 className="text-headline-md font-bold text-primary">
                        Request sent! / Demande envoyée
                    </h1>
                    <p className="text-body-md text-on-surface-variant">
                        A verified {category.name.toLowerCase()} expert will
                        respond to {email} within 24 hours. Your request stays
                        100% confidential.
                    </p>
                    <Link
                        href={home()}
                        className="rounded-lg bg-primary px-6 py-3 text-label-md text-on-primary transition-colors hover:bg-primary-container"
                    >
                        Back to Home
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Request Professional Services" />

            <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
                <div className="mb-8 text-center">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-label-sm text-primary">
                        <MaterialSymbol
                            name="verified_user"
                            className="text-sm"
                        />
                        <span>Confidential &amp; Verified Experts</span>
                    </div>
                    <h1 className="mb-2 text-headline-lg font-bold tracking-tight text-primary">
                        Request Professional Services
                        <span className="mt-1 block text-lg font-normal text-on-surface-variant md:text-headline-md md:font-normal">
                            Demande de Services Professionnels
                        </span>
                    </h1>
                    <p className="mx-auto max-w-xl text-body-md text-on-surface-variant">
                        Connect quickly with verified legal, accounting,
                        customs, and consulting experts across the DRC.
                    </p>
                </div>

                <form
                    onSubmit={submitRequest}
                    noValidate
                    className="space-y-6 rounded-xl bg-surface-container-lowest p-6 shadow-sm md:p-8"
                >
                    <div className="space-y-2">
                        <span className="block text-label-md text-primary">
                            1. Service Category / Domaine de compétence *
                        </span>
                        {isChoosingCategory ? (
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {businessCategories.map((option) => (
                                    <button
                                        key={option.slug}
                                        type="button"
                                        onClick={() => {
                                            setCategorySlug(option.slug);
                                            setIsChoosingCategory(false);
                                        }}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-surface-container-low',
                                            option.slug === categorySlug
                                                ? 'border-primary bg-surface-container-low'
                                                : 'border-outline-variant/30',
                                        )}
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
                                            <MaterialSymbol
                                                name={option.icon}
                                            />
                                        </span>
                                        <span>
                                            <span className="block text-label-md font-semibold text-primary">
                                                {option.name}
                                            </span>
                                            <span className="block text-label-sm text-on-surface-variant">
                                                {option.nameFr}
                                            </span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col justify-between gap-3 rounded-lg border border-outline-variant/30 bg-surface-container-low p-3.5 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
                                        <MaterialSymbol
                                            name={category.icon}
                                            className="text-2xl"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-label-md font-semibold text-primary">
                                                {category.name} /{' '}
                                                {category.nameFr}
                                            </span>
                                            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-label-sm text-primary">
                                                <MaterialSymbol
                                                    name="check_circle"
                                                    className="text-sm"
                                                />
                                                Selected
                                            </span>
                                        </div>
                                        <p className="text-label-sm text-on-surface-variant">
                                            {category.specialties}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsChoosingCategory(true)}
                                    className="inline-flex items-center gap-1 self-start text-label-md text-primary underline transition-colors hover:text-primary-container sm:self-auto"
                                >
                                    <MaterialSymbol
                                        name="edit"
                                        className="text-base"
                                    />
                                    Change / Modifier
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="request-description"
                                className="text-label-md text-primary"
                            >
                                2. What do you need help with? / Description du
                                besoin *
                            </label>
                            <span className="text-label-sm text-on-surface-variant/70">
                                Confidential
                            </span>
                        </div>
                        <textarea
                            id="request-description"
                            rows={3}
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            aria-invalid={Boolean(errors.description)}
                            placeholder="Briefly describe your request or legal/accounting requirement..."
                            className={cn(
                                fieldClassName,
                                'resize-none p-3.5',
                                errors.description && invalidClassName,
                            )}
                        />
                        <FieldError message={errors.description} />
                    </div>

                    <div className="space-y-2">
                        <span className="block text-label-md text-primary">
                            3. Estimated Timeline / Délai souhaité
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {timelines.map((option) => (
                                <label
                                    key={option.value}
                                    className="cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        name="timeline"
                                        value={option.value}
                                        checked={timeline === option.value}
                                        onChange={() =>
                                            setTimeline(option.value)
                                        }
                                        className="peer sr-only"
                                    />
                                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1.5 text-label-sm text-on-surface-variant transition-colors peer-checked:bg-primary peer-checked:text-on-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
                                        <MaterialSymbol
                                            name={option.icon}
                                            className="text-sm"
                                        />
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <span className="block text-label-md text-primary">
                            4. Contact &amp; Location / Vos Coordonnées *
                        </span>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <input
                                    type="text"
                                    autoComplete="name"
                                    value={fullName}
                                    onChange={(event) =>
                                        setFullName(event.target.value)
                                    }
                                    aria-label="Full name and organization"
                                    aria-invalid={Boolean(errors.fullName)}
                                    placeholder="Full Name & Organization (e.g. Jean Kalala)"
                                    className={cn(
                                        fieldClassName,
                                        errors.fullName && invalidClassName,
                                    )}
                                />
                                <FieldError message={errors.fullName} />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    aria-label="Professional email"
                                    aria-invalid={Boolean(errors.email)}
                                    placeholder="Professional Email (ex: j.kalala@corp.cd)"
                                    className={cn(
                                        fieldClassName,
                                        errors.email && invalidClassName,
                                    )}
                                />
                                <FieldError message={errors.email} />
                            </div>
                            <div>
                                <div className="flex gap-2">
                                    <span className="inline-flex items-center rounded-lg bg-surface-container-low px-3 text-label-sm text-primary select-none">
                                        +243
                                    </span>
                                    <input
                                        type="tel"
                                        autoComplete="tel-national"
                                        value={phone}
                                        onChange={(event) =>
                                            setPhone(event.target.value)
                                        }
                                        aria-label="Phone or WhatsApp number"
                                        aria-invalid={Boolean(errors.phone)}
                                        placeholder="Phone / WhatsApp (e.g. 81 234 5678)"
                                        className={cn(
                                            fieldClassName,
                                            errors.phone && invalidClassName,
                                        )}
                                    />
                                </div>
                                <FieldError message={errors.phone} />
                            </div>
                            <div className="relative self-start">
                                <select
                                    value={province}
                                    onChange={(event) =>
                                        setProvince(event.target.value)
                                    }
                                    aria-label="City or province"
                                    className={cn(
                                        fieldClassName,
                                        'cursor-pointer appearance-none pr-8',
                                    )}
                                >
                                    {provinces.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <MaterialSymbol
                                    name="expand_more"
                                    className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-base text-on-surface-variant"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-1">
                        <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-outline-variant p-3 text-on-surface-variant transition-colors hover:bg-surface-container-low">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(event) =>
                                    setAttachment(
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                                className="sr-only"
                            />
                            <MaterialSymbol
                                name="attach_file"
                                className="text-lg text-primary"
                            />
                            <span className="truncate text-label-sm">
                                {attachment
                                    ? attachment.name
                                    : 'Attach briefing document or RFP (Optional, PDF/DOCX up to 25MB)'}
                            </span>
                        </label>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
                            <Link
                                href={home()}
                                className="flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-label-md text-on-surface-variant transition-colors hover:text-primary sm:w-auto"
                            >
                                <MaterialSymbol
                                    name="arrow_back"
                                    className="text-base"
                                />
                                Back to Services
                            </Link>
                            <button
                                type="submit"
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-label-md text-on-primary shadow-sm transition-all hover:bg-primary-container hover:shadow-md sm:w-auto"
                            >
                                <MaterialSymbol
                                    name="lock"
                                    className="text-base"
                                />
                                Send Service Request / Envoyer la Demande
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-outline-variant/30 pt-2 text-center text-label-sm text-on-surface-variant">
                            <span className="inline-flex items-center gap-1">
                                <MaterialSymbol
                                    name="check"
                                    className="text-sm text-primary"
                                />
                                100% Confidential
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                                <MaterialSymbol
                                    name="check"
                                    className="text-sm text-primary"
                                />
                                Certified DRC Bar &amp; ONEC Experts
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                                <MaterialSymbol
                                    name="check"
                                    className="text-sm text-primary"
                                />
                                Response within 24h
                            </span>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
