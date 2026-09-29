const maxPhotoEdge = 1600;
const photoQuality = 0.82;

/**
 * Shrink a photo so six of them fit comfortably in one upload. Phone photos
 * are often 4–8 MB; this brings them to roughly 200–400 KB. Falls back to
 * the original file if the browser cannot decode it.
 */
export async function compressPhoto(file: File): Promise<File> {
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(
            1,
            maxPhotoEdge / Math.max(bitmap.width, bitmap.height),
        );
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas
            .getContext('2d')
            ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', photoQuality),
        );

        if (!blob || blob.size >= file.size) {
            return file;
        }

        const baseName = file.name.replace(/\.[^.]+$/, '');

        return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
    } catch {
        return file;
    }
}
