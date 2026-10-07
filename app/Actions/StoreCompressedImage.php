<?php

namespace App\Actions;

use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Stores a public image (profile photo, cover, gallery or vehicle photo)
 * after shrinking it on the server with PHP's GD library: oversized images
 * are scaled down, phone photos are turned the right way up, metadata such
 * as GPS location is dropped, and the result is saved as WebP. Nothing is
 * sent to an outside service.
 *
 * Whenever compressing would not help (an unsupported format, an image too
 * big to decode safely, or a result no smaller than the upload) the
 * original file is stored unchanged, so an upload is never lost.
 */
class StoreCompressedImage
{
    /**
     * WebP quality: visually close to the original at a fraction of the size.
     */
    public const QUALITY = 80;

    /**
     * Widest image kept when the caller doesn't ask for a smaller one.
     */
    public const DEFAULT_MAX_WIDTH = 1600;

    /**
     * Highest memory limit we will raise PHP to while decoding a large photo.
     */
    private const MEMORY_CEILING = 512 * 1024 * 1024;

    /** @var list<string> */
    private const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    /**
     * Compress the image and store it on the public disk, returning its path.
     */
    public function __invoke(UploadedFile $image, string $directory, int $maxWidth = self::DEFAULT_MAX_WIDTH): string
    {
        $compressed = $this->compress($image, $maxWidth);

        if ($compressed === null) {
            return $image->store($directory, 'public');
        }

        $path = trim($directory, '/').'/'.Str::random(40).'.webp';
        Storage::disk('public')->put($path, $compressed);

        return $path;
    }

    /**
     * The compressed WebP bytes, or null when the original should be kept.
     */
    private function compress(UploadedFile $image, int $maxWidth): ?string
    {
        $file = $image->getRealPath();
        $info = $file ? @getimagesize($file) : false;

        if ($info === false || ! in_array($info['mime'], self::COMPRESSIBLE_TYPES, true)) {
            return null;
        }

        [$width, $height] = $info;

        if (! $this->ensureMemoryFor($width, $height)) {
            return null;
        }

        $picture = @imagecreatefromstring((string) file_get_contents($file));

        if (! $picture instanceof GdImage) {
            return null;
        }

        $picture = $this->turnUpright($picture, $file, $info['mime']);

        if (imagesx($picture) > $maxWidth) {
            $picture = imagescale($picture, $maxWidth, -1, IMG_BICUBIC) ?: $picture;
        }

        imagepalettetotruecolor($picture);
        imagealphablending($picture, false);
        imagesavealpha($picture, true);

        ob_start();
        $isEncoded = imagewebp($picture, null, self::QUALITY);
        $compressed = (string) ob_get_clean();

        if (! $isEncoded || $compressed === '' || strlen($compressed) >= (int) $image->getSize()) {
            return null;
        }

        return $compressed;
    }

    /**
     * Rotate a phone photo as its camera recorded, since the EXIF data that
     * says which way is up is dropped when re-encoding.
     */
    private function turnUpright(GdImage $picture, string $file, string $mime): GdImage
    {
        if ($mime !== 'image/jpeg' || ! function_exists('exif_read_data')) {
            return $picture;
        }

        $orientation = (int) (@exif_read_data($file)['Orientation'] ?? 1);
        $angle = match ($orientation) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };

        return $angle === 0 ? $picture : (imagerotate($picture, $angle, 0) ?: $picture);
    }

    /**
     * Make sure there is room to decode and scale an image of this size,
     * raising PHP's memory limit up to a ceiling if needed.
     */
    private function ensureMemoryFor(int $width, int $height): bool
    {
        // A decoded image takes about 4 bytes per pixel; leave room for the
        // scaled copy and the encoder.
        $needed = memory_get_usage() + (int) ($width * $height * 4 * 2.2) + 16 * 1024 * 1024;
        $limit = $this->memoryLimitInBytes();

        if ($limit === -1 || $needed <= $limit) {
            return true;
        }

        if ($needed > self::MEMORY_CEILING) {
            return false;
        }

        return ini_set('memory_limit', (string) $needed) !== false;
    }

    /**
     * PHP's memory limit in bytes, or -1 when there is none.
     */
    private function memoryLimitInBytes(): int
    {
        $limit = trim((string) ini_get('memory_limit'));

        if ($limit === '' || $limit === '-1') {
            return -1;
        }

        $value = (int) $limit;

        return match (strtolower(substr($limit, -1))) {
            'g' => $value * 1024 ** 3,
            'm' => $value * 1024 ** 2,
            'k' => $value * 1024,
            default => $value,
        };
    }
}
