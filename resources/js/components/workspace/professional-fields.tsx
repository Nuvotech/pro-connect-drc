import { ImageUp } from 'lucide-react';
import { useState } from 'react';
import {
    Checkbox,
    Field,
    FileField,
    FormSection,
    inputClassName,
} from '@/components/workspace/form-fields';
import ProviderTypeField from '@/components/workspace/provider-type-field';
import ServicesPicker from '@/components/workspace/services-picker';
import VerificationFields from '@/components/workspace/verification-fields';
import { cn } from '@/lib/utils';
import { useCities } from '@/hooks/use-categories';
import { t } from '@/lib/i18n';
import type { ProviderType } from '@/types';

export type ProfessionalFieldDefaults = {
    provider_type: ProviderType;
    categories: string[];
    experience_years: number | null;
    business_name: string | null;
    bio: string | null;
    full_name: string;
    phone: string;
    email: string | null;
    is_on_whatsapp: boolean;
    preferred_language: string;
    city: string;
    commune: string;
    address: string | null;
    registry_number: string | null;
    tax_id: string | null;
    has_photo: boolean;
    has_cover: boolean;
    has_identity_document: boolean;
    has_business_registration: boolean;
};

/**
 * The fields describing a professional's listing: services, contact,
 * location and verification documents. Used by admin onboarding and by
 * pros managing their own listing.
 */
export default function ProfessionalFields({
    errors,
    defaults,
    showVerifiedToggle = false,
}: {
    errors: Record<string, string>;
    defaults?: ProfessionalFieldDefaults;
    showVerifiedToggle?: boolean;
}) {
    const { cities, findCity } = useCities();
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        defaults?.categories ?? [],
    );
    const [city, setCity] = useState(defaults?.city ?? '');
    const [photoName, setPhotoName] = useState<string>();
    const [coverName, setCoverName] = useState<string>();
    const [providerType, setProviderType] = useState<ProviderType>(
        defaults?.provider_type ?? 'individual',
    );
    const isCompany = providerType === 'company';
    const communes = findCity(city)?.communes ?? [];

    return (
        <>
            <FormSection
                title={t('Individual or company')}
                description={t(
                    'Individuals and companies are verified differently.',
                )}
            >
                <ProviderTypeField
                    value={providerType}
                    onChange={setProviderType}
                    error={errors.provider_type}
                />
                <Field
                    label={isCompany ? t('Company name') : t('Trade name')}
                    htmlFor="business_name"
                    error={errors.business_name}
                    isOptional={!isCompany}
                    className="sm:col-span-2"
                >
                    <input
                        id="business_name"
                        name="business_name"
                        defaultValue={defaults?.business_name ?? undefined}
                        autoComplete="organization"
                        placeholder={
                            isCompany
                                ? t('e.g. Dupont Plomberie SARL')
                                : t("e.g. Jean's Plumbing")
                        }
                        aria-invalid={Boolean(errors.business_name)}
                        className={inputClassName}
                    />
                </Field>
            </FormSection>

            <FormSection
                title={t('Service')}
                description={t('What this professional offers.')}
            >
                <ServicesPicker
                    selected={selectedCategories}
                    onChange={setSelectedCategories}
                    error={
                        errors.categories ??
                        Object.entries(errors).find(([key]) =>
                            key.startsWith('categories.'),
                        )?.[1]
                    }
                />
                <Field
                    label={t('Years of experience')}
                    htmlFor="experience_years"
                    error={errors.experience_years}
                    isOptional
                >
                    <input
                        id="experience_years"
                        name="experience_years"
                        defaultValue={defaults?.experience_years ?? undefined}
                        type="number"
                        min={0}
                        max={60}
                        placeholder="e.g. 8"
                        aria-invalid={Boolean(errors.experience_years)}
                        className={inputClassName}
                    />
                </Field>
                <Field
                    label={t('About their services')}
                    htmlFor="bio"
                    error={errors.bio}
                    isOptional
                    className="sm:col-span-2"
                >
                    <textarea
                        id="bio"
                        name="bio"
                        defaultValue={defaults?.bio ?? undefined}
                        rows={3}
                        placeholder={t(
                            'Specialties, certifications, areas covered…',
                        )}
                        aria-invalid={Boolean(errors.bio)}
                        className={cn(
                            inputClassName,
                            'h-auto resize-none py-2.5 leading-relaxed',
                        )}
                    />
                </Field>
            </FormSection>

            <FormSection
                title={t('Contact')}
                description={t('How clients and our team reach them.')}
            >
                <Field
                    label={isCompany ? t('Contact person') : t('Full name')}
                    htmlFor="full_name"
                    error={errors.full_name}
                    className="sm:col-span-2"
                >
                    <input
                        id="full_name"
                        name="full_name"
                        defaultValue={defaults?.full_name ?? undefined}
                        autoComplete="off"
                        placeholder={t('e.g. Jean Dupont')}
                        aria-invalid={Boolean(errors.full_name)}
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

            <FormSection
                title={t('Location')}
                description={t('Where they are based.')}
            >
                <Field label={t('City')} htmlFor="city" error={errors.city}>
                    <select
                        id="city"
                        name="city"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        aria-invalid={Boolean(errors.city)}
                        className={cn(inputClassName, 'cursor-pointer')}
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
                        className={cn(inputClassName, 'cursor-pointer')}
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
                    label={t('Street address')}
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
                        placeholder={t('e.g. 18 Av. du Commerce')}
                        aria-invalid={Boolean(errors.address)}
                        className={inputClassName}
                    />
                </Field>
            </FormSection>

            <FormSection
                title={t('Verification')}
                description={t('Registration details and documents.')}
            >
                <VerificationFields
                    providerType={providerType}
                    errors={errors}
                    defaults={defaults}
                    identityLabel={t('ID document')}
                />
                <FileField
                    id="photo"
                    label={isCompany ? t('Logo') : t('Profile photo')}
                    name="photo"
                    accept="image/jpeg,image/png,image/webp"
                    hint={t('JPG, PNG or WebP, up to 5 MB')}
                    icon={<ImageUp className="size-5" />}
                    fileName={
                        photoName ??
                        (defaults?.has_photo
                            ? 'Current photo on file'
                            : undefined)
                    }
                    onFileChange={setPhotoName}
                    error={errors.photo}
                />
                <FileField
                    id="cover"
                    label={t('Profile cover')}
                    name="cover"
                    accept="image/jpeg,image/png,image/webp"
                    hint={t(
                        'Wide banner, ideally 1600 × 400 · JPG, PNG or WebP, up to 5 MB',
                    )}
                    icon={<ImageUp className="size-5" />}
                    fileName={
                        coverName ??
                        (defaults?.has_cover
                            ? t('Current cover on file')
                            : undefined)
                    }
                    onFileChange={setCoverName}
                    error={errors.cover}
                />
                {showVerifiedToggle && (
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Checkbox
                            name="is_verified"
                            label={t('Mark as verified now')}
                            description={t(
                                'The documents have been checked and the profile can go live.',
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
