import { Building2, Check, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ProviderType } from '@/types';

const copy = {
    applicant: {
        legend: 'How do you work?',
        individual: {
            label: 'I work for myself',
            description: 'Independent, with no registered company.',
        },
        company: {
            label: 'I represent a company',
            description: 'A registered business (SARL, SA, SURL…).',
        },
    },
    listing: {
        legend: 'Individual or company',
        individual: {
            label: 'Individual',
            description: 'Works independently. Verified with an ID document.',
        },
        company: {
            label: 'Company',
            description:
                'Registered business. Verified with its RCCM and tax ID.',
        },
    },
} as const;

/**
 * Each choice has its own colour from the start, so the two are easy to
 * tell apart; the selected one turns solid.
 */
const tones = {
    individual: {
        idle: 'border-teal-200 bg-teal-50 hover:bg-teal-100/70',
        selected: 'border-teal-700 bg-teal-100 ring-1 ring-teal-700',
        idleIcon: 'bg-teal-100 text-teal-700',
        solid: 'bg-teal-700 text-white',
        label: 'text-teal-900',
    },
    company: {
        idle: 'border-blue-200 bg-blue-50 hover:bg-blue-100/70',
        selected: 'border-blue-800 bg-blue-100 ring-1 ring-blue-800',
        idleIcon: 'bg-blue-100 text-blue-800',
        solid: 'bg-blue-800 text-white',
        label: 'text-blue-950',
    },
} as const;

/**
 * Two cards for choosing whether a pro works for themselves or represents
 * a registered company. The choice decides which details are asked for
 * and how the listing is verified.
 */
export default function ProviderTypeField({
    value,
    onChange,
    variant = 'listing',
    name = 'provider_type',
    error,
}: {
    value: ProviderType | null;
    onChange: (value: ProviderType) => void;
    variant?: keyof typeof copy;
    name?: string;
    error?: string;
}) {
    const text = copy[variant];
    const options = [
        { value: 'individual', icon: UserRound, ...text.individual },
        { value: 'company', icon: Building2, ...text.company },
    ] as const;

    return (
        <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium text-zinc-900">
                {t(text.legend)}
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {options.map((option) => {
                    const isSelected = value === option.value;
                    const Icon = option.icon;
                    const tone = tones[option.value];

                    return (
                        <label
                            key={option.value}
                            className={cn(
                                'relative flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/15',
                                isSelected ? tone.selected : tone.idle,
                                !isSelected && error && 'border-error',
                            )}
                        >
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={isSelected}
                                onChange={() => onChange(option.value)}
                                className="sr-only"
                            />
                            <span
                                aria-hidden="true"
                                className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
                                    isSelected ? tone.solid : tone.idleIcon,
                                )}
                            >
                                <Icon className="size-5" />
                            </span>
                            <span className="flex flex-col pr-6">
                                <span
                                    className={cn(
                                        'text-sm font-medium',
                                        tone.label,
                                    )}
                                >
                                    {t(option.label)}
                                </span>
                                <span className="text-xs text-zinc-600">
                                    {t(option.description)}
                                </span>
                            </span>
                            {isSelected && (
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        'absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full',
                                        tone.solid,
                                    )}
                                >
                                    <Check className="size-3.5" />
                                </span>
                            )}
                        </label>
                    );
                })}
            </div>
            {error && (
                <p className="mt-1.5 text-xs font-medium text-error">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
