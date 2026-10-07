import { useState } from 'react';
import type { ReactNode } from 'react';
import {
    Checkbox,
    Field,
    FormSection,
    inputClassName,
} from '@/components/workspace/form-fields';
import ProviderTypeField from '@/components/workspace/provider-type-field';
import VerificationFields from '@/components/workspace/verification-fields';
import { cn } from '@/lib/utils';
import { useCities } from '@/hooks/use-categories';
import { t } from '@/lib/i18n';
import type { ProviderType } from '@/types';

const selectClassName = cn(inputClassName, 'cursor-pointer');

export type VehicleProviderFieldDefaults = {
    provider_type: ProviderType;
    contact_name: string;
    business_name: string | null;
    phone: string;
    email: string | null;
    is_on_whatsapp: boolean;
    preferred_language: string;
    city: string;
    commune: string;
    address: string | null;
    registry_number: string | null;
    tax_id: string | null;
    has_identity_document: boolean;
    has_business_registration: boolean;
};

/**
 * A vehicle provider's owner, contact, location and verification fields.
 * Anything passed as `fleet` renders between the owner and verification
 * sections, so onboarding forms can include the vehicles.
 */
export default function VehicleProviderFields({
    errors,
    defaults,
    showVerifiedToggle = false,
    fleet,
}: {
    errors: Record<string, string>;
    defaults?: VehicleProviderFieldDefaults;
    showVerifiedToggle?: boolean;
    fleet?: ReactNode;
}) {
    const { cities, findCity } = useCities();
    const [city, setCity] = useState(defaults?.city ?? '');
    const [providerType, setProviderType] = useState<ProviderType>(
        defaults?.provider_type ?? 'individual',
    );
    const isCompany = providerType === 'company';
    const communes = findCity(city)?.communes ?? [];

    return (
        <>
            <FormSection
                title={t('Owner')}
                description={t('Who we deal with for bookings and payouts.')}
            >
                <ProviderTypeField
                    value={providerType}
                    onChange={setProviderType}
                    error={errors.provider_type}
                />
                <Field
                    label={isCompany ? t('Contact person') : t('Contact name')}
                    htmlFor="contact_name"
                    error={errors.contact_name}
                >
                    <input
                        id="contact_name"
                        name="contact_name"
                        defaultValue={defaults?.contact_name ?? undefined}
                        autoComplete="off"
                        placeholder={t('e.g. Patrick Mbala')}
                        aria-invalid={Boolean(errors.contact_name)}
                        className={inputClassName}
                    />
                </Field>
                <Field
                    label={isCompany ? t('Company name') : t('Trade name')}
                    htmlFor="business_name"
                    error={errors.business_name}
                    isOptional={!isCompany}
                >
                    <input
                        id="business_name"
                        name="business_name"
                        defaultValue={defaults?.business_name ?? undefined}
                        autoComplete="off"
                        placeholder={t('e.g. Kongo Fleet Services SARL')}
                        aria-invalid={Boolean(errors.business_name)}
                        className={inputClassName}
                    />
                </Field>
                <Field
                    label={t('Phone number')}
                    htmlFor="phone"
                    error={errors.phone}
                >
                    <div
                        className={cn(
                            'flex h-10 overflow-hidden rounded-lg border border-zinc-200 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15',
                            errors.phone && 'border-zinc-900',
                        )}
                    >
                        <span className="flex items-center border-r border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 select-none">
                            +243
                        </span>
                        <input
                            id="phone"
                            name="phone"
                            defaultValue={defaults?.phone ?? undefined}
                            type="tel"
                            autoComplete="off"
                            placeholder="81 234 5678"
                            aria-invalid={Boolean(errors.phone)}
                            className="w-full bg-transparent px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                        />
                    </div>
                </Field>
                <Field
                    label={t('Email')}
                    htmlFor="email"
                    error={errors.email}
                    isOptional
                >
                    <input
                        id="email"
                        name="email"
                        defaultValue={defaults?.email ?? undefined}
                        type="email"
                        autoComplete="off"
                        placeholder={t('name@example.com')}
                        aria-invalid={Boolean(errors.email)}
                        className={inputClassName}
                    />
                </Field>
                <Field label={t('City')} htmlFor="city" error={errors.city}>
                    <select
                        id="city"
                        name="city"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        aria-invalid={Boolean(errors.city)}
                        className={selectClassName}
                    >
                        <option value="" disabled>
                            {t('Select a city')}
                        </option>
                        {cities.map((option) => (
                            <option key={option.name} value={option.name}>
                                {option.name}
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
                        key={city}
                        id="commune"
                        name="commune"
                        defaultValue={
                            city === defaults?.city
                                ? (defaults.commune ?? '')
                                : ''
                        }
                        disabled={!city}
                        aria-invalid={Boolean(errors.commune)}
                        className={selectClassName}
                    >
                        <option value="" disabled>
                            {city
                                ? t('Select a commune')
                                : t('Choose a city first')}
                        </option>
                        {communes.map((commune) => (
                            <option key={commune} value={commune}>
                                {commune}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field
                    label={t('Depot address')}
                    htmlFor="address"
                    error={errors.address}
                    isOptional
                    className="sm:col-span-2"
                >
                    <input
                        id="address"
                        name="address"
                        defaultValue={defaults?.address ?? undefined}
                        autoComplete="off"
                        placeholder={t('Where vehicles are collected')}
                        aria-invalid={Boolean(errors.address)}
                        className={inputClassName}
                    />
                </Field>
                <div className="flex flex-col gap-3 sm:col-span-2">
                    <Checkbox
                        name="is_on_whatsapp"
                        label={t('Reachable on WhatsApp')}
                        defaultChecked={defaults?.is_on_whatsapp ?? true}
                    />
                    <fieldset>
                        <legend className="mb-2 text-sm font-medium text-zinc-900">
                            {t('Preferred language')}
                        </legend>
                        <div className="flex gap-6">
                            {[
                                {
                                    value: 'fr',
                                    label: 'Français',
                                },
                                {
                                    value: 'en',
                                    label: 'English',
                                },
                            ].map((language) => (
                                <label
                                    key={language.value}
                                    className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700"
                                >
                                    <input
                                        type="radio"
                                        name="preferred_language"
                                        value={language.value}
                                        defaultChecked={
                                            language.value ===
                                            (defaults?.preferred_language ??
                                                'fr')
                                        }
                                        className="size-4 cursor-pointer accent-primary"
                                    />
                                    {t(language.label)}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                </div>
            </FormSection>

            {fleet}

            <FormSection
                title={t('Verification')}
                description={t('Registration details and ownership documents.')}
            >
                <VerificationFields
                    providerType={providerType}
                    errors={errors}
                    defaults={defaults}
                    identityLabel={t('Owner ID document')}
                />
                {showVerifiedToggle && (
                    <div className="flex flex-col justify-end gap-1.5 sm:col-span-1">
                        <Checkbox
                            name="is_verified"
                            label={t('Mark as verified now')}
                            description={t(
                                'Ownership and documents have been checked.',
                            )}
                        />
                        {errors.is_verified && (
                            <p className="text-xs font-medium text-zinc-900">
                                {errors.is_verified}
                            </p>
                        )}
                    </div>
                )}
            </FormSection>
        </>
    );
}
