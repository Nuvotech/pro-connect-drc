import { Trash2 } from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { Field, inputClassName } from '@/components/workspace/form-fields';
import VehiclePhotoSlots from '@/components/workspace/vehicle-photo-slots';
import {
    currencyOptions,
    driverOptions,
    fuelTypeOptions,
    transmissionOptions,
} from '@/lib/admin-data';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

const selectClassName = cn(inputClassName, 'cursor-pointer');

/**
 * One vehicle's fields (type, specs, pricing, terms and the 6 required
 * photos), named `vehicles[index][field]` for a fleet form.
 */
export type VehicleFieldDefaults = {
    category: string;
    make: string;
    model: string;
    year: number;
    registration_number: string;
    transmission: string;
    fuel_type: string;
    seats: number | null;
    payload_tonnes: string | null;
    driver_option: string;
    daily_rate: string;
    currency: string;
    deposit: string | null;
    minimum_rental_days: number;
    quantity: number;
    insurance_expires_on: string | null;
    notes: string | null;
    photos: { angle: string; url: string }[];
};

export default function VehicleFormCard({
    index = 0,
    errors,
    canRemove = false,
    onRemove,
    standalone = false,
    defaults,
}: {
    index?: number;
    errors: Record<string, string>;
    canRemove?: boolean;
    onRemove?: () => void;
    /** Plain field names (`make`, `photos[front]`) for a single-vehicle form. */
    standalone?: boolean;
    defaults?: VehicleFieldDefaults;
}) {
    const { vehicleOptions } = useCategories();
    const fieldName = (field: string) =>
        standalone ? field : `vehicles[${index}][${field}]`;
    const fieldId = (field: string) => `vehicle-${index}-${field}`;
    const errorFor = (field: string) =>
        errors[standalone ? field : `vehicles.${index}.${field}`];

    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-zinc-900">
                    {standalone ? t('Vehicle details') : `Vehicle ${index + 1}`}
                </h3>
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-sm text-zinc-500 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
                    >
                        <Trash2 className="size-4" aria-hidden="true" />
                        {t('Remove')}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
                <Field
                    label={t('Vehicle type')}
                    htmlFor={fieldId('category')}
                    error={errorFor('category')}
                    className="sm:col-span-6"
                >
                    <select
                        id={fieldId('category')}
                        name={fieldName('category')}
                        defaultValue={defaults?.category ?? ''}
                        aria-invalid={Boolean(errorFor('category'))}
                        className={selectClassName}
                    >
                        <option value="" disabled>
                            {t('Select a vehicle type')}
                        </option>
                        {vehicleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {t(option.label)}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field
                    label={t('Make')}
                    htmlFor={fieldId('make')}
                    error={errorFor('make')}
                    className="sm:col-span-2"
                >
                    <input
                        id={fieldId('make')}
                        name={fieldName('make')}
                        defaultValue={defaults?.make ?? undefined}
                        placeholder={t('e.g. Toyota')}
                        aria-invalid={Boolean(errorFor('make'))}
                        className={inputClassName}
                    />
                </Field>
                <Field
                    label={t('Model')}
                    htmlFor={fieldId('model')}
                    error={errorFor('model')}
                    className="sm:col-span-2"
                >
                    <input
                        id={fieldId('model')}
                        name={fieldName('model')}
                        defaultValue={defaults?.model ?? undefined}
                        placeholder={t('e.g. Hilux Double Cab')}
                        aria-invalid={Boolean(errorFor('model'))}
                        className={inputClassName}
                    />
                </Field>
                <Field
                    label={t('Year')}
                    htmlFor={fieldId('year')}
                    error={errorFor('year')}
                    className="sm:col-span-2"
                >
                    <input
                        id={fieldId('year')}
                        name={fieldName('year')}
                        defaultValue={defaults?.year ?? undefined}
                        type="number"
                        min={1980}
                        max={new Date().getFullYear() + 1}
                        placeholder={String(new Date().getFullYear())}
                        aria-invalid={Boolean(errorFor('year'))}
                        className={inputClassName}
                    />
                </Field>

                <Field
                    label={t('Number plate')}
                    htmlFor={fieldId('registration_number')}
                    error={errorFor('registration_number')}
                    className="sm:col-span-2"
                >
                    <input
                        id={fieldId('registration_number')}
                        name={fieldName('registration_number')}
                        defaultValue={
                            defaults?.registration_number ?? undefined
                        }
                        placeholder={t('e.g. 1234AB01')}
                        aria-invalid={Boolean(errorFor('registration_number'))}
                        className={cn(inputClassName, 'font-mono uppercase')}
                    />
                </Field>
                <Field
                    label={t('Transmission')}
                    htmlFor={fieldId('transmission')}
                    error={errorFor('transmission')}
                    className="sm:col-span-2"
                >
                    <select
                        id={fieldId('transmission')}
                        name={fieldName('transmission')}
                        defaultValue={defaults?.transmission ?? 'manual'}
                        className={selectClassName}
                    >
                        {transmissionOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {t(option.label)}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field
                    label={t('Fuel')}
                    htmlFor={fieldId('fuel_type')}
                    error={errorFor('fuel_type')}
                    className="sm:col-span-2"
                >
                    <select
                        id={fieldId('fuel_type')}
                        name={fieldName('fuel_type')}
                        defaultValue={defaults?.fuel_type ?? 'diesel'}
                        className={selectClassName}
                    >
                        {fuelTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {t(option.label)}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field
                    label={t('Seats')}
                    htmlFor={fieldId('seats')}
                    error={errorFor('seats')}
                    isOptional
                    className="sm:col-span-2"
                >
                    <input
                        id={fieldId('seats')}
                        name={fieldName('seats')}
                        defaultValue={defaults?.seats ?? undefined}
                        type="number"
                        min={1}
                        max={80}
                        placeholder="e.g. 5"
                        aria-invalid={Boolean(errorFor('seats'))}
                        className={inputClassName}
                    />
                </Field>
                <Field
                    label={t('Payload (tonnes)')}
                    htmlFor={fieldId('payload_tonnes')}
                    error={errorFor('payload_tonnes')}
                    isOptional
                    className="sm:col-span-2"
                >
                    <input
                        id={fieldId('payload_tonnes')}
                        name={fieldName('payload_tonnes')}
                        defaultValue={defaults?.payload_tonnes ?? undefined}
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="e.g. 30"
                        aria-invalid={Boolean(errorFor('payload_tonnes'))}
                        className={inputClassName}
                    />
                </Field>
                <Field
                    label={t('Quantity')}
                    htmlFor={fieldId('quantity')}
                    error={errorFor('quantity')}
                    className="sm:col-span-2"
                >
                    <input
                        id={fieldId('quantity')}
                        name={fieldName('quantity')}
                        type="number"
                        min={1}
                        defaultValue={defaults?.quantity ?? 1}
                        aria-invalid={Boolean(errorFor('quantity'))}
                        className={inputClassName}
                    />
                </Field>

                <fieldset className="sm:col-span-6">
                    <legend className="mb-2 text-sm font-medium text-zinc-900">
                        {t('Hire option')}
                    </legend>
                    <div className="flex flex-wrap gap-6">
                        {driverOptions.map((option) => (
                            <label
                                key={option.value}
                                className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
                            >
                                <input
                                    type="radio"
                                    name={fieldName('driver_option')}
                                    value={option.value}
                                    defaultChecked={
                                        option.value ===
                                        (defaults?.driver_option ?? 'both')
                                    }
                                    className="size-4 cursor-pointer accent-primary"
                                />
                                {t(option.label)}
                            </label>
                        ))}
                    </div>
                    {errorFor('driver_option') && (
                        <p className="mt-1.5 text-xs font-medium text-zinc-900">
                            {errorFor('driver_option')}
                        </p>
                    )}
                </fieldset>

                <Field
                    label={t('Daily rate')}
                    htmlFor={fieldId('daily_rate')}
                    error={errorFor('daily_rate') ?? errorFor('currency')}
                    className="sm:col-span-3"
                >
                    <div
                        className={cn(
                            'flex h-10 overflow-hidden rounded-lg border border-zinc-200 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15',
                            errorFor('daily_rate') && 'border-zinc-900',
                        )}
                    >
                        <select
                            name={fieldName('currency')}
                            defaultValue={defaults?.currency ?? 'USD'}
                            aria-label={t('Currency')}
                            className="cursor-pointer border-r border-zinc-200 bg-zinc-50 px-2 text-sm text-zinc-600 focus:outline-none"
                        >
                            {currencyOptions.map((currency) => (
                                <option key={currency} value={currency}>
                                    {currency}
                                </option>
                            ))}
                        </select>
                        <input
                            id={fieldId('daily_rate')}
                            name={fieldName('daily_rate')}
                            defaultValue={defaults?.daily_rate ?? undefined}
                            type="number"
                            min={1}
                            step="0.01"
                            placeholder="0.00"
                            aria-invalid={Boolean(errorFor('daily_rate'))}
                            className="w-full bg-transparent px-3 text-sm text-zinc-900 tabular-nums placeholder:text-zinc-400 focus:outline-none"
                        />
                    </div>
                </Field>
                <Field
                    label={t('Deposit')}
                    htmlFor={fieldId('deposit')}
                    error={errorFor('deposit')}
                    isOptional
                    className="sm:col-span-3"
                >
                    <input
                        id={fieldId('deposit')}
                        name={fieldName('deposit')}
                        defaultValue={defaults?.deposit ?? undefined}
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder={t('Same currency as the rate')}
                        aria-invalid={Boolean(errorFor('deposit'))}
                        className={cn(inputClassName, 'tabular-nums')}
                    />
                </Field>

                <Field
                    label={t('Minimum rental (days)')}
                    htmlFor={fieldId('minimum_rental_days')}
                    error={errorFor('minimum_rental_days')}
                    className="sm:col-span-3"
                >
                    <input
                        id={fieldId('minimum_rental_days')}
                        name={fieldName('minimum_rental_days')}
                        type="number"
                        min={1}
                        defaultValue={defaults?.minimum_rental_days ?? 1}
                        aria-invalid={Boolean(errorFor('minimum_rental_days'))}
                        className={inputClassName}
                    />
                </Field>
                <Field
                    label={t('Insurance valid until')}
                    htmlFor={fieldId('insurance_expires_on')}
                    error={errorFor('insurance_expires_on')}
                    isOptional
                    className="sm:col-span-3"
                >
                    <input
                        id={fieldId('insurance_expires_on')}
                        name={fieldName('insurance_expires_on')}
                        defaultValue={
                            defaults?.insurance_expires_on ?? undefined
                        }
                        type="date"
                        aria-invalid={Boolean(errorFor('insurance_expires_on'))}
                        className={inputClassName}
                    />
                </Field>

                <Field
                    label={t('Notes')}
                    htmlFor={fieldId('notes')}
                    error={errorFor('notes')}
                    isOptional
                    className="sm:col-span-6"
                >
                    <textarea
                        id={fieldId('notes')}
                        name={fieldName('notes')}
                        defaultValue={defaults?.notes ?? undefined}
                        rows={2}
                        placeholder={t(
                            'Condition, features, mileage limits, fuel policy…',
                        )}
                        aria-invalid={Boolean(errorFor('notes'))}
                        className={cn(
                            inputClassName,
                            'h-auto resize-none py-2.5 leading-relaxed',
                        )}
                    />
                </Field>

                <div className="sm:col-span-6">
                    <VehiclePhotoSlots
                        namePrefix={
                            standalone ? 'photos' : `vehicles.${index}.photos`
                        }
                        errors={errors}
                        existingPhotos={defaults?.photos}
                    />
                </div>
            </div>
        </div>
    );
}
