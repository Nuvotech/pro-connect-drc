import FieldError from '@/components/directory/field-error';
import {
    inputClassName,
    invalidClassName,
    selectClassName,
} from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import type { QuoteStepProps } from '@/components/directory/quote-request/quote-request-data';
import { cities, findCity } from '@/lib/directory-data';
import { cn } from '@/lib/utils';

const assessmentCards = [
    {
        value: 'in_person',
        icon: 'home_repair_service',
        title: 'In-Person Assessment Visit',
        titleFr: "Visite d'évaluation sur place",
        description:
            'A certified contractor inspects the premises to detect hidden requirements, take precise measurements, and guarantee an exact quote.',
        footerIcon: 'schedule',
        isRecommended: true,
    },
    {
        value: 'remote',
        icon: 'photo_library',
        title: 'Remote Fast Estimate',
        titleFr: 'Devis à distance sur photos & détails',
        description:
            'Ideal for straightforward replacements, emergency fixes, or initial budgeting. Calculated via photos and project description.',
        footerIcon: 'bolt',
        isRecommended: false,
    },
];

export default function StepLocation({
    data,
    errors,
    setField,
}: QuoteStepProps) {
    const selectedCity = findCity(data.city);
    const communes = selectedCity?.communes ?? [];

    function changeCity(cityName: string) {
        setField('city', cityName);
        setField('commune', findCity(cityName)?.communes[0] ?? '');
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 self-start rounded-full bg-primary-fixed px-3 py-1 text-label-sm text-on-primary-fixed">
                    <MaterialSymbol
                        name="verified"
                        filled
                        className="text-sm"
                    />
                    Proximité • Local Availability Guarantee
                </div>
                <h2 className="text-headline-lg-mobile tracking-tight text-on-surface md:text-headline-lg">
                    Where is the job located?
                </h2>
                <p className="text-body-md text-on-surface-variant">
                    Help us match you with verified professionals in your
                    commune or city. <span className="text-outline">•</span>{' '}
                    <span className="italic">
                        Indiquez votre ville et commune en RDC.
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="quote-city"
                        className="flex items-center justify-between text-label-md text-on-surface"
                    >
                        <span>City / Ville</span>
                        <span className="text-label-sm text-on-surface-variant">
                            Obligatoire
                        </span>
                    </label>
                    <div className="relative flex items-center">
                        <MaterialSymbol
                            name="apartment"
                            className="pointer-events-none absolute left-3.5 text-body-lg text-outline"
                        />
                        <select
                            id="quote-city"
                            value={data.city}
                            onChange={(event) => changeCity(event.target.value)}
                            className={cn(
                                selectClassName,
                                'py-3.5 pr-10 pl-11',
                                errors.city && invalidClassName,
                            )}
                        >
                            {cities.map((city) => (
                                <option key={city.name} value={city.name}>
                                    {city.name} ({city.region})
                                </option>
                            ))}
                        </select>
                        <MaterialSymbol
                            name="expand_more"
                            className="pointer-events-none absolute right-3.5 text-body-lg text-outline"
                        />
                    </div>
                    <FieldError message={errors.city} />
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="quote-commune"
                        className="flex items-center justify-between text-label-md text-on-surface"
                    >
                        <span>Commune / Quartier</span>
                        <span className="text-label-sm text-on-surface-variant">
                            {data.city}
                        </span>
                    </label>
                    <div className="relative flex items-center">
                        <MaterialSymbol
                            name="my_location"
                            className="pointer-events-none absolute left-3.5 text-body-lg text-outline"
                        />
                        <select
                            id="quote-commune"
                            value={data.commune}
                            onChange={(event) =>
                                setField('commune', event.target.value)
                            }
                            className={cn(
                                selectClassName,
                                'py-3.5 pr-10 pl-11',
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
                            className="pointer-events-none absolute right-3.5 text-body-lg text-outline"
                        />
                    </div>
                    <FieldError message={errors.commune} />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                    <label
                        htmlFor="quote-address"
                        className="flex items-center justify-between text-label-md text-on-surface"
                    >
                        <span>
                            Street Address &amp; Key Landmark / Adresse et
                            Repère
                        </span>
                        <span className="hidden text-label-sm text-outline sm:inline">
                            Précision d'accès
                        </span>
                    </label>
                    <div className="relative flex items-center">
                        <MaterialSymbol
                            name="signpost"
                            className="pointer-events-none absolute left-3.5 text-body-lg text-outline"
                        />
                        <input
                            id="quote-address"
                            type="text"
                            value={data.address}
                            onChange={(event) =>
                                setField('address', event.target.value)
                            }
                            placeholder="Avenue / Boulevard, Réf: ex. Près de l'Hôtel du Fleuve, Croisement Huileries..."
                            className={cn(inputClassName, 'py-3.5 pr-4 pl-11')}
                        />
                    </div>
                </div>
            </div>

            <div className="relative flex h-44 w-full items-end overflow-hidden rounded-xl bg-surface-container-high p-4 shadow-sm">
                <div
                    className="absolute inset-0 h-full w-full bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('/images/directory/map-kinshasa.png')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
                <div className="relative z-10 flex w-full flex-wrap items-center justify-between gap-3 text-on-primary">
                    <div className="flex items-center gap-2">
                        <MaterialSymbol
                            name="pin_drop"
                            filled
                            className="text-headline-md text-secondary-fixed"
                        />
                        <div>
                            <p className="text-label-md font-semibold text-on-primary">
                                Network Presence: {data.city} Central Hub
                            </p>
                            <p className="text-label-sm text-on-primary-container">
                                34 verified artisans available within 4.5 km of{' '}
                                {data.commune || data.city}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-surface-container-lowest/20 px-3 py-1 text-label-sm text-on-primary backdrop-blur">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-secondary-fixed-dim" />
                        Live Dispatch Active
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <span className="text-label-md font-semibold text-on-surface">
                        Assessment Preference / Modalité d'évaluation
                    </span>
                    <p className="text-label-sm text-on-surface-variant">
                        How would you prefer the artisan to assess the scope of
                        work?
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {assessmentCards.map((card) => {
                        const isSelected = data.assessment === card.value;

                        return (
                            <label
                                key={card.value}
                                className={cn(
                                    'relative flex cursor-pointer flex-col rounded-xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary',
                                    isSelected
                                        ? 'border-primary bg-surface-container-low'
                                        : 'border-outline-variant bg-surface-container-lowest',
                                )}
                            >
                                <input
                                    type="radio"
                                    name="quote-assessment"
                                    value={card.value}
                                    checked={isSelected}
                                    onChange={() =>
                                        setField('assessment', card.value)
                                    }
                                    className="sr-only"
                                />
                                <div className="flex items-start justify-between gap-3">
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-lg',
                                            isSelected
                                                ? 'bg-primary-fixed text-primary'
                                                : 'bg-surface-container-high text-on-surface-variant',
                                        )}
                                    >
                                        <MaterialSymbol
                                            name={card.icon}
                                            filled={isSelected}
                                            className="text-headline-md"
                                        />
                                    </div>
                                    <div
                                        className={cn(
                                            'flex h-5 w-5 items-center justify-center rounded-full transition-colors',
                                            isSelected
                                                ? 'bg-primary-container'
                                                : 'bg-surface-variant',
                                        )}
                                    >
                                        {isSelected && (
                                            <MaterialSymbol
                                                name="check"
                                                filled
                                                className="text-label-sm text-on-primary"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-col gap-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-label-md font-bold text-on-surface">
                                            {card.title}
                                        </span>
                                        {card.isRecommended && (
                                            <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[11px] font-bold text-on-secondary-container">
                                                RECOMMENDED
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            'text-label-sm font-medium',
                                            card.isRecommended
                                                ? 'text-primary'
                                                : 'text-on-surface-variant',
                                        )}
                                    >
                                        {card.titleFr}
                                    </span>
                                    <p className="mt-1 text-sm text-on-surface-variant">
                                        {card.description}
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 pt-3 text-label-sm text-on-surface-variant">
                                    <MaterialSymbol
                                        name={card.footerIcon}
                                        filled
                                        className={cn(
                                            'text-body-md',
                                            card.isRecommended
                                                ? 'text-secondary'
                                                : 'text-primary',
                                        )}
                                    />
                                    <span>
                                        {card.isRecommended
                                            ? `Scheduled according to your availability in ${data.city}`
                                            : 'Receive initial indicative figures within 2 hours'}
                                    </span>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-surface-container p-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                    <MaterialSymbol name="shield" className="text-body-md" />
                </div>
                <p className="text-label-sm text-on-surface">
                    <strong>ProConnect Guarantee:</strong> All pros assigned to
                    your commune carry authenticated National Police record
                    verification and municipal registration across the DRC.
                </p>
            </div>
        </div>
    );
}
