<?php

namespace App\Http\Controllers\Pro;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pro\StoreGalleryPhotosRequest;
use App\Models\ProfessionalPhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A service professional's photos of their work.
 */
class GalleryController extends Controller
{
    /**
     * Show the pro's work gallery.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $professional = $request->user()->professional;

        if (! $professional) {
            return to_route('dashboard');
        }

        return Inertia::render('dashboard/listing/gallery', [
            'photos' => $professional->photos->map(fn (ProfessionalPhoto $photo) => [
                'id' => $photo->id,
                'url' => Storage::disk('public')->url($photo->path),
            ]),
            'maxPhotos' => ProfessionalPhoto::MAX_PHOTOS,
        ]);
    }

    /**
     * Add photos to the end of the gallery.
     */
    public function store(StoreGalleryPhotosRequest $request): RedirectResponse
    {
        $professional = $request->user()->professional;

        abort_unless($professional, 404);
        Gate::authorize('update', $professional);

        $nextPosition = (int) $professional->photos()->max('position') + 1;

        $professional->photos()->createMany(
            collect($request->file('photos'))
                ->values()
                ->map(fn (UploadedFile $photo, int $index) => [
                    'path' => $photo->store("professionals/{$professional->id}/gallery", 'public'),
                    'position' => $nextPosition + $index,
                ])
                ->all(),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Photos added to your gallery.')]);

        return to_route('dashboard.listing.gallery.index');
    }

    /**
     * Remove a photo from the gallery.
     */
    public function destroy(ProfessionalPhoto $photo): RedirectResponse
    {
        Gate::authorize('update', $photo->professional);

        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Photo removed.')]);

        return to_route('dashboard.listing.gallery.index');
    }
}
