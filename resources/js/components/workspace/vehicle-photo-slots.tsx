import { Camera, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { vehiclePhotoAngles } from '@/lib/admin-data';
import { compressPhoto } from '@/lib/compress-photo';
import { cn } from '@/lib/utils';
import { t } from '@/lib/i18n';

export default function VehiclePhotoSlots({
    namePrefix,
    errors,
    existingPhotos = [],
}: {
    namePrefix: string;
    errors: Record<string, string>;
    /** Current photos when editing; uploading a new one replaces it. */
    existingPhotos?: { angle: string; url: string }[];
}) {
    const existingUrlFor = (angle: string) =>
        existingPhotos.find((photo) => photo.angle === angle)?.url ?? null;
    const photoErrors = vehiclePhotoAngles
        .map((angle) => errors[`${namePrefix}.${angle.value}`])
        .filter(Boolean);
    const groupError = errors[namePrefix];
    const [filledCount, setFilledCount] = useState(
        vehiclePhotoAngles.filter((angle) => existingUrlFor(angle.value))
            .length,
    );

    return (
        <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 flex w-full items-baseline justify-between gap-2 text-sm font-medium text-zinc-900">
                {t('Photos')}
                <span className="text-xs font-normal text-zinc-500 tabular-nums">
                    {filledCount} {t('of')} {vehiclePhotoAngles.length}{' '}
                    {t('added')}
                </span>
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {vehiclePhotoAngles.map((angle) => (
                    <PhotoSlot
                        key={angle.value}
                        label={angle.label}
                        name={`${inputName(namePrefix)}[${angle.value}]`}
                        hasError={Boolean(
                            errors[`${namePrefix}.${angle.value}`],
                        )}
                        existingUrl={existingUrlFor(angle.value)}
                        onFilledChange={(isFilled) =>
                            setFilledCount(
                                (count) => count + (isFilled ? 1 : -1),
                            )
                        }
                    />
                ))}
            </div>
            <p className="text-xs text-zinc-500">
                {existingPhotos.length > 0
                    ? t(
                          'Upload a photo to replace the current one. Photos are resized automatically.',
                      )
                    : t(
                          'All 6 are required. Photos are resized automatically before upload.',
                      )}
            </p>
            {(groupError || photoErrors.length > 0) && (
                <ul className="flex flex-col gap-0.5">
                    {[groupError, ...photoErrors]
                        .filter(Boolean)
                        .map((message) => (
                            <li
                                key={message}
                                className="text-xs font-medium text-zinc-900"
                            >
                                {message}
                            </li>
                        ))}
                </ul>
            )}
        </fieldset>
    );
}

/**
 * Convert an error-key prefix such as `vehicles.0.photos` into the
 * matching form field name, `vehicles[0][photos]`.
 */
function inputName(errorKey: string): string {
    const [first, ...rest] = errorKey.split('.');

    return first + rest.map((part) => `[${part}]`).join('');
}

function PhotoSlot({
    label,
    name,
    hasError,
    existingUrl,
    onFilledChange,
}: {
    label: string;
    name: string;
    hasError: boolean;
    existingUrl: string | null;
    onFilledChange: (isFilled: boolean) => void;
}) {
    const [uploadedUrl, setPreviewUrl] = useState<string | null>(null);
    const previewUrl = uploadedUrl ?? existingUrl;
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        return () => {
            if (uploadedUrl) {
                URL.revokeObjectURL(uploadedUrl);
            }
        };
    }, [uploadedUrl]);

    async function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
        const input = event.currentTarget;
        const file = input.files?.[0];

        if (!file) {
            return;
        }

        setIsProcessing(true);
        const compressed = await compressPhoto(file);
        const transfer = new DataTransfer();
        transfer.items.add(compressed);
        input.files = transfer.files;
        setIsProcessing(false);

        if (!previewUrl) {
            onFilledChange(true);
        }

        setPreviewUrl(URL.createObjectURL(compressed));
    }

    return (
        <label className="group flex cursor-pointer flex-col gap-1.5">
            <input
                type="file"
                name={name}
                accept="image/jpeg,image/png,image/webp"
                onChange={selectPhoto}
                className="peer sr-only"
            />
            <span
                className={cn(
                    'relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30',
                    previewUrl
                        ? 'border-zinc-200'
                        : 'border-dashed bg-zinc-50 group-hover:bg-zinc-100',
                    hasError && !previewUrl
                        ? 'border-zinc-900'
                        : !previewUrl && 'border-zinc-300',
                )}
            >
                {isProcessing ? (
                    <LoaderCircle
                        className="size-5 animate-spin text-zinc-400"
                        aria-label={t('Processing photo')}
                    />
                ) : previewUrl ? (
                    <>
                        <img
                            src={previewUrl}
                            alt={`${label} preview`}
                            className="size-full object-cover"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-zinc-900/60 py-1 text-center text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            {t('Replace')}
                        </span>
                    </>
                ) : (
                    <Camera
                        className="size-5 text-zinc-400"
                        aria-hidden="true"
                    />
                )}
            </span>
            <span className="text-xs text-zinc-700">{label}</span>
        </label>
    );
}
