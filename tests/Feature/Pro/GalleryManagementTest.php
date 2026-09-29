<?php

use App\Models\Professional;
use App\Models\ProfessionalPhoto;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

/**
 * Give a professional some gallery photos stored on the fake public disk.
 */
function addGalleryPhotos(Professional $professional, int $count): void
{
    foreach (range(1, $count) as $position) {
        $path = UploadedFile::fake()->image("job-{$position}.jpg")->store("professionals/{$professional->id}/gallery", 'public');
        $professional->photos()->create(['path' => $path, 'position' => $position]);
    }
}

test('a pro sees their work photos', function () {
    Storage::fake('public');
    $pro = User::factory()->create();
    addGalleryPhotos(Professional::factory()->for($pro)->create(), 2);

    $this->actingAs($pro)
        ->get(route('dashboard.listing.gallery.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/listing/gallery')
            ->has('photos', 2)
            ->where('maxPhotos', ProfessionalPhoto::MAX_PHOTOS));
});

test('a pro can add photos to their gallery', function () {
    Storage::fake('public');
    $pro = User::factory()->create();
    $professional = Professional::factory()->for($pro)->create();
    addGalleryPhotos($professional, 1);

    $this->actingAs($pro)
        ->post(route('dashboard.listing.gallery.store'), [
            'photos' => [UploadedFile::fake()->image('roof.jpg'), UploadedFile::fake()->image('boiler.jpg')],
        ])
        ->assertRedirect(route('dashboard.listing.gallery.index'));

    $photos = $professional->photos()->orderBy('position')->get();

    expect($photos)->toHaveCount(3)
        ->and($photos->pluck('position')->all())->toBe([1, 2, 3]);
    $photos->each(fn (ProfessionalPhoto $photo) => Storage::disk('public')->assertExists($photo->path));
});

test('the gallery holds at most six photos', function () {
    Storage::fake('public');
    $pro = User::factory()->create();
    $professional = Professional::factory()->for($pro)->create();
    addGalleryPhotos($professional, 5);

    $this->actingAs($pro)
        ->post(route('dashboard.listing.gallery.store'), [
            'photos' => [UploadedFile::fake()->image('one.jpg'), UploadedFile::fake()->image('two.jpg')],
        ])
        ->assertSessionHasErrors(['photos' => 'You can add 1 more photo(s). Your gallery holds up to 6.']);

    expect($professional->photos()->count())->toBe(5);
});

test('a pro can remove one of their photos', function () {
    Storage::fake('public');
    $pro = User::factory()->create();
    $professional = Professional::factory()->for($pro)->create();
    addGalleryPhotos($professional, 1);
    $photo = $professional->photos()->sole();

    $this->actingAs($pro)
        ->delete(route('dashboard.listing.gallery.destroy', $photo))
        ->assertRedirect(route('dashboard.listing.gallery.index'));

    $this->assertModelMissing($photo);
    Storage::disk('public')->assertMissing($photo->path);
});

test('a pro cannot remove another pro\'s photo', function () {
    Storage::fake('public');
    $otherProfessional = Professional::factory()->for(User::factory())->create();
    addGalleryPhotos($otherProfessional, 1);
    $photo = $otherProfessional->photos()->sole();
    $pro = User::factory()->create();
    Professional::factory()->for($pro)->create();

    $this->actingAs($pro)
        ->delete(route('dashboard.listing.gallery.destroy', $photo))
        ->assertForbidden();

    $this->assertModelExists($photo);
    Storage::disk('public')->assertExists($photo->path);
});
