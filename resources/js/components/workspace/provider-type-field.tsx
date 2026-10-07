import { Building2, UserRound } from 'lucide-react';
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

                    return (
                        <label
                            key={option.value}
                            className={cn(
                                'flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/15',
                                isSelected
                                    ? 'border-primary bg-primary/5'
                                    : 'border-zinc-200 hover:bg-zinc-50',
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
                            <Icon
                                aria-hidden="true"
                                className={cn(
                                    'mt-0.5 size-5 shrink-0',
                                    isSelected
                                        ? 'text-primary'
                                        : 'text-zinc-400',
                                )}
                            />
                            <span className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-900">
                                    {t(option.label)}
                                </span>
                                <span className="text-xs text-zinc-500">
                                    {t(option.description)}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </div>
            {error && (
                <p className="mt-1.5 text-xs font-medium text-zinc-900">
                    {error}
                </p>
            )}
        </fieldset>
    );
}
