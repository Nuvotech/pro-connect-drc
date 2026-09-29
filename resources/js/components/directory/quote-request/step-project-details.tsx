import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import FieldError from '@/components/directory/field-error';
import {
    inputClassName,
    invalidClassName,
} from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import ChoiceChips from '@/components/directory/quote-request/choice-chips';
import {
    descriptionMaxLength,
    descriptionMinLength,
    maxPhotoBytes,
    maxPhotos,
    serviceTypes,
    timings,
} from '@/components/directory/quote-request/quote-request-data';
import type { QuoteStepProps } from '@/components/directory/quote-request/quote-request-data';
import { compressPhoto } from '@/lib/compress-photo';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export default function StepProjectDetails({
    data,
    errors,
    setField,
}: QuoteStepProps) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [photoError, setPhotoError] = useState<string>();
    const [isPreparing, setIsPreparing] = useState(false);

    /**
     * Add the chosen photos, shrunk in the browser so they upload quickly on
     * mobile data and stay under the server's size limit.
     */
    async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(event.target.files ?? []);
        const remainingSlots = maxPhotos - data.photos.length;
        event.target.value = '';

        const images = selectedFiles
            .filter((file) => file.type.startsWith('image/'))
            .slice(0, remainingSlots);

        setIsPreparing(true);
        const compressed = await Promise.all(images.map(compressPhoto));
        setIsPreparing(false);

        const acceptedFiles = compressed.filter(
            (file) => file.size <= maxPhotoBytes,
        );

        setPhotoError(
            acceptedFiles.length < selectedFiles.length
                ? t('You can add up to :maxPhotos photos (JPG or PNG).', {
                      maxPhotos,
                  })
                : undefined,
        );

        setField('photos', [
            ...data.photos,
            ...acceptedFiles.map((file) => ({
                id: `${file.name}-${file.lastModified}-${Math.random()}`,
                file,
                previewUrl: URL.createObjectURL(file),
            })),
        ]);
    }

    function removePhoto(photoId: string) {
        const photo = data.photos.find(({ id }) => id === photoId);

        if (photo) {
            URL.revokeObjectURL(photo.previewUrl);
        }

        setField(
            'photos',
            data.photos.filter(({ id }) => id !== photoId),
        );
    }

    const descriptionLength = data.description.trim().length;

    return (
        <div className="flex flex-col gap-5">
            <ChoiceChips
                name="quote-service-type"
                label={t('Type of job')}
                options={serviceTypes}
                value={data.serviceType}
                onChange={(value) => setField('serviceType', value)}
                className="grid-cols-2 sm:grid-cols-4"
            />

            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="quote-description"
                    className="text-label-md text-on-surface"
                >
                    {t('Describe the job')}
                </label>
                <textarea
                    id="quote-description"
                    rows={3}
                    value={data.description}
                    onChange={(event) =>
                        setField('description', event.target.value)
                    }
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby="quote-description-count"
                    placeholder={t(
                        'What needs doing, where, and any materials you already have.',
                    )}
                    className={cn(
                        inputClassName,
                        'resize-none px-3 py-2.5',
                        errors.description && invalidClassName,
                    )}
                />
                <div className="flex items-start justify-between gap-3">
                    <FieldError message={errors.description} />
                    <span
                        id="quote-description-count"
                        className={cn(
                            'ml-auto shrink-0 text-label-sm',
                            descriptionLength > descriptionMaxLength
                                ? 'text-error'
                                : 'text-on-surface-variant',
                        )}
                    >
                        {descriptionLength < descriptionMinLength
                            ? `At least ${descriptionMinLength} characters`
                            : `${descriptionLength} / ${descriptionMaxLength}`}
                    </span>
                </div>
            </div>

            <ChoiceChips
                name="quote-timing"
                label={t('When do you need it?')}
                options={timings}
                value={data.timing}
                onChange={(value) => setField('timing', value)}
                className="grid-cols-2 sm:grid-cols-4"
            />

            <div className="flex flex-col gap-1.5">
                <span className="text-label-md text-on-surface">
                    {t('Photos')}{' '}
                    <span className="font-normal text-on-surface-variant">
                        {t('(optional, up to')} {maxPhotos})
                    </span>
                </span>
                <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={addPhotos}
                    className="hidden"
                />
                <div className="flex flex-wrap items-center gap-2">
                    {data.photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="relative size-12 overflow-hidden rounded-lg bg-surface-container"
                        >
                            <img
                                src={photo.previewUrl}
                                alt={photo.file.name}
                                className="h-full w-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removePhoto(photo.id)}
                                aria-label={`Remove ${photo.file.name}`}
                                className="absolute top-0.5 right-0.5 flex size-5 cursor-pointer items-center justify-center rounded-full bg-on-background/70 text-on-primary"
                            >
                                <MaterialSymbol
                                    name="close"
                                    className="text-[14px]"
                                />
                            </button>
                        </div>
                    ))}
                    {data.photos.length < maxPhotos && (
                        <button
                            type="button"
                            onClick={() => fileInput.current?.click()}
                            disabled={isPreparing}
                            className="flex h-12 cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-outline-variant px-3 text-label-sm text-primary transition-colors hover:border-primary disabled:cursor-wait disabled:opacity-60"
                        >
                            <MaterialSymbol
                                name="add_photo_alternate"
                                className="text-[20px]"
                            />
                            {isPreparing ? t('Preparing…') : t('Add photos')}
                        </button>
                    )}
                </div>
                <FieldError message={photoError} />
            </div>
        </div>
    );
}
