import FieldError from '@/components/directory/field-error';
import {
    inputClassName,
    invalidClassName,
} from '@/components/directory/field-styles';
import ChoiceChips from '@/components/directory/quote-request/choice-chips';
import { contactChannels } from '@/components/directory/quote-request/quote-request-data';
import type { QuoteStepProps } from '@/components/directory/quote-request/quote-request-data';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export default function StepContact({
    data,
    errors,
    setField,
}: QuoteStepProps) {
    const isEmailRequired = data.contactChannel === 'email';

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-body-lg font-semibold text-on-surface">
                {t('How can pros reach you?')}
            </h2>

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="quote-full-name"
                    className="text-label-md text-on-surface"
                >
                    {t('Full name')}
                </label>
                <input
                    id="quote-full-name"
                    type="text"
                    autoComplete="name"
                    value={data.fullName}
                    onChange={(event) =>
                        setField('fullName', event.target.value)
                    }
                    aria-invalid={Boolean(errors.fullName)}
                    placeholder={t('e.g. Patrick Mukendi')}
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
                    htmlFor="quote-phone"
                    className="text-label-md text-on-surface"
                >
                    {t('Phone number')}
                </label>
                <div
                    className={cn(
                        'flex h-11 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30',
                        errors.phone && 'border-error',
                    )}
                >
                    <span className="flex shrink-0 items-center gap-2 border-r border-outline-variant bg-surface-container-low px-3 text-label-md text-on-surface select-none">
                        <svg
                            aria-hidden="true"
                            className="h-3.5 w-5 overflow-hidden rounded-sm"
                            viewBox="0 0 800 600"
                        >
                            <rect fill="#007fff" height="600" width="800" />
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
                        +243
                    </span>
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
                        className="w-full bg-transparent px-3 text-body-md text-on-surface outline-none placeholder:text-outline"
                    />
                </div>
                <FieldError message={errors.phone} />
            </div>

            <ChoiceChips
                name="quote-contact-channel"
                label={t('Preferred contact')}
                options={contactChannels}
                value={data.contactChannel}
                onChange={(value) => setField('contactChannel', value)}
                className="grid-cols-3"
            />

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="quote-email"
                    className="text-label-md text-on-surface"
                >
                    {t('Email')}{' '}
                    {!isEmailRequired && (
                        <span className="font-normal text-on-surface-variant">
                            {t('(optional)')}
                        </span>
                    )}
                </label>
                <input
                    id="quote-email"
                    type="email"
                    autoComplete="email"
                    value={data.email}
                    onChange={(event) => setField('email', event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-required={isEmailRequired}
                    placeholder={t('you@example.com')}
                    className={cn(
                        inputClassName,
                        'h-11 px-3',
                        errors.email && invalidClassName,
                    )}
                />
                <FieldError message={errors.email} />
            </div>

            <p className="text-label-sm text-on-surface-variant">
                {t(
                    'Free, with no obligation. Your details are only shared with the pros quoting on your job.',
                )}
            </p>
        </div>
    );
}
