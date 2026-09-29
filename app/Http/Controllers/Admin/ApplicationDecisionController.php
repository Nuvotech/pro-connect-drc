<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\ResolvesListings;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApplicationDecisionRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ApplicationDecisionController extends Controller
{
    use ResolvesListings;

    /**
     * Approve a listing, ask the pro for changes, or decline it.
     */
    public function store(ApplicationDecisionRequest $request, string $type, int $id): RedirectResponse
    {
        $listing = $this->resolveListing($type, $id);

        $listing->recordDecision(
            $request->user(),
            $request->validated('decision'),
            $request->validated('message'),
            $request->validated('internal_note'),
            $request->boolean('notify', true),
        );

        $name = $listing->business_name ?? $listing->full_name ?? $listing->contact_name;

        Inertia::flash('toast', ['type' => 'success', 'message' => match ($request->validated('decision')) {
            'approve' => __(':name is now verified.', ['name' => $name]),
            'request_changes' => __('Changes requested from :name.', ['name' => $name]),
            default => __(':name was declined.', ['name' => $name]),
        }]);

        return back();
    }
}
