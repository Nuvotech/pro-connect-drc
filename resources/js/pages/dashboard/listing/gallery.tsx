import { Head, Link, router, usePage } from '@inertiajs/react';
import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import PageHeader from '@/components/workspace/page-header';
import { compressPhoto } from '@/lib/compress-photo';
import { show } from '@/routes/dashboard/listing';
import { destroy, store } from '@/routes/dashboard/listing/gallery';
import { t } from '@/lib/i18n';

type GalleryPhoto = {
    id: number;
    url: string;
};

export default function Gallery({
    photos,
    maxPhotos,
}: {
    photos: GalleryPhoto[];
    maxPhotos: number;
}) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const [isUploading, setIsUploading] = useState(false);
    const remaining = maxPhotos - photos.length;
    const photoError =
        errors.photos ??
        Object.entries(errors).find(([key]) => key.startsWith('photos.'))?.[1];

    async function upload(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []).slice(0, remaining);
        event.target.value = '';

        if (files.length === 0) {
            return;
        }

        setIsUploading(true);

        const compressed = await Promise.all(files.map(compressPhoto));

        router.post(
            store.url(),
            { photos: compressed },
            {
                forceFormData: true,
                preserveScroll: true,
                onFinish: () => setIsUploading(false),
            },
        );
    }

    return (
        <>
            <Head title={t('Work photos')} />

            <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
                <PageHeader
                    title={t('Work photos')}
                    description={t(
                        'Show clients jobs you have done. Up to :maxPhotos photos.',
                        { maxPhotos },
                    )}
                    backHref={show()}
                    backLabel={t('My listing')}
                />

                <section className="rounded-xl border border-zinc-200 bg-white p-6">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <p className="text-sm text-zinc-500">
                            {photos.length} {t('of')} {maxPhotos} {t('photos')}
                        </p>

                        {remaining > 0 && (
                            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-container has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                                {isUploading ? (
                                    <LoaderCircle
                                        className="size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <ImagePlus
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                )}
                                {isUploading
                                    ? t('Uploading…')
                                    : t('Add photos')}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    disabled={isUploading}
                                    onChange={upload}
                                    className="sr-only"
                                />
                            </label>
                        )}
                    </div>

                    {photoError && (
                        <p className="mb-4 text-sm text-red-600" role="alert">
                            {photoError}
                        </p>
                    )}

                    {photos.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-200 px-6 py-12 text-center">
                            <ImagePlus
                                className="size-6 text-zinc-400"
                                aria-hidden="true"
                            />
                            <p className="text-sm font-medium text-zinc-900">
                                {t('No photos yet')}
                            </p>
                            <p className="text-sm text-zinc-500">
                                {t(
                                    'Listings with photos of real work get more enquiries.',
                                )}
                            </p>
                        </div>
                    ) : (
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {photos.map((photo, index) => (
                                <li
                                    key={photo.id}
                                    className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100"
                                >
                                    <img
                                        src={photo.url}
                                        alt={t('Work photo :index', {
                                            index: index + 1,
                                        })}
                                        className="size-full object-cover"
                                    />
                                    <Link
                                        href={destroy(photo.id)}
                                        as="button"
                                        preserveScroll
                                        onBefore={() =>
                                            confirm('Remove this photo?')
                                        }
                                        aria-label={t(
                                            'Remove work photo :index',
                                            { index: index + 1 },
                                        )}
                                        className="absolute top-2 right-2 inline-flex size-9 cursor-pointer items-center justify-center rounded-lg bg-white/90 text-zinc-700 shadow-sm transition-colors duration-200 hover:bg-white hover:text-zinc-900"
                                    >
                                        <Trash2
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </>
    );
}
