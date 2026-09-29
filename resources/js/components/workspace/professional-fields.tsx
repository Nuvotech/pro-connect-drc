import { FileUp, ImageUp } from 'lucide-react';
import { useState } from 'react';
import {
    Checkbox,
    Field,
    FileField,
    FormSection,
    inputClassName,
} from '@/components/workspace/form-fields';
import ServicesPicker from '@/components/workspace/services-picker';
import { cn } from '@/lib/utils';
import { useCities } from '@/hooks/use-categories';
import { t } from '@/lib/i18n';

export type ProfessionalFieldDefaults = {
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
    has_identity_document: boolean;
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
    const [documentName, setDocumentName] = useState<string>();
    const communes = findCity(city)?.communes ?? [];

    return (
        <>
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
                    label={t('Business name')}
                    htmlFor="business_name"
                    error={errors.business_name}
                    isOptional
                >
                    <input
                        id="business_name"
                        name="business_name"
                        defaultValue={defaults?.business_name ?? undefined}
                        autoComplete="organization"
                        placeholder={t('e.g. Dupont Plomberie SARL')}
                        aria-invalid={Boolean(errors.business_name)}
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
                    label={t('Full name')}
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
                <Field
                    label={t('RCCM number')}
                    htmlFor="registry_number"
                    error={errors.registry_number}
                    isOptional
                >
                    <input
                        id="registry_number"
                        name="registry_number"
                        defaultValue={defaults?.registry_number ?? undefined}
                        placeholder={t('CD/KIN/RCCM/…')}
                        aria-invalid={Boolean(errors.registry_number)}
                        className={cn(inputClassName, 'font-mono')}
                    />
                </Field>
                <Field
                    label={t('Tax ID')}
                    htmlFor="tax_id"
                    error={errors.tax_id}
                    isOptional
                >
                    <input
                        id="tax_id"
                        name="tax_id"
                        defaultValue={defaults?.tax_id ?? undefined}
                        placeholder="01-00-X00000X"
                        aria-invalid={Boolean(errors.tax_id)}
                        className={cn(inputClassName, 'font-mono')}
                    />
                </Field>
                <FileField
                    id="photo"
                    label={t('Profile photo')}
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
                    id="identity_document"
                    label={t('ID document')}
                    name="identity_document"
                    accept="application/pdf,image/jpeg,image/png"
                    hint={t('PDF, JPG or PNG, up to 10 MB · kept private')}
                    icon={<FileUp className="size-5" />}
                    fileName={
                        documentName ??
                        (defaults?.has_identity_document
                            ? 'Current document on file'
                            : undefined)
                    }
                    onFileChange={setDocumentName}
                    error={errors.identity_document}
                />
                {showVerifiedToggle && (
                    <div className="sm:col-span-2">
                        <Checkbox
                            name="is_verified"
                            label={t('Mark as verified now')}
                            description={t(
                                'The documents have been checked and the profile can go live.',
                            )}
                        />
                    </div>
                )}
            </FormSection>
        </>
    );
}
