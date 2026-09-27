import FieldError from '@/components/directory/field-error';
import {
    inputClassName,
    invalidClassName,
} from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import {
    contactChannels,
    serviceTypes,
} from '@/components/directory/quote-request/quote-request-data';
import type { QuoteStepProps } from '@/components/directory/quote-request/quote-request-data';
import { findCategory } from '@/lib/directory-data';
import { cn } from '@/lib/utils';
import type { Professional } from '@/types';

type StepContactProps = QuoteStepProps & {
    professional?: Professional;
};

export default function StepContact({
    data,
    errors,
    setField,
    professional,
}: StepContactProps) {
    const category = findCategory(data.categorySlug);
    const serviceType = serviceTypes.find(
        ({ value }) => value === data.serviceType,
    );
    const summaryItems = [
        {
            icon: category?.icon ?? 'category',
            label: 'Category / Métier',
            value: category ? `${category.name} • ${category.nameFr}` : '—',
        },
        {
            icon: 'location_on',
            label: 'Location / Commune',
            value: [data.city, data.commune].filter(Boolean).join(', '),
        },
        {
            icon: 'home_repair_service',
            label: "Service Scope / Type d'intervention",
            value: `${serviceType?.caption ?? '—'} + ${
                data.assessment === 'in_person'
                    ? 'Site Visit'
                    : 'Remote Estimate'
            }`,
        },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="mb-2 text-headline-lg-mobile text-primary md:text-headline-lg">
                    Where should pros send your quotes?
                </h2>
                <p className="text-body-md text-on-surface-variant">
                    You will receive up to 3 competitive quotes from verified
                    local pros. 100% free with no obligation.
                    <span className="mt-1 block text-label-sm text-outline">
                        Recevez jusqu'à 3 devis gratuits et sans engagement
                        d'artisans vérifiés.
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                <div className="flex flex-col gap-5 lg:col-span-7">
                    <div>
                        <label
                            htmlFor="quote-full-name"
                            className="mb-2 block text-label-sm font-semibold text-on-surface"
                        >
                            Full Name / Nom complet{' '}
                            <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                            <MaterialSymbol
                                name="person"
                                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg text-outline"
                            />
                            <input
                                id="quote-full-name"
                                type="text"
                                autoComplete="name"
                                value={data.fullName}
                                onChange={(event) =>
                                    setField('fullName', event.target.value)
                                }
                                aria-invalid={Boolean(errors.fullName)}
                                placeholder="e.g. Patrick Mukendi"
                                className={cn(
                                    inputClassName,
                                    'py-3 pr-4 pl-10',
                                    errors.fullName && invalidClassName,
                                )}
                            />
                        </div>
                        <div className="mt-1">
                            <FieldError message={errors.fullName} />
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <label
                                htmlFor="quote-phone"
                                className="text-label-sm font-semibold text-on-surface"
                            >
                                Phone Number / Numéro de téléphone{' '}
                                <span className="text-error">*</span>
                            </label>
                            <span className="hidden text-label-sm text-outline sm:inline">
                                Airtel • Vodacom • Orange
                            </span>
                        </div>
                        <div
                            className={cn(
                                'flex overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30',
                                errors.phone && 'border-error',
                            )}
                        >
                            <div className="flex shrink-0 items-center gap-2 bg-surface-container-low px-3.5 text-label-md text-on-surface select-none">
                                <svg
                                    aria-label="DRC Flag"
                                    className="h-3.5 w-5 overflow-hidden rounded-sm"
                                    viewBox="0 0 800 600"
                                >
                                    <rect
                                        fill="#007fff"
                                        height="600"
                                        width="800"
                                    />
                                    <polygon
                                        fill="#f7d518"
                                        points="0,600 0,480 640,0 800,0 800,120 160,600"
                                    />
                                    <polygon
                                        fill="#ce1021"
                                        points="0,600 0,510 680,0 800,0 800,90 120,600"
                                    />
                                    <polygon
                                        fill="#f7d518"
                                        points="120,60 135,105 180,105 144,132 158,175 120,148 82,175 96,132 60,105 105,105"
                                    />
                                </svg>
                                <span>+243</span>
                            </div>
                            <input
                                id="quote-phone"
                                type="tel"
                                autoComplete="tel-national"
                                value={data.phone}
                                onChange={(event) =>
                                    setField('phone', event.target.value)
                                }
                                aria-invalid={Boolean(errors.phone)}
                                placeholder="81 234 5678"
                                className="w-full bg-transparent px-4 py-3 text-body-md text-on-surface outline-none placeholder:text-outline"
                            />
                        </div>
                        <div className="mt-1">
                            <FieldError message={errors.phone} />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="quote-email"
                            className="mb-2 block text-label-sm font-semibold text-on-surface"
                        >
                            Email Address / Adresse e-mail{' '}
                            <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                            <MaterialSymbol
                                name="mail"
                                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg text-outline"
                            />
                            <input
                                id="quote-email"
                                type="email"
                                autoComplete="email"
                                value={data.email}
                                onChange={(event) =>
                                    setField('email', event.target.value)
                                }
                                aria-invalid={Boolean(errors.email)}
                                placeholder="e.g. patrick.mukendi@example.com"
                                className={cn(
                                    inputClassName,
                                    'py-3 pr-4 pl-10',
                                    errors.email && invalidClassName,
                                )}
                            />
                        </div>
                        <div className="mt-1">
                            <FieldError message={errors.email} />
                        </div>
                    </div>

                    <div>
                        <span className="mb-2 block text-label-sm font-semibold text-on-surface">
                            Preferred Contact Channel / Canal privilégié
                        </span>
                        <div className="grid grid-cols-3 gap-2.5">
                            {contactChannels.map((channel) => (
                                <label
                                    key={channel.value}
                                    className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg bg-surface-container-low p-3 text-center transition-colors select-none hover:bg-surface-container has-[:checked]:bg-primary-container has-[:checked]:text-on-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary"
                                >
                                    <input
                                        type="radio"
                                        name="quote-contact-channel"
                                        value={channel.value}
                                        checked={
                                            data.contactChannel ===
                                            channel.value
                                        }
                                        onChange={() =>
                                            setField(
                                                'contactChannel',
                                                channel.value,
                                            )
                                        }
                                        className="sr-only"
                                    />
                                    <MaterialSymbol
                                        name={channel.icon}
                                        className="mb-1"
                                    />
                                    <span className="text-label-md">
                                        {channel.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 lg:col-span-5">
                    <div className="rounded-xl bg-surface-container-low p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-2 pb-3">
                            <div className="flex items-center gap-2">
                                <MaterialSymbol
                                    name="receipt_long"
                                    className="text-xl text-primary"
                                />
                                <span className="text-label-md font-bold tracking-wider text-primary uppercase">
                                    Request Summary
                                </span>
                            </div>
                            <span className="rounded-full bg-secondary-fixed px-2.5 py-0.5 text-label-sm font-semibold text-on-secondary-fixed">
                                Ready to dispatch
                            </span>
                        </div>
                        <div className="space-y-3.5 pt-2">
                            {summaryItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-start gap-3"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest text-primary shadow-xs">
                                        <MaterialSymbol
                                            name={item.icon}
                                            className="text-lg"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-label-sm text-outline">
                                            {item.label}
                                        </p>
                                        <p className="truncate text-label-md text-on-surface">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center gap-2 pt-3.5 text-label-sm text-on-surface-variant">
                            <MaterialSymbol
                                name="verified"
                                filled
                                className="text-base text-primary"
                            />
                            <span>
                                {professional
                                    ? `Sent to ${professional.name} + 2 certified local pros`
                                    : 'Matching with 3 certified local pros'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4">
                        <MaterialSymbol
                            name="security"
                            filled
                            className="mt-0.5 shrink-0 text-xl text-primary"
                        />
                        <div className="text-label-sm text-on-surface">
                            <span className="mb-0.5 block font-semibold text-primary">
                                Your data is secured
                            </span>
                            Pros only receive details required to furnish
                            quotes. Your phone number is never shared with third
                            parties or advertisers.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
