import FieldError from '@/components/directory/field-error';
import {
    inputClassName,
    invalidClassName,
    selectClassName,
} from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import ChoiceChips from '@/components/directory/quote-request/choice-chips';
import { assessments } from '@/components/directory/quote-request/quote-request-data';
import type { QuoteStepProps } from '@/components/directory/quote-request/quote-request-data';
import { useCities } from '@/hooks/use-categories';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export default function StepLocation({
    data,
    errors,
    setField,
}: QuoteStepProps) {
    const { cities, findCity } = useCities();
    const communes = findCity(data.city)?.communes ?? [];
    const selectedAssessment = assessments.find(
        ({ value }) => value === data.assessment,
    );

    function changeCity(cityName: string) {
        setField('city', cityName);
        setField('commune', findCity(cityName)?.communes[0] ?? '');
    }

    return (
        <div className="flex flex-col gap-5">
            <h2 className="text-body-lg font-semibold text-on-surface">
                {t('Where is the job?')}
            </h2>

            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="quote-city"
                        className="text-label-md text-on-surface"
                    >
                        {t('City')}
                    </label>
                    <div className="relative flex items-center">
                        <select
                            id="quote-city"
                            value={data.city}
                            onChange={(event) => changeCity(event.target.value)}
                            aria-invalid={Boolean(errors.city)}
                            className={cn(
                                selectClassName,
                                'h-11 pr-9 pl-3',
                                errors.city && invalidClassName,
                            )}
                        >
                            {cities.map((city) => (
                                <option key={city.name} value={city.name}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                        <MaterialSymbol
                            name="expand_more"
                            className="pointer-events-none absolute right-2.5 text-[20px] text-outline"
                        />
                    </div>
                    <FieldError message={errors.city} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="quote-commune"
                        className="text-label-md text-on-surface"
                    >
                        {t('Commune')}
                    </label>
                    <div className="relative flex items-center">
                        <select
                            id="quote-commune"
                            value={data.commune}
                            onChange={(event) =>
                                setField('commune', event.target.value)
                            }
                            aria-invalid={Boolean(errors.commune)}
                            className={cn(
                                selectClassName,
                                'h-11 pr-9 pl-3',
                                errors.commune && invalidClassName,
                            )}
                        >
                            {communes.map((commune) => (
                                <option key={commune} value={commune}>
                                    {commune}
                                </option>
                            ))}
                        </select>
                        <MaterialSymbol
                            name="expand_more"
                            className="pointer-events-none absolute right-2.5 text-[20px] text-outline"
                        />
                    </div>
                    <FieldError message={errors.commune} />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="quote-address"
                    className="text-label-md text-on-surface"
                >
                    {t('Street or landmark')}{' '}
                    <span className="font-normal text-on-surface-variant">
                        {t('(optional)')}
                    </span>
                </label>
                <input
                    id="quote-address"
                    type="text"
                    value={data.address}
                    onChange={(event) =>
                        setField('address', event.target.value)
                    }
                    aria-invalid={Boolean(errors.address)}
                    placeholder={t('e.g. Av. du Commerce, near the market')}
                    className={cn(
                        inputClassName,
                        'h-11 px-3',
                        errors.address && invalidClassName,
                    )}
                />
                <FieldError message={errors.address} />
            </div>

            <div className="flex flex-col gap-1.5">
                <ChoiceChips
                    name="quote-assessment"
                    label={t('How should pros quote?')}
                    options={assessments}
                    value={data.assessment}
                    onChange={(value) => setField('assessment', value)}
                    className="grid-cols-2"
                />
                {selectedAssessment && (
                    <p className="text-label-sm text-on-surface-variant">
                        {t(selectedAssessment.hint)}
                    </p>
                )}
            </div>
        </div>
    );
}
