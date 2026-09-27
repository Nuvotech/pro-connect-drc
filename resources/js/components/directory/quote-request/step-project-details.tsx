import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import FieldError from '@/components/directory/field-error';
import {
    inputClassName,
    invalidClassName,
} from '@/components/directory/field-styles';
import MaterialSymbol from '@/components/directory/material-symbol';
import {
    descriptionMaxLength,
    descriptionMinLength,
    maxPhotoBytes,
    maxPhotos,
    serviceTypes,
    timings,
} from '@/components/directory/quote-request/quote-request-data';
import type { QuoteStepProps } from '@/components/directory/quote-request/quote-request-data';
import { cn } from '@/lib/utils';

export default function StepProjectDetails({
    data,
    errors,
    setField,
}: QuoteStepProps) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [photoError, setPhotoError] = useState<string>();

    function addPhotos(event: ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(event.target.files ?? []);
        const remainingSlots = maxPhotos - data.photos.length;
        const acceptedFiles = selectedFiles
            .filter((file) => ['image/png', 'image/jpeg'].includes(file.type))
            .filter((file) => file.size <= maxPhotoBytes)
            .slice(0, remainingSlots);

        setPhotoError(
            acceptedFiles.length < selectedFiles.length
                ? `Only ${maxPhotos} PNG or JPG images up to 10 MB each are accepted.`
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

        event.target.value = '';
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

    return (
        <div className="flex flex-col gap-10">
            <div>
                <div className="mb-2 flex items-center gap-2">
                    <MaterialSymbol
                        name="assignment"
                        className="text-primary"
                    />
                    <h2 className="text-headline-lg-mobile text-primary md:text-headline-lg">
                        Parlez-nous de votre projet
                    </h2>
                </div>
                <p className="text-body-md text-on-surface-variant">
                    Provide details so verified professionals in Kinshasa and
                    across DRC can prepare accurate quotes.
                    <span className="mt-1 block text-on-surface-variant/80 italic">
                        Donnez des précisions pour recevoir des devis sur-mesure
                        et fiables.
                    </span>
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-label-md text-on-surface">
                    <span className="font-semibold">
                        Type d'intervention • Service Type
                    </span>
                    <span className="text-label-sm font-medium text-primary">
                        Requis / Required
                    </span>
                </div>
                <div
                    role="radiogroup"
                    aria-label="Service type"
                    className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                >
                    {serviceTypes.map((serviceType) => {
                        const isSelected =
                            data.serviceType === serviceType.value;

                        return (
                            <button
                                key={serviceType.value}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() =>
                                    setField('serviceType', serviceType.value)
                                }
                                className={cn(
                                    'group flex h-24 flex-col justify-between rounded-xl border p-3 text-left transition-all duration-150',
                                    isSelected
                                        ? 'border-primary bg-surface-container-low'
                                        : 'border-outline-variant bg-surface-container-lowest shadow-sm hover:bg-surface-container-low',
                                )}
                            >
                                <MaterialSymbol
                                    name={serviceType.icon}
                                    filled={isSelected}
                                    className={cn(
                                        'transition-colors',
                                        isSelected
                                            ? 'text-primary'
                                            : 'text-on-surface-variant group-hover:text-primary',
                                    )}
                                />
                                <span>
                                    <span className="block text-label-md leading-tight font-semibold text-on-surface">
                                        {serviceType.label}
                                    </span>
                                    <span className="text-xs text-on-surface-variant">
                                        {serviceType.caption}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                    <label
                        htmlFor="quote-description"
                        className="text-label-md font-semibold text-on-surface"
                    >
                        Description des travaux • Project Description
                    </label>
                    <span className="text-label-sm text-on-surface-variant">
                        Min. {descriptionMinLength} caractères
                    </span>
                </div>
                <div className="relative">
                    <textarea
                        id="quote-description"
                        rows={4}
                        value={data.description}
                        onChange={(event) =>
                            setField('description', event.target.value)
                        }
                        aria-invalid={Boolean(errors.description)}
                        placeholder="Précisez la nature des dégâts, les dimensions des pièces, la commune (ex: Gombe, Ngaliema), ou matériaux déjà achetés... Describe the issue, space dimensions, materials needed..."
                        className={cn(
                            inputClassName,
                            'resize-none rounded-xl p-4 pb-9',
                            errors.description && invalidClassName,
                        )}
                    />
                    <div
                        className={cn(
                            'absolute right-3 bottom-3 flex items-center gap-1 text-label-sm',
                            data.description.length > descriptionMaxLength
                                ? 'text-error'
                                : 'text-on-surface-variant',
                        )}
                    >
                        <MaterialSymbol
                            name="edit_note"
                            className="text-base"
                        />
                        <span>
                            {data.description.length} / {descriptionMaxLength}
                        </span>
                    </div>
                </div>
                <FieldError message={errors.description} />
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-label-md font-semibold text-on-surface">
                    Échéance souhaitée • Urgency &amp; Timeline
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                    {timings.map((timing) => (
                        <label key={timing.value} className="cursor-pointer">
                            <input
                                type="radio"
                                name="quote-timing"
                                value={timing.value}
                                checked={data.timing === timing.value}
                                onChange={() =>
                                    setField('timing', timing.value)
                                }
                                className="peer sr-only"
                            />
                            <div
                                className={cn(
                                    'flex h-auto items-center justify-between gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm transition-all peer-checked:shadow-md peer-focus-visible:ring-2 peer-focus-visible:ring-primary sm:h-20 sm:flex-col sm:items-start sm:justify-center',
                                    timing.icon
                                        ? 'peer-checked:border-primary peer-checked:bg-surface-container-high'
                                        : 'peer-checked:border-secondary-container peer-checked:bg-secondary-container/20',
                                )}
                            >
                                {timing.icon ? (
                                    <MaterialSymbol
                                        name={timing.icon}
                                        className="text-xl text-primary"
                                    />
                                ) : (
                                    <span className="inline-flex items-center justify-center rounded-full bg-secondary-container px-2 py-0.5 text-label-sm font-semibold text-on-secondary-container">
                                        Immédiat
                                    </span>
                                )}
                                <span className="text-label-sm font-semibold text-on-surface">
                                    {timing.label}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-label-md font-semibold text-on-surface">
                    <span>
                        Photos du problème ou de la zone • Photos (Optionnel)
                    </span>
                    <span className="text-label-sm font-normal text-on-surface-variant">
                        Max {maxPhotos} fichiers (10 MB)
                    </span>
                </div>
                <input
                    ref={fileInput}
                    type="file"
                    accept="image/png, image/jpeg"
                    multiple
                    onChange={addPhotos}
                    className="hidden"
                />
                {data.photos.length === 0 ? (
                    <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="group flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-center transition-colors duration-200 hover:bg-surface-container"
                    >
                        <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm transition-transform group-hover:scale-110">
                            <MaterialSymbol
                                name="add_photo_alternate"
                                className="text-[28px]"
                            />
                        </span>
                        <span className="text-label-md font-semibold text-primary">
                            Cliquez pour téléverser{' '}
                            <span className="font-normal text-on-surface-variant">
                                ou choisissez vos images
                            </span>
                        </span>
                        <span className="mt-1 text-label-sm text-on-surface-variant">
                            PNG, JPG autorisés jusqu'à 10 Mo • PNG, JPG up to
                            10MB
                        </span>
                    </button>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {data.photos.map((photo) => (
                            <div
                                key={photo.id}
                                className="group relative h-20 overflow-hidden rounded-lg bg-surface-container shadow-sm"
                            >
                                <img
                                    src={photo.previewUrl}
                                    alt={photo.file.name}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-primary/40 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(photo.id)}
                                        aria-label={`Remove ${photo.file.name}`}
                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-lowest text-error shadow-md"
                                    >
                                        <MaterialSymbol
                                            name="delete"
                                            className="text-sm"
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {data.photos.length < maxPhotos && (
                            <button
                                type="button"
                                onClick={() => fileInput.current?.click()}
                                className="flex h-20 flex-col items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant/60 transition-colors hover:bg-surface-container"
                            >
                                <MaterialSymbol
                                    name="add"
                                    className="text-xl"
                                />
                                <span className="text-xs">Ajouter</span>
                            </button>
                        )}
                    </div>
                )}
                <FieldError message={photoError} />
            </div>
        </div>
    );
}
