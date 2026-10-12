import { FileUp } from 'lucide-react';
import { useState } from 'react';
import {
    Field,
    FileField,
    inputClassName,
} from '@/components/workspace/form-fields';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';
import type { ProviderType } from '@/types';

/**
 * Registration numbers and private documents. Individuals are verified
 * with an ID document; companies with their RCCM number and tax ID, so
 * those are marked as needed for each. The NIF and ARSP numbers and the
 * business registration document are optional.
 */
export default function VerificationFields({
    providerType,
    errors,
    defaults,
    identityLabel,
}: {
    providerType: ProviderType;
    errors: Record<string, string>;
    defaults?: {
        registry_number: string | null;
        tax_id: string | null;
        nif_number: string | null;
        arsp_number: string | null;
        has_identity_document: boolean;
        has_business_registration: boolean;
    };
    identityLabel: string;
}) {
    const [identityName, setIdentityName] = useState<string>();
    const [registrationName, setRegistrationName] = useState<string>();
    const isCompany = providerType === 'company';
    const neededNote = t('Needed to verify');

    return (
        <>
            <Field
                label={t('RCCM number')}
                htmlFor="registry_number"
                error={errors.registry_number}
                isOptional
                note={isCompany ? neededNote : undefined}
                className="scroll-mt-24"
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
                label={t('Tax ID (ID NAT)')}
                htmlFor="tax_id"
                error={errors.tax_id}
                isOptional
                note={isCompany ? neededNote : undefined}
                className="scroll-mt-24"
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
            <Field
                label={t('NIF number')}
                htmlFor="nif_number"
                error={errors.nif_number}
                isOptional
                className="scroll-mt-24"
            >
                <input
                    id="nif_number"
                    name="nif_number"
                    defaultValue={defaults?.nif_number ?? undefined}
                    aria-invalid={Boolean(errors.nif_number)}
                    className={cn(inputClassName, 'font-mono')}
                />
            </Field>
            <Field
                label={t('ARSP number')}
                htmlFor="arsp_number"
                error={errors.arsp_number}
                isOptional
                className="scroll-mt-24"
            >
                <input
                    id="arsp_number"
                    name="arsp_number"
                    defaultValue={defaults?.arsp_number ?? undefined}
                    aria-invalid={Boolean(errors.arsp_number)}
                    className={cn(inputClassName, 'font-mono')}
                />
            </Field>
            {isCompany && (
                <FileField
                    id="business_registration"
                    label={t('Business registration')}
                    name="business_registration"
                    accept="application/pdf,image/jpeg,image/png"
                    hint={t('RCCM certificate · PDF, JPG or PNG, up to 10 MB')}
                    icon={<FileUp className="size-5" />}
                    fileName={
                        registrationName ??
                        (defaults?.has_business_registration
                            ? t('Current document on file')
                            : undefined)
                    }
                    onFileChange={setRegistrationName}
                    error={errors.business_registration}
                />
            )}
            <FileField
                id="identity_document"
                label={
                    isCompany
                        ? t('ID of the legal representative')
                        : identityLabel
                }
                name="identity_document"
                accept="application/pdf,image/jpeg,image/png"
                hint={t('PDF, JPG or PNG, up to 10 MB · kept private')}
                icon={<FileUp className="size-5" />}
                fileName={
                    identityName ??
                    (defaults?.has_identity_document
                        ? t('Current document on file')
                        : undefined)
                }
                onFileChange={setIdentityName}
                error={errors.identity_document}
                note={isCompany ? undefined : neededNote}
            />
        </>
    );
}
