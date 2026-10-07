<?php

use App\Actions\StoreCompressedImage;
use App\Models\Professional;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('a large photo is scaled down and saved as a smaller WebP', function () {
    $upload = UploadedFile::fake()->image('site-visit.png', 3000, 1500);

    $path = app(StoreCompressedImage::class)($upload, 'professionals/covers', 2000);

    Storage::disk('public')->assertExists($path);
    [$width, $height, $type] = getimagesizefromstring(Storage::disk('public')->get($path));

    expect($path)->toStartWith('professionals/covers/')->toEndWith('.webp')
        ->and($type)->toBe(IMAGETYPE_WEBP)
        ->and($width)->toBe(2000)
        ->and($height)->toBe(1000)
        ->and(Storage::disk('public')->size($path))->toBeLessThan($upload->getSize());
});

test('a photo already within the width limit keeps its size', function () {
    $path = app(StoreCompressedImage::class)(UploadedFile::fake()->image('portrait.jpg', 640, 480), 'professionals/photos', 800);

    [$width, $height] = getimagesizefromstring(Storage::disk('public')->get($path));

    expect([$width, $height])->toBe([640, 480]);
});

test('formats it cannot compress are stored unchanged', function () {
    $upload = UploadedFile::fake()->image('animation.gif', 300, 300);

    $path = app(StoreCompressedImage::class)($upload, 'quote-requests/1');

    expect($path)->toEndWith('.gif')
        ->and(Storage::disk('public')->get($path))->toBe($upload->getContent());
});

test('gallery uploads are compressed before they are saved', function () {
    $pro = User::factory()->create();
    $professional = Professional::factory()->for($pro)->create();

    $this->actingAs($pro)
        ->post(route('dashboard.listing.gallery.store'), [
            'photos' => [UploadedFile::fake()->image('kitchen.jpg', 2400, 1800)],
        ])
        ->assertSessionHasNoErrors();

    $path = $professional->photos()->sole()->path;
    [$width] = getimagesizefromstring(Storage::disk('public')->get($path));

    expect($path)->toEndWith('.webp')
        ->and($width)->toBe(StoreCompressedImage::DEFAULT_MAX_WIDTH);
});
