<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\ResolvesListings;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ListingDocumentController extends Controller
{
    use ResolvesListings;

    /**
     * Private documents admins may open, and where each is stored.
     *
     * @var array<string, string>
     */
    private const DOCUMENT_COLUMNS = [
        'identity-document' => 'identity_document_path',
        'business-registration' => 'business_registration_path',
    ];

    /**
     * Show a listing's private document (ID or business registration) in
     * the browser. Only admins reach this route.
     */
    public function show(string $type, int $id, string $document): StreamedResponse
    {
        $listing = $this->resolveListing($type, $id);
        $column = self::DOCUMENT_COLUMNS[$document] ?? null;
        $path = $column ? $listing->getAttribute($column) : null;

        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path);
    }
}
